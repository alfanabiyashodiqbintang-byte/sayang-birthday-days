'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';

interface InteractionFlowProps {
  onFlowComplete?: () => void;
  onComplete?: () => void;
}

export default function InteractionFlow({ onFlowComplete, onComplete }: InteractionFlowProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Halo Sayang! ❤️",
      description: "Ada kejutan kecil yang udah disiapin spesial buat ulang tahun kamu yang ke-20.",
      buttonText: "Mulai Kejutan ✨"
    },
    {
      title: "20 Tahun Yang Spesial 🎉",
      description: "Semoga di usia yang baru ini, kamu makin bahagia, sehat selalu, dan semua impianmu tercapai.",
      buttonText: "Lihat Galeri Foto 📸"
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      if (onFlowComplete) onFlowComplete();
      if (onComplete) onComplete();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-6 text-center bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 max-w-md mx-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="p-3 bg-pink-500/20 rounded-full text-pink-400">
            <Heart className="w-8 h-8 fill-pink-500 animate-pulse" />
          </div>
          
          <h2 className="text-2xl font-bold text-white">
            {steps[step].title}
          </h2>
          
          <p className="text-gray-300 text-sm leading-relaxed">
            {steps[step].description}
          </p>

          <button
            onClick={handleNext}
            className="mt-4 px-6 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium rounded-full shadow-lg hover:shadow-pink-500/25 transition-all duration-300 active:scale-95"
          >
            {steps[step].buttonText}
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
// refresh-build
