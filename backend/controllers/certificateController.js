const Certificate = require('../models/Certificate');
const User = require('../models/User');
const Artwork = require('../models/Artwork');
const ArtistProfile = require('../models/ArtistProfile');
const {
  generateAndSaveCertificate,
  getMilestoneProgress
} = require('../utils/certificateService');
const { sendCertificateEmail, sendCertificateRevocationEmail } = require('../utils/sendEmail');
const fs = require('fs').promises;

/**
 * Check if artist has reached milestone and generate certificate if eligible
 *@param {String} artistId - Artist user ID
 * @returns {Object} - Certificate data or null if no milestone reached
 */
const checkAndGenerateCertificate = async (artistId) => {
  try {
    // Get artist data
    const artist = await User.findById(artistId);
    if (!artist) {
      throw new Error('Artist not found');
    }

    // Get approved artworks count (only published artworks count as approved)
    const approvedCount = await Artwork.countDocuments({
      artist_id: artistId,
      status: 'published'
    });

    console.log(`Artist ${artistId} has ${approvedCount} approved artworks`);

    // Check against milestones
    const milestones = [
      { count: 25, level: 'bronze' },
      { count: 50, level: 'silver' },
      { count: 75, level: 'gold' }
    ];

    let generatedCertificate = null;

    for (const milestone of milestones) {
      // Check if exactly at milestone
      if (approvedCount === milestone.count) {
        // Check if certificate already exists for this level
        const existingCertificate = await Certificate.findOne({
          artist_id: artistId,
          level: milestone.level,
          is_revoked: false
        });

        if (!existingCertificate) {
          // Generate certificate
          console.log(`Generating ${milestone.level} certificate for artist ${artistId}`);
          
          const certificateData = await generateAndSaveCertificate(
            artist,
            milestone.level,
            milestone.count
          );

          // Save to database
          const certificate = new Certificate({
            artist_id: artistId,
            level: milestone.level,
            artwork_count: milestone.count,
            certificate_id: certificateData.certificateId,
            certificate_number: certificateData.certificateNumber,
            description: `${certificateData.level} Level Certificate - ${milestone.count} Approved Artworks`,
            pdf_path: certificateData.filePath,
            pdf_url: certificateData.pdfUrl,
            issued_at: certificateData.issueDate,
            metadata: {
              artist_name: artist.full_name,
              artist_email: artist.email,
              platform_name: 'VisualArt'
            }
          });

          await certificate.save();

          // Send email notification
          try {
            await sendCertificateEmail(
              artist.email,
              artist.full_name,
              milestone.level,
              milestone.count
            );
            certificate.email_sent = true;
            certificate.email_sent_at = Date.now();
            await certificate.save();
          } catch (emailError) {
            console.error('Failed to send certificate email:', emailError);
            // Continue even if email fails
          }

          generatedCertificate = {
            level: milestone.level,
            artworksCount: milestone.count,
            certificate: certificate
          };

          console.log(`${milestone.level.toUpperCase()} certificate generated successfully`);
          break; // Only generate one certificate at a time
        }
      }
    }

    return generatedCertificate;
  } catch (error) {
    console.error('Error checking and generating certificate:', error);
    throw error;
  }
};

/**
 * Get all certificates for an artist
 */
const getArtistCertificates = async (req, res) => {
  try {
    const { artistId } = req.params;
    const userId = req.user?.id || req.user?._id;

    // Security: Ensure user is requesting their own certificates
    if (userId.toString() !== artistId.toString()) {
      return res.status(403).json({
        message: 'Unauthorized to view these certificates'
      });
    }

    const certificates = await Certificate.find({
      artist_id: artistId,
      is_revoked: false
    }).sort({ issued_at: -1 });

    res.json({
      success: true,
      certificates,
      count: certificates.length
    });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({
      message: 'Failed to fetch certificates',
      error: error.message
    });
  }
};

/**
 * Get milestone progress for an artist
 */
