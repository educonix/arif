import React, { useState, useEffect, useRef } from 'react';

export function useSliderAutoPlay(
  sliderRef: React.RefObject<HTMLDivElement | null>,
  itemsCount: number,
  loading: boolean,
  isModalOpen: boolean
) {
  const [isVisible, setIsVisible] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const interactionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!sliderRef.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.6 } // Increased threshold so it only starts when well in view
    );

    observer.observe(sliderRef.current);
    return () => observer.disconnect();
  }, [sliderRef]);

  const handleInteractionStart = () => {
    setIsInteracting(true);
    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current);
    }
  };

  const handleInteractionEnd = () => {
    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current);
    }
    interactionTimeoutRef.current = setTimeout(() => {
      setIsInteracting(false);
    }, 4000); // Wait 4 seconds after interaction ends before resuming
  };

  useEffect(() => {
    if (loading || itemsCount <= 1 || isInteracting || !isVisible || isModalOpen) return;

    const interval = setInterval(() => {
      if (sliderRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
        const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 20;
        
        if (isAtEnd) {
          sliderRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          const scrollAmount = sliderRef.current.offsetWidth * 0.8;
          sliderRef.current.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
          });
        }
      }
    }, 8000); // Generous 8-second delay to prioritize reading

    return () => clearInterval(interval);
  }, [loading, itemsCount, isInteracting, isVisible, isModalOpen, sliderRef]);

  return { handleInteractionStart, handleInteractionEnd };
}
