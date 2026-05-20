import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { successToast, errorToast, promiseToast } from "../utils/toast";

import api from "../services/api";

function AlbumDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [images, setImages] = useState([]);
    const [file, setFile] = useState(null);
    
    // State to manage the open modal image view
    const [activeImage, setActiveImage] = useState(null);

    // FETCH IMAGES
    const fetchImages = async () => {
        try {
            const response = await api.get(`images/${id}/`);
            setImages(response.data);
        } catch (error) {
            console.log(error);
            errorToast("Failed to fetch images");
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);

    // UPLOAD IMAGE
    const uploadImage = async () => {
        if (!file) {
            return errorToast("Please select an image");
        }

        const formData = new FormData();
        formData.append("image", file);

        try {
            const uploadPromise = api.post(
                `images/${id}/upload/`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            promiseToast(uploadPromise, {
                loading: "AI is processing faces...",
                success: "Image uploaded successfully",
                error: "Failed to upload image",
            });
            
            await uploadPromise;
            setFile(null);
            await fetchImages();
            
        } catch (error) {
            console.log(error);
        }
    };

    // DELETE IMAGE
    const deleteImage = async (imgId) => {
        try {
            await api.delete(`images/delete/${imgId}/`);
            successToast("Image deleted successfully");
            setActiveImage(null); // Close the modal since the asset is deleted
            fetchImages();
        } catch (error) {
            console.log(error);
            errorToast("Failed to delete image");
        }
    };

    // LOCAL DOWNLOAD TRIGGER
    const handleDownload = async (imageUrl, imageId) => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = `faceshare-asset-${imageId}.jpg`;
            document.body.appendChild(link);
            link.click();
            
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
            successToast("Download started");
        } catch (error) {
            console.log(error);
            errorToast("Download failed");
        }
    };

    return (
        <div className="min-h-screen bg-black text-zinc-100 antialiased selection:bg-violet-500/30 selection:text-violet-200">
            <div className="max-w-xl mx-auto px-4 py-8 sm:py-12 md:max-w-4xl lg:max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
                
                {/* BACK BUTTON */}
                <button
                    onClick={() => navigate("/dashboard")}
                    className="group mb-6 flex items-center gap-2 rounded-xl bg-zinc-900/50 border border-zinc-800/80 px-4 py-2.5 text-xs font-semibold text-zinc-400 backdrop-blur-sm transition-all duration-200 hover:border-zinc-700 hover:text-white active:scale-95"
                >
                    <svg className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Dashboard
                </button>

                {/* HEADER */}
                <header className="mb-8">
                    <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text text-transparent sm:text-4xl">
                        Album Vault
                    </h1>
                    <p className="text-xs text-zinc-500 font-medium tracking-wide uppercase mt-1">
                        Viewing Reference #{id} • {images.length} item{images.length === 1 ? "" : "s"}
                    </p>
                </header>

                {/* FILE UPLOAD INPUT */}
                <section className="mb-12">
                    <div className="group relative flex flex-col gap-3 rounded-2xl bg-zinc-900/40 p-3 border border-zinc-800/60 transition-all duration-300 transform-gpu focus-within:border-violet-500/50 focus-within:ring-4 focus-within:ring-violet-500/10 sm:flex-row sm:items-center">
                        <div className="relative flex-1 flex items-center px-3 py-2 bg-transparent text-zinc-400 text-sm">
                            <label className="w-full flex items-center justify-between cursor-pointer gap-2">
                                <span className="truncate font-medium text-zinc-300">
                                    {file ? file.name : "Select or snap an asset..."}
                                </span>
                                <span className="text-xs bg-zinc-800 text-zinc-300 px-2.5 py-1.5 rounded-lg border border-zinc-700 hover:bg-zinc-700 active:scale-95 transition-all whitespace-nowrap">
                                    Browse
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setFile(e.target.files[0])}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        <button
                            onClick={uploadImage}
                            className="w-full rounded-xl bg-zinc-100 px-6 py-3 text-center text-sm font-semibold text-black transition-all duration-300 hover:bg-zinc-200 active:scale-95 sm:w-auto sm:whitespace-nowrap"
                        >
                            Upload Asset
                        </button>
                    </div>
                </section>

                {/* IMAGES GRID */}
                <main className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {images.map((img) => (
                        <article
                            key={img.id}
                            onClick={() => setActiveImage(img)}
                            className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-800/50 bg-gradient-to-b from-zinc-900/60 to-zinc-900/20 p-2 transition-all duration-300 transform-gpu hover:border-violet-500/40 hover:from-zinc-900/80 hover:-translate-y-1 cursor-pointer"
                        >
                            {/* Media Container */}
                            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-zinc-950">
                                <img
                                    src={`${img.image}`}
                                    alt=""
                                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <span className="text-xs bg-black/60 backdrop-blur-md px-3 py-2 rounded-xl font-bold tracking-wide border border-zinc-800 scale-90 group-hover:scale-100 transition-transform duration-300">
                                        Expand View
                                    </span>
                                </div>
                            </div>

                            {/* Clean, Minimal Metadata Label */}
                            <div className="p-2 pt-3 flex items-center justify-between">
                                <span className="font-mono text-[9px] text-zinc-600 tracking-tight transition-colors group-hover:text-zinc-500">
                                    IMG_ID: #{img.id}
                                </span>
                            </div>
                        </article>
                    ))}
                </main>
            </div>

            {/* HIGH-END FULL-SCREEN MEDIA LIGHTBOX MODAL */}
            {activeImage && (
                <div 
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl p-4 animate-in fade-in duration-200"
                    onClick={() => setActiveImage(null)}
                >
                    {/* Top Action Row */}
                    <div className="w-full max-w-2xl flex items-center justify-between mb-4 px-2">
                        <span className="font-mono text-xs text-zinc-400">
                            Viewing Asset #{activeImage.id}
                        </span>
                        <button 
                            onClick={() => setActiveImage(null)}
                            className="rounded-full bg-zinc-900 border border-zinc-800 p-2.5 text-zinc-400 hover:text-white hover:border-zinc-700 active:scale-95 transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Image Render Window */}
                    <div 
                        className="relative max-w-2xl w-full max-h-[70vh] flex items-center justify-center overflow-hidden rounded-2xl animate-in zoom-in-95 duration-300 ease-out"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img 
                            src={`${activeImage.image}`} 
                            alt="" 
                            className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl shadow-black"
                        />
                    </div>

                    {/* Bottom Utility Action Row (Now houses both Download and Delete actions) */}
                    <div 
                        className="mt-6 flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm justify-center" 
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => handleDownload(activeImage.image, activeImage.id)}
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-100 px-5 py-3.5 text-sm font-bold text-black shadow-lg hover:bg-white active:scale-95 transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download Asset
                        </button>

                        <button
                            onClick={() => deleteImage(activeImage.id)}
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-950/40 border border-red-900/30 px-5 py-3.5 text-sm font-bold text-red-400 transition-all duration-200 hover:bg-red-900/30 hover:text-red-300 active:scale-95"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete System Asset
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AlbumDetails;