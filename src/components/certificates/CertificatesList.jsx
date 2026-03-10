import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/CertificatesList.css';

/**
 * CertificatesList Component
 * Display all earned certificates for an artist
 */
const CertificatesList = ({ artistId }) => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  useEffect(() => {
    fetchCertificates();
  }, [artistId]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `/api/certificates/${artistId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setCertificates(response.data.certificates || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching certificates:', err);
      setError(err.response?.data?.message || 'Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (certificateId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `/api/certificates/${certificateId}/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading certificate:', err);
      alert('Failed to download certificate');
    }
  };

  const getLevelInfo = (level) => {
    const infoMap = {
      bronze: { emoji: '🥉', color: '#CD7F32', displayName: 'Bronze' },
      silver: { emoji: '🥈', color: '#C0C0C0', displayName: 'Silver' },
      gold: { emoji: '🥇', color: '#FFD700', displayName: 'Gold' }
    };
    return infoMap[level.toLowerCase()] || { emoji: '🎖️', color: '#D3D3D3', displayName: level };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="certificates-container loading">
        <p>Loading certificates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="certificates-container error">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <div className="certificates-container empty">
        <div className="empty-state">
          <div className="empty-icon">🎖️</div>
          <h3>No Certificates Yet</h3>
          <p>Create approved artworks to earn certificates and unlock milestones!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="certificates-container">
      <h3 className="certificates-title">Your Certificates</h3>

      <div className="certificates-grid">
        {certificates.map((cert) => {
          const levelInfo = getLevelInfo(cert.level);
          return (
            <div key={cert._id} className="certificate-card">
              <div
                className="certificate-badge"
                style={{ borderColor: levelInfo.color }}
              >
                <div className="badge-emoji">{levelInfo.emoji}</div>
                <h4 className="badge-level">{levelInfo.displayName} Level</h4>
              </div>

              <div className="certificate-details">
                <div className="detail">
                  <span className="label">Artworks:</span>
                  <span className="value">{cert.artwork_count}</span>
                </div>
                <div className="detail">
                  <span className="label">Certificate ID:</span>
                  <span className="value certificate-id">{cert.certificate_id}</span>
                </div>
                <div className="detail">
                  <span className="label">Issued:</span>
                  <span className="value">{formatDate(cert.issued_at)}</span>
                </div>
                {cert.is_revoked && (
                  <div className="detail revoked">
                    <span className="label">Status:</span>
                    <span className="value">Revoked</span>
                  </div>
                )}
                <div className="detail">
                  <span className="label">Downloads:</span>
                  <span className="value">{cert.download_count || 0}</span>
                </div>
              </div>

              <div className="certificate-actions">
                <button
                  className="btn btn-download"
                  onClick={() => handleDownload(cert._id)}
                  disabled={cert.is_revoked}
                  title={cert.is_revoked ? 'Certificate has been revoked' : 'Download PDF'}
                >
                  📥 Download
                </button>
                <button
                  className="btn btn-view"
                  onClick={() => setSelectedCertificate(cert)}
                >
                  👁️ View Details
                </button>
              </div>

              {cert.download_count > 0 && (
                <div className="download-info">
                  Last downloaded: {formatDate(cert.last_downloaded_at)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Certificate Details Modal */}
      {selectedCertificate && (
        <CertificateDetailsModal
          certificate={selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
};

/**
 * Certificate Details Modal
 */
const CertificateDetailsModal = ({ certificate, onClose, onDownload }) => {
  const levelInfo = {
    bronze: { displayName: 'Bronze', description: 'Create 25 approved artworks' },
    silver: { displayName: 'Silver', description: 'Create 50 approved artworks' },
    gold: { displayName: 'Gold', description: 'Create 75 approved artworks' }
  }[certificate.level.toLowerCase()] || { displayName: certificate.level, description: '' };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>

        <div className="modal-header">
          <h2>{levelInfo.displayName} Level Certificate</h2>
        </div>

        <div className="modal-body">
          <div className="detail-group">
            <h4>Certificate Information</h4>
            <div className="detail-row">
              <span>Certificate ID:</span>
              <strong>{certificate.certificate_id}</strong>
            </div>
            <div className="detail-row">
              <span>Certificate Number:</span>
              <strong>{certificate.certificate_number}</strong>
            </div>
            <div className="detail-row">
              <span>Achievement:</span>
              <strong>{levelInfo.description}</strong>
            </div>
            <div className="detail-row">
              <span>Approved Artworks:</span>
              <strong>{certificate.artwork_count}</strong>
            </div>
            <div className="detail-row">
              <span>Issued Date:</span>
              <strong>{formatDate(certificate.issued_at)}</strong>
            </div>
            <div className="detail-row">
              <span>Artist Name:</span>
              <strong>{certificate.metadata?.artist_name}</strong>
            </div>
          </div>

          <div className="detail-group">
            <h4>Download Statistics</h4>
            <div className="detail-row">
              <span>Total Downloads:</span>
              <strong>{certificate.download_count || 0}</strong>
            </div>
            {certificate.last_downloaded_at && (
              <div className="detail-row">
                <span>Last Downloaded:</span>
                <strong>{formatDate(certificate.last_downloaded_at)}</strong>
              </div>
            )}
          </div>

          {certificate.is_revoked && (
            <div className="revocation-notice">
              <strong>⚠️ This certificate has been revoked</strong>
              <p>{certificate.revoked_reason}</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-primary"
            onClick={() => onDownload(certificate._id)}
            disabled={certificate.is_revoked}
          >
            📥 Download Certificate
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CertificatesList;
