import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import Button from './Button';

interface SlideData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  buttonText?: string;
  buttonAction?: () => void;
  gradient?: string;
}

interface SliderProps {
  slides: SlideData[];
  autoPlay?: boolean;
  interval?: number;
  className?: string;
}

const Slider: React.FC<SliderProps> = ({ 
  slides, 
  autoPlay = true, 
  interval = 5000,
  className = '' 
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!autoPlay || slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  if (slides.length === 0) return null;

  return (
    <div className={`relative w-full h-64 md:h-80 lg:h-96 rounded-2xl overflow-hidden shadow-xl ${className}`}>
      {/* Slides */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${slide.image})` }}
            />
            
            {/* Gradient Overlay */}
            <div className={`absolute inset-0 ${slide.gradient || 'bg-gradient-to-r from-black/60 via-black/30 to-transparent'}`} />
            
            {/* Content */}
            <div className="relative h-full flex items-center justify-start p-6 md:p-8 lg:p-12">
              <div className="max-w-lg text-white">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 leading-tight">
                  {slide.title}
                </h2>
                <p className="text-lg md:text-xl font-medium mb-3 text-orange-200">
                  {slide.subtitle}
                </p>
                <p className="text-sm md:text-base mb-6 text-gray-200 leading-relaxed">
                  {slide.description}
                </p>
                {slide.buttonText && slide.buttonAction && (
                  <Button
                    onClick={slide.buttonAction}
                    variant="primary"
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
                  >
                    {slide.buttonText}
                    <ExternalLink size={16} className="ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300"
            aria-label="Previous slide"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300"
            aria-label="Next slide"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white w-8' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Slider;