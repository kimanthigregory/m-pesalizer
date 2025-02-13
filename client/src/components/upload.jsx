import React, { useRef, useState, useEffect } from "react";
import { io } from "socket.io-client";

export const FileUpload = ({ onUploadSuccess, onUploadError }) => {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    console.log("Upload Progress:", uploadProgress);
  }, [uploadProgress]);

  useEffect(() => {
    const newSocket = io("http://127.0.0.1:5000"); // Connect to Flask-SocketIO
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    newSocket.on("processing_update", (data) => {
      console.log("Processing update:", data);

      if (data.status === "done") {
        setIsProcessing(false);
        setUploadSuccess(true);
        onUploadSuccess && onUploadSuccess();
      } else if (data.status === "failed") {
        setIsProcessing(false);
        onUploadError && onUploadError(data.error);
      }
    });

    return () => newSocket.close();
  }, []);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    } else {
      alert("Only PDF files are allowed");
    }
  };

  const handleSubmit = () => {
    if (!file || !password) {
      alert("Please provide both the PDF file and password");
      return;
    }

    setUploadProgress(0);
    setIsProcessing(true);
    setUploading(true);

    const formData = new FormData();
    formData.append("the_file", file);
    formData.append("pass_code", password);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://127.0.0.1:5000/upload", true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percent);
      }
    };

    xhr.onload = () => {
      setUploading(false);
      if (xhr.status === 200) {
        setUploadProgress(100);
      } else {
        setIsProcessing(false);
        onUploadError && onUploadError("Upload failed.");
      }
    };

    xhr.onerror = () => {
      setUploading(false);
      setIsProcessing(false);
      onUploadError && onUploadError("Network error.");
    };

    xhr.send(formData);
  };

  return (
    <div className="w-full">
      {!file ? (
        <div
          className={`p-10 rounded-lg cursor-pointer w-full border-2 border-dashed ${
            isDragging ? "border-blue-500 bg-blue-100" : "border-emerald-500"
          } transition-all duration-300`}
          onClick={() => fileInputRef.current.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFileChange(e);
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="flex flex-col items-center justify-center">
            <p className="text-gray-700 font-bold">Upload PDF file</p>
            <p className="text-gray-500 text-sm mt-2">
              Drag & drop your file here or click to upload
            </p>
          </div>
        </div>
      ) : uploadSuccess ? (
        // Success message UI
        <div className="p-6 rounded-lg bg-green-500 text-white text-center shadow-md">
          <p className="text-2xl font-bold">Processing Complete!</p>
          <p className="mt-2 text-lg">
            Your PDF has been successfully processed.
          </p>
        </div>
      ) : isProcessing ? (
        // Loading spinner while processing
        <div className="flex flex-col items-center justify-center p-6 bg-slate-700 rounded-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
          <p className="text-yellow-400 font-bold mt-4">Processing PDF...</p>
        </div>
      ) : (
        // File name, password input, and upload button
        <div className="p-6 rounded-lg bg-slate-700 shadow-md">
          <p className="text-gray-400 font-medium">{file.name}</p>
          <input
            type="password"
            placeholder="Enter PDF password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mt-4 p-2 border rounded-lg"
          />

          {isUploading ? (
            <div className="mt-4 w-full">
              <p className="text-white text-center">
                Uploading... {uploadProgress}%
              </p>
              <div className="w-full bg-gray-300 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <button
              onClick={handleSubmit}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg w-full"
            >
              Submit
            </button>
          )}
        </div>
      )}
    </div>
  );
};
