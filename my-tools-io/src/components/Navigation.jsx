import React, { useState } from 'react';
import { href } from 'react-router-dom';

// You can place this component in your project, e.g., src/components/Header.jsx
export default function Navigation() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navLinks = [
    { href: '/image-to-pdf', text: 'Image to PDF' },
    { href: '/pdf-to-image', text: 'PDF to Image'},
    { href: '/image-generator', text: 'AI Image Generation'}
    ];


    return (
        <header className="bg-white shadow-md w-full sticky top-0 z-10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Site Title / Logo */}
                    <div className="flex-shrink-0">
                        <a href="/" className="text-2xl font-bold text-black">
                           PixelShift
                        </a>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex md:space-x-8">
                        {navLinks.map((link) => (
                             <a
                                key={link.text}
                                href={link.href}
                                className="font-medium text-gray-600 hover:text-black transition-colors duration-200"
                            >
                                {link.text}
                            </a>
                        ))}
                    </nav>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-black hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black"
                        >
                            <span className="sr-only">Open main menu</span>
                            {/* Icon: Menu (Hamburger) */}
                            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu (collapsible) */}
            {isMenuOpen && (
                <div className="md:hidden" id="mobile-menu">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                         {navLinks.map((link) => (
                             <a
                                key={link.text}
                                href={link.href}
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-black hover:bg-gray-100"
                            >
                                {link.text}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </header>
    );
}
