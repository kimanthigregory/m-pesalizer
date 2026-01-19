import React, { useRef, useState, useEffect } from "react";
import { io } from "socket.io-client";

// Define your backend URL once here
const API_BASE_URL = "https://mpesa-lens.onrender.com";

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

  // 1. Initialize Socket
  useEffect(() => {
    // We force 'websocket' transport to avoid Render's polling issues
    const newSocket = io(API_BASE_URL, {
      transports: ["websocket"],
      upgrade: false,
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to Render with ID:", newSocket.id);
    });

    newSocket.on("connect_error", (err) => {
      console.error("Socket Connection Error:", err.message);
    });

    // 2. Listen for the "Done" signal containing Data
    newSocket.on("processing_update", (response) => {
      console.log("Received Update:", response);

      if (response.status === "done") {
        setIsProcessing(false);
        setUploadSuccess(true);
        if (onUploadSuccess && response.data) {
          onUploadSuccess(response.data);
        }
      } else if (response.status === "failed") {
        setIsProcessing(false);
        setUploading(false);
        if (onUploadError) onUploadError(response.error);
      }
    });

    return () => newSocket.close();
  }, [onUploadSuccess, onUploadError]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files
      ? event.target.files[0]
      : event.dataTransfer.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    } else {
      alert("Only PDF files are allowed");
    }
  };

  const handleSubmit = () => {
    if (!file) {
      alert("Please select a PDF file.");
      return;
    }

    // Ensure we have a socket ID before sending
    if (!socket || !socket.id) {
      console.warn("Socket not ready yet");
      alert("Connecting to server... Please wait a few seconds and try again.");
      return;
    }

    setUploadProgress(0);
    setIsProcessing(true);
    setUploading(true);

    const formData = new FormData();
    formData.append("the_file", file);
    formData.append("pass_code", password);
    formData.append("socket_id", socket.id);

    const xhr = new XMLHttpRequest();
    // Use the dynamic API_BASE_URL here
    xhr.open("POST", `${API_BASE_URL}/upload`, true);

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
        console.log("Upload successful, waiting for AI processing signal...");
      } else {
        setIsProcessing(false);
        if (onUploadError)
          onUploadError(`Upload failed (${xhr.status}). Check server logs.`);
      }
    };

    xhr.onerror = () => {
      setUploading(false);
      setIsProcessing(false);
      if (onUploadError)
        onUploadError("Network error: Could not reach the server.");
    };

    xhr.send(formData);
  };

  // ... rest of your return/UI remains the same
  return (
    <div className="w-full">
      {!file ? (
        <div
          className={`p-10 rounded-2xl cursor-pointer w-full border-2 border-dashed ${
            isDragging
              ? "border-emerald-400 bg-emerald-500/10"
              : "border-white/20 hover:border-emerald-500/50 hover:bg-white/5"
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
          <div className="flex flex-col items-center justify-center text-center">
            <p className="text-slate-300 font-bold text-lg">
              Upload M-Pesa Statement
            </p>
            <p className="text-slate-500 text-sm mt-2">
              Drag & drop or click to browse (PDF only)
            </p>
          </div>
        </div>
      ) : uploadSuccess ? (
        <div className="p-6 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-center animate-in zoom-in-95">
          <p className="text-2xl font-bold text-emerald-400">Success!</p>
          <p className="mt-2 text-sm text-emerald-200/70">
            Statement analyzed successfully.
          </p>
        </div>
      ) : isProcessing ? (
        <div className="flex flex-col items-center justify-center p-8 bg-white/5 rounded-2xl border border-white/10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-emerald-500 border-r-2 border-emerald-500/30"></div>
          <p className="text-emerald-400 font-medium mt-4 animate-pulse">
            {isUploading
              ? `Uploading... ${uploadProgress}%`
              : "AI Processing..."}
          </p>
          {!isUploading && (
            <p className="text-xs text-slate-500 mt-2">
              Decrypting & Analyzing tables
            </p>
          )}
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-300 font-medium truncate max-w-[200px]">
              {file.name}
            </p>
            <button
              onClick={() => setFile(null)}
              className="text-xs text-rose-400 hover:text-rose-300"
            >
              Change
            </button>
          </div>

          <input
            type="password"
            placeholder="Enter PDF password (ID Number)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
          />

          <button
            onClick={handleSubmit}
            className="mt-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl w-full transition-all active:scale-[0.98]"
          >
            Process Statement
          </button>
        </div>
      )}
    </div>
  );
};
