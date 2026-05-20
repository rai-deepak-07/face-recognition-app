import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";

function Dashboard() {

    const navigate = useNavigate();

    const [albums, setAlbums] = useState([]);
    const [title, setTitle] = useState("");

    // LOGOUT
    const handleLogout = () => {

        localStorage.removeItem("access");
        localStorage.removeItem("refresh");

        navigate("/login");
    };

    // FETCH ALBUMS
    const fetchAlbums = async () => {

        try {

            const response = await api.get("albums/");

            setAlbums(response.data);

        } catch (error) {

            console.log(error);

            // token invalid
            if (error.response?.status === 401) {
                handleLogout();
            }
        }
    };

    useEffect(() => {
        fetchAlbums();
    }, []);

    // CREATE ALBUM
    const createAlbum = async () => {

        if (!title.trim()) {
            return alert("Album title required");
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

            await api.delete(
                `albums/${id}/delete/`
            );

            fetchAlbums();

        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-10">

            {/* TOP BAR */}
            <div className="flex justify-between items-center mb-10">

                <h1 className="text-4xl font-bold">
                    My Albums
                </h1>

                <button
                    onClick={handleLogout}
                    className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
                >
                    Logout
                </button>

            </div>

            {/* CREATE ALBUM */}
            <div className="flex gap-4 mb-10">

                <input
                    type="text"
                    placeholder="Album Name"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="p-3 rounded text-black w-80"
                />

                <button
                    onClick={createAlbum}
                    className="bg-blue-500 px-6 py-2 rounded hover:bg-blue-600"
                >
                    Create Album
                </button>

            </div>

            {/* ALBUM GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {albums.map((album) => (

                    <div
                        key={album.id}
                        className="bg-gray-800 p-6 rounded-lg shadow-lg"
                    >

                        <h2 className="text-2xl mb-4">
                            {album.title}
                        </h2>

                        <p className="text-gray-400 mb-6">
                            Album ID: {album.id}
                        </p>
                        <div className="flex gap-3">

                            <button
                                onClick={() =>
                                    navigate(`/albums/${album.id}`)
                                }
                                className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600"
                            >
                                Open
                            </button>

                            <button
                                onClick={() => deleteAlbum(album.id)}
                                className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
                            >
                                Delete
                            </button>

                        </div>

                    </div>
                ))}

            </div>

        </div>
    );
}

export default Dashboard;