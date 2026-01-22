import React from 'react';
import { cn } from "@/lib/utils";
import './GeneratingLoader.css';

interface GeneratingLoaderProps {
    className?: string;
}

const GeneratingLoader = ({ className }: GeneratingLoaderProps) => {
    return (
        <div className={cn("generating-loader-wrapper", className)}>
            <span className="loader-letter">G</span>
            <span className="loader-letter">e</span>
            <span className="loader-letter">n</span>
            <span className="loader-letter">e</span>
            <span className="loader-letter">r</span>
            <span className="loader-letter">a</span>
            <span className="loader-letter">t</span>
            <span className="loader-letter">i</span>
            <span className="loader-letter">n</span>
            <span className="loader-letter">g</span>
            <div className="generating-loader" />
        </div>
    );
}

export default GeneratingLoader;
