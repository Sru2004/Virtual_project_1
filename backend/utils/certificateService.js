const PDFDocument = require('pdfkit');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

/**
 * Certificate Service
 * Handles PDF generation for Digital Certificates of Honor
 */

const CERTIFICATE_CONFIG = {
  bronze: {
    level: 'Bronze',
    color: '#CD7F32',
    milestone: 25,
    description: 'For creating 25 approved artworks'
  },
  silver: {
    level: 'Silver',
    color: '#C0C0C0',
    milestone: 50,
    description: 'For creating 50 approved artworks'
  },
  gold: {
    level: 'Gold',
    color: '#FFD700',
    milestone: 75,
    description: 'For creating 75 approved artworks'
  }
};

const generateUniqueCertificateId = () => {
  return 'CERT-' + crypto.randomBytes(16).toString('hex').toUpperCase();
};

const generateCertificateNumber = (level, timestamp = Date.now()) => {
  const levelCode = level.charAt(0).toUpperCase();
  const dateCode = new Date(timestamp).getFullYear();
  const randomCode = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `${levelCode}L-${dateCode}-${randomCode}`;
};

const createCertificatePDF = (artistName, level, artworkCount, certificateId, issueDate) => {
  return new Promise((resolve, reject) => {
    try {
      const config = CERTIFICATE_CONFIG[level.toLowerCase()];
      if (!config) {
        reject(new Error(`Invalid certificate level: ${level}`));
        return;
      }

      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        bufferPages: true
      });

      const buffers = [];

      doc.on('data', (data) => buffers.push(data));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Background color (subtle gradient effect with rectangles)
      doc
        .rect(0, 0, doc.page.width, doc.page.height)
        .fill('#FAFAFA');

      // Border
      doc
        .rect(30, 30, doc.page.width - 60, doc.page.height - 60)
        .stroke('#D4AF37', 3); // Gold border

      // Inner decorative border
      doc
        .rect(50, 50, doc.page.width - 100, doc.page.height - 100)
        .stroke('#E8E8E8', 1);

      // Header - "Certificate of Honor"
      doc
        .font('Helvetica-Bold', 48)
        .fill('#2C3E50')
        .text('CERTIFICATE OF HONOR', { align: 'center', baseline: 'top' })
        .moveDown(0.5);

      // Subtitle
      doc
        .font('Helvetica', 16)
        .fill('#7F8C8D')
        .text(`Digital Artist Recognition Program`, { align: 'center' })
        .moveDown(2);

      // Level badge
      doc
        .rect(doc.page.width / 2 - 60, doc.y, 120, 50)
        .fill(config.color);

      doc
        .font('Helvetica-Bold', 28)
        .fill('#FFFFFF')
        .text(config.level, doc.page.width / 2 - 60, doc.y + 10, {
          width: 120,
          align: 'center',
          height: 50
        })
        .moveDown(3);

      // Main content
      doc
        .font('Helvetica', 12)
        .fill('#555555')
        .text('This is to certify that', { align: 'center' })
        .moveDown(0.5);

      // Artist name - emphasized
      doc
        .font('Helvetica-Bold', 24)
        .fill('#2C3E50')
        .text(artistName, { align: 'center' })
        .moveDown(1);

      // Achievement text
      doc
        .font('Helvetica', 12)
        .fill('#555555')
        .text(`has demonstrated exceptional creativity and dedication in the field of digital art.`, {
          align: 'center'
        })
        .moveDown(0.8);

      doc
        .font('Helvetica-Bold', 13)
        .fill('#2C3E50')
        .text(`${config.level} Level Achievement`, { align: 'center' })
        .moveDown(0.5);

      doc
        .font('Helvetica', 11)
        .fill('#555555')
        .text(`${config.description} on the VisualArt Platform`, {
          align: 'center'
        })
        .moveDown(0.5);

      doc
        .font('Helvetica-Bold', 12)
        .fill('#2C3E50')
        .text(`Total Approved Artworks: ${artworkCount}`, { align: 'center' })
        .moveDown(2);

      // Signature area
      doc
        .font('Helvetica', 10)
        .fill('#777777')
        .text('Digitally Signed', { align: 'left' })
        .moveDown(0.3)
        .text(new Date(issueDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }), { align: 'left' })
        .moveDown(2);

      // Footer with certificate details
      doc
        .font('Helvetica', 9)
        .fill('#999999')
        .text(`Certificate ID: ${certificateId}`, { align: 'center' })
        .text(`Certificate Number: ${generateCertificateNumber(level, issueDate)}`, {
          align: 'center'
        })
        .moveDown(0.5)
        .text('This certificate is a digital recognition of achievement and is non-transferable.', {
          align: 'center',
          width: doc.page.width - 100
        });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

const saveCertificatePDF = async (pdfBuffer, artistId, level, certificateId) => {
  try {
    const certificatesDir = path.join(
      __dirname,
      '../storage/certificates'
    );

    // Ensure directory exists
    await fs.mkdir(certificatesDir, { recursive: true });

    const fileName = `${artistId}_${level}_${certificateId}.pdf`;
    const filePath = path.join(certificatesDir, fileName);

    await fs.writeFile(filePath, pdfBuffer);

    return {
      filePath,
      fileName,
      relativePath: `/storage/certificates/${fileName}`
    };
  } catch (error) {
    console.error('Error saving certificate PDF:', error);
    throw new Error(`Failed to save certificate PDF: ${error.message}`);
  }
};

const generateAndSaveCertificate = async (artistData, level, artworkCount, issueDate = Date.now()) => {
  try {
    const certificateId = generateUniqueCertificateId();
    const certificateNumber = generateCertificateNumber(level, issueDate);

    // Validate inputs
    const config = CERTIFICATE_CONFIG[level.toLowerCase()];
    if (!config) {
      throw new Error(`Invalid certificate level: ${level}`);
    }

    if (!artistData || !artistData.full_name) {
      throw new Error('Artist name is required');
    }

    // Generate PDF
    const pdfBuffer = await createCertificatePDF(
      artistData.full_name,
      level,
      artworkCount,
      certificateId,
      issueDate
    );

    // Save PDF file
    const { filePath, relativePath } = await saveCertificatePDF(
      pdfBuffer,
      artistData._id || artistData.id,
      level,
      certificateId
    );

    return {
      success: true,
      certificateId,
      certificateNumber,
      filePath,
      pdfUrl: relativePath,
      level: config.level,
      artworkCount,
      issueDate: new Date(issueDate)
    };
  } catch (error) {
    console.error('Error generating certificate:', error);
    throw new Error(`Certificate generation failed: ${error.message}`);
  }
};

const validateCertificateGeneration = (artworkCount, level) => {
  const config = CERTIFICATE_CONFIG[level.toLowerCase()];
  if (!config) return false;
  return artworkCount === config.milestone;
};

const getMilestoneProgress = (artworkCount) => {
  const milestones = [25, 50, 75];
  const nextMilestone = milestones.find(m => m > artworkCount);
  
  return {
    currentCount: artworkCount,
    nextMilestone: nextMilestone || null,
    artworksNeeded: nextMilestone ? nextMilestone - artworkCount : 0,
    earnedLevels: {
      bronze: artworkCount >= 25,
      silver: artworkCount >= 50,
      gold: artworkCount >= 75
    },
    progressPercentage: {
      bronze: Math.min((artworkCount / 25) * 100, 100),
      silver: Math.min((artworkCount / 50) * 100, 100),
      gold: Math.min((artworkCount / 75) * 100, 100)
    }
  };
};

module.exports = {
  generateAndSaveCertificate,
  validateCertificateGeneration,
  getMilestoneProgress,
  generateUniqueCertificateId,
  generateCertificateNumber,
  CERTIFICATE_CONFIG
};
