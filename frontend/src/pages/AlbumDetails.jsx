import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { successToast, errorToast, promiseToast } from "../utils/toast";

import api from "../services/api";

function AlbumDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation(); // Initialize the hook

    // Fallback safely to "Collection & Vault" if the page is refreshed directly
    const albumName = location.state?.albumName || "Collection & Vault";

    const [images, setImages] = useState([]);
    const [files, setFiles] = useState([]);

    // State to manage the open modal image view
    const [activeImage, setActiveImage] = useState(null);

    // Queue state to manage image uploads
    const [uploadQueue, setUploadQueue] = useState([]);

    // --- ALERT STATE ---
    // Tracks image ID for deletion. If null, the alert is hidden.
    const [deleteId, setDeleteId] = useState(null);

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

        if (files.length === 0) {
            return errorToast("Please select images");
        }

        // MAX 10 IMAGES
        if (files.length > 10) {
            return errorToast("Maximum 10 images allowed");
        }

        // CREATE QUEUE ITEMS
        const queueItems = files.map(file => ({
            id: `${Date.now()}-${file.name}`,
            name: file.name,
            size: (file.size / (1024 * 1024)).toFixed(2), // MB
            status: "processing"
        }));

        setUploadQueue(prev => [...prev, ...queueItems]);

        const formData = new FormData();
        files.forEach((file) => {
            formData.append("images", file);
        });

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
                loading: "Uploading images...",
                success: "Images uploaded successfully",
                error: "Upload failed",
            });

            // CLEAR INPUT IMMEDIATELY
            setFiles([]);

            await uploadPromise;

            // COMPLETE STATUS
            setUploadQueue(prev =>
                prev.map(item => ({
                    ...item,
                    status: "completed"
                }))
            );

            fetchImages();

            // AUTO CLEAR
            setTimeout(() => {
                setUploadQueue([]);
            }, 2500);

        } catch (error) {
            console.log(error);
            setUploadQueue(prev =>
                prev.map(item => ({
                    ...item,
                    status: "failed"
                }))
            );
        }
    };

    // --- CONFIRMED DELETE IMAGE ---
    const confirmDeleteImage = async () => {
        if (deleteId) {
            try {
                await api.delete(`images/delete/${deleteId}/`);
                successToast("Image deleted permanently");

                // Hide confirmation alert
                setDeleteId(null);
                // Close lightbox modal immediately (prevents seeing deleted asset again)
                setActiveImage(null);
                // Refresh gallery
                fetchImages();
            } catch (error) {
                console.log(error);
                errorToast("Failed to delete image");
                // Hide alert on error
                setDeleteId(null);
            }
        }
    };

    // --- CANCEL DELETE ---
    const cancelDelete = () => {
        setDeleteId(null); // Reset track on cancel
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
        <div className="min-h-screen bg-zinc-950 text-zinc-100 antialiased selection:bg-violet-500/30 selection:text-violet-200 relative overflow-x-hidden">

            {/* --- PROFESSION DESIGN CONFIRMATION ALERT MODAL --- */}
            {/* Conditional check: render if deleteId is tracked (e.g., clicked from gallery view) */}
            {deleteId && (
                <div className="fixed inset-0 flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">

                    {/* Backdrop blur effect */}
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={cancelDelete} // Close on backdrop click
                    />

                    {/* Professional Alert Content Box */}
                    <div className="relative w-full max-w-sm rounded-3xl bg-zinc-900 border border-zinc-800 p-8 shadow-2xl shadow-black animate-in zoom-in-95 duration-300 ease-out">
                        <div className="flex flex-col items-center text-center gap-6 mb-8 pb-6 border-b border-zinc-800">
                            <div className="p-4 rounded-xl bg-red-950/40 border border-red-900/30 text-red-400">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                </svg>
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-xl font-bold text-white tracking-tight">Confirm Asset Deletion</h2>
                                <p className="text-sm text-zinc-400 font-mono">NODE_IMG_ID: #{deleteId}</p>
                            </div>
                        </div>

                        <p className="text-sm text-zinc-300 leading-relaxed mb-10 text-center">
                            Are you absolutely sure you want to delete this photo permanently? This action <strong className="text-red-400">cannot be undone</strong> and the image will be erased from the Faceshare pipeline node.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={cancelDelete}
                                className="flex-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 py-3 text-center text-sm font-semibold text-zinc-300 transition-all active:scale-[0.98]"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteImage}
                                className="flex-1 rounded-xl bg-red-600 hover:bg-red-500 py-3 text-center text-sm font-bold text-white transition-all active:scale-[0.98] shadow-lg shadow-red-950/30"
                            >
                                Delete Permanently
                            </button>
                        </div>
                    </div>
                </div>
            )}

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

                {/* THE RESPONSIVE DIVISION LAYOUT SPLIT FRAME */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* LEFT SIDEBAR: Sticky layout */}
                    <aside className="lg:col-span-4 lg:sticky lg:top-28 space-y-8">

                        {/* HEADER BLOCK */}
                        <div className="border-b border-zinc-900 pb-6">
                            <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent sm:text-3xl capitalize">
                                {albumName}
                            </h1>
                            <p className="text-xs text-zinc-500 font-semibold tracking-widest uppercase mt-1.5 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                                Ref #{id} • {images.length} item{images.length === 1 ? "" : "s"} loaded
                            </p>
                        </div>

                        {/* UPLOAD CONTROLLER */}
                        <div className="space-y-6">

                            {/* Dropzone Area */}
                            <div className="relative group rounded-3xl bg-zinc-900/30 border border-zinc-800/60 p-5 transition-all duration-300 hover:border-violet-500/50 focus-within:ring-2 focus-within:ring-violet-500/20">
                                <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-center gap-4 py-8">
                                    <div className="p-3 bg-zinc-950/80 rounded-2xl border border-zinc-800 group-hover:scale-105 group-hover:border-violet-800 group-hover:bg-violet-950/20 transition-all duration-300">
                                        <svg className="w-8 h-8 text-zinc-600 group-hover:text-violet-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                        </svg>
                                    </div>

                                    <div className="space-y-1">
                                        <span className="block text-sm font-semibold text-zinc-100 group-hover:text-white transition-colors">
                                            {files.length > 0 ? `${files.length} images selected` : "Choose or drag assets"}
                                        </span>
                                        <span className="block text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">
                                            Up to 10 images, max 10MB each
                                        </span>
                                    </div>

                                    {/* Action button in dropzone */}
                                    {files.length === 0 && (
                                        <span className="mt-3 text-xs bg-zinc-900 text-zinc-300 px-4 py-2.5 rounded-xl border border-zinc-800 hover:border-zinc-700 active:scale-[0.97] transition-all whitespace-nowrap font-bold shrink-0">
                                            Browse files
                                        </span>
                                    )}

                                    {/* Small preview list */}
                                    {files.length > 0 && (
                                        <div className="mt-3 text-[11px] text-zinc-400 bg-zinc-950/80 px-4 py-2.5 rounded-xl border border-zinc-800 w-full max-w-[90%] mx-auto line-clamp-2">
                                            {files.map(f => f.name).join(', ')}
                                        </div>
                                    )}

                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={(e) => {
                                            const selectedFiles = Array.from(e.target.files);
                                            if (selectedFiles.length > 10) {
                                                errorToast("Maximum 10 images allowed");
                                                return;
                                            }
                                            const oversized = selectedFiles.find(file => file.size > 10 * 1024 * 1024);
                                            if (oversized) {
                                                errorToast("Each image must be below 10MB");
                                                return;
                                            }
                                            setFiles(selectedFiles);
                                        }}
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            {/* Main Upload Button */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={uploadImage}
                                    disabled={files.length === 0}
                                    className="flex-1 rounded-2xl bg-violet-600 disabled:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-violet-500 py-4 text-center text-sm font-bold text-white transition-all active:scale-[0.98] shadow-lg shadow-violet-950/20"
                                >
                                    Upload to Pipeline
                                </button>
                                {files.length > 0 && (
                                    <button
                                        onClick={() => setFiles([])}
                                        className="p-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-all text-zinc-500 hover:text-zinc-100 active:scale-[0.97]"
                                        title="Clear selection"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>

                            {/* PROFESSIONAL PROCESS MONITOR QUEUE */}
                            {uploadQueue.length > 0 && (
                                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/10 p-5 space-y-4 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="text-xs font-bold text-zinc-500 tracking-wider uppercase flex items-center justify-between border-b border-zinc-900 pb-3">
                                        <span className="flex items-center gap-2">
                                            <div className="relative flex items-center justify-center w-4 h-4">
                                                <div className="absolute w-full h-full bg-violet-500 rounded-full animate-ping opacity-20"></div>
                                                <div className="relative w-2 h-2 bg-violet-500 rounded-full"></div>
                                            </div>
                                            Active Pipeline Queue
                                        </span>
                                        <span className="font-mono text-[10px] text-zinc-600 bg-zinc-950 px-2 py-0.5 rounded">Node #{id}</span>
                                    </div>

                                    <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-zinc-950/20">
                                        {uploadQueue.map((item) => (
                                            <div key={item.id} className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 text-xs animate-in fade-in duration-200">
                                                <div className="flex items-center justify-between gap-4 mb-2">
                                                    <div className="flex items-center gap-3 truncate">
                                                        <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 shrink-0">
                                                            <svg className="w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375 0 11-.75 0 .375 0 01.75 0z" />
                                                            </svg>
                                                        </div>
                                                        <div className="flex flex-col gap-0.5 truncate">
                                                            <span className="truncate font-medium text-zinc-100 text-sm">{item.name}</span>
                                                            <span className="font-mono text-zinc-500 text-[10px]">{item.size} MB</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 shrink-0">
                                                        {item.status === "processing" && (
                                                            <span className="text-[10px] flex items-center gap-1.5 font-bold text-violet-400 bg-violet-950/60 border border-violet-800/40 px-3 py-1 rounded uppercase tracking-wider">
                                                                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4}></circle>
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                </svg>
                                                                Processing
                                                            </span>
                                                        )}
                                                        {item.status === "completed" && (
                                                            <span className="text-[10px] flex items-center gap-1 font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-3 py-1 rounded uppercase tracking-wider">
                                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                                </svg>
                                                                Synced
                                                            </span>
                                                        )}
                                                        {item.status === "failed" && (
                                                            <span className="text-[10px] flex items-center gap-1 font-bold text-red-400 bg-red-950/60 border border-red-800/40 px-3 py-1 rounded uppercase tracking-wider">
                                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                                Failed
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Optional: Simple Progress Bar */}
                                                {item.status === "processing" && (
                                                    <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden mt-3">
                                                        <div className="w-1/2 h-full bg-violet-500 animate-pulse-fast rounded-full"></div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </aside>


                    {/* =========================================================
                    💥 REDESIGNED GALLERY VIEWPORT WITH PREMIUM CUSTOM SCROLLBAR
                        ========================================================= */}
                    <main className="lg:col-span-8 w-full lg:max-h-[78vh] lg:overflow-y-auto pr-0 lg:pr-3 scrollbar-thin [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-zinc-950/40 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-800 hover:[&::-webkit-scrollbar-thumb]:bg-zinc-700 active:[&::-webkit-scrollbar-thumb]:bg-violet-500/50 [&::-webkit-scrollbar-track]:rounded-full transition-all duration-300">
                        {images.length === 0 ? (
                            /* EMPTY PLATFORM LOG LAYOUT FALLBACK */
                            <div className="w-full text-center py-24 sm:py-36 border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/5 backdrop-blur-sm">
                                <div className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center mx-auto mb-4 bg-zinc-950/50 text-zinc-500 font-mono text-sm shadow-xl">
                                    !
                                </div>
                                <h3 className="text-sm font-bold text-zinc-400 tracking-tight">No Vault Assets Loaded</h3>
                                <p className="text-xs text-zinc-600 mt-1.5 max-w-xs mx-auto leading-relaxed">
                                    Use the left sidebar asset block node component to push images directly into the cluster pipeline records layer.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
                                {images.map((img) => (
                                    <article
                                        key={img.id}
                                        onClick={() => setActiveImage(img)}
                                        className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-900 bg-gradient-to-b from-zinc-900/40 to-zinc-900/5 p-2 transition-all duration-300 hover:border-violet-500/30 hover:-translate-y-1 shadow-xl shadow-black/30 cursor-pointer"
                                    >
                                        {/* Media Asset Render Wrapper Frame */}
                                        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-zinc-950 border border-zinc-900/60">
                                            <img
                                                src={`${img.image}`}
                                                alt=""
                                                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-102"
                                                loading="lazy"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                                                <span className="text-[10px] bg-zinc-900/90 border border-zinc-800 text-zinc-100 px-3 py-1.5 rounded-xl font-bold tracking-wider uppercase backdrop-blur-sm shadow-2xl transition-all group-hover:scale-105">
                                                    Expand Record
                                                </span>
                                            </div>
                                        </div>

                                        {/* Node Item Identifier Metadata row */}
                                        <div className="p-2 pt-3 flex flex-col gap-0.5 border-t border-zinc-900/50 mt-1.5">
                                            <span className="font-mono text-[9px] text-zinc-600 tracking-tight transition-colors group-hover:text-zinc-500">
                                                REGISTRY_ID:
                                            </span>
                                            <span className="font-mono text-[11px] text-zinc-300 font-bold tracking-tight">
                                                #{img.id}
                                            </span>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </main>

                </div>
            </div>

            {/* LIGHTBOX MODAL */}
            {activeImage && (
                <div
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-2xl p-4 animate-in fade-in duration-200 overflow-x-hidden"
                    onClick={() => setActiveImage(null)}
                >
                    {/* Top action row */}
                    <div className="w-full max-w-2xl flex items-center justify-between mb-4 px-2 animate-in fade-in duration-300 delay-100">
                        <span className="font-mono text-xs text-zinc-400 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
                            Viewing Row #{activeImage.id}
                        </span>
                        <button
                            onClick={() => setActiveImage(null)}
                            className="rounded-full bg-zinc-900 border border-zinc-800 p-2 text-zinc-400 hover:text-white hover:border-zinc-700 active:scale-95 transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Image rendering window */}
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
                        className="relative mt-6 flex items-center gap-3 w-full max-w-sm justify-center animate-in slide-in-from-bottom-2 duration-300 delay-100 z-[60]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Download button */}
                        <button
                            onClick={() => handleDownload(activeImage.image, activeImage.id)}
                            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-zinc-100 px-5 py-3.5 text-sm font-bold text-black shadow-lg hover:bg-white active:scale-95 transition-all shadow-white/5"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download Asset
                        </button>

                        {/* Delete asset button trigger */}
                        <button
                            onClick={() => setDeleteId(activeImage.id)}
                            className="rounded-xl bg-red-950/40 border border-red-900/30 p-3.5 text-red-400 transition-all duration-200 hover:bg-red-900/30 hover:text-red-300 active:scale-95 z-[60]"
                            title="Delete system asset permanently"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AlbumDetails;