import React, { useState, useCallback } from 'react';
import FileUpload from './components/FileUpload';
import ResultsDisplay from './components/ResultsDisplay';
import { Header } from './components/Header';
import { AFFECTED_PACKAGES } from './constants';
import type { AnalysisResult, PackageLock, AffectedPackage } from './types';
import { ChevronDownIcon, ChevronUpIcon } from './components/icons/Icons';

const parsePackageLock = (content: string): { packages: Map<string, string>, error?: string } => {
    try {
        const json: PackageLock = JSON.parse(content);
        
        if (!json.packages) {
            return { packages: new Map(), error: "Invalid package-lock.json format: 'packages' property is missing." };
        }

        const packages = new Map<string, string>();

        Object.keys(json.packages).forEach(path => {
          if (path === "") return;

          const lastNodeModulesIndex = path.lastIndexOf('node_modules/');
          if(lastNodeModulesIndex === -1) return;

          const packageName = path.substring(lastNodeModulesIndex + 'node_modules/'.length);
          
          if (!packages.has(packageName)) {
            packages.set(packageName, json.packages[path].version);
          }
        });
        return { packages };
    } catch (e) {
        if (e instanceof SyntaxError) {
          return { packages: new Map(), error: "Failed to parse file. Please ensure it's a valid JSON file."};
        }
        return { packages: new Map(), error: "An unexpected error occurred while parsing package-lock.json."};
    }
};

const parseYarnLock = (content: string): { packages: Map<string, string>, error?: string } => {
    const packages = new Map<string, string>();
    const lines = content.split('\n');
    
    let currentPackageNames: string[] = [];

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (line.startsWith('__metadata:')) {
            currentPackageNames = []; // reset in case we are in a metadata block
            continue;
        }

        if (line.length > 0 && !line.startsWith(' ') && !line.startsWith('#')) {
            // New package definition line
            if (line.trim().endsWith(':')) {
                currentPackageNames = line.slice(0, line.lastIndexOf(':')).split(',').map(s => {
                    const cleanSpecifier = s.trim().replace(/^"|"$/g, '');
                    const lastAt = cleanSpecifier.lastIndexOf('@');
                    if (lastAt > 0) {
                        return cleanSpecifier.substring(0, lastAt);
                    }
                    return cleanSpecifier;
                }).filter(Boolean);
            }
        } else if (trimmedLine.startsWith('version') && currentPackageNames.length > 0) {
            const version = trimmedLine.substring(trimmedLine.indexOf(' ') + 1).replace(/"/g, '').trim();
            for (const packageName of currentPackageNames) {
                if (packageName && !packages.has(packageName)) {
                    packages.set(packageName, version);
                }
            }
            currentPackageNames = [];
        }
    }
    
    if (packages.size === 0) {
        return { packages, error: "Could not find any packages. Is this a valid yarn.lock file?" };
    }

    return { packages };
};


const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [affectedPackages, setAffectedPackages] = useState<string>(Array.from(AFFECTED_PACKAGES).join('\n'));
  const [isEditorVisible, setIsEditorVisible] = useState<boolean>(false);


  const analyzeFile = useCallback((selectedFile: File) => {
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
        
        let analysisResult: { packages: Map<string, string>, error?: string };

        if (selectedFile.name === 'package-lock.json') {
          analysisResult = parsePackageLock(content);
        } else if (selectedFile.name === 'yarn.lock') {
          analysisResult = parseYarnLock(content);
        } else {
          throw new Error("Unsupported file. Please upload 'package-lock.json' or 'yarn.lock'.");
        }

        const { packages: parsedPackages, error: parseError } = analysisResult;
        
        if (parseError) {
            throw new Error(parseError);
        }

        const userAffectedPackages = new Set(affectedPackages.split('\n').map(p => p.trim()).filter(Boolean));
        const foundPackages: AffectedPackage[] = [];

        for (const [packageName, version] of parsedPackages.entries()) {
          if (userAffectedPackages.has(packageName)) {
            foundPackages.push({
              name: packageName,
              version: version,
            });
          }
        }
        
        setResult({
          found: foundPackages,
          scannedCount: parsedPackages.size,
        });

      } catch (e) {
        if (e instanceof Error) {
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
        analyzeFile(selectedFile);
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