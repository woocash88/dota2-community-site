'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface SplitTextProps {
  text: string;
  tag?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  splitType?: 'chars' | 'words' | 'lines';
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  threshold?: number;
}

export default function SplitText({
  text,
  tag: Tag = 'h1',
  className = '',
  delay = 40,
  duration = 0.6,
  ease = 'power4.out',
  from = { opacity: 0, y: 30, scale: 0.9 },
  to = { opacity: 1, y: 0, scale: 1 },
  threshold = 0.1,
}: SplitTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const chars = el.querySelectorAll('.split-char');

    gsap.set(chars, from);

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: `top+=${(1 - threshold) * 100}% bottom`,
        onEnter: () => {
          gsap.to(chars, {
            ...to,
            duration,
            ease,
            stagger: delay / 1000,
          });
        },
        once: true,
      });
    }, el);

    return () => ctx.revert();
  }, [text, delay, duration, ease, from, to, threshold]);

  const characters = text.split('').map((char, i) => {
    if (char === ' ') {
      return <span key={i} className="inline-block">&nbsp;</span>;
    }
    return (
      <span key={i} className="split-char inline-block" style={{ willChange: 'transform, opacity' }}>
        {char}
      </span>
    );
  });

  return (
    <div ref={containerRef} className={className}>
      <Tag className="inline" aria-label={text}>
        {characters}
      </Tag>
    </div>
  );
}
