import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { successToast, errorToast, promiseToast } from "../utils/toast";

import api from "../services/api";

function AlbumDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation(); // 2. Initialize the hook

    // 3. Fallback safely to "Collection & Vault" if the page is refreshed directly
    const albumName = location.state?.albumName || "Collection & Vault";

    const [images, setImages] = useState([]);
    const [file, setFile] = useState(null);

    // State to manage the open modal image view
    const [activeImage, setActiveImage] = useState(null);

    // Queue state to manage image uploads (Ready for multi-file extensions later)
    const [uploadQueue, setUploadQueue] = useState([]);

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

        // Generate local tracking identity context for the item queue object
        const trackingId = Date.now();
        const currentFileName = file.name;

        // Append a fresh uploading state slot into our local queue track
        setUploadQueue(prev => [...prev, { id: trackingId, name: currentFileName, status: "processing" }]);

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

            // Clear current staged browser input early
            setFile(null);

            await uploadPromise;

            // Change state value to success on clean database resolve execution
            setUploadQueue(prev => prev.map(item => item.id === trackingId ? { ...item, status: "completed" } : item));

            // Gracefully slide completed task items out of visibility after a brief delay
            setTimeout(() => {
                setUploadQueue(prev => prev.filter(item => item.id !== trackingId));
            }, 2500);

            await fetchImages();

        } catch (error) {
            console.log(error);
            // Catch structural errors and flag items inside queue log visually
            setUploadQueue(prev => prev.map(item => item.id === trackingId ? { ...item, status: "failed" } : item));
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
        <div className="min-h-screen bg-zinc-950 text-zinc-100 antialiased selection:bg-violet-500/30 selection:text-violet-200 relative">

            {/* COMPACT TOP BACKGROUND LIGHTS */}
            <div className="absolute top-0 right-1/4 w-[300px] sm:w-[500px] aspect-square bg-violet-600/5 rounded-full blur-[100px] pointer-events-none z-0" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(39,39,42,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(39,39,42,0.1)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black_50%,transparent_100%)] pointer-events-none z-0" />

            {/* MAIN APP SHELL WRAPPER - Unified alignment configuration */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 py-8 sm:py-12 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">

                {/* GLOBAL ACTION BACK ROUTE BUTTON */}
                <button
                    onClick={() => navigate("/dashboard")}
                    className="group mb-8 inline-flex items-center gap-2 rounded-xl bg-zinc-900/30 border border-zinc-800/60 px-4 py-2.5 text-xs font-semibold text-zinc-400 backdrop-blur-md transition-all duration-200 hover:border-zinc-700 hover:text-white active:scale-[0.98]"
                >
                    <svg className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Dashboard
                </button>

                {/* THE RESPONSIVE DIVISION LAYOUT SPLIT FRAME - Only layout split on lg and up */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* =========================================================
                        LEFT SIDEBAR: 30% width boundary grid layout (only sticky on lg)
                       ========================================================= */}
                    <aside className="lg:col-span-4 lg:sticky lg:top-28 space-y-6">

                        {/* HEADER BLOCK */}
                        <div className="border-b border-zinc-900 pb-6">
                            <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent sm:text-3xl capitalize">
                                {albumName} {/* 4. Real dynamic name renders here instantly */}
                            </h1>
                            <p className="text-xs text-zinc-500 font-semibold tracking-widest uppercase mt-1.5 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                                Ref #{id} • {images.length} item{images.length === 1 ? "" : "s"} loaded
                            </p>
                        </div>

                        {/* UPLOAD CONTROLLER */}
                        <div className="space-y-4">
                            <div className="group relative flex flex-col gap-2 rounded-2xl bg-zinc-900/20 p-2 border border-zinc-800/60 transition-all duration-300 focus-within:border-violet-500/40 focus-within:ring-4 focus-within:ring-violet-500/5 backdrop-blur-md">
                                <div className="relative flex-1 flex items-center px-3 py-1 bg-transparent text-zinc-400 text-sm">
                                    <label className="w-full flex items-center justify-between cursor-pointer gap-4">
                                        <span className="truncate font-medium text-zinc-300 text-xs sm:text-sm max-w-[160px] sm:max-w-none">
                                            {file ? file.name : "Select or snap asset..."}
                                        </span>
                                        <span className="text-xs bg-zinc-900 text-zinc-300 px-3 py-2 rounded-xl border border-zinc-800 hover:border-zinc-700 active:scale-[0.97] transition-all whitespace-nowrap font-bold shrink-0">
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
                                    className="w-full rounded-xl bg-zinc-100 hover:bg-white py-3.5 text-center text-xs font-bold text-black transition-all active:scale-[0.98] shadow-lg shadow-white/5"
                                >
                                    Upload Asset
                                </button>
                            </div>

                            {/* GOOGLE DRIVE STYLE INTERACTIVE PROCESS MONITOR QUEUE */}
                            {uploadQueue.length > 0 && (
                                <div className="rounded-2xl border border-zinc-900 bg-zinc-900/10 p-4 space-y-3 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase flex items-center justify-between">
                                        <span>Active Pipeline Queue</span>
                                        <span className="font-mono text-violet-400">Processing Node</span>
                                    </div>

                                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                                        {uploadQueue.map((item) => (
                                            <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-900/60 text-xs animate-in fade-in duration-200">
                                                <div className="flex items-center gap-3 truncate max-w-[60%]">
                                                    <div className="w-2 h-2 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                                                        {item.status === "processing" && <div className="w-2 h-2 bg-violet-500 rounded-full animate-ping" />}
                                                        {item.status === "completed" && <div className="w-2 h-2 bg-emerald-500 rounded-full" />}
                                                        {item.status === "failed" && <div className="w-2 h-2 bg-red-500 rounded-full" />}
                                                    </div>
                                                    <span className="truncate font-medium text-zinc-300">{item.name}</span>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0">
                                                    {item.status === "processing" && (
                                                        <span className="text-[9px] font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded uppercase tracking-wider animate-pulse">
                                                            Analyzing...
                                                        </span>
                                                    )}
                                                    {item.status === "completed" && (
                                                        <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                                                            Synced ✓
                                                        </span>
                                                    )}
                                                    {item.status === "failed" && (
                                                        <span className="text-[9px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                                                            Failed ✕
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* =========================================================
                        RIGHT GALLERY VIEWPORT: 70% width boundary grid on laptop (4 columns)
                       ========================================================= */}
                    <main className="lg:col-span-8">
                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                            {images.map((img) => (
                                <article
                                    key={img.id}
                                    onClick={() => setActiveImage(img)}
                                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-900 bg-gradient-to-b from-zinc-900/30 to-zinc-900/5 p-2 transition-all duration-300 hover:border-violet-500/30 hover:-translate-y-0.5 shadow-xl shadow-black/40 cursor-pointer"
                                >
                                    {/* Media Asset Render Wrapper Frame */}
                                    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-zinc-950 border border-zinc-900/60">
                                        <img
                                            src={`${img.image}`}
                                            alt=""
                                            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-102"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                                            <span className="text-[9px] bg-zinc-900 border border-zinc-800 text-zinc-200 px-2.5 py-1.5 rounded-xl font-bold tracking-wider uppercase shadow-xl">
                                                Expand
                                            </span>
                                        </div>
                                    </div>

                                    {/* Node Item Identifier Metadata row */}
                                    <div className="p-1.5 pt-2.5 flex items-center justify-between">
                                        <span className="font-mono text-[9px] text-zinc-600 tracking-tight transition-colors group-hover:text-zinc-500">
                                            NODE_IMG_ID: #{img.id}
                                        </span>
                                    </div>
                                </article>
                            ))}
                        </div>

                        {/* EMPTY PLATFORM LOG LAYOUT FALLBACK */}
                        {images.length === 0 && (
                            <div className="w-full text-center py-20 border border-zinc-900/60 rounded-3xl bg-zinc-900/5">
                                <p className="text-xs text-zinc-500 font-mono">NO_ASSETS_LOADED_IN_VAULT</p>
                            </div>
                        )}
                    </main>

                </div>
            </div>

            {/* HIGH-END FULL-SCREEN MEDIA LIGHTBOX MODAL */}
            {activeImage && (
                <div
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-2xl p-4 animate-in fade-in duration-200"
                    onClick={() => setActiveImage(null)}
                >
                    {/* Top Action Row */}
                    <div className="w-full max-w-2xl flex items-center justify-between mb-4 px-2">
                        <span className="font-mono text-xs text-zinc-400">
                            Viewing Asset Row #{activeImage.id}
                        </span>
                        <button
                            onClick={() => setActiveImage(null)}
                            className="rounded-xl bg-zinc-900 border border-zinc-800 p-2.5 text-zinc-400 hover:text-white hover:border-zinc-700 active:scale-95 transition-all"
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

                    {/* Bottom Utility Action Row */}
                    <div
                        className="mt-6 flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => handleDownload(activeImage.image, activeImage.id)}
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-100 px-5 py-3.5 text-sm font-bold text-black shadow-lg hover:bg-white active:scale-95 transition-all shadow-white/5"
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