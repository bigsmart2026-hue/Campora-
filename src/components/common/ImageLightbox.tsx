import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageLightboxProps {
  images: string[];
  initialIndex?: number;
  alt?: string;
  onClose: () => void;
}

export default function ImageLightbox({ images, initialIndex = 0, alt = '', onClose }: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setScale(1);
  }, [images.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setScale(1);
  }, [images.length]);

  const toggleZoom = () => {
    setScale((prev) => (prev === 1 ? 2 : 1));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === ' ') { e.preventDefault(); toggleZoom(); }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [goToNext, goToPrev, onClose]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm animate-fade-in">
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all duration-200 backdrop-blur-sm"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-4 z-10 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg text-white text-sm font-medium">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Zoom */}
      <button
        onClick={toggleZoom}
        className="absolute top-4 left-1/2 -translate-x-1/2 z-10 p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all duration-200 backdrop-blur-sm"
      >
        {scale > 1 ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
      </button>

      {/* Image */}
      <div className="absolute inset-0 flex items-center justify-center p-8 pt-16 pb-24">
        <img
          src={images[currentIndex]}
          alt={`${alt} ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain transition-transform duration-300"
          style={{ transform: `scale(${scale})` }}
          onClick={toggleZoom}
          draggable={false}
        />
      </div>

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all duration-200 backdrop-blur-sm"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all duration-200 backdrop-blur-sm"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-black/80">
          <div className="flex justify-center gap-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => { setCurrentIndex(index); setScale(1); }}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  currentIndex === index
                    ? 'border-white scale-105'
                    : 'border-white/30 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={image} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
