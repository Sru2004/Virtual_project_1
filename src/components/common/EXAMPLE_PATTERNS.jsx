/**
 * EXAMPLE COMPONENT: Professional UI Patterns
 * 
 * This file demonstrates best practices for using:
 * - Toast notifications (success, error, warning, info)
 * - Confirmation modals (delete, logout, confirm actions)
 * 
 * Copy patterns from this file to your components!
 */

import React, { useState } from 'react';
import { Trash2, Save, LogOut } from 'lucide-react';
import { toastSuccess, toastError, toastWarning, toastInfo } from '../../lib/toast';
import ConfirmModal from '../auth/ConfirmModal';

const ExampleComponent = () => {
  // ============================================
  // STATE MANAGEMENT
  // ============================================

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    itemId: null,
    itemName: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Logout Modal State
  const [logoutModal, setLogoutModal] = useState({
    isOpen: false
  });
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Generic Confirm Modal
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });
  const [isConfirming, setIsConfirming] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  // ============================================
  // PATTERN 1: DELETE WITH CONFIRMATION
  // ============================================

  const handleDeleteClick = (itemId, itemName) => {
    setDeleteModal({
      isOpen: true,
      itemId,
      itemName
    });
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Success
      toastSuccess(`"${deleteModal.itemName}" deleted successfully`);
      
      // Close modal
      setDeleteModal({ isOpen: false, itemId: null, itemName: '' });
      
      // Refresh data, navigate, etc.
    } catch (error) {
      // Error with specific message
      toastError(error.message || 'Failed to delete. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // ============================================
  // PATTERN 2: FORM VALIDATION WITH TOAST
  // ============================================

  const handleSaveClick = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.title.trim()) {
      toastError('Please enter a title');
      return;
    }

    if (!formData.description.trim()) {
      toastError('Please enter a description');
      return;
    }

    // Check for duplicate/conflict
    if (formData.title.length < 3) {
      toastWarning('Title should be at least 3 characters long');
      return;
    }

    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toastSuccess('Changes saved successfully!');
      // Reset form
      setFormData({ title: '', description: '' });
    } catch (error) {
      toastError(error.message || 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================
  // PATTERN 3: LOGOUT WITH CONFIRMATION
  // ============================================

  const handleLogoutClick = () => {
    setLogoutModal({ isOpen: true });
  };

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      toastSuccess('Logged out successfully');
      setLogoutModal({ isOpen: false });
      // Navigate to login
      window.location.href = '/login';
    } catch (error) {
      toastError('Failed to logout. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // ============================================
  // PATTERN 4: GENERIC CONFIRM DIALOG
  // ============================================

  const openConfirm = (title, message, onConfirm) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm
    });
  };

  const handleConfirmAction = async () => {
    setIsConfirming(true);
    try {
      if (confirmModal.onConfirm) {
        await confirmModal.onConfirm();
      }
      setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
    } catch (error) {
      toastError(error.message);
    } finally {
      setIsConfirming(false);
    }
  };

  // ============================================
  // PATTERN 5: INFO MESSAGES (NON-BLOCKING)
  // ============================================

  const handleInfoClick = () => {
    toastInfo('This is an informational message that auto-dismisses');
  };

  const handleWarningClick = () => {
    toastWarning('This is a warning that requires attention but is not an error');
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Professional UI Patterns Example</h1>

      {/* ===== PATTERN EXAMPLES ===== */}

      <section className="space-y-6">
        {/* Pattern 1: Delete Button */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-600" />
            Pattern 1: Delete with Modal Confirmation
          </h2>
          <p className="text-gray-600 mb-4">
            Opens a confirmation modal before delete. User must confirm to proceed.
          </p>
          <button
            onClick={() => handleDeleteClick('artwork-123', 'Beautiful Sunset')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Delete Item
          </button>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
            ✓ Shows confirmation modal before action<br/>
            ✓ Prevents accidental deletions<br/>
            ✓ Displays success/error toasts<br/>
            ✓ Shows loading state during API call
          </div>
        </div>

        {/* Pattern 2: Form with Validation */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Save className="w-5 h-5 text-green-600" />
            Pattern 2: Form with Validation & Toast Feedback
          </h2>
          <form onSubmit={handleSaveClick} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter title..."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter description..."
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </form>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
            ✓ Validates before submission<br/>
            ✓ Shows specific error messages<br/>
            ✓ Clear success feedback<br/>
            ✓ Handles loading state
          </div>
        </div>

        {/* Pattern 3: Logout Button */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <LogOut className="w-5 h-5 text-amber-600" />
            Pattern 3: Logout with Confirmation Modal
          </h2>
          <p className="text-gray-600 mb-4">
            Confirms before logging out (prevents accidental clicks).
          </p>
          <button
            onClick={handleLogoutClick}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
          >
            Logout
          </button>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
            ✓ Confirmation modal for significant actions<br/>
            ✓ Loading state during API call<br/>
            ✓ Clear user feedback<br/>
            ✓ Graceful error handling
          </div>
        </div>

        {/* Pattern 4: Just Info Messages */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-semibold mb-4">
            Pattern 4: Informational & Warning Toasts
          </h2>
          <p className="text-gray-600 mb-4">
            Simple, non-blocking messages for informational purposes.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleInfoClick}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Show Info
            </button>
            <button
              onClick={handleWarningClick}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
            >
              Show Warning
            </button>
          </div>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
            ✓ Auto-dismisses after 3-4 seconds<br/>
            ✓ Non-blocking (user can interact)<br/>
            ✓ Top-right position (non-intrusive)<br/>
            ✓ Professional styling
          </div>
        </div>
      </section>

      {/* ===== COMPONENT REFERENCE ===== */}

      <section className="mt-12 bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Quick Reference</h2>
        <div className="space-y-2 text-sm text-gray-700 font-mono">
          <div>
            <strong>Toast Success:</strong> toastSuccess('Message', duration?)
          </div>
          <div>
            <strong>Toast Error:</strong> toastError('Message', duration?)
          </div>
          <div>
            <strong>Toast Warning:</strong> toastWarning('Message', duration?)
          </div>
          <div>
            <strong>Toast Info:</strong> toastInfo('Message', duration?)
          </div>
          <div className="mt-4">
            <strong>ConfirmModal Props:</strong>
            <div className="mt-2 pl-4 space-y-1">
              - isOpen: boolean
              <br />- onClose: function
              <br />- onConfirm: function
              <br />- title: string
              <br />- message: string
              <br />- confirmText: string (default: "Confirm")
              <br />- cancelText: string (default: "Cancel")
              <br />- confirmColor: "red" | "blue" | "green" | "amber" (default: "red")
              <br />- isLoading: boolean (default: false)
            </div>
          </div>
        </div>
      </section>

      {/* ===== MODALS ===== */}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, itemId: null, itemName: '' })}
        onConfirm={handleDeleteConfirm}
        title="Delete Item?"
        message={`Are you sure you want to delete "${deleteModal.itemName}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmColor="red"
        isLoading={isDeleting}
      />

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={logoutModal.isOpen}
        onClose={() => setLogoutModal({ isOpen: false })}
        onConfirm={handleLogoutConfirm}
        title="Logout?"
        message="Are you sure you want to logout? You will need to login again to access your account."
        confirmText="Logout"
        confirmColor="amber"
        isLoading={isLoggingOut}
      />

      {/* Generic Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null })}
        onConfirm={handleConfirmAction}
        title={confirmModal.title}
        message={confirmModal.message}
        isLoading={isConfirming}
      />
    </div>
  );
};

export default ExampleComponent;

/**
 * ============================================
 * HOW TO USE THESE PATTERNS IN YOUR CODE
 * ============================================
 * 
 * 1. COPY THE STATE MANAGEMENT
 *    - Copy the useState hooks you need
 *    - Adapt names to your use case
 * 
 * 2. COPY THE HANDLERS
 *    - handleDeleteClick, handleDeleteConfirm
 *    - handleSaveClick, handleLogoutClick
 *    - Adapt API calls to your actual endpoints
 * 
 * 3. COPY THE JSX
 *    - Buttons with onClick handlers
 *    - ConfirmModal components
 *    - Toast notifications
 * 
 * 4. CUSTOMIZE
 *    - Change button text, colors, labels
 *    - Adjust toast durations
 *    - Update API endpoints
 * 
 * ============================================
 * COMMON MISTAKES TO AVOID
 * ============================================
 * 
 * ❌ Don't use window.alert('message')
 *    → Use toastError('message') instead
 * 
 * ❌ Don't use window.confirm()
 *    → Use <ConfirmModal> instead
 * 
 * ❌ Don't forget to close modal on confirm
 *    → Call setModal({ isOpen: false })
 * 
 * ❌ Don't show toast before closing modal
 *    → Close modal first, then show toast
 * 
 * ❌ Don't forget loading state during API call
 *    → Use try/finally and isLoading state
 * 
 * ✅ Always provide specific error messages
 * ✅ Always show feedback after user action
 * ✅ Always reset state after successful action
 * ✅ Always handle errors gracefully
 * ✅ Always close modals when done
 */
