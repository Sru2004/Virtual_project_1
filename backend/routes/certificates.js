const express = require('express');
const { auth } = require('../middleware/auth');
const {
  getArtistCertificates,
  getMilestoneProgressData,
  downloadCertificate,
  getCertificateDetails,
  revokeCertificate,
  getCertificatesStatistics,
  testCertificateGeneration,
  manualGenerateCertificate
} = require('../controllers/certificateController');

const router = express.Router();

/**
 * @route   GET /api/certificates/:artistId
 * @desc    Get all certificates for an artist
 * @access  Private (Artist can only view their own)
 */
router.get('/:artistId', auth, getArtistCertificates);

/**
 * @route   GET /api/certificates/:artistId/progress
 * @desc    Get milestone progress for an artist
 * @access  Private (Artist can only view their own)
 */
router.get('/:artistId/progress', auth, getMilestoneProgressData);

/**
 * @route   GET /api/certificates/:certificateId/details
 * @desc    Get certificate details
 * @access  Private (Only certificate owner)
 */
router.get('/:certificateId/details', auth, getCertificateDetails);

/**
 * @route   GET /api/certificates/:certificateId/download
 * @desc    Download certificate PDF
 * @access  Private (Only certificate owner)
 */
router.get('/:certificateId/download', auth, downloadCertificate);

/**
 * @route   POST /api/certificates/:certificateId/revoke
 * @desc    Revoke certificate (Admin only)
 * @access  Private (Admin)
 */
router.post('/:certificateId/revoke', auth, revokeCertificate);

/**
 * @route   GET /api/certificates/admin/statistics
 * @desc    Get certificate statistics (Admin only)
 * @access  Private (Admin)
 */
router.get('/admin/statistics', auth, getCertificatesStatistics);

/**
 * Testing endpoints
 */

/**
 * @route   GET /api/certificates/test/:artistId/status
 * @desc    Check certificate generation status and progress
 * @access  Private (For testing)
 */
router.get('/test/:artistId/status', auth, testCertificateGeneration);

/**
 * @route   POST /api/certificates/test/:artistId/generate
 * @desc    Manually trigger certificate generation
 * @access  Private (For testing)
 */
router.post('/test/:artistId/generate', auth, manualGenerateCertificate);

module.exports = router;
