import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import { successToast, errorToast } from "../utils/toast";

function Dashboard() {
    const navigate = useNavigate();

    const [albums, setAlbums] = useState([]);
    const [title, setTitle] = useState("");

    // FETCH ALBUMS
    const fetchAlbums = async () => {
        try {
            const response = await api.get("albums/");
            setAlbums(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchAlbums();
    }, []);

    // CREATE ALBUM
    const createAlbum = async () => {
        if (!title.trim()) {
            return errorToast("Album title required");
        }

        try {
            await api.post("albums/", {
                title,
            });

            setTitle("");
            fetchAlbums();
        } catch (error) {
            console.log(error);
        }
    };

    // DELETE ALBUM
    const deleteAlbum = async (id) => {
        try {
            await api.delete(`albums/${id}/delete/`);
            fetchAlbums();
        } catch (error) {
            console.log(error);
        }
    };

    const createShareLink = async (id) => {
        let link = "";

        try {
            const response = await api.post(`sharing/create/${id}/`);
            const token = response.data.token;

            link = `${import.meta.env.VITE_FRONTEND_URL}/share/${token}`;

            // Check if the browser supports mobile-native sharing
            if (navigator.share) {
                await navigator.share({
                    title: 'FaceFetch Album Access',
                    text: `Scan your face to see all your matching photos from this collection instantly!`,
                    url: link,
                });
                successToast("Share menu opened");
            } else {
                // Desktop fallback: copy to clipboard
                await navigator.clipboard.writeText(link);
                successToast("Share link copied");
            }

        } catch (error) {
            console.log(error);

            // Ignore standard user cancellations of the native share sheet menu
            if (error.name === "AbortError") {
                return;
            }

            // Secondary fallback copy method for legacy configurations
            if (link) {
                const textArea = document.createElement("textarea");
                textArea.value = link;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand("copy");
                document.body.removeChild(textArea);
                successToast("Share link copied");
            }
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 antialiased selection:bg-violet-500/30 selection:text-violet-200 relative">

            {/* COMPACT TOP BACKGROUND LIGHTS */}
            <div className="absolute top-0 right-1/4 w-[300px] sm:w-[500px] aspect-square bg-violet-600/5 rounded-full blur-[100px] pointer-events-none z-0" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(39,39,42,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(39,39,42,0.1)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black_50%,transparent_100%)] pointer-events-none z-0" />

            {/* MAIN CONTAINER */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 py-10 sm:py-16 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">

                {/* TOP BAR HEADER */}
                <header className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-900 pb-6">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent sm:text-4xl">
                            My Collections
                        </h1>
                        <p className="text-xs text-zinc-500 font-semibold tracking-widest uppercase mt-1.5 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                            {albums.length} {albums.length === 1 ? "album" : "albums"} live
                        </p>
                    </div>
                </header>

                {/* CREATE ALBUM INPUT SECTION */}
                <section className="mb-12 max-w-2xl">
                    <div className="group relative flex flex-col gap-2 rounded-2xl bg-zinc-900/20 p-2 border border-zinc-800/60 transition-all duration-300 focus-within:border-violet-500/40 focus-within:ring-4 focus-within:ring-violet-500/5 sm:flex-row sm:items-center backdrop-blur-md">
                        <input
                            type="text"
                            placeholder="Drop a new album title..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-transparent px-4 py-3.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none font-medium sm:text-base"
                        />
                        <button
                            onClick={createAlbum}
                            className="w-full rounded-xl bg-zinc-100 hover:bg-white px-6 py-3.5 text-center text-xs sm:text-sm font-bold text-black transition-all active:scale-[0.98] sm:w-auto sm:whitespace-nowrap shadow-lg shadow-white/5"
                        >
                            Create Album
                        </button>
                    </div>
                </section>

                {/* ALBUM GRID */}
                <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {albums.map((album) => (
                        <article
                            key={album.id}
                            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-900 bg-gradient-to-b from-zinc-900/30 to-zinc-900/5 p-6 transition-all duration-300 hover:border-violet-500/30 hover:from-zinc-900/50 hover:-translate-y-0.5 shadow-xl shadow-black/40"
                        >
                            {/* Floating Delete Button with clean micro-interaction design */}
                            <button
                                onClick={() => deleteAlbum(album.id)}
                                className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 max-lg:opacity-100 rounded-xl bg-zinc-950 border border-zinc-900 p-2.5 text-zinc-500 transition-all duration-200 hover:border-red-500/30 hover:bg-red-500/5 hover:text-red-400"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            {/* Album Icon framing placeholder layout asset */}
                            <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-900 flex items-center justify-center text-zinc-700 mb-6 group-hover:text-violet-500/40 transition-colors">
                                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>

                            {/* Album Label & Title */}
                            <div>
                                <div className="mb-1 text-[10px] font-bold tracking-widest text-violet-400/80 uppercase transition-colors duration-300 group-hover:text-violet-400">
                                    COLLECTION
                                </div>
                                <h2 className="text-base font-black tracking-tight text-zinc-200 transition-colors duration-200 group-hover:text-white line-clamp-2 sm:text-lg">
                                    {album.title}
                                </h2>
                            </div>

                            {/* Bottom Controls / Metrics details layout pane */}
                            <div className="space-y-3 mt-8 border-t border-zinc-900/60 pt-4">
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-[10px] text-zinc-600 group-hover:text-zinc-500 transition-colors">
                                        NODE_ID: {album.id}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => navigate(`/albums/${album.id}`, { state: { albumName: album.title } })}
                                        className="rounded-xl bg-zinc-100 hover:bg-white py-2.5 text-center text-xs font-bold text-black transition-all active:scale-[0.97]"
                                    >
                                        Open Workspace
                                    </button>
                                    <button
                                        onClick={() => createShareLink(album.id)}
                                        className="rounded-xl bg-zinc-950 border border-zinc-900 hover:border-zinc-800 py-2.5 text-center text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors active:scale-[0.97]"
                                    >
                                        Share Link
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </main>

            </div>
        </div>
    );
}

export default Dashboard;