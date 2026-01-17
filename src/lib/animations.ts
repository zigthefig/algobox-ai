"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Animation presets
export const animations = {
    fadeInUp: {
        from: { opacity: 0, y: 50 },
        to: { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
    },
    fadeInDown: {
        from: { opacity: 0, y: -50 },
        to: { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
    },
    fadeInLeft: {
        from: { opacity: 0, x: -50 },
        to: { opacity: 1, x: 0, duration: 0.8, ease: "power3.out" },
    },
    fadeInRight: {
        from: { opacity: 0, x: 50 },
        to: { opacity: 1, x: 0, duration: 0.8, ease: "power3.out" },
    },
    scaleIn: {
        from: { opacity: 0, scale: 0.8 },
        to: { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)" },
    },
    slideUp: {
        from: { y: 100, opacity: 0 },
        to: { y: 0, opacity: 1, duration: 1, ease: "power4.out" },
    },
    rotateIn: {
        from: { opacity: 0, rotationY: 90 },
        to: { opacity: 1, rotationY: 0, duration: 0.8, ease: "power2.out" },
    },
};

// Hook for scroll-triggered animations
export function useScrollAnimation(
    options: {
        animation?: keyof typeof animations;
        stagger?: number;
        delay?: number;
        trigger?: string;
        start?: string;
        end?: string;
        scrub?: boolean | number;
    } = {}
) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!ref.current) return;

        const {
            animation = "fadeInUp",
            stagger = 0,
            delay = 0,
            trigger,
            start = "top 80%",
            end = "bottom 20%",
            scrub = false,
        } = options;

        const anim = animations[animation];
        const elements = stagger > 0 ? ref.current.children : ref.current;

        const ctx = gsap.context(() => {
            gsap.fromTo(elements, anim.from, {
                ...anim.to,
                delay,
                stagger: stagger > 0 ? stagger : undefined,
                scrollTrigger: {
                    trigger: trigger || ref.current,
                    start,
                    end,
                    scrub,
                    toggleActions: "play none none reverse",
                },
            });
        }, ref);

        return () => ctx.revert();
    }, [options]);

    return ref;
}

// Hook for staggered list animations
export function useStaggerAnimation(staggerDelay = 0.1, animation: keyof typeof animations = "fadeInUp") {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!ref.current) return;

        const anim = animations[animation];
        const children = ref.current.children;

        const ctx = gsap.context(() => {
            gsap.fromTo(children, anim.from, {
                ...anim.to,
                stagger: staggerDelay,
                scrollTrigger: {
                    trigger: ref.current,
                    start: "top 85%",
                    toggleActions: "play none none reverse",
                },
            });
        }, ref);

        return () => ctx.revert();
    }, [staggerDelay, animation]);

    return ref;
}

// Hook for hover animations
export function useHoverAnimation() {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!ref.current) return;

        const element = ref.current;

        const handleMouseEnter = () => {
            gsap.to(element, {
                scale: 1.02,
                y: -5,
                duration: 0.3,
                ease: "power2.out",
            });
        };

        const handleMouseLeave = () => {
            gsap.to(element, {
                scale: 1,
                y: 0,
                duration: 0.3,
                ease: "power2.out",
            });
        };

        element.addEventListener("mouseenter", handleMouseEnter);
        element.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            element.removeEventListener("mouseenter", handleMouseEnter);
            element.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, []);

    return ref;
}

// Hook for text reveal animation
export function useTextReveal() {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!ref.current) return;

        const ctx = gsap.context(() => {
            // Split text into words (simple approach)
            const text = ref.current!.innerText;
            const words = text.split(" ");
            ref.current!.innerHTML = words
                .map((word) => `<span class="inline-block overflow-hidden"><span class="inline-block">${word}</span></span>`)
                .join(" ");

            const innerSpans = ref.current!.querySelectorAll("span > span");

            gsap.fromTo(
                innerSpans,
                { y: "100%", opacity: 0 },
                {
                    y: "0%",
                    opacity: 1,
                    duration: 0.8,
                    stagger: 0.05,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: ref.current,
                        start: "top 85%",
                        toggleActions: "play none none reverse",
                    },
                }
            );
        }, ref);

        return () => ctx.revert();
    }, []);

    return ref;
}

// Magnetic button effect
export function useMagneticEffect(strength = 0.3) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!ref.current) return;

        const element = ref.current;
        const rect = element.getBoundingClientRect();

        const handleMouseMove = (e: MouseEvent) => {
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            gsap.to(element, {
                x: x * strength,
                y: y * strength,
                duration: 0.3,
                ease: "power2.out",
            });
        };

        const handleMouseLeave = () => {
            gsap.to(element, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: "elastic.out(1, 0.3)",
            });
        };

        element.addEventListener("mousemove", handleMouseMove);
        element.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            element.removeEventListener("mousemove", handleMouseMove);
            element.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [strength]);

    return ref;
}

// Parallax effect hook
export function useParallax(speed = 0.5) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!ref.current) return;

        const ctx = gsap.context(() => {
            gsap.to(ref.current, {
                y: () => window.innerHeight * speed,
                ease: "none",
                scrollTrigger: {
                    trigger: ref.current,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true,
                },
            });
        }, ref);

        return () => ctx.revert();
    }, [speed]);

    return ref;
}

// Counter animation hook
export function useCountUp(endValue: number, duration = 2) {
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (!ref.current) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                ref.current,
                { innerText: 0 },
                {
                    innerText: endValue,
                    duration,
                    ease: "power1.out",
                    snap: { innerText: 1 },
                    scrollTrigger: {
                        trigger: ref.current,
                        start: "top 85%",
                        toggleActions: "play none none none",
                    },
                }
            );
        }, ref);

        return () => ctx.revert();
    }, [endValue, duration]);

    return ref;
}
