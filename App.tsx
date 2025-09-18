
import React, { useState, useCallback } from 'react';
import FileUpload from './components/FileUpload';
import ResultsDisplay from './components/ResultsDisplay';
import { Header } from './components/Header';
import { AFFECTED_PACKAGES } from './constants';
import type { AnalysisResult, PackageLock, AffectedPackage } from './types';
import { ChevronDownIcon, ChevronUpIcon } from './components/icons/Icons';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [affectedPackages, setAffectedPackages] = useState<string>(Array.from(AFFECTED_PACKAGES).join('\n'));
  const [isEditorVisible, setIsEditorVisible] = useState<boolean>(false);


  const analyzePackageLock = useCallback((selectedFile: File) => {
    setIsLoading(true);
    setResult(null);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      try {
        if (!event.target?.result) {
            throw new Error("File could not be read.");
        }
        const content = event.target.result as string;
        const json: PackageLock = JSON.parse(content);
        
        if (!json.packages) {
            throw new Error("Invalid package-lock.json format: 'packages' property is missing.");
        }

        const userAffectedPackages = new Set(affectedPackages.split('\n').map(p => p.trim()).filter(Boolean));
        const foundPackages: AffectedPackage[] = [];
        const scannedPackages = new Set<string>();

        Object.keys(json.packages).forEach(path => {
          // Skip the root project entry which is an empty string
          if (path === "") return;

          // Extract package name from path like "node_modules/@types/node"
          const lastNodeModulesIndex = path.lastIndexOf('node_modules/');
          if(lastNodeModulesIndex === -1) return;

          const packageName = path.substring(lastNodeModulesIndex + 'node_modules/'.length);
          
          if (!scannedPackages.has(packageName)) {
            scannedPackages.add(packageName);
            if (userAffectedPackages.has(packageName)) {
              foundPackages.push({
                name: packageName,
                version: json.packages[path].version,
              });
            }
          }
        });
        
        setResult({
          found: foundPackages,
          scannedCount: scannedPackages.size,
        });

      } catch (e) {
        if (e instanceof SyntaxError) {
          setError("Failed to parse file. Please ensure it's a valid JSON file.");
        } else if (e instanceof Error) {
          setError(e.message);
        } else {
          setError("An unknown error occurred during analysis.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
        setError("Error reading the file.");
        setIsLoading(false);
    }

    reader.readAsText(selectedFile);
  }, [affectedPackages]);

  const handleFileSelect = (selectedFile: File | null) => {
    setFile(selectedFile);
    setResult(null);
    setError(null);
    if (selectedFile) {
        analyzePackageLock(selectedFile);
    }
  };
  
  const resetState = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setIsLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 md:p-8 font-sans">
      <div className="w-full max-w-4xl mx-auto">
        <Header />
        <main className="mt-8">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 md:p-8 shadow-2xl shadow-slate-950/50">
                <FileUpload onFileSelect={handleFileSelect} file={file} onClear={resetState} />

                <div className="mt-6 pt-6 border-t border-slate-700">
                    <button
                        onClick={() => setIsEditorVisible(!isEditorVisible)}
                        className="flex justify-between items-center w-full text-left transition-colors hover:text-sky-400"
                        aria-expanded={isEditorVisible}
                        aria-controls="package-list-editor"
                    >
                        <h3 className="text-lg font-semibold text-slate-200">
                            Edit Affected Packages List
                        </h3>
                        {isEditorVisible ? <ChevronUpIcon className="w-6 h-6 text-slate-400" /> : <ChevronDownIcon className="w-6 h-6 text-slate-400" />}
                    </button>
                    {isEditorVisible && (
                        <div id="package-list-editor" className="mt-4">
                            <p className="text-sm text-slate-400 mb-3">
                                Enter one package name per line. The scanner will use this list for analysis.
                            </p>
                            <textarea
                                value={affectedPackages}
                                onChange={(e) => setAffectedPackages(e.target.value)}
                                className="w-full h-64 p-3 bg-slate-900 border border-slate-600 rounded-lg text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors duration-200 font-mono text-sm"
                                aria-label="Affected packages list"
                                spellCheck="false"
                            />
                        </div>
                    )}
                </div>
            </div>
          
            <ResultsDisplay 
                isLoading={isLoading}
                result={result}
                error={error}
            />
        </main>
      </div>
    </div>
  );
};

export default App;
