import React, { useEffect, useLayoutEffect, useRef, useState, useId, useCallback } from 'react';
import { useGesture } from '@use-gesture/react';

interface ImageItem {
  src: string;
  alt?: string;
  caption?: string;
}

interface DomeGalleryProps {
  images?: ImageItem[];
  fitAspect?: number;
  segments?: number;
  minRadius?: number;
  maxRadius?: number;
  grayscale?: boolean;
  autoRotationSpeed?: number;
  overlayBlur?: number;
  overlayColor?: string;
  leftText?: string;
  rightText?: string;
}

interface RingConfig {
  ringIndex: number;
  itemCount: number;
  phi: number;
  radius: number;
}

interface ItemData {
  src: string;
  alt: string;
  caption?: string;
  x: number;
  y: number;
  z: number;
  ringIndex: number;
}

// 7 FOTO & KATA-KATA ROMANTIS UNTUK ULANG TAHUN KE-20
const DEFAULT_IMAGES: ImageItem[] = [
  { 
    src: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?q=80&w=1000&auto=format&fit=crop', 
    alt: 'Foto 1', 
    caption: 'Selamat ulang tahun ke-20, sayang. Terima kasih udah lahir dan hadir di hidup biyaa ❤️' 
  },
  { 
    src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop', 
    alt: 'Foto 2', 
    caption: 'Mungkin biya jarang bilang, tapi rasya itu alasan biya selalu merasa aman dan bersyukur ✨' 
  },
  { 
    src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1000&auto=format&fit=crop', 
    alt: 'Foto 3', 
    caption: 'Di umur sayang yang baru ini, biya cuma mau sayang bahagia, biya mau jadi bagian dari bahagia itu 🌿' 
  },
  { 
    src: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=1000&auto=format&fit=crop', 
    alt: 'Foto 4', 
    caption: 'Biya sayang Rasya lebih dari sekadar kata-kata. biya bener bener sayang banget 💖' 
  },
  { 
    src: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?q=80&w=1000&auto=format&fit=crop', 
    alt: 'Foto 5', 
    caption: 'Terima kasih sudah selalu sabar dan jadi rumah terbaik buat biya pulang 🏠' 
  },
  { 
    src: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1000&auto=format&fit=crop', 
    alt: 'Foto 6', 
    caption: 'Apapun yang terjadi ke depannya, ingat ya... biya bakal selalu ada di samping sayang 🌅' 
  },
  { 
    src: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=1000&auto=format&fit=crop', 
    alt: 'Foto 7', 
    caption: 'Selamat berproses di usia 20 tahun, laki-lakiku. Biya bangga dan sayang banget sama Rasyaa 🥰' 
  },
];

