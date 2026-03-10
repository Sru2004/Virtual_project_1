import React from 'react';

const SettingsSection = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Settings & Permissions</h1>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Sub-Admin Management</h3>
            <p className="text-gray-600 mb-4">Create or remove sub-admin accounts</p>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Manage Sub-Admins
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Role-Based Access</h3>
            <p className="text-gray-600 mb-4">Set role-based access control (RBAC)</p>
            <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Configure Roles
            </button>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">System Configuration</h3>
          <p className="text-gray-600">Change admin credentials, update themes, limits, and API keys</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsSection;
