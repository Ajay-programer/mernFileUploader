import React, { useState } from 'react';
import axios from 'axios';
import './UploadForm.css';

const UploadForm = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const [progress, setProgress] = useState(0);
    const [uploadedFiles, setUploadedFiles] = useState([]);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            alert("Please select a file to upload.");
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        formData.append('description', description);

        try {
            const res = await axios.post('http://localhost:5000/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setProgress(percentCompleted);
                },
            });

            setUploadedFiles([...uploadedFiles, res.data]);
            setTitle('');
            setDescription('');
            setFile(null);
            setProgress(0);
        } catch (err) {
            console.error('Error uploading file:', err);
            alert('Error uploading file. Please check the console for more details.');
        }
    };

    return (
        <div className="upload-form">
            <h3>Upload File</h3>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
                <input
                    type="file"
                    onChange={handleFileChange}
                    accept="audio/*,video/*"
                    required
                />
                <button type="submit">Upload</button>
            </form>
            {progress > 0 && (
                <progress value={progress} max="100" />
            )}
            <h3>Uploaded Files</h3>
            <ul>
                {uploadedFiles.map((file) => (
                    <li key={file._id}>
                        <strong>{file.title}</strong> - {file.description}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UploadForm;
