import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Professional Confirmation Modal Component
 * 
 * Props:
 * - isOpen: Boolean to control modal visibility
 * - onClose: Function to call when modal is closed (Cancel or X button)
 * - onConfirm: Function to call when user confirms action
 * - title: Modal title (e.g., "Delete Artwork?")
 * - message: Detailed message (e.g., "This action cannot be undone...")
 * - confirmText: Confirm button text (default: "Confirm")
 * - cancelText: Cancel button text (default: "Cancel")
 * - confirmColor: Button color - 'red' (delete), 'blue' (general), 'green' (save) - default: 'red'
 * - isLoading: Show loading state and disable buttons
 * 
 * Example:
 * const [deleteModal, setDeleteModal] = useState({ isOpen: false, artworkId: null });
 * 
 * <ConfirmModal
 *   isOpen={deleteModal.isOpen}
 *   onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
 *   onConfirm={() => handleDelete(deleteModal.artworkId)}
 *   title="Delete Artwork?"
 *   message="This action cannot be undone. The artwork will be permanently removed."
 *   confirmText="Delete"
 *   confirmColor="red"
 *   isLoading={deleting}
 * />
 */

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'red',
  isLoading = false,
}) => {
  // Handle keyboard events (Escape to close, Enter to confirm)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
      // Uncomment if you want Enter to confirm automatically
      // if (e.key === 'Enter' && !isLoading) {
      //   onConfirm();
      // }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onConfirm, isLoading]);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Determine button color classes based on confirmColor prop
  const buttonColorClasses = {
    red: 'bg-red-600 hover:bg-red-700',
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    amber: 'bg-amber-600 hover:bg-amber-700',
  };

  const buttonColor = buttonColorClasses[confirmColor] || buttonColorClasses.red;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Backdrop - Click to close */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container - Smooth animation */}
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div
          className={`relative bg-white rounded-lg shadow-2xl max-w-md w-full p-6 transform transition-all ${
            isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          {/* Close Button (Top Right) */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            disabled={isLoading}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2 pr-8" id="modal-title">
            {title}
          </h3>

          {/* Modal Message */}
          <p className="text-gray-600 text-sm mb-6">
            {message}
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            {/* Cancel Button */}
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>

            {/* Confirm Button */}
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-4 py-2 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${buttonColor}`}
            >
              {isLoading ? 'Processing...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
