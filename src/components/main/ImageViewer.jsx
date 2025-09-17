import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect } from "react";

export default function ImageViewer({ isOpen, images, index, onClose, onPrev, onNext }) {
    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowLeft") onPrev();
            if (e.key === "ArrowRight") onNext();
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [isOpen, onClose, onPrev, onNext]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center" onClick={onClose}>
            <button className="absolute top-4 left-4 text-white z-10" onClick={(e) => { e.stopPropagation(); onClose(); }}>
                <X className="w-7 h-7" />
            </button>
            <button className="absolute left-14 text-white z-10" onClick={(e) => { e.stopPropagation(); onPrev(); }}>
                <ChevronLeft className="w-10 h-10" />
            </button>
            <div onClick={(e) => e.stopPropagation()} className="z-0">
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <img src={images[index]} className="max-h-[80vh] max-w-[90vw] rounded-lg shadow-2xl object-contain" />
            </div>
            <button className="absolute right-4 text-white z-10" onClick={(e) => { e.stopPropagation(); onNext(); }}>
                <ChevronRight className="w-10 h-10" />
            </button>
            <div className="absolute bottom-6 text-white text-sm">
                {index + 1} / {images.length}
            </div>
        </div>
    );
}



