import React, { useEffect, useState } from 'react';
import '../styles/CertificateNotification.css';

/**
 * CertificateNotification Component
 * Shows a celebratory notification when a certificate is earned
 */
const CertificateNotification = ({ show, level, artworkCount, onClose }) => {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show);
    if (show) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, 6000); // Auto close after 6 seconds
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!isVisible) return null;

  const levelInfo = {
    bronze: {
      emoji: '🥉',
      displayName: 'Bronze',
      color: '#CD7F32',
      message: 'Congratulations! You achieved Bronze Level!'
    },
    silver: {
      emoji: '🥈',
      displayName: 'Silver',
      color: '#C0C0C0',
      message: 'Amazing! You reached Silver Level!'
    },
    gold: {
      emoji: '🥇',
      displayName: 'Gold',
      color: '#FFD700',
      message: 'Incredible! You earned Gold Level!'
    }
  };

  const info = levelInfo[level?.toLowerCase()] || {
    emoji: '🎖️',
    displayName: level,
    color: '#D3D3D3',
    message: 'Congratulations on your achievement!'
  };

  return (
    <div className="certificate-notification" style={{ borderColor: info.color }}>
      <div className="notification-content">
        <div className="notification-icon">{info.emoji}</div>
        <div className="notification-text">
          <h3>{info.message}</h3>
          <p>Certificate for {artworkCount} approved artworks</p>
        </div>
        <button
          className="notification-close"
          onClick={() => {
            setIsVisible(false);
            onClose?.();
          }}
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
      <div
        className="notification-progress"
        style={{ backgroundColor: info.color }}
      />
    </div>
  );
};

export default CertificateNotification;
