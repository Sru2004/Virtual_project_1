import React from 'react';
import { Sparkles, ShoppingCart, Eye, Smartphone } from 'lucide-react';

export default function FeaturesSection() {
    const features = [
        {
            icon: <Sparkles className="h-8 w-8 text-amber-500" />,
            title: "AI-Powered Recommendations",
            description: "Discover artworks tailored to your taste with our intelligent recommendation system."
        },
        {
            icon: <ShoppingCart className="h-8 w-8 text-rose-500" />,
            title: "Easy Buying & Selling",
            description: "Seamless transactions with secure payments and instant delivery of digital artworks."
        },
        {
            icon: <Eye className="h-8 w-8 text-blue-500" />,
            title: "Augmented Reality Gallery",
            description: "Experience artworks in immersive AR environments before making your purchase."
        },
        {
            icon: <Smartphone className="h-8 w-8 text-green-500" />,
            title: "Mobile-First Design",
            description: "Access your art collection anywhere with our responsive mobile application."
        }
    ];

    return (
        <div className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-800 mb-4">
                        Platform Features
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Cutting-edge technology meets artistic expression in our comprehensive art marketplace.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                            <div className="flex items-center mb-4">
                                <div className="p-3 bg-gray-100 rounded-lg mr-4">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800">
                                    {feature.title}
                                </h3>
                            </div>
                            <p className="text-gray-600 ml-16">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
