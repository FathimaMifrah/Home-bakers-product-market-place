/*
 File: src/components/ui/meteor-impact-border.tsx
 Purpose: Reusable React UI component.
 Main exports: MeteorImpactBorder
 */

import { useRef, useEffect, type ReactNode, type CSSProperties } from 'react'


interface MeteorImpactBorderProps {
  children: ReactNode
  /** Duration of one full orbit in seconds */
  duration?: number
  /** Primary glow color */
  color?: string
  /** Secondary trail color */
  trailColor?: string
  /** Border radius matching the child container */
  borderRadius?: string
  /** Width of the glowing border line */
  borderWidth?: number
  /** Additional className for the wrapper */
  className?: string
  /** Additional inline styles */
  style?: CSSProperties
}

// MeteorImpactBorder: Helper or component used in this file.
export function MeteorImpactBorder({
  children,
  duration = 4,
  color = 'oklch(0.52 0.22 35)',
  trailColor = 'oklch(0.88 0.08 65)',
  borderRadius = '1.5rem',
  borderWidth = 2,
  className = '',
  style,
}: MeteorImpactBorderProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    // Inject the unique animation name if not already present
    const id = 'meteor-impact-border-keyframes'
    if (!document.getElementById(id)) {
      const styleSheet = document.createElement('style')
      styleSheet.id = id
      styleSheet.textContent = `
        @keyframes meteor-orbit {
          0% { transform: rotate(0deg) translateX(50%) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(50%) rotate(-360deg); }
        }
        @keyframes meteor-glow-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `
      document.head.appendChild(styleSheet)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={`relative group ${className}`}
      style={{
        borderRadius,
        ...style,
      }}
    >
      {/* Outer glow layer */}
      <div
        className="pointer-events-none absolute -inset-px overflow-hidden"
        style={{ borderRadius }}
      >
        {/* Conic gradient border that rotates */}
        <div
          className="absolute inset-0"
          style={{
            borderRadius,
            padding: borderWidth,
            background: `conic-gradient(from 0deg, transparent, ${color}, ${trailColor}, transparent 60%)`,
            WebkitMask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            animation: `meteor-orbit ${duration}s linear infinite`,
          }}
        >
          <div className="h-full w-full" style={{ borderRadius }} />
        </div>

        {/* Subtle static glow behind */}
        <div
          className="absolute inset-0 opacity-30 group-hover:opacity-60 transition-opacity duration-500"
          style={{
            borderRadius,
            padding: borderWidth,
            background: `conic-gradient(from 180deg, transparent, ${trailColor}40, transparent 40%)`,
            WebkitMask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            animation: `meteor-orbit ${duration * 1.5}s linear infinite reverse`,
          }}
        >
          <div className="h-full w-full" style={{ borderRadius }} />
        </div>
      </div>

      {/* Meteor head (bright dot that orbits) */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{ borderRadius }}
      >
        <div
          className="absolute top-1/2 left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2"
          style={{
            animation: `meteor-orbit ${duration}s linear infinite`,
          }}
        >
          <div
            className="h-full w-full rounded-full"
            style={{
              background: color,
              boxShadow: `0 0 8px 3px ${color}, 0 0 20px 6px ${trailColor}`,
              animation: `meteor-glow-pulse ${duration / 2}s ease-in-out infinite`,
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}