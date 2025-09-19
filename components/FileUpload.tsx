import React, { useCallback, useState } from 'react';
import { UploadIcon, FileJsonIcon, XCircleIcon } from './icons/Icons';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  file: File | null;
  onClear: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, file, onClear }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      if(files[0].name === 'package-lock.json' || files[0].name === 'yarn.lock') {
          onFileSelect(files[0]);
      } else {
        alert("Please upload a file named 'package-lock.json' or 'yarn.lock'");
      }
    }
    event.target.value = ''; // Reset input to allow re-uploading the same file
  };

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      if(files[0].name === 'package-lock.json' || files[0].name === 'yarn.lock') {
          onFileSelect(files[0]);
      } else {
        alert("Please upload a file named 'package-lock.json' or 'yarn.lock'");
      }
    }
  }, [onFileSelect]);

  return (
    <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-100">Upload your lockfile</h2>
        <p className="text-slate-400 mt-2">To begin, upload or drag and drop your `package-lock.json` or `yarn.lock` file.</p>
        
        {!file ? (
            <label
                htmlFor="file-upload"
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`mt-6 flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300 ${isDragging ? 'border-sky-500 bg-sky-500/10' : 'border-slate-600 hover:border-sky-500 hover:bg-slate-800'}`}
            >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadIcon className="w-10 h-10 mb-3 text-slate-400" />
                    <p className="mb-2 text-sm text-slate-400"><span className="font-semibold text-sky-400">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-slate-500">package-lock.json or yarn.lock</p>
                </div>
                <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} />
            </label>
        ) : (
            <div className="mt-6 flex items-center justify-between bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                <div className="flex items-center space-x-3">
                    <FileJsonIcon className="w-8 h-8 text-sky-400 flex-shrink-0" />
                    <div>
                        <p className="font-medium text-slate-200">{file.name}</p>
                        <p className="text-sm text-slate-400">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                </div>
                <button
                    onClick={onClear}
                    className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors duration-200"
                    aria-label="Clear file"
                >
                    <XCircleIcon className="w-6 h-6" />
                </button>
            </div>
        )}
    </div>
  );
};

export default FileUpload;