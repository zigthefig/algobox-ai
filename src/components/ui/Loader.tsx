import React from 'react';
import { cn } from "@/lib/utils";
import './Loader.css';

interface LoaderProps {
    className?: string;
    squareClassName?: string;
}

const Loader = ({ className, squareClassName }: LoaderProps) => {
    return (
        <div className={cn("loader", className)}>
            {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className={cn("loader-square bg-primary", squareClassName)} />
            ))}
        </div>
    );
}

export default Loader;
