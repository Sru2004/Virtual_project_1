import React from 'react';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${color}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
      <Icon className="h-8 w-8 text-gray-400" />
    </div>
  </div>
);

export default StatCard;
