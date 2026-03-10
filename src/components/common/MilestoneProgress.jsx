import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/MilestoneProgress.css';

/**
 * MilestoneProgress Component
 * Displays progress toward next certificate milestone
 */
const MilestoneProgress = ({ artistId, onCertificateEarned }) => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMilestoneProgress();
    // Refresh every 2 minutes
    const interval = setInterval(fetchMilestoneProgress, 120000);
    return () => clearInterval(interval);
  }, [artistId]);

  const fetchMilestoneProgress = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `/api/certificates/${artistId}/progress`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setProgress(response.data.progress);
      setError(null);

      // Notify if new certificate was earned
      onCertificateEarned?.(response.data.earnedCertificates);
    } catch (err) {
      console.error('Error fetching milestone progress:', err);
      setError(err.response?.data?.message || 'Failed to load progress');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="milestone-container loading">
        <p>Loading progress...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="milestone-container error">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!progress) {
    return null;
  }

  const getBadgeClass = (level, earned) => {
    if (earned) {
      return `badge badge-${level} earned`;
    }
    return `badge badge-${level}`;
  };

  const getMilestoneStatus = (nextMilestone, currentCount) => {
    if (nextMilestone === null) {
      return "🎉 All milestones reached!";
    }
    return `${currentCount}/${nextMilestone} for ${
      nextMilestone === 25 ? 'Bronze' : nextMilestone === 50 ? 'Silver' : 'Gold'
    }`;
  };

  return (
    <div className="milestone-container">
      <h3 className="milestone-title">Certificate Milestones</h3>

      {/* Milestone Badges */}
      <div className="badges-section">
        <div className={getBadgeClass('bronze', progress.earnedLevels.bronze)}>
          <div className="badge-icon">🥉</div>
          <div className="badge-content">
            <div className="badge-label">Bronze</div>
            <div className="badge-count">25 Artworks</div>
          </div>
          {progress.earnedLevels.bronze && (
            <div className="badge-earned-mark">✓ Earned</div>
          )}
        </div>

        <div className={getBadgeClass('silver', progress.earnedLevels.silver)}>
          <div className="badge-icon">🥈</div>
          <div className="badge-content">
            <div className="badge-label">Silver</div>
            <div className="badge-count">50 Artworks</div>
          </div>
          {progress.earnedLevels.silver && (
            <div className="badge-earned-mark">✓ Earned</div>
          )}
        </div>

        <div className={getBadgeClass('gold', progress.earnedLevels.gold)}>
          <div className="badge-icon">🥇</div>
          <div className="badge-content">
            <div className="badge-label">Gold</div>
            <div className="badge-count">75 Artworks</div>
          </div>
          {progress.earnedLevels.gold && (
            <div className="badge-earned-mark">✓ Earned</div>
          )}
        </div>
      </div>

      {/* Progress Bars */}
      <div className="progress-section">
        <h4>Progress</h4>

        {/* Bronze Progress */}
        <div className="progress-item">
          <div className="progress-label">
            <span>Bronze Level</span>
            <span className="progress-text">
              {Math.round(progress.progressPercentage.bronze)}%
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill bronze"
              style={{ width: `${progress.progressPercentage.bronze}%` }}
            />
          </div>
          <div className="progress-count">
            {progress.currentCount} / 25 artworks
          </div>
        </div>

        {/* Silver Progress */}
        <div className="progress-item">
          <div className="progress-label">
            <span>Silver Level</span>
            <span className="progress-text">
              {Math.round(progress.progressPercentage.silver)}%
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill silver"
              style={{ width: `${progress.progressPercentage.silver}%` }}
            />
          </div>
          <div className="progress-count">
            {progress.currentCount} / 50 artworks
          </div>
        </div>

        {/* Gold Progress */}
        <div className="progress-item">
          <div className="progress-label">
            <span>Gold Level</span>
            <span className="progress-text">
              {Math.round(progress.progressPercentage.gold)}%
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill gold"
              style={{ width: `${progress.progressPercentage.gold}%` }}
            />
          </div>
          <div className="progress-count">
            {progress.currentCount} / 75 artworks
          </div>
        </div>
      </div>

      {/* Status Message */}
      <div className="status-message">
        <p>{getMilestoneStatus(progress.nextMilestone, progress.currentCount)}</p>
        {progress.artworksNeeded > 0 && (
          <p className="needed-text">
            {progress.artworksNeeded} approved artwork{progress.artworksNeeded !== 1 ? 's' : ''} needed for next level
          </p>
        )}
      </div>
    </div>
  );
};

export default MilestoneProgress;
