"use client";
import { useRef, useLayoutEffect, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register plugins
gsap.registerPlugin(ScrollTrigger);

interface PageTransitionProps {
    children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const location = useLocation();

    useLayoutEffect(() => {
        if (!containerRef.current) return;

        const ctx = gsap.context(() => {
            // Simple, elegant fade-in with slight movement
            gsap.fromTo(containerRef.current,
                {
                    opacity: 0,
                    y: 20,
                },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.4,
                    ease: "power2.out",
                    clearProps: "all"
                }
            );
        }, containerRef);

        return () => ctx.revert();
    }, [location.pathname]);

    // Refresh ScrollTrigger on route change
    useEffect(() => {
        ScrollTrigger.refresh();
    }, [location.pathname]);

    return (
        <div ref={containerRef} className="w-full h-full">
            {children}
        </div>
    );
}
