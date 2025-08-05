import React, { useState, useCallback } from 'react';

// --- Helper Components (Styled for the light theme) ---

const Spinner = ({ size = 'md' }) => {
    const sizeClasses = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
    return <div className={`animate-spin rounded-full border-t-2 border-b-2 border-black ${sizeClasses[size]}`}></div>;
};

const ImageIcon = ({ className = '' }) => (
    <svg className={`w-24 h-24 text-gray-400 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

// --- Main Component ---

export default function ImageGenerator() {
    const [prompt, setPrompt] = useState('');
    const [imageUrl, setImageUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleGenerateImage = useCallback(async (e) => {
        e.preventDefault();
        if (!prompt.trim()) {
            setError('Please enter a prompt to generate an image.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setImageUrl(null);

        try {
            const payload = {
                instances: [{ prompt }],
                parameters: { "sampleCount": 1 }
            };
            
            // The API key is left as an empty string. The environment will provide it.
            const apiKey = "AIzaSyAHXDjmlQRu9Be0zlwO26xsUYNeEcY4FF0"; 
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'The API returned an error.');
            }

            const result = await response.json();
            if (result.predictions && result.predictions.length > 0 && result.predictions[0].bytesBase64Encoded) {
                const generatedImageUrl = `data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`;
                setImageUrl(generatedImageUrl);
            } else {
                throw new Error('API did not return a valid image.');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Failed to generate image: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    }, [prompt]);

    // Generates a sanitized filename from the prompt
    const getDownloadFileName = () => {
        if (!prompt) return 'ai-generated-image.png';
        const sanitizedPrompt = prompt.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
        return `${sanitizedPrompt.slice(0, 50)}.png`;
    };

    return (
        <div className="bg-gray-100 min-h-screen flex items-center justify-center font-sans p-4">
        <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl p-8">
            <header className="text-center mb-8">
                <h2 className="text-3xl font-bold text-black">AI Image Generator</h2>
                <p className="mt-2 text-gray-500">Turn your imagination into stunning visuals with AI.</p>
            </header>

            <main className="w-full">
                <form onSubmit={handleGenerateImage} className="flex flex-col sm:flex-row gap-4 mb-8">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., A majestic lion wearing a crown, cinematic fantasy art"
                        className="flex-grow bg-white border border-black rounded-lg p-1 focus:ring-2 focus:ring-black focus:outline-none transition-shadow duration-200 resize-none h-24 sm:h-auto"
                        disabled={isLoading}
                        aria-label="Image generation prompt"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !prompt.trim()}
                        className="bg-black text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-300 flex items-center justify-center"
                    >
                        {isLoading ? <Spinner size="sm" /> : 'Generate'}
                    </button>
                </form>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md my-4" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <div className="w-1/2 bg-gray-50 border border-gray-200 rounded-xl shadow-inner overflow-hidden aspect-square flex items-center justify-center p-4" aria-live="polite">
                    {isLoading && (
                        <div className="text-center text-gray-500">
                            <Spinner size="lg" />
                            <p className="mt-4 text-lg animate-pulse">Generating your vision...</p>
                        </div>
                    )}
                    {!isLoading && !error && imageUrl && (
                        <img
                            src={imageUrl}
                            alt={prompt}
                            className="w-full h-full object-contain rounded-lg animate-fade-in"
                            key={imageUrl} 
                        />
                    )}
                    {!isLoading && !error && !imageUrl && (
                        <div className="text-center text-gray-500">
                            <ImageIcon className="mx-auto" />
                            <p className="mt-4 text-lg">Your generated image will appear here.</p>
                        </div>
                    )}
                </div>

                {/* --- NEW: Download Button --- */}
                {imageUrl && !isLoading && (
                    <div className="mt-6 text-center">
                        <a
                            href={imageUrl}
                            download={getDownloadFileName()}
                            className="inline-block bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 transition-colors duration-300 transform hover:scale-105"
                        >
                            Download Image
                        </a>
                    </div>
                )}
            </main>
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-in-out;
                }
            `}</style>
        </div>
        </div>
    );
}
