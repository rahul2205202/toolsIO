import React from 'react';

// You can place this component in your project, e.g., src/components/Footer.jsx
export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-200 mt-auto">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-center justify-between py-6">
                    {/* Copyright Notice */}
                    <div className="text-center md:text-left mb-4 md:mb-0">
                        <p className="text-sm text-gray-500">
                            &copy; {new Date().getFullYear()} PixelShift. All Rights Reserved.
                        </p>
                    </div>

                    {/* Footer Links */}
                    <div className="flex space-x-6">
                        <a href="#" className="text-sm text-gray-500 hover:text-black transition-colors duration-200">
                            Privacy Policy
                        </a>
                        <a href="#" className="text-sm text-gray-500 hover:text-black transition-colors duration-200">
                            Terms of Service
                        </a>
                        <a href="#" className="text-sm text-gray-500 hover:text-black transition-colors duration-200">
                            Contact
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
