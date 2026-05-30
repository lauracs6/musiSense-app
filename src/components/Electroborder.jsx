import React, { useRef, useLayoutEffect, useEffect, useId } from "react";

const toRGBA = (color, alpha = 1) => {
    if (!color || color === "currentColor") return `rgba(80, 115, 255, ${alpha})`;
    if (color.startsWith("#")) {
        const hex = color.length === 4
            ? `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`
            : color;
        if (hex.length === 7) {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
    }
    return color;
};

export const ElectroBorder = ({
    children,
    borderColor = "#5073ff",
    borderWidth = 3,
    distortion = 1,       
    animationSpeed = 1.8,   
    glow = true,
    aura = true,
    effects = true,
    glowBlur = 12,          
    isPaused = false,
    className,
    style,
}) => {
    const rootRef = useRef(null);
    const svgRef = useRef(null);
    const strokeLayer = useRef(null);
    const id = useId().replace(/[:]/g, "");
    const filterId = `electro-filter-${id}`;

    const updateFilter = () => {
        const svg = svgRef.current;
        if (!svg) return;

        if (strokeLayer.current) {
            strokeLayer.current.style.filter = `url(#${filterId})`;
        }

        const disp = svg.querySelector("feDisplacementMap");
        if (disp) {
            disp.setAttribute("scale", `${25 * distortion}`);
        }

        if (svg) {
            try {
                if (isPaused) {
                    svg.pauseAnimations();
                } else {
                    svg.unpauseAnimations();
                }
            } catch (e) {}
        }
    };

    useLayoutEffect(() => {
        const observer = new ResizeObserver(() => updateFilter());
        if (rootRef.current) observer.observe(rootRef.current);
        updateFilter();
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        updateFilter();
    }, [animationSpeed, distortion, isPaused, borderColor]);

    const borderBase = { 
        borderTop: `${borderWidth}px solid ${borderColor}`,
    };
    
    const glowLayer1 = effects && glow ? { 
        borderTop: `${borderWidth}px solid ${borderColor}`, 
        filter: `blur(3px)`, 
        opacity: 0.8 
    } : {};
    
    const glowLayer2 = effects && glow ? { 
        borderTop: `${borderWidth + 1}px solid ${toRGBA(borderColor, 0.8)}`, 
        filter: `blur(${glowBlur}px)`, 
        opacity: 0.6 
    } : {};
    
    const backgroundAura = effects && aura ? { 
        background: `linear-gradient(to bottom, ${toRGBA(borderColor, 0.15)} 0%, transparent 100%)`, 
        height: "40px", 
        opacity: 0.7 
    } : {};

    const baseDur = Math.max(0.1, 4 / animationSpeed);

    return (
        <div ref={rootRef} className={`relative ${className ?? ""}`} style={style}>
            <svg ref={svgRef} className="absolute w-0 h-0" aria-hidden focusable="false">
                <defs>
                    <filter id={filterId} x="-50%" width="200%" y="-200%" height="500%">
                        <feTurbulence type="fractalNoise" baseFrequency="0.015 0.08" numOctaves="2" result="noise1">
                            <animate 
                                attributeName="baseFrequency" 
                                values="0.015 0.08; 0.025 0.12; 0.015 0.08" 
                                dur={`${baseDur}s`} 
                                repeatCount="indefinite" 
                            />
                        </feTurbulence>
                        <feOffset dx="0" dy="0" result="offset1">
                            <animate 
                                attributeName="dx" 
                                values="0; 2000" 
                                dur={`${baseDur * 2}s`} 
                                repeatCount="indefinite" 
                            />
                        </feOffset>

                        <feTurbulence type="fractalNoise" baseFrequency="0.02 0.06" numOctaves="2" result="noise2">
                            <animate 
                                attributeName="baseFrequency" 
                                values="0.02 0.06; 0.01 0.04; 0.02 0.06" 
                                dur={`${baseDur * 1.5}s`} 
                                repeatCount="indefinite" 
                            />
                        </feTurbulence>
                        <feOffset dx="0" dy="0" result="offset2">
                            <animate 
                                attributeName="dx" 
                                values="1000; -1000" 
                                dur={`${baseDur * 2.5}s`} 
                                repeatCount="indefinite" 
                            />
                        </feOffset>
                        
                        <feBlend in="offset1" in2="offset2" mode="difference" result="mixedNoise" />
                        <feDisplacementMap in="SourceGraphic" in2="mixedNoise" xChannelSelector="R" yChannelSelector="G" />
                    </filter>
                </defs>
            </svg>

            <div className="absolute top-0 left-0 right-0 h-0 pointer-events-none overflow-visible z-50">
                {effects && aura && <div className="absolute left-0 right-0 top-0" style={backgroundAura} />}
                {effects && glow && <div className="absolute left-0 right-0 top-0" style={glowLayer2} />}
                {effects && glow && <div className="absolute left-0 right-0 top-0" style={glowLayer1} />}
                <div ref={strokeLayer} className="absolute left-0 right-0 top-0" style={borderBase} />
            </div>

            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};

export default ElectroBorder;