const getMilestoneProgressData = async (req, res) => {
  try {
    const { artistId } = req.params;
    const userId = req.user?.id || req.user?._id;

    // Security: Ensure user is requesting their own data
    if (userId.toString() !== artistId.toString()) {
      return res.status(403).json({
        message: 'Unauthorized to view this data'
      });
    }

    const approvedCount = await Artwork.countDocuments({
      artist_id: artistId,
      status: 'published'
    });

    const progress = getMilestoneProgress(approvedCount);

    // Get earned certificates
    const certificates = await Certificate.find({
      artist_id: artistId,
      is_revoked: false
    });

    const earnedCertificates = certificates.map(cert => ({
      level: cert.level,
      issuedAt: cert.issued_at,
      certificateId: cert.certificate_id
    }));

    res.json({
      success: true,
      artworkCount: approvedCount,
      progress,
      earnedCertificates
    });
  } catch (error) {
    console.error('Error fetching milestone progress:', error);
    res.status(500).json({
      message: 'Failed to fetch milestone progress',
      error: error.message
    });
  }
};

/**
 * Download certificate PDF
 */
const downloadCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const userId = req.user?.id || req.user?._id;

    const certificate = await Certificate.findById(certificateId);
    if (!certificate) {
      return res.status(404).json({
        message: 'Certificate not found'
      });
    }

    // Security: Only certificate owner can download
    if (certificate.artist_id.toString() !== userId.toString()) {
      return res.status(403).json({
        message: 'Unauthorized to download this certificate'
      });
    }

    if (certificate.is_revoked) {
      return res.status(410).json({
        message: 'This certificate has been revoked'
      });
    }

    // Check if file exists
    const fileExists = await fs.stat(certificate.pdf_path).catch(() => false);
    if (!fileExists) {
      return res.status(410).json({
        message: 'Certificate file not found'
      });
    }

    // Update download stats
    certificate.download_count = (certificate.download_count || 0) + 1;
    certificate.last_downloaded_at = Date.now();
    await certificate.save();

    // Send file
    const fileName = `${certificate.level}_Certificate_${certificate.certificate_id}.pdf`;
    res.download(certificate.pdf_path, fileName);
  } catch (error) {
    console.error('Error downloading certificate:', error);
    res.status(500).json({
      message: 'Failed to download certificate',
      error: error.message
    });
  }
};

/**
 * Get single certificate details
 */
const getCertificateDetails = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const userId = req.user?.id || req.user?._id;

    const certificate = await Certificate.findById(certificateId);
    if (!certificate) {
      return res.status(404).json({
        message: 'Certificate not found'
      });
    }

    // Security: Only certificate owner can view full details
    if (certificate.artist_id.toString() !== userId.toString()) {
      return res.status(403).json({
        message: 'Unauthorized to view this certificate'
      });
    }

    const artist = await User.findById(certificate.artist_id);

    res.json({
      success: true,
      certificate: {
        ...certificate.toObject(),
        artist: {
          name: artist.full_name,
          email: artist.email
        }
      }
    });
  } catch (error) {
    console.error('Error fetching certificate details:', error);
    res.status(500).json({
      message: 'Failed to fetch certificate details',
      error: error.message
    });
  }
};

/**
 * Admin: Revoke certificate
 */
const revokeCertificate = async (req, res) => {
  try {
    // Check admin access
    if (req.user?.user_type !== 'admin') {
      return res.status(403).json({
        message: 'Only admins can revoke certificates'
      });
    }

    const { certificateId } = req.params;
    const { reason } = req.body;

    const certificate = await Certificate.findByIdAndUpdate(
      certificateId,
      {
        is_revoked: true,
        revoked_reason: reason || 'No reason provided',
        revoked_at: Date.now()
      },
      { new: true }
    );

    if (!certificate) {
      return res.status(404).json({
        message: 'Certificate not found'
      });
    }

    // Notify artist
    const artist = await User.findById(certificate.artist_id);
    if (artist) {
      try {
        await sendCertificateRevocationEmail(
          artist.email,
          artist.full_name,
          certificate.level,
          reason
        );
      } catch (emailError) {
        console.error('Failed to send revocation email:', emailError);
      }
    }

    res.json({
      success: true,
      message: 'Certificate revoked successfully',
      certificate
    });
  } catch (error) {
    console.error('Error revoking certificate:', error);
    res.status(500).json({
      message: 'Failed to revoke certificate',
      error: error.message
    });
  }
};

/**
 * Admin: Get all certificates statistics
 */
