import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import api from "../services/api";

function AlbumDetails() {

    const { id } = useParams();

    const navigate = useNavigate();

    const [images, setImages] = useState([]);

    const [file, setFile] = useState(null);

    const fetchImages = async () => {

        try {

            const response = await api.get(
                `images/${id}/`
            );

            setImages(response.data);

        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);

    const uploadImage = async () => {

        if (!file) {
            return alert("Select image");
        }

        const formData = new FormData();

        formData.append("image", file);

        try {

            await api.post(
                `images/${id}/upload/`,
                formData,
                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data",
                    },
                }
            );

            fetchImages();

        } catch (error) {
            console.log(error);
        }
    };

    const deleteImage = async (id) => {

        try {

            await api.delete(
                `images/delete/${id}/`
            );

            fetchImages();

        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-10">
            <button
                onClick={() => navigate("/dashboard")}
                className="bg-gray-700 px-4 py-2 rounded mb-6 hover:bg-gray-600"
            >
                Back to Dashboard
            </button>
            <h1 className="text-4xl font-bold mb-10">
                Album Images
            </h1>

            <div className="flex gap-4 mb-10">

                <input
                    type="file"
                    onChange={(e) =>
                        setFile(e.target.files[0])
                    }
                />

                <button
                    onClick={uploadImage}
                    className="bg-blue-500 px-4 py-2 rounded"
                >
                    Upload
                </button>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {images.map((img) => (

                    <div
                        key={img.id}
                        className="bg-gray-800 p-4 rounded-lg"
                    >

                        <img
                            src={`${img.image}`}
                            alt=""
                            className="w-full h-72 object-cover rounded mb-4"
                        />

                        <button
                            onClick={() => deleteImage(img.id)}
                            className="bg-red-500 w-full py-2 rounded hover:bg-red-600"
                        >
                            Delete Image
                        </button>

                    </div>

                ))}

            </div>

        </div>
    );
}

export default AlbumDetails;