export default function DomeGallery({
  images = DEFAULT_IMAGES,
  fitAspect = 1,
  segments = 18,
  minRadius = 600,
  maxRadius = 1200,
  grayscale = false,
  autoRotationSpeed = 0.1,
  overlayBlur = 10,
  overlayColor = '#060010',
  leftText = 'HAPPY 20TH',
  rightText = 'MY EVERYTHING',
}: DomeGalleryProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const filterId = useId();

  const [items, setItems] = useState<ItemData[]>([]);
  const [openedImage, setOpenedImage] = useState<ItemData | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const rotX = useRef(0);
  const rotY = useRef(0);
  const targetRotX = useRef(0);
  const targetRotY = useRef(0);

  const isDragging = useRef(false);
  const animFrameId = useRef<number | null>(null);

  const buildItems = useCallback(() => {
    if (!rootRef.current || images.length === 0) return;

    const width = rootRef.current.clientWidth;
    const radius = Math.min(Math.max(width * 0.8, minRadius), maxRadius);

    const rings: RingConfig[] = [];
    const numRings = 5;
    
    for (let i = 0; i < numRings; i++) {
      const phi = (Math.PI / (numRings + 1)) * (i + 1) - Math.PI / 2;
      const ringRadius = radius * Math.cos(phi);
      const itemCount = Math.max(3, Math.floor((2 * Math.PI * ringRadius) / 220));
      rings.push({ ringIndex: i, itemCount, phi, radius });
    }

    const newItems: ItemData[] = [];
    let imgIdx = 0;

    rings.forEach((ring) => {
      for (let j = 0; j < ring.itemCount; j++) {
        const theta = ((2 * Math.PI) / ring.itemCount) * j;
        const img = images[imgIdx % images.length];

        const x = radius * Math.cos(ring.phi) * Math.sin(theta);
        const y = radius * Math.sin(ring.phi);
        const z = radius * Math.cos(ring.phi) * Math.cos(theta);

        newItems.push({
          src: img.src,
          alt: img.alt || `Gallery Image ${imgIdx + 1}`,
          caption: img.caption,
          x,
          y,
          z,
          ringIndex: ring.ringIndex,
        });

        imgIdx++;
      }
    });

    setItems(newItems);
  }, [images, minRadius, maxRadius]);

  useLayoutEffect(() => {
    buildItems();
    window.addEventListener('resize', buildItems);
    return () => window.removeEventListener('resize', buildItems);
  }, [buildItems]);

  useEffect(() => {
    const loop = () => {
      if (!isDragging.current && !openedImage) {
        targetRotY.current += autoRotationSpeed;
      }

      rotX.current += (targetRotX.current - rotX.current) * 0.08;
      rotY.current += (targetRotY.current - rotY.current) * 0.08;

      if (containerRef.current) {
        containerRef.current.style.transform = `rotateX(${rotX.current}deg) rotateY(${rotY.current}deg)`;
      }

      animFrameId.current = requestAnimationFrame(loop);
    };

    animFrameId.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [autoRotationSpeed, openedImage]);

  useGesture(
    {
      onDragStart: () => {
        isDragging.current = true;
      },
      onDrag: ({ delta: [dx, dy] }) => {
        targetRotY.current += dx * 0.3;
        targetRotX.current = Math.min(Math.max(targetRotX.current - dy * 0.3, -60), 60);
      },
      onDragEnd: () => {
        isDragging.current = false;
      },
    },
    { target: rootRef, drag: { filterTaps: true } }
  );

  const handleItemClick = (item: ItemData) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setOpenedImage(item);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleClose = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setOpenedImage(null);
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <div
      ref={rootRef}
      className="relative w-full h-screen overflow-hidden select-none cursor-grab active:cursor-grabbing"
      style={{ backgroundColor: overlayColor }}
    >
      <svg className="hidden">
        <filter id={filterId}>
          {grayscale ? (
            <feColorMatrix type="matrix" values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 1 0" />
          ) : (
            <feColorMatrix type="identity" />
          )}
        </filter>
      </svg>

      {/* Kubah 3D */}
      <div className="w-full h-full perspective-[1000px] flex items-center justify-center">
        <div
          ref={containerRef}
          className="relative w-0 h-0 transform-style-3d ease-out"
          style={{
            filter: `url(#${filterId})`,
          }}
        >
          {items.map((item, idx) => {
            const transform = `translate3d(${item.x}px, ${item.y}px, ${item.z}px) rotateY(${Math.atan2(
              item.x,
              item.z
            )}rad) rotateX(${-Math.atan2(item.y, Math.sqrt(item.x * item.x + item.z * item.z))}rad)`;

            return (
              <div
                key={idx}
                onClick={() => handleItemClick(item)}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140px] h-[180px] md:w-[180px] md:h-[240px] rounded-2xl overflow-hidden shadow-2xl transition-transform duration-300 hover:scale-110 cursor-pointer bg-white/5 border border-white/10 backdrop-blur-md"
                style={{
                  transform,
                  backfaceVisibility: 'hidden',
                }}
              >
                <img src={item.src} alt={item.alt} className="w-full h-full object-cover pointer-events-none" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Background Overlay Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, transparent 30%, ${overlayColor} 90%)`,
          backdropFilter: `blur(${overlayBlur}px)`,
        }}
      />

      {/* Pop-up Foto Saat Diklik (dengan Kata-Kata Romantis) */}
      {openedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl transition-opacity duration-300 animate-fadeIn"
          onClick={handleClose}
        >
          {/* Teks Sisi Kiri */}
          <div className="absolute left-[5%] top-1/2 -translate-y-1/2 text-white/15 text-4xl md:text-6xl font-black tracking-widest pointer-events-none select-none hidden lg:block uppercase">
            {leftText}
          </div>

          {/* Area Foto + Kata-kata */}
          <div
            className="relative z-10 max-w-[90vw] max-h-[85vh] flex flex-col items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={openedImage.src}
              alt={openedImage.alt}
              className="max-w-full max-h-[60vh] md:max-h-[65vh] object-contain rounded-2xl shadow-[0_0_50px_rgba(255,255,255,0.2)] border border-white/20 transition-transform duration-300"
            />

            {/* KATA-KATA DI BAWAH FOTO */}
            {openedImage.caption && (
              <p className="mt-6 text-center text-white/95 text-base md:text-lg font-medium drop-shadow-md max-w-lg px-6 py-3 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md leading-relaxed">
                {openedImage.caption}
              </p>
            )}
          </div>

          {/* Teks Sisi Kanan */}
          <div className="absolute right-[5%] top-1/2 -translate-y-1/2 text-white/15 text-4xl md:text-6xl font-black tracking-widest pointer-events-none select-none hidden lg:block uppercase">
            {rightText}
          </div>

          {/* Tombol Tutup (X) */}
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 text-white/70 hover:text-white text-2xl w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all border border-white/10"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
