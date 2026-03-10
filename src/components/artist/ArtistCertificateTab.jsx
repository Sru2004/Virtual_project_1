import React, { useState, useEffect } from 'react';
import MilestoneProgress from '../common/MilestoneProgress';
import CertificatesList from '../certificates/CertificatesList';
import CertificateNotification from '../certificates/CertificateNotification';
import '../styles/ArtistCertificateTab.css';

/**
 * ArtistCertificateTab Component
 * Complete tab for artist dashboard showing certificates and progress
 */
const ArtistCertificateTab = ({ artistId }) => {
  const [notification, setNotification] = useState({
    show: false,
    level: null,
    count: null
  });

  const handleCertificateEarned = (earnedCerts) => {
    if (earnedCerts && earnedCerts.length > 0) {
      // Show notification for the latest earned certificate
      const latest = earnedCerts[earnedCerts.length - 1];
      setNotification({
        show: true,
        level: latest.level,
        count: latest.level === 'bronze' ? 25 : latest.level === 'silver' ? 50 : 75
      });
    }
  };

  return (
    <div className="certificate-tab-container">
      {/* Notification */}
      <CertificateNotification
        show={notification.show}
        level={notification.level}
        artworkCount={notification.count}
        onClose={() =>
          setNotification({ show: false, level: null, count: null })
        }
      />

      {/* Header */}
      <div className="certificate-tab-header">
        <h2>🎖️ Certificates & Milestones</h2>
        <p>Track your achievements and earn digital certificates</p>
      </div>

      {/* Main Content */}
      <div className="certificate-tab-content">
        {/* Milestone Progress */}
        <section className="section">
          <MilestoneProgress
            artistId={artistId}
            onCertificateEarned={handleCertificateEarned}
          />
        </section>

        {/* Certificates List */}
        <section className="section">
          <CertificatesList artistId={artistId} />
        </section>

        {/* Info Box */}
        <section className="section info-section">
          <div className="info-box">
            <h3>About Digital Certificates</h3>
            <ul>
              <li>
                <strong>Bronze Level:</strong> Awarded when you reach 25 approved artworks
              </li>
              <li>
                <strong>Silver Level:</strong> Awarded when you reach 50 approved artworks
              </li>
              <li>
                <strong>Gold Level:</strong> Awarded when you reach 75 approved artworks
              </li>
              <li>Certificates are unique and non-transferable</li>
              <li>Each certificate includes a unique ID for verification</li>
              <li>Download and display your certificates on your profile or portfolio</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ArtistCertificateTab;
