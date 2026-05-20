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

        await navigator.clipboard.writeText(link);

        successToast("Share link copied");

    } catch (error) {
        console.log(error);

        // fallback copy
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
        <div className="min-h-screen bg-black text-zinc-100 antialiased selection:bg-violet-500/30 selection:text-violet-200">
            {/* MAIN CONTAINER (Animate entrance on page load) */}
            <div className="max-w-xl mx-auto px-4 py-8 sm:py-12 md:max-w-4xl lg:max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">

                {/* TOP BAR */}
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text text-transparent sm:text-4xl">
                            My Collections
                        </h1>
                        <p className="text-xs text-zinc-500 font-medium tracking-wide uppercase mt-1">
                            {albums.length} {albums.length === 1 ? "album" : "albums"} live
                        </p>
                    </div>
                </header>

                {/* CREATE ALBUM INPUT SECTION */}
                <section className="mb-10">
                    <div className="group relative flex flex-col gap-3 rounded-2xl bg-zinc-900/40 p-2.5 border border-zinc-800/60 transition-all duration-300 transform-gpu focus-within:border-violet-500/50 focus-within:ring-4 focus-within:ring-violet-500/10 focus-within:scale-[1.01] sm:flex-row sm:items-center">
                        <input
                            type="text"
                            placeholder="Drop a new album title..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-transparent px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none sm:text-base"
                        />
                        <button
                            onClick={createAlbum}
                            className="w-full rounded-xl bg-zinc-100 px-5 py-3 text-center text-sm font-semibold text-black transition-all duration-300 cubic-bezier(0.16,1,0.3,1) hover:bg-zinc-200 active:scale-95 sm:w-auto sm:whitespace-nowrap"
                        >
                            Create Album
                        </button>
                    </div>
                </section>

                {/* ALBUM GRID */}
                <main className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {albums.map((album) => (
                        <article
                            key={album.id}
                            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-800/50 bg-gradient-to-b from-zinc-900/60 to-zinc-900/20 p-4 transition-all duration-300 transform-gpu hover:border-violet-500/40 hover:from-zinc-900/80 hover:-translate-y-1 active:scale-[0.98]"
                        >
                            {/* Floating Delete Badge with smooth fade-in state */}
                            <button
                                onClick={() => deleteAlbum(album.id)}
                                className="absolute top-3 right-3 z-10 opacity-0 md:group-hover:opacity-100 max-md:opacity-100 rounded-full bg-black/40 p-2 text-zinc-400 backdrop-blur-sm transition-all duration-200 hover:bg-red-500/20 hover:text-red-400"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            {/* Album Label & Title */}
                            <div className="pt-2">
                                <div className="mb-1 text-[10px] font-mono tracking-widest text-violet-400 uppercase transition-colors duration-300 group-hover:text-violet-300">
                                    COLLECTION
                                </div>
                                <h2 className="text-base font-black tracking-tight text-zinc-100 transition-colors duration-200 group-hover:text-white line-clamp-2 sm:text-lg">
                                    {album.title}
                                </h2>
                            </div>

                            {/* Bottom Controls / ID */}
                            <div className="space-y-2 mt-6">
                                <p className="font-mono text-[9px] text-zinc-600 transition-colors duration-300 group-hover:text-zinc-500">
                                    ID: {album.id}
                                </p>

                                <div className="grid grid-cols-2 gap-1.5">
                                    <button
                                        onClick={() => navigate(`/albums/${album.id}`)}
                                        className="rounded-lg bg-zinc-100 py-2 text-center text-xs font-bold text-black transition-all duration-200 hover:bg-white active:scale-95"
                                    >
                                        Open
                                    </button>
                                    <button
                                        onClick={() => createShareLink(album.id)}
                                        className="rounded-lg bg-zinc-800/80 py-2 text-center text-xs font-medium text-zinc-300 backdrop-blur-sm transition-all duration-200 hover:bg-zinc-700 hover:text-white active:scale-95"
                                    >
                                        Link
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