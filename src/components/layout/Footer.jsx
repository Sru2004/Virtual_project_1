import React from 'react';
import { Info, Mail, FileText, Shield } from 'lucide-react';

const Footer = ({ onNavigate }) => {
  return (
    <footer className="bg-gradient-to-r from-amber-900 to-rose-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">About Us</h3>
            <button
              onClick={() => onNavigate('about')}
              className="flex items-center gap-2 text-amber-100 hover:text-white transition-colors"
            >
              <Info className="h-4 w-4" />
              <span>Learn More</span>
            </button>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Contact</h3>
            <button
              onClick={() => onNavigate('contact')}
              className="flex items-center gap-2 text-amber-100 hover:text-white transition-colors"
            >
              <Mail className="h-4 w-4" />
              <span>Get in Touch</span>
            </button>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Legal</h3>
            <div className="space-y-2">
              <button
                onClick={() => onNavigate('terms')}
                className="flex items-center gap-2 text-amber-100 hover:text-white transition-colors"
              >
                <FileText className="h-4 w-4" />
                <span>Terms & Conditions</span>
              </button>
              <button
                onClick={() => onNavigate('privacy')}
                className="flex items-center gap-2 text-amber-100 hover:text-white transition-colors"
              >
                <Shield className="h-4 w-4" />
                <span>Privacy Policy</span>
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Newsletter</h3>
            <p className="text-amber-100 text-sm mb-3">
              Stay updated with the latest artworks and artists
            </p>
            <input
              type="email"
              placeholder="Your email"
              className="w-full px-4 py-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="border-t border-amber-700 mt-8 pt-8 text-center">
          <p className="text-amber-100">
            Virtual Art © 2025 - All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
