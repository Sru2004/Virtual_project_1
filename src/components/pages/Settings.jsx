import React, { useState } from 'react';
import { Save, Upload, Globe, Mail, Phone, MapPin, Image, Palette } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const [settings, setSettings] = useState({
    siteName: 'Virtual Art Gallery',
    siteDescription: 'Discover and purchase unique artworks with AR preview',
    contactEmail: 'admin@virtualart.com',
    contactPhone: '+91 9876543210',
    address: '123 Art Street, Creative City, India',
    logoUrl: '',
    footerText: '© 2024 Virtual Art Gallery. All rights reserved.',
    socialLinks: {
      facebook: 'https://facebook.com/virtualart',
      instagram: 'https://instagram.com/virtualart',
      twitter: 'https://twitter.com/virtualart',
      linkedin: 'https://linkedin.com/company/virtualart'
    },
    notificationSettings: {
      emailNotifications: true,
      pushNotifications: false,
      artistApprovals: true,
      artworkSubmissions: true,
      systemUpdates: false
    },
    systemLimits: {
      maxFileSize: 10, // MB
      maxArtworksPerArtist: 50,
      maxImagesPerArtwork: 5
    }
  });

  const [logoFile, setLogoFile] = useState(null);

  const handleSave = () => {
    // Here you would typically save to backend
    toast.success('Settings saved successfully!');
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setLogoFile(file);
      // Here you would upload the file and get the URL
      toast.success('Logo uploaded successfully!');
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateNestedSetting = (parentKey, childKey, value) => {
    setSettings(prev => ({
      ...prev,
      [parentKey]: {
        ...prev[parentKey],
        [childKey]: value
      }
    }));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">System Settings</h1>
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          Save Changes
        </button>
      </div>

      <div className="space-y-8">
        {/* Site Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Site Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => updateSetting('siteName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => updateSetting('contactEmail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => updateSetting('siteDescription', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Contact Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={settings.contactPhone}
                onChange={(e) => updateSetting('contactPhone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => updateSetting('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Branding */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Branding
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Logo Upload</label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Choose Logo
                </label>
                {logoFile && <span className="text-sm text-gray-600">{logoFile.name}</span>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Footer Text</label>
              <input
                type="text"
                value={settings.footerText}
                onChange={(e) => updateSetting('footerText', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Image className="h-5 w-5" />
            Social Media Links
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(settings.socialLinks).map(([platform, url]) => (
              <div key={platform}>
                <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                  {platform}
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => updateNestedSetting('socialLinks', platform, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Notification Settings</h2>
          <div className="space-y-4">
            {Object.entries(settings.notificationSettings).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => updateNestedSetting('notificationSettings', key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* System Limits */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">System Limits</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max File Size (MB)</label>
              <input
                type="number"
                value={settings.systemLimits.maxFileSize}
                onChange={(e) => updateNestedSetting('systemLimits', 'maxFileSize', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Artworks per Artist</label>
              <input
                type="number"
                value={settings.systemLimits.maxArtworksPerArtist}
                onChange={(e) => updateNestedSetting('systemLimits', 'maxArtworksPerArtist', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Images per Artwork</label>
              <input
                type="number"
                value={settings.systemLimits.maxImagesPerArtwork}
                onChange={(e) => updateNestedSetting('systemLimits', 'maxImagesPerArtwork', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium"
          >
            <Save className="h-5 w-5" />
            Save All Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
