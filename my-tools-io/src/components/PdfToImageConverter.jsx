import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';

// You can place this component in your project, e.g., src/components/PdfToImageConverter.jsx
export default function PdfToImageConverter() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [targetFormat, setTargetFormat] = useState('png');
    const [convertedImages, setConvertedImages] = useState([]);
    const [zipUrl, setZipUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Clean up object URLs to prevent memory leaks
    useEffect(() => {
        return () => {
            convertedImages.forEach(image => URL.revokeObjectURL(image.url));
            if (zipUrl) URL.revokeObjectURL(zipUrl);
        };
    }, [convertedImages, zipUrl]);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'application/pdf') {
            setSelectedFile(file);
            // Reset previous results
            setConvertedImages([]);
            setZipUrl(null);
            setError(null);
        } else {
            setSelectedFile(null);
            setError('Please select a valid PDF file.');
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!selectedFile) {
            setError('Please select a PDF file first.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setConvertedImages([]);
        setZipUrl(null);

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('format', targetFormat);

        try {
            const response = await fetch('http://localhost:8080/api/convert/pdf-to-image', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'PDF to Image conversion failed.');
            }

            const zipBlob = await response.blob();
            setZipUrl(URL.createObjectURL(zipBlob));

            // Unzip the file to show previews
            const zip = await JSZip.loadAsync(zipBlob);
            const imagePromises = [];
            zip.forEach((relativePath, zipEntry) => {
                if (!zipEntry.dir) {
                    const promise = zipEntry.async('blob').then(blob => ({
                        name: zipEntry.name,
                        url: URL.createObjectURL(blob),
                    }));
                    imagePromises.push(promise);
                }
            });
            
            const images = await Promise.all(imagePromises);
            setConvertedImages(images);

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
            <h2 className="text-3xl font-bold text-black text-center mb-2">PDF to Image Converter</h2>
            <p className="text-center text-gray-500 mb-8">Convert each page of your PDF into high-quality images.</p>

            <form onSubmit={handleSubmit} className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    <div className="col-span-1">
                        <label htmlFor="pdf-upload" className="block text-sm font-bold text-black mb-2">1. Upload PDF</label>
                        <input id="pdf-upload" type="file" accept="application/pdf" onChange={handleFileChange} className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-200 file:text-black hover:file:bg-gray-300" />
                    </div>
                    <div className="col-span-1">
                        <label htmlFor="image-format-select" className="block text-sm font-bold text-black mb-2">2. Select Image Format</label>
                        <select id="image-format-select" value={targetFormat} onChange={(e) => setTargetFormat(e.target.value)} className="w-full p-2.5 border border-black bg-white text-black rounded-md focus:ring-2 focus:ring-black focus:border-black">
                            <option value="png">PNG</option>
                            <option value="jpeg">JPEG</option>
                        </select>
                    </div>
                    <div className="col-span-1">
                        <button type="submit" disabled={isLoading || !selectedFile} className="w-full bg-black text-white font-bold py-2.5 px-4 rounded-md transition-colors duration-300 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed">
                            {isLoading ? 'Converting...' : '3. Convert to Images'}
                        </button>
                    </div>
                </div>
            </form>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md my-4" role="alert"><strong className="font-bold">Error: </strong><span className="block sm:inline">{error}</span></div>}

            {/* Results Section */}
            {(isLoading || convertedImages.length > 0) && (
                <div className="mt-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-black">Converted Images ({convertedImages.length} pages)</h3>
                        {zipUrl && <a href={zipUrl} download={selectedFile.name.replace('.pdf', '.zip')} className="bg-green-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300 hover:bg-green-700">Download All as ZIP</a>}
                    </div>
                    {isLoading && <p className="text-center text-gray-500">Processing PDF, please wait...</p>}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {convertedImages.map((image, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-2 text-center">
                                <img src={image.url} alt={`Page ${index + 1}`} className="w-full h-auto object-contain rounded-md mb-2" />
                                <p className="text-xs text-gray-600 truncate">{image.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <div className="my-12 border-t border-gray-200"></div>
            {/* --- Guide and Features Section --- */}
            {/* How to Use Section */}
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-black mb-10">How to Convert PDF to Images?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Step 1 */}
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mb-4"><span className="text-white font-bold text-2xl">1</span></div>
                            <h3 className="text-xl font-semibold text-black mb-2">Upload PDF</h3>
                            <p className="text-gray-600 px-4">Select the PDF file you want to convert from your device.</p>
                        </div>
                        {/* Step 2 */}
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mb-4"><span className="text-white font-bold text-2xl">2</span></div>
                            <h3 className="text-xl font-semibold text-black mb-2">Convert to Images</h3>
                            <p className="text-gray-600 px-4">Choose your desired output format (PNG or JPEG) and click the "Convert" button.</p>
                        </div>
                        {/* Step 3 */}
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mb-4"><span className="text-white font-bold text-2xl">3</span></div>
                            <h3 className="text-xl font-semibold text-black mb-2">Download ZIP</h3>
                            <p className="text-gray-600 px-4">Your converted images will be bundled into a single ZIP file, ready for you to download.</p>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="my-12 border-t border-gray-200"></div>

                {/* Key Features Section */}
                <div className="text-center pb-[15px]">
                    <h2 className="text-3xl font-bold text-black mb-10">Key Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 max-w-4xl mx-auto text-left">
                        {/* Feature 1: Full PDF Conversion */}
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-black mb-1">Full PDF Conversion</h4>
                                <p className="text-gray-600">Converts every page of your PDF document into a separate, high-quality image file.</p>
                            </div>
                        </div>
                        {/* Feature 2: ZIP Archive */}
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                               <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-black mb-1">Convenient ZIP Archive</h4>
                                <p className="text-gray-600">All generated images are conveniently packaged into a single ZIP file for easy downloading.</p>
                            </div>
                        </div>
                        {/* Feature 3: High-Resolution Output */}
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path></svg>
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-black mb-1">High-Resolution Output</h4>
                                <p className="text-gray-600">Images are rendered at 300 DPI to ensure they are crisp and clear for any use case.</p>
                            </div>
                        </div>
                        {/* Feature 4: Secure & Private */}
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.417l5.5-5.5a1 1 0 011.414 0l5.5 5.5A12.02 12.02 0 0012 21.944a11.955 11.955 0 018.618-3.04m-3.04-7.016a1 1 0 011.414 0l2.12 2.12a1 1 0 010 1.414l-2.12 2.12a1 1 0 01-1.414 0l-2.12-2.12a1 1 0 010-1.414l2.12-2.12z"></path></svg>
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-black mb-1">Secure & Private</h4>
                                <p className="text-gray-600">Your files are processed securely and are immediately deleted from our servers after conversion.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
