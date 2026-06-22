'use client';
import React, { ElementType, ComponentPropsWithoutRef } from 'react';

interface StarBorderProps<T extends ElementType> {
  as?: T;
  className?: string;
  color?: string;
  speed?: string;
  thickness?: number;
  children?: React.ReactNode;
}

type Props<T extends ElementType> = StarBorderProps<T> & Omit<ComponentPropsWithoutRef<T>, keyof StarBorderProps<T>>;

const StarBorder = <T extends ElementType = 'button'>({
  as,
  className = '',
  color = 'white',
  speed = '6s',
  thickness = 1,
  children,
  ...rest
}: Props<T>) => {
  const Component = as || 'button';

  return (
    <Component
      className={`inline-block relative rounded-full overflow-hidden no-underline ${className}`}
      style={{
        padding: `${thickness}px 0`,
        ...rest.style
      }}
      {...rest}
    >
      <div
        className="absolute w-[300%] h-1/2 opacity-80 bottom-[-12px] right-[-250%] rounded-full animate-star-movement-bottom z-0"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed
        }}
      />
      <div
        className="absolute opacity-80 w-[300%] h-1/2 top-[-12px] left-[-250%] rounded-full animate-star-movement-top z-0"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed
        }}
      />
      <div className="relative border border-white/5 bg-[#0a0a0a]/70 backdrop-blur-md text-white text-[24px] font-medium flex items-center justify-center gap-[10px] px-8 py-3 rounded-full z-[1] transition-all duration-300 hover:bg-[#141414]/90 hover:text-[#ff5500]">
        {children}
      </div>
    </Component>
  );
};

export default StarBorder;