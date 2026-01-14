import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
    startOnLoad: true,
    theme: 'dark',
    securityLevel: 'loose',
    fontFamily: 'inherit',
});

interface MermaidProps {
    chart: string;
}

export default function Mermaid({ chart }: MermaidProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ref.current) {
            mermaid.contentLoaded();
            ref.current.innerHTML = chart;
            // Mermaid needs a unique ID for each render or re-render
            const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
            try {
                mermaid.render(id, chart).then(result => {
                    if (ref.current) ref.current.innerHTML = result.svg;
                });
            } catch (e) {
                console.error("Mermaid render error", e);
            }
        }
    }, [chart]);

    return <div ref={ref} className="mermaid w-full h-full flex justify-center" />;
}
