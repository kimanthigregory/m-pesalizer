import React, { useRef, useState } from "react";

export const FileUpload = ({ onChange }) => {
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files || []);
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    onChange && onChange(newFiles);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // Drag and Drop Handlers
  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const newFiles = Array.from(event.dataTransfer.files);
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    onChange && onChange(newFiles);
  };

  return (
    <div className="w-full">
      <div
        className={`p-10 rounded-lg cursor-pointer w-full relative overflow-hidden border-2 border-dashed ${
          isDragging ? "border-blue-500 bg-blue-100" : "border-gray-300"
        } transition-all duration-300`}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="flex flex-col items-center justify-center relative z-10">
          <p className="text-gray-700 font-bold">Upload file</p>
          <p className="text-gray-500 text-sm mt-2">
            Drag & drop your pdf here or click to upload
          </p>

          {/* Upload Icon */}
          <div className="mt-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-gray-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"></path>
              <polyline points="16 12 12 8 8 12"></polyline>
              <line x1="12" y1="8" x2="12" y2="20"></line>
            </svg>
          </div>
        </div>
      </div>

      {/* Display Uploaded Files */}
      <div className="mt-4">
        {files.length > 0 &&
          files.map((file, index) => (
            <div
              key={index}
              className="bg-slate-700 p-3 rounded-md flex justify-between items-center mt-2"
            >
              <p className="text-gray-500 truncate">{file.name}</p>
              <span className="text-sm text-gray-500">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </span>
            </div>
          ))}
      </div>
    </div>
  );
};
