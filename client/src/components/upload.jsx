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

  // 1. Initialize Socket
  useEffect(() => {
    // Ensure this matches your Flask port (e.g., 5000)
    const newSocket = io("http://127.0.0.1:5000");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected with ID:", newSocket.id);
    });

    // 2. Listen for the "Done" signal containing Data
    newSocket.on("processing_update", (response) => {
      console.log("Received Update:", response);

      if (response.status === "done") {
        setIsProcessing(false);
        setUploadSuccess(true);
        // PASS THE DATA UP TO THE PARENT
        if (onUploadSuccess && response.data) {
          onUploadSuccess(response.data);
        }
      } else if (response.status === "failed") {
        setIsProcessing(false);
        setUploading(false); // Stop progress bar
        if (onUploadError) onUploadError(response.error);
      }
    });

    return () => newSocket.close();
  }, [onUploadSuccess, onUploadError]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
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

    // 3. Ensure we have a socket ID before sending
    if (!socket || !socket.id) {
      console.warn("Socket not ready yet");
      alert("Establishing connection... please try again in a moment.");
      return;
    }

    setUploadProgress(0);
    setIsProcessing(true);
    setUploading(true);

    const formData = new FormData();
    formData.append("the_file", file); // Must match backend 'the_file'
    formData.append("pass_code", password);
    formData.append("socket_id", socket.id); // VITAL: Tell backend who we are

    const xhr = new XMLHttpRequest();
    // Ensure this matches your Flask route
    xhr.open("POST", "http://127.0.0.1:5000/upload", true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percent);
      }
    };

    xhr.onload = () => {
      setUploading(false); // Upload done, now waiting for processing
      if (xhr.status === 200) {
        setUploadProgress(100);
        // Note: We stay in "isProcessing" state until the Socket says "done"
      } else {
        setIsProcessing(false);
        if (onUploadError)
          onUploadError("Upload failed with status " + xhr.status);
      }
    };

    xhr.onerror = () => {
      setUploading(false);
      setIsProcessing(false);
      if (onUploadError) onUploadError("Network error.");
    };

    xhr.send(formData);
  };

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
            Redirecting to dashboard...
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
