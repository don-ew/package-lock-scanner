import React from 'react';
import { LockIcon } from './icons/Icons';

export const Header: React.FC = () => {
    return (
        <header className="text-center">
            <div className="inline-flex items-center justify-center bg-slate-800 p-4 rounded-full border border-slate-700">
                <LockIcon className="w-10 h-10 text-sky-400"/>
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-slate-100">
                Lockfile Scanner
            </h1>
        </header>
    );
}