const getCertificatesStatistics = async (req, res) => {
  try {
    // Check admin access
    if (req.user?.user_type !== 'admin') {
      return res.status(403).json({
        message: 'Only admins can view statistics'
      });
    }

    const stats = await Certificate.aggregate([
      {
        $match: { is_revoked: false }
      },
      {
        $group: {
          _id: '$level',
          count: { $sum: 1 },
          totalDownloads: { $sum: '$download_count' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const totalCertificates = await Certificate.countDocuments({ is_revoked: false });
    const totalRevokedCertificates = await Certificate.countDocuments({ is_revoked: true });

    res.json({
      success: true,
      totalCertificates,
      totalRevokedCertificates,
      byLevel: stats
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

/**
 * Test certificate generation (For testing purposes)
 * This endpoint shows current status and allows manual triggering
 */
const testCertificateGeneration = async (req, res) => {
  try {
    const { artistId } = req.params;

    // Get artist data
    const artist = await User.findById(artistId);
    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    // Get published artworks count
    const publishedCount = await Artwork.countDocuments({
      artist_id: artistId,
      status: 'published'
    });

    // Get existing certificates
    const existingCertificates = await Certificate.find({
      artist_id: artistId,
      is_revoked: false
    }).select('level issued_at certificate_number');

    // Calculate milestone progress
    const milestones = [
      { level: 'bronze', count: 25 },
      { level: 'silver', count: 50 },
      { level: 'gold', count: 75 }
    ];

    const progress = milestones.map(milestone => ({
      level: milestone.level,
      required: milestone.count,
      current: publishedCount,
      remaining: Math.max(0, milestone.count - publishedCount),
      percentage: Math.min(100, Math.round((publishedCount / milestone.count) * 100)),
      achieved: publishedCount >= milestone.count,
      certificateIssued: existingCertificates.some(cert => cert.level === milestone.level)
    }));

    // Check if can generate certificate now
    const canGenerate = milestones.find(m => 
      publishedCount === m.count && 
      !existingCertificates.some(cert => cert.level === m.level)
    );

    res.json({
      success: true,
      artist: {
        id: artist._id,
        name: artist.full_name,
        email: artist.email
      },
      publishedArtworks: publishedCount,
      certificates: existingCertificates,
      progress,
      canGenerateNow: !!canGenerate,
      nextMilestone: canGenerate ? canGenerate.level : 
        milestones.find(m => publishedCount < m.count)?.level || 'all achieved',
      instructions: {
        howToTrigger: 'Certificates are auto-generated when admin approves artworks',
        manualTrigger: 'POST to /api/certificates/test/:artistId/generate',
        requirements: 'Artist must have exactly 25, 50, or 75 published artworks'
      }
    });
  } catch (error) {
    console.error('Error testing certificate generation:', error);
    res.status(500).json({
      message: 'Failed to test certificate generation',
      error: error.message
    });
  }
};

/**
 * Manually trigger certificate generation (For testing purposes)
 */
const manualGenerateCertificate = async (req, res) => {
  try {
    const { artistId } = req.params;

    console.log(`Manual certificate generation triggered for artist: ${artistId}`);

    const result = await checkAndGenerateCertificate(artistId);

    if (result) {
      res.json({
        success: true,
        message: `${result.level.toUpperCase()} certificate generated successfully!`,
        certificate: result
      });
    } else {
      const artist = await User.findById(artistId);
      const publishedCount = await Artwork.countDocuments({
        artist_id: artistId,
        status: 'published'
      });

      res.json({
        success: false,
        message: 'No certificate generated. Artist has not reached a milestone or already has the certificate.',
        currentArtworkCount: publishedCount,
        milestones: [
          { level: 'bronze', required: 25 },
          { level: 'silver', required: 50 },
          { level: 'gold', required: 75 }
        ]
      });
    }
  } catch (error) {
    console.error('Error manually generating certificate:', error);
    res.status(500).json({
      message: 'Failed to generate certificate',
      error: error.message
    });
  }
};

module.exports = {
  checkAndGenerateCertificate,
  getArtistCertificates,
  getMilestoneProgressData,
  downloadCertificate,
  getCertificateDetails,
  revokeCertificate,
  getCertificatesStatistics,
  testCertificateGeneration,
  manualGenerateCertificate
};
