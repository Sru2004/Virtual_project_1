import React from "react";

export default function WelcomeCard({ userName }) {
  return (
    <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 rounded-2xl shadow-xl p-8 mb-8 text-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>
      
      <div className="relative z-10">
        <p className="text-purple-100 text-sm font-medium uppercase tracking-wider mb-2">Welcome Back</p>
        <h1 className="text-4xl font-bold mb-3">
          {userName || "User"}
        </h1>
        <p className="text-purple-100 text-lg max-w-2xl">
          Discover and collect stunning artworks from talented artists around the world. Explore unique pieces that inspire and delight.
        </p>
        
        {/* Quick Stats */}
        <div className="flex gap-8 mt-6">
          <div>
            <p className="text-white/80 text-sm font-medium">New This Week</p>
            <p className="text-2xl font-bold text-white">150+</p>
          </div>
          <div>
            <p className="text-white/80 text-sm font-medium">Categories</p>
            <p className="text-2xl font-bold text-white">12</p>
          </div>
          <div>
            <p className="text-white/80 text-sm font-medium">Top Artists</p>
            <p className="text-2xl font-bold text-white">340+</p>
          </div>
        </div>
      </div>
    </div>
  );
}
