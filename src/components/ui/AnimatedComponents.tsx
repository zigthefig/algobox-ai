"use client";
import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

interface AnimatedCardProps {
    children: React.ReactNode;
    className?: string;
    hoverScale?: number;
    hoverY?: number;
    glowColor?: string;
    delay?: number;
}

export function AnimatedCard({
    children,
    className,
    hoverScale = 1.02,
    hoverY = -5,
    glowColor = "hsl(var(--primary))",
    delay = 0,
}: AnimatedCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const glowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!cardRef.current) return;

        const card = cardRef.current;
        const glow = glowRef.current;

        // Entrance animation
        gsap.fromTo(
            card,
            { opacity: 0, y: 30, scale: 0.95 },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.6,
                delay,
                ease: "power3.out",
            }
        );

        // Hover handlers
        const handleMouseEnter = () => {
            gsap.to(card, {
                scale: hoverScale,
                y: hoverY,
                duration: 0.3,
                ease: "power2.out",
            });
            if (glow) {
                gsap.to(glow, {
                    opacity: 0.15,
                    scale: 1.1,
                    duration: 0.3,
                });
            }
        };

        const handleMouseLeave = () => {
            gsap.to(card, {
                scale: 1,
                y: 0,
                duration: 0.3,
                ease: "power2.out",
            });
            if (glow) {
                gsap.to(glow, {
                    opacity: 0,
                    scale: 1,
                    duration: 0.3,
                });
            }
        };

        // Mouse move for tilt effect
        const handleMouseMove = (e: MouseEvent) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            gsap.to(card, {
                rotateX: rotateX,
                rotateY: rotateY,
                duration: 0.3,
                ease: "power2.out",
            });

            // Move glow to follow cursor
            if (glow) {
                gsap.to(glow, {
                    x: (x - centerX) * 0.2,
                    y: (y - centerY) * 0.2,
                    duration: 0.3,
                });
            }
        };

        const handleMouseLeaveReset = () => {
            gsap.to(card, {
                rotateX: 0,
                rotateY: 0,
                duration: 0.5,
                ease: "power2.out",
            });
        };

        card.addEventListener("mouseenter", handleMouseEnter);
        card.addEventListener("mouseleave", handleMouseLeave);
        card.addEventListener("mousemove", handleMouseMove);
        card.addEventListener("mouseleave", handleMouseLeaveReset);

        return () => {
            card.removeEventListener("mouseenter", handleMouseEnter);
            card.removeEventListener("mouseleave", handleMouseLeave);
            card.removeEventListener("mousemove", handleMouseMove);
            card.removeEventListener("mouseleave", handleMouseLeaveReset);
        };
    }, [hoverScale, hoverY, delay]);

    return (
        <div
            ref={cardRef}
            className={cn(
                "relative rounded-xl border border-border bg-card overflow-hidden",
                "transition-shadow duration-300",
                "hover:shadow-lg hover:shadow-primary/5",
                className
            )}
            style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
        >
            {/* Glow effect */}
            <div
                ref={glowRef}
                className="absolute inset-0 rounded-xl opacity-0 pointer-events-none"
                style={{
                    background: `radial-gradient(circle at center, ${glowColor}, transparent 70%)`,
                }}
            />
            {children}
        </div>
    );
}

// Stagger animated list
interface AnimatedListProps {
    children: React.ReactNode;
    className?: string;
    staggerDelay?: number;
}

export function AnimatedList({ children, className, staggerDelay = 0.1 }: AnimatedListProps) {
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!listRef.current) return;

        const items = listRef.current.children;

        gsap.fromTo(
            items,
            { opacity: 0, y: 20, scale: 0.98 },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.5,
                stagger: staggerDelay,
                ease: "power3.out",
            }
        );
    }, [staggerDelay]);

    return (
        <div ref={listRef} className={className}>
            {children}
        </div>
    );
}

// Magnetic button
interface MagneticButtonProps {
    children: React.ReactNode;
    className?: string;
    strength?: number;
}

export function MagneticButton({ children, className, strength = 0.3 }: MagneticButtonProps) {
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!buttonRef.current) return;

        const button = buttonRef.current;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            gsap.to(button, {
                x: x * strength,
                y: y * strength,
                duration: 0.3,
                ease: "power2.out",
            });
        };

        const handleMouseLeave = () => {
            gsap.to(button, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: "elastic.out(1, 0.3)",
            });
        };

        button.addEventListener("mousemove", handleMouseMove);
        button.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            button.removeEventListener("mousemove", handleMouseMove);
            button.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [strength]);

    return (
        <button ref={buttonRef} className={className}>
            {children}
        </button>
    );
}

// Text reveal animation
interface RevealTextProps {
    children: string;
    className?: string;
    delay?: number;
}

export function RevealText({ children, className, delay = 0 }: RevealTextProps) {
    const textRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!textRef.current) return;

        const words = children.split(" ");
        textRef.current.innerHTML = words
            .map(
                (word) =>
                    `<span class="inline-block overflow-hidden mr-[0.25em]"><span class="inline-block">${word}</span></span>`
            )
            .join("");

        const innerSpans = textRef.current.querySelectorAll("span > span");

        gsap.fromTo(
            innerSpans,
            { y: "100%", opacity: 0 },
            {
                y: "0%",
                opacity: 1,
                duration: 0.6,
                stagger: 0.03,
                delay,
                ease: "power3.out",
            }
        );
    }, [children, delay]);

    return <div ref={textRef} className={className} />;
}
