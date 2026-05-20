import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Webcam from "react-webcam";
import api from "../services/api";
import { successToast, errorToast } from "../utils/toast";

function SharePage() {
    const { token } = useParams();
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const intervalRef = useRef(null);

    const [matchedImages, setMatchedImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    
    const [activeImage, setActiveImage] = useState(null);
    const [cameraActive, setCameraActive] = useState(true);
    const [isStable, setIsStable] = useState(false);

    // native high-speed pixel matrix evaluation
    useEffect(() => {
        if (!cameraActive) return;

        // Create an off-screen canvas to process pixels dynamically
        if (!canvasRef.current) {
            canvasRef.current = document.createElement("canvas");
        }

        const analyzeFrame = () => {
            if (webcamRef.current && webcamRef.current.video && webcamRef.current.video.readyState === 4) {
                const video = webcamRef.current.video;
                const canvas = canvasRef.current;
                const ctx = canvas.getContext("2d");

                canvas.width = 160; // downscaled for optimal mobile processing speeds
                canvas.height = 120;

                // Mirror and draw frame coordinates
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1);
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                try {
                    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const pixels = imgData.data;

                    // Realtime luminosity algorithm checking for center-mass face blocking values
                    let centerLuminosity = 0;
                    let edgeLuminosity = 0;
                    let countCenter = 0;
                    let countEdge = 0;

                    for (let i = 0; i < pixels.length; i += 16) {
                        const r = pixels[i];
                        const g = pixels[i + 1];
                        const b = pixels[i + 2];
                        const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

                        const pixelIndex = i / 4;
                        const x = pixelIndex % canvas.width;
                        const y = Math.floor(pixelIndex / canvas.width);

                        // Check if skin/shadow cluster targets sit directly inside your circular HUD bounds
                        if (x > canvas.width * 0.35 && x < canvas.width * 0.65 && y > canvas.height * 0.25 && y < canvas.height * 0.75) {
                            centerLuminosity += brightness;
                            countCenter++;
                        } else {
                            edgeLuminosity += brightness;
                            countEdge++;
                        }
                    }

                    const avgCenter = centerLuminosity / (countCenter || 1);
                    const avgEdge = edgeLuminosity / (countEdge || 1);

                    // A dynamic delta shift tells us a head is actively breaking the center circle frame grid
                    if (Math.abs(avgCenter - avgEdge) > 8 && avgCenter > 30) {
                        setIsStable(true);
                    } else {
                        setIsStable(false);
                    }
                } catch (e) {
                    // Fail-safe to avoid throwing blocking unhandled runtime trace exceptions
                    setIsStable(false);
                }
            }
        };

        // Poll the camera track array safely every 200ms
        intervalRef.current = setInterval(analyzeFrame, 200);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [cameraActive]);

    // CAPTURE IMAGE
    const capture = async () => {
        if (!webcamRef.current || !isStable) return;
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
            successToast("Scan processed complete!");
            
        } catch (error) {
            console.log(error);
            errorToast("Facial search processing failed");
        } finally {
            setLoading(false);
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
            link.download = `faceshare-match-${imageId}.jpg`;
            document.body.appendChild(link);
            link.click();
            
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
            successToast("Download initiated");
        } catch (error) {
            console.log(error);
            errorToast("Download failed");
        }
    };

    return (
        <div className="min-h-screen bg-black text-zinc-100 antialiased selection:bg-violet-500/30 selection:text-violet-200">
            <div className="max-w-xl mx-auto px-4 py-8 sm:py-12 md:max-w-4xl lg:max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
                
                {/* HEADER */}
                <header className="mb-8 text-center sm:text-left">
                    <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text text-transparent sm:text-4xl">
                        Face Finder Sync
                    </h1>
                    <p className="text-xs text-zinc-500 font-medium tracking-wide uppercase mt-1">
                        AI-Powered Biometric Shared Portal Lookup
                    </p>
                </header>

                {/* CAMERA DECK / INPUT AREA */}
                <section className="mb-10 flex flex-col items-center">
                    {cameraActive ? (
                        <div className={`relative w-full max-w-md aspect-square sm:aspect-video overflow-hidden rounded-2xl border transition-all duration-500 bg-zinc-950 shadow-2xl shadow-black group ${isStable ? 'border-emerald-500/40 shadow-emerald-950/20' : 'border-zinc-800'}`}>
                            <Webcam
                                ref={webcamRef}
                                mirrored={true}
                                audio={false}
                                screenshotFormat="image/png"
                                screenshotQuality={1}
                                videoConstraints={{
                                    width: 1280,
                                    height: 720,
                                    facingMode: "user"
                                }}
                                className="w-full h-full object-cover"
                            />
                            
                            {/* DOTTED HUD SCANNING OVERLAY GRAPHIC */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-8">
                                <div className={`w-64 h-64 rounded-full border-2 border-dashed transition-all duration-500 flex items-center justify-center ${isStable ? 'border-emerald-400 scale-100 rotate-45' : 'border-zinc-500/50 scale-95 animate-spin [animation-duration:20s]'}`}>
                                    <div className={`w-56 h-56 rounded-full border border-dashed transition-colors duration-500 ${isStable ? 'border-emerald-400/40' : 'border-zinc-600/30'}`} />
                                </div>
                                
                                {/* Realtime Biometric Feedback Status Stamp */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 backdrop-blur-md px-3 py-1 rounded-full border text-[10px] font-mono tracking-wider uppercase transition-all duration-300 bg-black/40 border-zinc-800">
                                    {isStable ? (
                                        <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Frame Locked
                                        </span>
                                    ) : (
                                        <span className="text-zinc-400 animate-pulse flex items-center gap-1.5">
                                            Align Head to Matrix...
                                        </span>
                                    )}
                                </div>
                            </div>

                            {loading && (
                                <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center gap-3 animate-fade-in">
                                    <div className="w-8 h-8 rounded-full border-2 border-t-violet-500 border-zinc-800 animate-spin" />
                                    <span className="text-xs font-mono tracking-widest text-violet-400 uppercase animate-pulse">Running Neural Sync...</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={() => setCameraActive(true)}
                            className="rounded-xl bg-zinc-900/50 border border-zinc-800/80 px-5 py-3 text-xs font-bold text-zinc-300 transition-all active:scale-95 hover:border-zinc-700"
                        >
                            🔄 Reset Camera Matrix & Rescan
                        </button>
                    )}

                    {/* ACTION INTERFACE HUB BUTTON */}
                    {cameraActive && (
                        <button
                            onClick={capture}
                            disabled={loading || !isStable}
                            className={`w-full max-w-md mt-4 rounded-xl px-6 py-4 text-center text-sm font-black uppercase tracking-wide text-black transition-all duration-300 shadow-xl ${!isStable ? 'bg-zinc-800/50 text-zinc-500 cursor-not-allowed border border-zinc-800/50 shadow-none' : 'bg-zinc-100 hover:bg-zinc-200 active:scale-95 shadow-white/5'}`}
                        >
                            {loading ? "Decrypting Node..." : !isStable ? "Position Alignment Required" : "Scan & Match Index"}
                        </button>
                    )}
                </section>

                {/* DYNAMIC RESULTS RETRIEVAL */}
                <main className="mt-12 border-t border-zinc-900 pt-8">
                    <h2 className="text-lg font-bold tracking-tight text-zinc-400 mb-6 font-mono">
                        // Output Index Matrix
                    </h2>

                    {hasSearched && matchedImages.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-zinc-800/80 bg-zinc-900/10 py-16 text-center animate-in fade-in duration-300">
                            <div className="text-3xl mb-3">🛰️</div>
                            <h3 className="text-base font-bold text-zinc-300 tracking-tight">Zero Network Index Found</h3>
                            <p className="text-xs text-zinc-600 mt-1 max-w-xs mx-auto">
                                The AI scanned your profile vector but found no registered match constraints in this cluster vault.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {matchedImages.map((img) => {
                                const fullImageUrl = `${import.meta.env.VITE_API_BASE_URL}${img.image}`;
                                return (
                                    <article
                                        key={img.id}
                                        onClick={() => setActiveImage({ ...img, image: fullImageUrl })}
                                        className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-800/50 bg-gradient-to-b from-zinc-900/60 to-zinc-900/20 p-2 transition-all duration-300 transform-gpu hover:border-violet-500/40 hover:from-zinc-900/80 hover:-translate-y-1 cursor-pointer"
                                    >
                                        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-zinc-950">
                                            <img
                                                src={fullImageUrl}
                                                alt=""
                                                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                                loading="lazy"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                                <span className="text-xs bg-black/60 backdrop-blur-md px-3 py-2 rounded-xl font-bold tracking-wide border border-zinc-800 scale-90 group-hover:scale-100 transition-transform duration-300">
                                                    Expand Asset
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-2 pt-3 flex items-center justify-between">
                                            <span className="font-mono text-[9px] text-zinc-600 tracking-tight">
                                                CONFIDENCE:
                                            </span>
                                            <span className="text-xs font-bold font-mono text-emerald-400">
                                                {img.confidence}%
                                            </span>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>

            {/* FULL SCREEN LIGHTBOX MODAL */}
            {activeImage && (
                <div 
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl p-4 animate-in fade-in duration-200"
                    onClick={() => setActiveImage(null)}
                >
                    <div className="w-full max-w-2xl flex items-center justify-between mb-4 px-2">
                        <span className="font-mono text-xs text-zinc-400">
                            Confidence Index Matrix Match Value: <span className="text-emerald-400 font-bold">{activeImage.confidence}%</span>
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

                    <div 
                        className="relative max-w-2xl w-full max-h-[70vh] flex items-center justify-center overflow-hidden rounded-2xl animate-in zoom-in-95 duration-300 ease-out"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img 
                            src={activeImage.image} 
                            alt="" 
                            className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl shadow-black"
                        />
                    </div>

                    <div 
                        className="mt-6 flex items-center gap-3 w-full max-w-xs justify-center" 
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => handleDownload(activeImage.image, activeImage.id)}
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-100 px-5 py-3.5 text-sm font-bold text-black shadow-lg hover:bg-white active:scale-95 transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download Match Asset
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SharePage;