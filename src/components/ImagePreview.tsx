"use client";

import { useState } from "react";
import { X } from "lucide-react";

type ImagePreviewProps = {
    imagemUrl: string;
};

export function ImagePreview({ imagemUrl }: ImagePreviewProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div className="relative group/img inline-block cursor-pointer">
                <button
                    onClick={() => setIsOpen(true)}
                    className="text-[#006fb3] hover:text-[#faa954] hover:underline transition-colors text-sm font-medium flex items-center gap-1 justify-center"
                >
                    Ver Foto
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/img:block z-50 pointer-events-none">
                    <div className="bg-white p-2 rounded-xl shadow-2xl border border-slate-200">
                        <img 
                            src={imagemUrl} 
                            alt="Comprovante" 
                            className="max-w-[250px] max-h-[300px] object-cover rounded-lg"
                            loading="lazy"
                        />
                    </div>
                </div>
            </div>

            {isOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center justify-center animate-in fade-in zoom-in duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="absolute -top-12 right-0 bg-white/10 hover:bg-white/30 text-white rounded-full p-2 backdrop-blur-md transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <X className="w-8 h-8" />
                        </button>
                        <img
                            src={imagemUrl}
                            alt="Comprovante Ampliado"
                            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/10"
                        />
                    </div>
                </div>
            )}
        </>
    );
}
