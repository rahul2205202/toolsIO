import React, { useState, useEffect } from 'react';

// You can place this component in your project, e.g., src/components/ImageConverter.jsx
export default function ImageConverter() {
    // State for the selected file and its preview
    const [selectedFile, setSelectedFile] = useState(null);
    const [originalImagePreview, setOriginalImagePreview] = useState(null);

    // State for the conversion process
    const [targetFormat, setTargetFormat] = useState('jpeg');
    const [convertedImageUrl, setConvertedImageUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Clean up object URLs to prevent memory leaks
    useEffect(() => {
        return () => {
            if (originalImagePreview) URL.revokeObjectURL(originalImagePreview);
            if (convertedImageUrl) URL.revokeObjectURL(convertedImageUrl);
        };
    }, [originalImagePreview, convertedImageUrl]);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            // Create a preview URL for the selected file
            setOriginalImagePreview(URL.createObjectURL(file));
            // Reset previous conversion results
            setConvertedImageUrl(null);
            setError(null);
        }
    };

    const handleFormatChange = (event) => {
        setTargetFormat(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!selectedFile) {
            setError('Please select an image file first.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setConvertedImageUrl(null);

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('toFormat', targetFormat);

        try {
            // Replace with your actual API endpoint if different
            const response = await fetch('http://localhost:8080/api/convert/image', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                // Try to read the error message from the server
                const errorText = await response.text();
                throw new Error(errorText || 'Image conversion failed.');
            }

            const imageBlob = await response.blob();
            setConvertedImageUrl(URL.createObjectURL(imageBlob));

        } catch (err) {
            setError(err.message);
            console.error('Conversion error:', err);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Generates a dynamic filename for the download link
    const getDownloadFileName = () => {
        if (!selectedFile) return `converted_image.${targetFormat}`;
        const nameWithoutExtension = selectedFile.name.split('.').slice(0, -1).join('.');
        return `${nameWithoutExtension}_converted.${targetFormat}`;
    };

    return (
        <div className="bg-gray-100 min-h-screen flex items-center justify-center font-sans p-4">
            <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl p-8">
                <h1 className="text-3xl font-bold text-black text-center mb-2">Universal Image Converter</h1>
                <p className="text-center text-gray-500 mb-8">Upload any image and convert it to a different format.</p>

                {/* Form Section */}
                <form onSubmit={handleSubmit} className="mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                        {/* File Input */}
                        <div className="col-span-1">
                            <label htmlFor="file-upload" className="block text-sm font-bold text-black mb-2">
                                 Upload Image
                            </label>
                            <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-200 file:text-black hover:file:bg-gray-300"
                            />
                        </div>

                        {/* Format Selector */}
                        <div className="col-span-1">
                            <label htmlFor="format-select" className="block text-sm font-bold text-black mb-2">
                                Select Output Format
                            </label>
                            <select
                                id="format-select"
                                value={targetFormat}
                                onChange={handleFormatChange}
                                className="w-full p-2.5 border border-black bg-white text-black rounded-md focus:ring-2 focus:ring-black focus:border-black"
                            >
                                <option value="jpeg">JPEG</option>
                                <option value="png">PNG</option>
                                <option value="gif">GIF</option>
                                <option value="bmp">BMP</option>
                            </select>
                        </div>

                        {/* Submit Button */}
                        <div className="col-span-1">
                             <button
                                type="submit"
                                disabled={isLoading || !selectedFile}
                                className="w-full bg-black text-white font-bold py-2.5 px-4 rounded-md transition-colors duration-300 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Converting...' : 'Convert Image'}
                            </button>
                        </div>
                    </div>
                </form>
                
                {/* Error Display */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md my-4" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}


                {/* Results Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Original Image Preview */}
                    <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="text-lg font-bold text-black mb-4">Original</h3>
                        <div className="h-80 flex items-center justify-center bg-gray-50 rounded-md">
                           {originalImagePreview ? (
                                <img src={originalImagePreview} alt="Original preview" className="max-h-full max-w-full object-contain" />
                            ) : (
                                <p className="text-gray-400">Upload an image to see a preview</p>
                            )}
                        </div>
                    </div>

                    {/* Converted Image Preview */}
                    <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="text-lg font-bold text-black mb-4">Converted ({targetFormat.toUpperCase()})</h3>
                         <div className="h-80 flex items-center justify-center bg-gray-50 rounded-md">
                           {isLoading && <div className="text-black">Processing...</div>}
                           {convertedImageUrl && !isLoading && (
                                <img src={convertedImageUrl} alt="Converted preview" className="max-h-full max-w-full object-contain" />
                            )}
                           {!isLoading && !convertedImageUrl && (
                               <p className="text-gray-400">Your converted image will appear here</p>
                           )}
                        </div>
                        {convertedImageUrl && (
                           <a
                                href={convertedImageUrl}
                                download={getDownloadFileName()}
                                className="mt-4 w-full block text-center bg-green-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300 hover:bg-green-700"
                            >
                                Download Converted Image
                            </a>
                        )}
                    </div>
                </div>
                <div className="my-12 border-t border-gray-200"></div>
                {/* How to Use Section */}
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-black mb-10">How to Convert Images Free?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Step 1 */}
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mb-4">
                                <span className="text-white font-bold text-2xl">1</span>
                            </div>
                            <h3 className="text-xl font-semibold text-black mb-2">Upload</h3>
                            <p className="text-gray-600 px-4">Select the image you want to change, then add it to our converter for processing.</p>
                        </div>
                        {/* Step 2 */}
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mb-4">
                                <span className="text-white font-bold text-2xl">2</span>
                            </div>
                            <h3 className="text-xl font-semibold text-black mb-2">Choose Format</h3>
                            <p className="text-gray-600 px-4">Our online converter turns your image into your chosen format in seconds.</p>
                        </div>
                        {/* Step 3 */}
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mb-4">
                                <span className="text-white font-bold text-2xl">3</span>
                            </div>
                            <h3 className="text-xl font-semibold text-black mb-2">Download</h3>
                            <p className="text-gray-600 px-4">Download your converted file. All remaining files will be deleted from our servers.</p>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="my-12 border-t border-gray-200"></div>

                {/* --- UPDATED: Key Features Section --- */}
                <div className="text-center pb-[15px]">
                    <h2 className="text-3xl font-bold text-black mb-10">Key Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 max-w-4xl mx-auto text-left">
                        {/* Feature 1: Multiple Formats */}
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-black mb-1">Multiple Formats</h4>
                                <p className="text-gray-600">Convert to and from the most popular image formats, including JPEG, PNG, GIF, and BMP.</p>
                            </div>
                        </div>
                        {/* Feature 2: Instant Previews */}
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                               <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-black mb-1">Instant Previews</h4>
                                <p className="text-gray-600">See a preview of your original image and the converted result side-by-side before you download.</p>
                            </div>
                        </div>
                        {/* Feature 3: Transparency Handling */}
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path><path d="M12 18.5V18.5" stroke="white" strokeWidth="2" strokeLinecap="round"></path><path d="M12 5.5V5.5" stroke="white" strokeWidth="2" strokeLinecap="round"></path></svg>
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-black mb-1">Transparency Handling</h4>
                                <p className="text-gray-600">Automatically adds a white background when converting from transparent formats like PNG.</p>
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
