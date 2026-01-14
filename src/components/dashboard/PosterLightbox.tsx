import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, Download } from 'lucide-react';
import { Button } from '../ui/button';

interface PosterLightboxProps {
    isOpen: boolean;
    onClose: () => void;
    imageSrc?: string;
    imageAlt?: string;
}

export function PosterLightbox({ isOpen, onClose, imageSrc, imageAlt }: PosterLightboxProps) {
    if (!imageSrc) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
                    />

                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative z-10 max-w-[90vw] max-h-[90vh] flex flex-col items-center gap-4"
                    >
                        <div className="relative group overflow-hidden rounded-2xl shadow-2xl border-4 border-white/10">
                            <img
                                src={imageSrc}
                                alt={imageAlt}
                                className="max-w-full max-h-[80vh] object-contain rounded-xl"
                            />

                            <div className="absolute top-4 right-4 flex gap-2">
                                <Button
                                    size="icon"
                                    onClick={onClose}
                                    className="bg-black/50 hover:bg-black/70 text-white border-0 backdrop-blur-md rounded-full h-10 w-10"
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <a
                                href={imageSrc}
                                download={imageAlt || 'event-poster'}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <Button className="rounded-full px-6 bg-white text-[#5A3A1E] hover:bg-white/90 font-bold shadow-lg">
                                    <Download className="h-4 w-4 mr-2" />
                                    Download Poster
                                </Button>
                            </a>
                            <Button
                                onClick={onClose}
                                variant="outline"
                                className="rounded-full px-6 border-white/20 text-white hover:bg-white/10 backdrop-blur-md"
                            >
                                Close
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
