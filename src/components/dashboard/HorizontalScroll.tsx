"use client";

import { useRef, ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from "@/utils/utils";

interface HorizontalScrollProps extends React.HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    showButtons?: boolean;
}

export function HorizontalScroll({ children, className, showButtons = true, ...props }: HorizontalScrollProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = window.innerWidth;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="relative group">
            {showButtons && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm shadow-md opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex h-12 w-12 rounded-full"
                    onClick={() => scroll('left')}
                >
                    <ChevronLeft className="h-8 w-8" />
                </Button>
            )}

            <div
                ref={scrollRef}
                className={cn(
                    "flex overflow-x-auto snap-x snap-mandatory scroll-smooth hide-scrollbar",
                    className
                )}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                {...props}
            >
                <style>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}</style>
                {children}
            </div>

            {showButtons && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm shadow-md opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex h-12 w-12 rounded-full"
                    onClick={() => scroll('right')}
                >
                    <ChevronRight className="h-8 w-8" />
                </Button>
            )}
        </div>
    );
}
