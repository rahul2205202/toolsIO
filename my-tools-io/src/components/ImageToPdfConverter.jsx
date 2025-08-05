import React, { useState, useEffect } from 'react';

export default function ImageToPdfConverter() {
    // State now holds an array of files and previews
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    
    const [pdfUrl, setPdfUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Clean up object URLs to prevent memory leaks
    useEffect(() => {
        return () => {
            imagePreviews.forEach(file => URL.revokeObjectURL(file.url));
            if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        };
    }, [imagePreviews, pdfUrl]);

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        if (files.length > 0) {
            setSelectedFiles(files);
            
            // Create previews for all selected files
            const previewUrls = files.map(file => ({
                name: file.name,
                url: URL.createObjectURL(file)
            }));
            setImagePreviews(previewUrls);

            // Reset previous results
            setPdfUrl(null);
            setError(null);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (selectedFiles.length === 0) {
            setError('Please select one or more image files.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setPdfUrl(null);

        const formData = new FormData();
        // Append each file to the FormData object with the same key "files"
        selectedFiles.forEach(file => {
            formData.append('files', file);
        });

        try {
            const response = await fetch('http://localhost:8080/api/convert/image-to-pdf', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'PDF conversion failed.');
            }

            const pdfBlob = await response.blob();
            setPdfUrl(URL.createObjectURL(pdfBlob));

        } catch (err) {
            setError(err.message);
            console.error('Conversion error:', err);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="bg-gray-100 min-h-screen flex items-center justify-center font-sans p-4">
            <div className="w-full max-w-6xl bg-white rounded-lg shadow-xl p-8">
                <h2 className="text-3xl font-bold text-black text-center mb-2">Image to PDF Converter</h2>
                <p className="text-center text-gray-500 mb-8">Upload multiple images to combine them into a single PDF.</p>

                <form onSubmit={handleSubmit} className="mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                        <div className="col-span-1">
                            <label htmlFor="pdf-file-upload" className="block text-sm font-bold text-black mb-2">
                                Upload Images
                            </label>
                            <input
                                id="pdf-file-upload"
                                type="file"
                                accept="image/png, image/jpeg, image/gif, image/bmp"
                                multiple // <-- Allow multiple file selection
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-200 file:text-black hover:file:bg-gray-300"
                            />
                        </div>
                        <div className="col-span-1">
                            <button
                                type="submit"
                                disabled={isLoading || selectedFiles.length === 0}
                                className="w-full bg-black text-white font-bold py-2.5 px-4 rounded-md transition-colors duration-300 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Creating PDF...' : 'Convert to PDF'}
                            </button>
                        </div>
                    </div>
                </form>
                
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md my-4" role="alert"><strong className="font-bold">Error: </strong><span className="block sm:inline">{error}</span></div>}

                {/* Preview and Download Section */}
                {imagePreviews.length > 0 && (
                    <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-black">Image Previews ({imagePreviews.length} files)</h3>
                            {pdfUrl && !isLoading && (
                                <a href={pdfUrl} download="converted_document.pdf" className="bg-green-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300 hover:bg-green-700">
                                    Download PDF
                                </a>
                            )}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 bg-gray-50 p-4 rounded-md">
                        {imagePreviews.map((image, index) => (
                            <div key={index} className="text-center">
                                <img src={image.url} alt={image.name} className="w-full h-24 object-cover rounded-md mb-2 border" />
                                <p className="text-xs text-gray-600 truncate" title={image.name}>{image.name}</p>
                            </div>
                        ))}
                        </div>
                    </div>
                )}
                {/* Divider */}
                <div className="my-12 border-t border-gray-200"></div>
                {/* --- Guide and Features Section --- */}
                {/* How to Use Section */}
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-black mb-10">How to Convert Images to PDF?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Step 1 */}
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mb-4"><span className="text-white font-bold text-2xl">1</span></div>
                            <h3 className="text-xl font-semibold text-black mb-2">Upload Images</h3>
                            <p className="text-gray-600 px-4">Select one or more images you want to combine into a PDF document.</p>
                        </div>
                        {/* Step 2 */}
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mb-4"><span className="text-white font-bold text-2xl">2</span></div>
                            <h3 className="text-xl font-semibold text-black mb-2">Create PDF</h3>
                            <p className="text-gray-600 px-4">Click the "Convert to PDF" button. Our tool will merge your images into a single file.</p>
                        </div>
                        {/* Step 3 */}
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mb-4"><span className="text-white font-bold text-2xl">3</span></div>
                            <h3 className="text-xl font-semibold text-black mb-2">Download</h3>
                            <p className="text-gray-600 px-4">Download your new PDF file. All uploaded images are deleted from our servers for your privacy.</p>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="my-12 border-t border-gray-200"></div>

                {/* Key Features Section */}
                <div className="text-center pb-[15px]">
                    <h2 className="text-3xl font-bold text-black mb-10">Key Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 max-w-4xl mx-auto text-left">
                        {/* Feature 1: Multi-Image Support */}
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-black mb-1">Multi-Image Support</h4>
                                <p className="text-gray-600">Combine multiple images (JPG, PNG, GIF, BMP) into one convenient PDF document.</p>
                            </div>
                        </div>
                        {/* Feature 2: Page per Image */}
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                               <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-black mb-1">Page per Image</h4>
                                <p className="text-gray-600">Each image you upload is automatically placed on its own separate page for a clean, organized document.</p>
                            </div>
                        </div>
                        {/* Feature 3: High-Quality Output */}
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-black mb-1">High-Quality Output</h4>
                                <p className="text-gray-600">Your images are embedded in the PDF at their original quality, ensuring a crisp and professional result.</p>
                            </div>
                        </div>
                        {/* Feature 4: Secure & Private */}
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.417l5.5-5.5a1 1 0 011.414 0l5.5 5.5A12.02 12.02 0 0012 21.944a11.955 11.955 0 018.618-3.04m-3.04-7.016a1 1 0 011.414 0l2.12 2.12a1 1 0 010 1.414l-2.12 2.12a1 1 0 01-1.414 0l-2.12-2.12a1 1 0 010-1.414l2.12-2.12z"></path></svg>
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-black mb-1">Secure & Private</h4>
                                <p className="text-gray-600">All conversions are done on our secure servers, and your files are never stored or shared.</p>
                            </div>
                        </div>
                    </div>
            </div>
            </div>
        </div>
    );
}
