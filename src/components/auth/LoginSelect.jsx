import React from 'react';
import { Palette, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import bgImage from '../../assets/img8.jpg'; // import the image

const LoginSelect = ({ onSelect }) => {
  const navigate = useNavigate();

  return (
    <div
      className="relative min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Blur overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

      {/* Content */}
      <div className="relative max-w-4xl w-full">
      <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-center mb-4 bg-gradient-to-r from-red-500 via-yellow-400 via-green-400 via-blue-500 via-indigo-500 to-purple-600 bg-clip-text text-transparent text-shadow-white animate-rainbow">
          Welcome to Virtual Art
       </h1>


        <p className="text-center text-2xl text-gray-200 mb-10">
          Select your account type to continue
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <button
            onClick={() => navigate('/login/artist')}
            className="group bg-white/80 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
          >
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-rose-500 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Palette className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">I'm an Artist</h2>
              <p className="text-gray-600 text-center mb-6">
                Showcase your artwork, connect with buyers, and grow your art business
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                  Upload Art
                </span>
                <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-sm">
                  Manage Sales
                </span>
                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                  Build Portfolio
                </span>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/login/user')}
            className="group bg-white/80 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
          >
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-teal-500 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <User className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">I'm a Buyer</h2>
              <p className="text-gray-600 text-center mb-6">
                Discover unique artworks, connect with artists, and build your collection
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  Browse Art
                </span>
                <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm">
                  Create Wishlist
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  Leave Reviews
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginSelect;
