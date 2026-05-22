import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Webcam from "react-webcam";
import JSZip from "jszip"; // For downloading all images as zip

import api from "../services/api";
import { successToast, errorToast } from "../utils/toast";

function SharePage() {
    const { token } = useParams();
    const webcamRef = useRef(null);
    const analyzerCanvasRef = useRef(null);
    const loopAnimationFrameRef = useRef(null);

    const [matchedImages, setMatchedImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const [activeImage, setActiveImage] = useState(null);
    const [cameraActive, setCameraActive] = useState(true);
    const [isFaceDetected, setIsFaceDetected] = useState(false);
    const [alignmentScore, setAlignmentScore] = useState(0);
    const [showGuide, setShowGuide] = useState(true);

    // High performance localized color differential processor loop
    useEffect(() => {
        if (!cameraActive) {
            setIsFaceDetected(false);
            setAlignmentScore(0);
            return;
        }

        if (!analyzerCanvasRef.current) {
            analyzerCanvasRef.current = document.createElement("canvas");
        }

        const runAnalysisFrame = () => {
            if (
                webcamRef.current &&
                webcamRef.current.video &&
                webcamRef.current.video.readyState === 4
            ) {
                const video = webcamRef.current.video;
                const canvas = analyzerCanvasRef.current;
                const ctx = canvas.getContext("2d", { willReadFrequently: true });

                canvas.width = 40;
                canvas.height = 40;
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                try {
                    const matrixBuffer = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

                    let coreSum = 0;
                    let peripherySum = 0;
                    let coreCount = 0;
                    let peripheryCount = 0;

                    for (let index = 0; index < matrixBuffer.length; index += 16) {
                        const r = matrixBuffer[index];
                        const g = matrixBuffer[index + 1];
                        const b = matrixBuffer[index + 2];
                        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

                        const flatPixelIndex = index / 4;
                        const pointX = flatPixelIndex % canvas.width;
                        const pointY = Math.floor(flatPixelIndex / canvas.width);

                        if (pointX > 11 && pointX < 29 && pointY > 9 && pointY < 31) {
                            coreSum += Math.abs(luminance);
                            coreCount++;
                        } else {
                            peripherySum += Math.abs(luminance);
                            peripheryCount++;
                        }
                    }

                    const coreMean = coreSum / (coreCount || 1);
                    const peripheryMean = peripherySum / (peripheryCount || 1);
                    const absoluteDelta = Math.abs(coreMean - peripheryMean);

                    if (absoluteDelta > 14 && coreMean > 20) {
                        setIsFaceDetected(true);
                        setAlignmentScore(prev => Math.min(100, Math.max(88, prev + Math.floor(Math.random() * 4) + 1)));
                    } else {
                        setIsFaceDetected(false);
                        setAlignmentScore(prev => Math.max(0, prev - 8));
                    }
                } catch (matrixException) {
                    setIsFaceDetected(false);
                }
            }
            loopAnimationFrameRef.current = requestAnimationFrame(runAnalysisFrame);
        };

        loopAnimationFrameRef.current = requestAnimationFrame(runAnalysisFrame);

        return () => {
            if (loopAnimationFrameRef.current) {
                cancelAnimationFrame(loopAnimationFrameRef.current);
            }
        };
    }, [cameraActive]);

    // CAPTURE IMAGE
    const capture = async () => {
        if (!webcamRef.current || !isFaceDetected) return;
        setLoading(true);

        try {
            const screenshot = webcamRef.current.getScreenshot();
            if (!screenshot) {
                errorToast("Camera stream inaccessible");
                setLoading(false);
                return;
            }

            const blob = await fetch(screenshot).then(res => res.blob());
            const formData = new FormData();
            formData.append("selfie", blob, "selfie.jpg");

            const response = await api.post(
                `sharing/match/${token}/`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            setMatchedImages(response.data);
            setHasSearched(true);
            setCameraActive(false);
            successToast("Biometric capture indexed!");

        } catch (error) {
            console.error(error);
            errorToast("Facial index lookup failed");
        } finally {
            setLoading(false);
        }
    };

    // SINGLE IMAGE DOWNLOAD TRIGGER
    const handleDownload = async (imageUrl, imageId) => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = `faceshare-match-${imageId}.jpg`;
            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
            successToast("Download initiated");
        } catch (error) {
            console.error(error);
            errorToast("Download failed");
        }
    };

    // --- WORKING ONE TAP ZIP DOWNLOADER ---
    const downloadAllMatchedImages = async () => {
        if (matchedImages.length === 0) return;

        const zip = new JSZip();
        setLoading(true);

        try {
            // Map over elements and group download fetch cycles
            const downloadPromises = matchedImages.map(async (img, idx) => {
                const fullImageUrl = `${import.meta.env.VITE_API_BASE_URL}${img.image}`;
                const response = await fetch(fullImageUrl);
                const fileBlob = await response.blob();

                // Construct file configuration within local buffer
                const fileName = `matched_asset_${img.id || idx + 1}.jpg`;
                zip.file(fileName, fileBlob);
            });

            await Promise.all(downloadPromises);

            // Compress dynamic runtime memory components into system blob
            const contentBlob = await zip.generateAsync({ type: "blob" });
            const zipUrl = window.URL.createObjectURL(contentBlob);

            const downloadLink = document.createElement("a");
            downloadLink.href = zipUrl;
            downloadLink.download = `faceshare-collection-${token || "vault"}.zip`;
            document.body.appendChild(downloadLink);
            downloadLink.click();

            document.body.removeChild(downloadLink);
            window.URL.revokeObjectURL(zipUrl);
            successToast("ZIP extraction finished cleanly!");
        } catch (err) {
            console.error(err);
            errorToast("Batch processing compilation failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 antialiased selection:bg-emerald-500/30 selection:text-emerald-200 relative overflow-x-hidden">

            {/* AMBIENT TECH BACKGROUND ACCENTS */}
            <div className="absolute top-0 right-1/4 w-[250px] sm:w-[500px] aspect-square bg-violet-600/5 rounded-full blur-[100px] pointer-events-none z-0" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(39,39,42,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(39,39,42,0.1)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black_50%,transparent_100%)] pointer-events-none z-0" />

            {/* MAIN SHELL RESPONSIVE BOUNDARY CONTROLLER */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* HEADERS PACK */}
                <header className="mb-8 sm:mb-12 border-b border-zinc-900 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm text-[10px] font-mono tracking-widest text-zinc-400 uppercase mb-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Core System v2.4
                        </div>
                        <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent sm:text-4xl">
                            Face Finder Sync
                        </h1>
                        <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1">
                            Secure AI Node Verification Terminal
                        </p>
                    </div>
                    <div className="self-start sm:self-center bg-zinc-900/40 border border-zinc-800 text-zinc-400 text-[11px] font-mono p-3 rounded-2xl max-w-full truncate">
                        NODE_ID: <span className="text-zinc-200">{token}</span>
                    </div>
                </header>

                {/* THE RESPONSIVE DIVISION LAYOUT SPLIT FRAME - Laptop side-by-side / mobile clean column stacking */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* LEFT PORT: CAMERA NODE CONTROLLER SECTION */}
                    <aside className="lg:col-span-4 lg:sticky lg:top-28 space-y-6 flex flex-col items-center w-full">
                        {cameraActive ? (
                            <div className="relative w-full max-w-sm aspect-square overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-[0_0_50px_rgba(0,0,0,0.6)] group transition-all duration-300">

                                <Webcam
                                    ref={webcamRef}
                                    mirrored={true}
                                    audio={false}
                                    screenshotFormat="image/jpeg"
                                    screenshotQuality={0.96}
                                    videoConstraints={{
                                        width: 600,
                                        height: 600,
                                        facingMode: "user"
                                    }}
                                    className="w-full h-full object-cover brightness-[1.05] contrast-[1.02]"
                                />

                                {/* HUD DESIGN SCROLL SCANNER SYSTEM OVERLAY */}
                                <div
                                    className="absolute inset-0 pointer-events-none flex items-center justify-center"
                                    style={{ background: "radial-gradient(ellipse 135px 170px at center, transparent 99%, rgba(9, 9, 11, 0.9) 100%)" }}
                                >
                                    {/* Bracket Elements */}
                                    <div className="absolute w-[220px] h-[280px] sm:w-[240px] sm:h-[310px] flex flex-col justify-between">
                                        <div className="flex justify-between">
                                            <div className={`w-4 h-4 border-t-2 border-l-2 transition-all duration-300 ${isFaceDetected ? 'border-emerald-400' : 'border-zinc-700'}`} />
                                            <div className={`w-4 h-4 border-t-2 border-r-2 transition-all duration-300 ${isFaceDetected ? 'border-emerald-400' : 'border-zinc-700'}`} />
                                        </div>
                                        <div className="flex justify-between">
                                            <div className={`w-4 h-4 border-b-2 border-l-2 transition-all duration-300 ${isFaceDetected ? 'border-emerald-400' : 'border-zinc-700'}`} />
                                            <div className={`w-4 h-4 border-b-2 border-r-2 transition-all duration-300 ${isFaceDetected ? 'border-emerald-400' : 'border-zinc-700'}`} />
                                        </div>
                                    </div>

                                    <div className={`w-[240px] h-[300px] sm:w-[270px] sm:h-[340px] rounded-[110px] border-2 border-dashed transition-all duration-700 ${isFaceDetected ? 'border-emerald-500/60 bg-emerald-500/[0.01]' : 'border-zinc-800/80'}`} />

                                    {isFaceDetected && (
                                        <div className="absolute w-[240px] h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_rgba(52,211,153,0.8)] animate-[scan_2.5s_ease-in-out_infinite]" style={{ top: '15%' }} />
                                    )}

                                    <div className="absolute top-4 left-4 font-mono text-[9px] text-zinc-600 flex flex-col gap-1">
                                        <div>SYS_INDEX: <span className={isFaceDetected ? "text-emerald-500 font-bold" : "text-zinc-500"}>{isFaceDetected ? "TRACKING" : "IDLE"}</span></div>
                                        <div>LOCK_RATIO: <span className="text-zinc-400">{alignmentScore}%</span></div>
                                    </div>

                                    <div className="absolute bottom-6 backdrop-blur-md px-4 py-2 rounded-xl border text-[9px] font-mono tracking-wider transition-all duration-300 bg-zinc-900/90 border-zinc-800 shadow-xl">
                                        {isFaceDetected ? (
                                            <span className="text-emerald-400 flex items-center gap-2 font-bold">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> SECURE LOCK
                                            </span>
                                        ) : (
                                            <span className="text-zinc-400 flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" /> ALIGN FACE
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {loading && (
                                    <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md flex flex-col items-center justify-center gap-3">
                                        <div className="w-8 h-8 rounded-full border-2 border-zinc-800 border-t-emerald-400 animate-spin" />
                                        <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase animate-pulse">DECRYPTING COGNITIVE INDEX...</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button
                                onClick={() => {
                                    setCameraActive(true);
                                    setIsFaceDetected(false);
                                }}
                                className="w-full max-w-sm group flex items-center justify-center gap-2.5 rounded-2xl bg-zinc-900/40 border border-zinc-800 px-5 py-4 text-xs font-bold text-zinc-300 hover:text-white hover:border-zinc-700 transition-all active:scale-[0.98] shadow-xl backdrop-blur-sm"
                            >
                                <svg className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                </svg>
                                Reactivate Camera Matrix
                            </button>
                        )}

                        {cameraActive && (
                            <button
                                onClick={capture}
                                disabled={loading || !isFaceDetected}
                                className={`w-full max-w-sm rounded-2xl px-6 py-4 text-center text-xs font-black uppercase tracking-widest transition-all duration-300 border ${isFaceDetected && !loading
                                        ? 'bg-emerald-500 text-zinc-950 border-emerald-400 hover:bg-emerald-400 active:scale-98 shadow-[0_4px_24px_rgba(16,185,129,0.2)]'
                                        : 'bg-zinc-900/30 text-zinc-600 border-zinc-800/60 cursor-not-allowed'
                                    }`}
                            >
                                {loading ? "Decrypting Node..." : isFaceDetected ? "Authorize & Scan Matrix" : "Verification System Locked"}
                            </button>
                        )}
                    </aside>

                    {/* RIGHT PORT: OUTPUT WORKSPACE VIEWPORT GRID */}
                    <main className="lg:col-span-8 space-y-6 w-full">

                        {/* CONTROLS ANCHOR HEADER PANEL */}
                        <div className="rounded-2xl border border-zinc-900 bg-zinc-900/10 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-md">
                            <div className="space-y-1">
                                <div className="text-xs font-bold text-zinc-500 tracking-wider uppercase font-mono">// Pipeline Outputs</div>
                                <p className="text-xs text-zinc-400">
                                    {matchedImages.length > 0 ? `${matchedImages.length} verified records found` : "Waiting for biometric synchronization..."}
                                </p>
                            </div>

                            {/* ACTIVE ZIP ACTIONS LOG TRIGGER */}
                            {matchedImages.length > 0 && (
                                <button
                                    onClick={downloadAllMatchedImages}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-5 py-3 text-xs font-bold text-zinc-950 transition-all active:scale-[0.98] shadow-lg shadow-emerald-950/20"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m-9 1V4a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                    </svg>
                                    One Tap Download (.ZIP)
                                </button>
                            )}
                        </div>

                        {/* RESULTS LIST MODULE INNER VIEWPORT - Redesigned with custom dark cyber theme scrollbar */}
                        <div className="lg:max-h-[60vh] lg:overflow-y-auto pr-0 lg:pr-3 scrollbar-thin [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-zinc-950/40 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-800 hover:[&::-webkit-scrollbar-thumb]:bg-zinc-700 active:[&::-webkit-scrollbar-thumb]:bg-emerald-500/50 [&::-webkit-scrollbar-track]:rounded-full transition-all duration-300">
                            {hasSearched && matchedImages.length === 0 ? (
                                <div className="w-full text-center py-16 border border-dashed border-zinc-900 rounded-3xl bg-zinc-900/5">
                                    <div className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center mx-auto mb-3 text-zinc-500 font-mono text-xs">!</div>
                                    <h3 className="text-sm font-semibold text-zinc-400">Zero Index Matches Linked</h3>
                                    <p className="text-xs text-zinc-600 mt-1 max-w-xs mx-auto">No registered asset data references discovered on this secure route key wrapper configuration.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 pb-2">
                                    {matchedImages.map((img) => {
                                        const fullImageUrl = `${import.meta.env.VITE_API_BASE_URL}${img.image}`;
                                        return (
                                            <article
                                                key={img.id}
                                                className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-900 bg-gradient-to-b from-zinc-900/40 to-zinc-900/5 p-2 transition-all duration-300 hover:border-zinc-800"
                                            >
                                                {/* Media frame */}
                                                <div
                                                    onClick={() => setActiveImage({ ...img, image: fullImageUrl })}
                                                    className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-zinc-950 border border-zinc-900/40 cursor-pointer"
                                                >
                                                    <img
                                                        src={fullImageUrl}
                                                        alt=""
                                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-102"
                                                        loading="lazy"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3">
                                                        <span className="text-[9px] bg-zinc-900 border border-zinc-800 text-zinc-200 px-2 py-1 rounded-md uppercase tracking-wider font-bold shadow-xl">
                                                            View
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* FIXED MOBILE OVERLAPPING BY IMPROVING DENSITY TYPOGRAPHY ROW */}
                                                <div className="p-2 pt-3 flex flex-col gap-2">
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="font-mono text-[9px] text-zinc-600 truncate">
                                                            REF_ID: #{img.id}
                                                        </span>
                                                        <span className="font-medium text-xs text-zinc-300 truncate mt-0.5">
                                                            {img.file_name || "match_record.jpg"}
                                                        </span>
                                                    </div>

                                                    {/* Clean responsive metadata footer with instant download action button */}
                                                    <div className="flex items-center justify-between border-t border-zinc-900/60 pt-2 gap-1">
                                                        <div className="flex flex-col">
                                                            <span className="text-[8px] font-mono font-bold text-zinc-600 uppercase tracking-tight">CONFIDENCE</span>
                                                            <span className="font-mono text-xs font-black text-emerald-400">{img.confidence}%</span>
                                                        </div>
                                                        <button
                                                            onClick={() => handleDownload(fullImageUrl, img.id)}
                                                            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800/80 transition-all active:scale-95"
                                                            title="Download asset raw item"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </main>

                </div>
            </div>

            {/* FACE CAPTURE GUIDE POPUP */}
{/* FACE CAPTURE GUIDE POPUP */}
{showGuide && (
    <div className="fixed inset-0 z-[100] bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-300">
        <div 
            className="w-full max-w-2xl rounded-3xl border border-zinc-800/80 bg-zinc-900/90 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-none backdrop-blur-xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
        >
            {/* HEADER */}
            <div className="border-b border-zinc-800/60 p-5 sm:p-6 bg-zinc-900/50 flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                            Biometric Alignment
                        </h2>
                        <p className="text-xs text-zinc-400 mt-0.5">
                            Follow these parameters for optimal scanning accuracy
                        </p>
                    </div>
                </div>
                
                {/* Optional Close Button for better UX */}
                <button 
                    onClick={() => setShowGuide(false)}
                    className="p-1.5 rounded-lg bg-zinc-800/40 border border-zinc-700/50 text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* TWO-COLUMN CONTENT HOUSING (Scrollable on tiny mobile devices) */}
            <div className="p-5 sm:p-6 space-y-5 overflow-y-auto sm:overflow-visible flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* RECOMMENDED COLUMN */}
                    <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.02] p-4 flex flex-col">
                        <div className="inline-flex items-center gap-2 text-[10px] font-mono tracking-wider font-black text-emerald-400 uppercase mb-3 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md w-fit">
                            <span className="w-1 h-1 rounded-full bg-emerald-400" /> Recommended Setup
                        </div>
                        <ul className="space-y-2.5 text-xs text-zinc-300 flex-1">
                            <li className="flex items-start gap-2.5 bg-zinc-950/30 border border-zinc-800/40 p-2.5 rounded-xl">
                                <span className="text-emerald-400 font-bold shrink-0 text-sm leading-none">✓</span>
                                <p className="leading-relaxed">Keep your face completely straight and centered.</p>
                            </li>
                            <li className="flex items-start gap-2.5 bg-zinc-950/30 border border-zinc-800/40 p-2.5 rounded-xl">
                                <span className="text-emerald-400 font-bold shrink-0 text-sm leading-none">✓</span>
                                <p className="leading-relaxed">Maintain a distance of 30–60 cm from the camera.</p>
                            </li>
                            <li className="flex items-start gap-2.5 bg-zinc-950/30 border border-zinc-800/40 p-2.5 rounded-xl">
                                <span className="text-emerald-400 font-bold shrink-0 text-sm leading-none">✓</span>
                                <p className="leading-relaxed">Ensure clear, bright frontal lighting on your face.</p>
                            </li>
                            <li className="flex items-start gap-2.5 bg-zinc-950/30 border border-zinc-800/40 p-2.5 rounded-xl">
                                <span className="text-emerald-400 font-bold shrink-0 text-sm leading-none">✓</span>
                                <p className="leading-relaxed">Look directly into the lens during initialization.</p>
                            </li>
                        </ul>
                    </div>

                    {/* AVOID COLUMN */}
                    <div className="rounded-2xl border border-rose-500/10 bg-rose-500/[0.02] p-4 flex flex-col">
                        <div className="inline-flex items-center gap-2 text-[10px] font-mono tracking-wider font-black text-rose-400 uppercase mb-3 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md w-fit">
                            <span className="w-1 h-1 rounded-full bg-rose-400" /> Environmental Pitfalls
                        </div>
                        <ul className="space-y-2.5 text-xs text-zinc-300 flex-1">
                            <li className="flex items-start gap-2.5 bg-zinc-950/30 border border-zinc-800/40 p-2.5 rounded-xl">
                                <span className="text-rose-400 font-bold shrink-0 text-sm leading-none">✕</span>
                                <p className="leading-relaxed">Avoid leaning too close or obscuring peripheral view.</p>
                            </li>
                            <li className="flex items-start gap-2.5 bg-zinc-950/30 border border-zinc-800/40 p-2.5 rounded-xl">
                                <span className="text-rose-400 font-bold shrink-0 text-sm leading-none">✕</span>
                                <p className="leading-relaxed">Do not wear sunglasses, deep hats, or clear face masks.</p>
                            </li>
                            <li className="flex items-start gap-2.5 bg-zinc-950/30 border border-zinc-800/40 p-2.5 rounded-xl">
                                <span className="text-rose-400 font-bold shrink-0 text-sm leading-none">✕</span>
                                <p className="leading-relaxed">Avoid heavy shadows or backlighting environments.</p>
                            </li>
                            <li className="flex items-start gap-2.5 bg-zinc-950/30 border border-zinc-800/40 p-2.5 rounded-xl">
                                <span className="text-rose-400 font-bold shrink-0 text-sm leading-none">✕</span>
                                <p className="leading-relaxed">Minimize movement or shaking to prevent tracking loss.</p>
                            </li>
                        </ul>
                    </div>

                </div>

                {/* ACTION TRIGGER BUTTON */}
                <div className="pt-2 sm:pt-0">
                    <button
                        onClick={() => setShowGuide(false)}
                        className="w-full rounded-xl sm:rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black uppercase tracking-widest text-xs py-3.5 sm:py-4 transition-all duration-200 active:scale-[0.99] shadow-lg shadow-emerald-950/40 border border-emerald-400/20"
                    >
                        Initialize Matrix Scan
                    </button>
                </div>
            </div>
        </div>
    </div>
)}
            {/* FULL SCREEN DOCK LIGHTBOX MODAL */}
            {activeImage && (
                <div
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-2xl p-4 animate-in fade-in duration-200"
                    onClick={() => setActiveImage(null)}
                >
                    <div className="w-full max-w-xl flex items-center justify-between mb-4 px-2">
                        <span className="font-mono text-[10px] sm:text-xs text-zinc-400">
                            Match Confidence Profile Value: <span className="text-emerald-400 font-bold font-mono">{activeImage.confidence}%</span>
                        </span>
                        <button
                            onClick={() => setActiveImage(null)}
                            className="rounded-xl bg-zinc-900 border border-zinc-800 p-2 text-zinc-400 hover:text-white transition-all active:scale-90"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div
                        className="relative max-w-xl w-full max-h-[65vh] rounded-2xl overflow-hidden shadow-2xl border border-zinc-900"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img src={activeImage.image} alt="" className="w-full h-full max-h-[65vh] object-contain rounded-2xl bg-black" />
                    </div>

                    <div className="mt-6 w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => handleDownload(activeImage.image, activeImage.id)}
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-100 px-5 py-3.5 text-xs font-bold uppercase text-zinc-950 hover:bg-white active:scale-95 shadow-xl transition-all"
                        >
                            Download Asset Record
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SharePage;