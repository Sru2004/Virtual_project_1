import React from 'react';
import { Palette, Users, Shield, Zap } from 'lucide-react';

export default function WhyChooseUs() {
    const features = [
        {
            icon: <Palette className="h-12 w-12 text-amber-500" />,
            title: "Diverse Art Collection",
            description: "Explore thousands of artworks across multiple styles, from contemporary to classical, digital to traditional."
        },
        {
            icon: <Users className="h-12 w-12 text-rose-500" />,
            title: "Artist Community",
            description: "Connect directly with talented artists, learn about their creative process, and support emerging talent."
        },
        {
            icon: <Shield className="h-12 w-12 text-green-500" />,
            title: "Secure Transactions",
            description: "Safe and secure buying and selling with protected payments and verified artist profiles."
        },
        {
            icon: <Zap className="h-12 w-12 text-blue-500" />,
            title: "AI-Powered Discovery",
            description: "Personalized recommendations based on your taste, helping you discover your next favorite piece."
        }
    ];

    return (
        <div className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-800 mb-4">
                        Why Choose VisualArt?
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Experience the future of art collecting with our innovative platform designed for artists and collectors alike.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
                            <div className="flex justify-center mb-4">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
