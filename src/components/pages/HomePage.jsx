import React from 'react';
import HeroSection from '../sections/HeroSection';
import WhyChooseUs from '../sections/WhyChooseUs';
import FeaturesSection from '../sections/FeaturesSection';
import LatestCreations from '../sections/LatestCreations';

const HomePage = () => {

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-rose-50">
      <HeroSection />
      <WhyChooseUs />
      <FeaturesSection />
      <LatestCreations />
    </div>
  );
};

export default HomePage;
