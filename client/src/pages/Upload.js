import React, { useState } from 'react';
import axios from 'axios';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      alert('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setUploadStatus('Uploading...');

    try {
      // Send the file to the backend API
      const response = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        setUploadStatus('File uploaded successfully');
      } else {
        setUploadStatus('Error uploading file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus('Error uploading file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Upload Customer Data</h2>
      <form onSubmit={handleFileUpload}>
        <input
          type="file"
          accept=".csv,.xls,.xlsx"
          onChange={handleFileChange}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Uploading...' : 'Upload File'}
        </button>
      </form>

      {uploadStatus && <p>{uploadStatus}</p>}
    </div>
  );
};

export default Upload;
