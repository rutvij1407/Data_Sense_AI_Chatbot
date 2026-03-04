"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface FileDropZoneProps {
  onFileAccepted: (file: File) => void;
  isLoading: boolean;
}

export function FileDropZone({ onFileAccepted, isLoading }: FileDropZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileAccepted(acceptedFiles[0]);
      }
    },
    [onFileAccepted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    multiple: false,
    disabled: isLoading,
  });

  return (
    <div
      {...getRootProps()}
      className={`drop-zone ${isDragActive ? "drop-zone-active" : ""} ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
    >
      <input {...getInputProps()} />

      {isLoading ? (
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-crimson border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Analyzing dataset...</p>
        </div>
      ) : isDragActive ? (
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-crimson/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-crimson" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-crimson">Drop your file here!</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-surface-raised border border-crimson/30 flex items-center justify-center">
            <svg className="w-6 h-6 text-crimson/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-200">Drop your dataset here</p>
            <p className="text-xs text-gray-500 mt-0.5">or click to browse</p>
          </div>
          <div className="flex gap-2 mt-1">
            {["CSV", "XLSX", "XLS"].map((fmt) => (
              <span key={fmt} className="text-xs bg-crimson/10 text-crimson border border-crimson/20 px-2 py-0.5 rounded">
                {fmt}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
