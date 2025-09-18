
import React from 'react';
import type { AnalysisResult } from '../types';
import { CheckCircleIcon, XCircleIcon, ShieldExclamationIcon, PackageIcon } from './icons/Icons';

interface ResultsDisplayProps {
  isLoading: boolean;
  result: AnalysisResult | null;
  error: string | null;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center space-x-3">
        <svg className="animate-spin h-6 w-6 text-sky-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-lg text-slate-300">Analyzing packages...</span>
    </div>
);

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ isLoading, result, error }) => {
    if (isLoading) {
        return (
            <div className="mt-8 p-6 bg-slate-800/50 border border-slate-700 rounded-2xl flex justify-center items-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="mt-8 p-6 bg-red-900/20 border border-red-500/30 text-red-300 rounded-2xl flex items-center space-x-4">
                <XCircleIcon className="w-8 h-8 text-red-400 flex-shrink-0" />
                <div>
                    <h3 className="font-bold text-lg text-red-200">Analysis Failed</h3>
                    <p className="text-red-300">{error}</p>
                </div>
            </div>
        );
    }

    if (!result) {
        return null; // Don't render anything if there's no result, error, or loading state
    }
    
    if (result.found.length === 0) {
        return (
            <div className="mt-8 p-6 bg-green-900/20 border border-green-500/30 text-green-300 rounded-2xl flex items-center space-x-4">
                <CheckCircleIcon className="w-8 h-8 text-green-400 flex-shrink-0"/>
                <div>
                    <h3 className="font-bold text-lg text-green-200">No Affected Packages Found</h3>
                    <p>Scanned {result.scannedCount} unique packages and found no matches from the affected list.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-8 p-6 bg-amber-900/20 border border-amber-500/30 text-amber-300 rounded-2xl">
            <div className="flex items-center space-x-4">
                <ShieldExclamationIcon className="w-8 h-8 text-amber-400 flex-shrink-0" />
                <div>
                    <h3 className="font-bold text-lg text-amber-200">{result.found.length} Affected Package(s) Found</h3>
                    <p>Scanned {result.scannedCount} unique packages and found the following matches:</p>
                </div>
            </div>
            <div className="mt-6 flow-root">
                <ul role="list" className="-my-4 divide-y divide-amber-500/20">
                    {result.found.map((pkg) => (
                        <li key={pkg.name} className="flex items-center space-x-4 py-4">
                            <div className="p-2 bg-slate-700 rounded-full">
                                <PackageIcon className="w-5 h-5 text-amber-300" />
                            </div>
                            <div className="min-w-0 flex-auto">
                                <p className="font-semibold text-amber-200 truncate">{pkg.name}</p>
                            </div>
                            <div>
                                <span className="inline-flex items-center rounded-md bg-amber-400/10 px-2 py-1 text-xs font-medium text-amber-300 ring-1 ring-inset ring-amber-400/20">
                                    v{pkg.version}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ResultsDisplay;
