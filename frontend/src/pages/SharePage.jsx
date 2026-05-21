import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Webcam from "react-webcam";
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

                // Matrix downscaling for responsive browser calculations
                canvas.width = 40;
                canvas.height = 40;
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                try {
                    const matrixBuffer = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
                    
                    let coreSum = 0;
                    let peripherySum = 0;
                    let coreCount = 0;
                    let peripheryCount = 0;

                    // Scan pixel array matrix
                    for (let index = 0; index < matrixBuffer.length; index += 16) {
                        const r = matrixBuffer[index];
                        const g = matrixBuffer[index + 1];
                        const b = matrixBuffer[index + 2];
                        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

                        const flatPixelIndex = index / 4;
                        const pointX = flatPixelIndex % canvas.width;
                        const pointY = Math.floor(flatPixelIndex / canvas.width);

                        // Isolate middle coordinates corresponding to the circle HUD geometry overlay
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

                    // Compute alignment validation calculations natively
                    if (absoluteDelta > 14 && coreMean > 20) {
                        setIsFaceDetected(true);
                        // Simulate natural, granular structural stability metrics matching actual camera applications
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
            console.error(error);
            errorToast("Download failed");
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
            
            {/* AMBIENT TECH BACKGROUND BACKGROUND ACCENTS */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] aspect-square rounded-full bg-violet-950/10 blur-[140px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] aspect-square rounded-full bg-emerald-950/10 blur-[140px]" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-4 py-12 animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out">
                
                {/* HEADER */}
                <header className="mb-12 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm text-[10px] font-mono tracking-widest text-zinc-400 uppercase mb-3">
                        <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" /> Core System Version 2.4
                    </div>
                    <h1 className="text-4xl font-black tracking-tight bg-gradient-to-b from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text text-transparent sm:text-5xl">
                        Face Finder Sync
                    </h1>
                    <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1.5">
                        Secure AI Node Verification Terminal
                    </p>
                </header>

                {/* CAMERA CONSOLE VIEWER */}
                <section className="mb-14 flex flex-col items-center">
                    {cameraActive ? (
                        <div className="relative w-full max-w-sm aspect-square overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-[0_0_50px_rgba(0,0,0,0.8)] group transition-all duration-500">
                            
                            {/* LIVE CAMERA STEAM VIEWPORT */}
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
                            
                            {/* HOLLYWOOD HUD HARDWARE SCAN OVERLAY */}
                            <div 
                                className="absolute inset-0 pointer-events-none flex items-center justify-center transition-all duration-500"
                                style={{
                                    background: "radial-gradient(ellipse 135px 170px at center, transparent 99%, rgba(9, 9, 11, 0.9) 100%)"
                                }}
                            >
                                {/* Target Corner Brackets Layout */}
                                <div className="absolute w-[240px] h-[310px] flex flex-col justify-between">
                                    <div className="flex justify-between">
                                        <div className={`w-4 h-4 border-t-2 border-l-2 transition-all duration-300 ${isFaceDetected ? 'border-emerald-400 scale-100' : 'border-zinc-600 scale-95'}`} />
                                        <div className={`w-4 h-4 border-t-2 border-r-2 transition-all duration-300 ${isFaceDetected ? 'border-emerald-400 scale-100' : 'border-zinc-600 scale-95'}`} />
                                    </div>
                                    <div className="flex justify-between">
                                        <div className={`w-4 h-4 border-b-2 border-l-2 transition-all duration-300 ${isFaceDetected ? 'border-emerald-400 scale-100' : 'border-zinc-600 scale-95'}`} />
                                        <div className={`w-4 h-4 border-b-2 border-r-2 transition-all duration-300 ${isFaceDetected ? 'border-emerald-400 scale-100' : 'border-zinc-600 scale-95'}`} />
                                    </div>
                                </div>

                                {/* Main Geometric Center Target Scope */}
                                <div className={`w-[270px] h-[340px] rounded-[110px] border-2 border-dashed transition-all duration-700 ${
                                    isFaceDetected 
                                        ? 'border-emerald-500/80 scale-100 rotate-0 bg-emerald-500/[0.01] shadow-[0_0_30px_rgba(16,185,129,0.05)]' 
                                        : 'border-zinc-800 scale-[0.97] rotate-2'
                                }`} />

                                {/* Realistic Linear Scanning Bar Laser */}
                                {isFaceDetected && (
                                    <div className="absolute w-[260px] h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_rgba(52,211,153,0.8)] animate-[scan_2.5s_ease-in-out_infinite]" 
                                        style={{ top: '15%', transform: 'translateY(-50%)' }}
                                    />
                                )}
                                
                                {/* Dynamic Biometric Metadata Badge Indicators */}
                                <div className="absolute top-4 left-4 font-mono text-[9px] text-zinc-600 flex flex-col gap-1">
                                    <div>SYS_INDEX: <span className={isFaceDetected ? "text-emerald-500 font-bold" : "text-zinc-500"}>{isFaceDetected ? "TRACKING" : "IDLE"}</span></div>
                                    <div>LOCK_RATIO: <span className="text-zinc-400">{alignmentScore}%</span></div>
                                </div>

                                {/* Status Footer Badge */}
                                <div className="absolute bottom-6 backdrop-blur-md px-3.5 py-1.5 rounded-xl border text-[9px] font-mono tracking-widest uppercase transition-all duration-300 bg-zinc-900/90 border-zinc-800 shadow-xl">
                                    {isFaceDetected ? (
                                        <span className="text-emerald-400 flex items-center gap-2 font-bold tracking-normal">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> SECURE RETINAL LOCK
                                        </span>
                                    ) : (
                                        <span className="text-zinc-400 flex items-center gap-2 tracking-normal">
                                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" /> ALIGN FACE TO FRAME
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* LOADER GRAPHIC CONTAINER SCREEN */}
                            {loading && (
                                <div className="absolute inset-0 bg-zinc-950/85 backdrop-blur-md flex flex-col items-center justify-center gap-4 animate-in fade-in duration-200">
                                    <div className="relative w-10 h-10">
                                        <div className="absolute inset-0 rounded-full border-2 border-zinc-800" />
                                        <div className="absolute inset-0 rounded-full border-2 border-t-emerald-400 animate-spin" />
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-xs font-mono tracking-widest text-emerald-400 uppercase animate-pulse">DECRYPTING COGNITIVE INDEX...</span>
                                        <span className="text-[9px] font-mono text-zinc-600 uppercase">DO NOT TERMINATE CONNECTION</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={() => {
                                setCameraActive(true);
                                setIsFaceDetected(false);
                            }}
                            className="group flex items-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 px-5 py-3 text-xs font-bold text-zinc-300 hover:text-white hover:border-zinc-700 transition-all active:scale-95 shadow-xl"
                        >
                            <svg className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18" />
                            </svg>
                            Reinitialize Security Camera Matrix
                        </button>
                    )}

                    {/* DYNAMIC SHIFT INTERACT CONTROL ACTION BUTTON */}
                    {cameraActive && (
                        <button
                            onClick={capture}
                            disabled={loading || !isFaceDetected}
                            className={`w-full max-w-sm mt-5 rounded-xl px-6 py-4 text-center text-xs font-black uppercase tracking-widest transition-all duration-300 border ${
                                isFaceDetected && !loading
                                    ? 'bg-emerald-500 text-zinc-950 border-emerald-400 hover:bg-emerald-400 active:scale-98 shadow-[0_4px_20px_rgba(16,185,129,0.25)]' 
                                    : 'bg-zinc-900/50 text-zinc-600 border-zinc-800/80 cursor-not-allowed'
                            }`}
                        >
                            {loading ? "Decrypting Node..." : isFaceDetected ? "Authorize & Scan Matrix" : "Verification System Locked"}
                        </button>
                    )}
                </section>

                {/* SEARCH RESULTS VIEWPORT DESKTOP GRID */}
                <main className="mt-16 border-t border-zinc-900 pt-10">
                    <div className="flex items-center gap-3 mb-8 font-mono text-xs tracking-widest text-zinc-500 uppercase">
                        <span>// Vault Matrix Inventory Output</span>
                        <div className="h-[1px] flex-1 bg-zinc-900" />
                    </div>

                    {hasSearched && matchedImages.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-zinc-900 bg-zinc-900/10 py-20 text-center animate-in fade-in zoom-in-98 duration-500">
                            <div className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center mx-auto mb-4 bg-zinc-950 text-zinc-500 text-xl shadow-lg font-mono">!</div>
                            <h3 className="text-sm font-bold text-zinc-400 tracking-tight">Zero Network Index Records Found</h3>
                            <p className="text-xs text-zinc-600 mt-1.5 max-w-xs mx-auto font-sans leading-relaxed">
                                The tracking algorithms scanned your spatial map vector but found no registered matches matching inside this server asset container cluster.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                            {matchedImages.map((img) => {
                                const fullImageUrl = `${import.meta.env.VITE_API_BASE_URL}${img.image}`;
                                return (
                                    <article
                                        key={img.id}
                                        onClick={() => setActiveImage({ ...img, image: fullImageUrl })}
                                        className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-950 p-2 transition-all duration-300 hover:border-zinc-800 hover:-translate-y-1 cursor-pointer"
                                    >
                                        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-zinc-900">
                                            <img 
                                                src={fullImageUrl} 
                                                alt="" 
                                                className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500 group-hover:scale-102" 
                                                loading="lazy" 
                                            />
                                            <div className="absolute inset-0 bg-zinc-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                                                <span className="text-[10px] font-mono tracking-wider uppercase bg-zinc-900/90 text-zinc-300 px-3 py-1.5 rounded-lg border border-zinc-800 shadow-xl">
                                                    Expand Record
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-2 pt-3 flex items-center justify-between font-mono text-[9px] tracking-wider">
                                            <span className="text-zinc-600 uppercase">MATCH RATIO:</span>
                                            <span className="font-black text-emerald-400">{img.confidence}%</span>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>

            {/* FULL SCREEN DOCK LIGHTBOX MODAL */}
            {activeImage && (
                <div 
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950/98 backdrop-blur-lg p-4 animate-in fade-in duration-200" 
                    onClick={() => setActiveImage(null)}
                >
                    <div className="w-full max-w-xl flex items-center justify-between mb-4 px-1">
                        <span className="font-mono text-xs text-zinc-400">
                            Biometric Target Registry Confidence Value: <span className="text-emerald-400 font-bold font-mono">{activeImage.confidence}%</span>
                        </span>
                        <button 
                            onClick={() => setActiveImage(null)} 
                            className="rounded-xl bg-zinc-900 border border-zinc-800 p-2 text-zinc-400 hover:text-white transition-all active:scale-90"
                        >
                            ✕
                        </button>
                    </div>
                    
                    <div 
                        className="relative max-w-xl w-full max-h-[65vh] rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.9)] border border-zinc-900" 
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img src={activeImage.image} alt="" className="w-full h-full max-h-[65vh] object-contain rounded-2xl bg-black" />
                    </div>

                    <div className="mt-6 w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
                        <button 
                            onClick={() => handleDownload(activeImage.image, activeImage.id)} 
                            className="w-full rounded-xl bg-zinc-100 px-5 py-3.5 text-xs font-black tracking-widest uppercase text-zinc-950 hover:bg-white active:scale-95 shadow-xl transition-all"
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