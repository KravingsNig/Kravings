
'use client';

import { useState, TouchEvent, ReactNode } from 'react';
import { LoaderCircle, ArrowDown } from 'lucide-react';

const PULL_THRESHOLD = 80; // The distance in pixels the user needs to pull down to trigger a refresh

export function PullToRefresh({ children }: { children: ReactNode }) {
  const [pullStart, setPullStart] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    // Only track pulls from the top of the page
    if (window.scrollY === 0) {
      setPullStart(e.targetTouches[0].clientY);
    }
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (pullStart === 0) return;

    const currentY = e.targetTouches[0].clientY;
    const distance = currentY - pullStart;

    // Only register downward pulls
    if (distance > 0) {
      e.preventDefault(); 
      setPullDistance(distance);
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > PULL_THRESHOLD) {
      setIsRefreshing(true);
      // Give a moment for the refresh indicator to be seen before reloading
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } else {
      // Reset if the pull was not far enough
      resetPullState();
    }
  };

  const resetPullState = () => {
    setPullStart(0);
    setPullDistance(0);
  };
  
  const iconProgress = Math.min(pullDistance / PULL_THRESHOLD, 1);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: 'pan-y' }}
    >
        <div
            className="fixed top-0 left-0 right-0 flex justify-center items-center text-primary transition-transform duration-300 ease-out"
            style={{
                height: `${PULL_THRESHOLD}px`,
                transform: `translateY(${isRefreshing ? '0' : Math.min(pullDistance, PULL_THRESHOLD) - PULL_THRESHOLD}px)`,
                opacity: isRefreshing || pullDistance > 0 ? 1 : 0,
            }}
        >
            {isRefreshing ? (
                <LoaderCircle className="h-6 w-6 animate-spin" />
            ) : (
                <div 
                    className="transition-transform"
                    style={{ transform: `rotate(${iconProgress * 180}deg)`}}
                >
                    <ArrowDown className="h-6 w-6" />
                </div>
            )}
        </div>
      {children}
    </div>
  );
}
