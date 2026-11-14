import React, { useEffect, useState } from 'react';

interface CompanySealProps {
  className?: string;
}

const SEAL_ASSET_URL = '/assets/aistudio/image_f7b9f8c3.png';

/**
 * Renders the exact official seal image provided by the user (image_f7b9f8c3.png),
 * keying out pure white pixels via an offscreen canvas so underlying contract text
 * stays cleanly visible even in exported PDFs.
 */
export const CompanySeal: React.FC<CompanySealProps> = ({ className = '' }) => {
  const [transparentSrc, setTransparentSrc] = useState<string>(SEAL_ASSET_URL);

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = SEAL_ASSET_URL;

    img.onload = () => {
      if (cancelled) return;
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // Remove near-white background while preserving exact red seal strokes
          if (r > 235 && g > 235 && b > 235) {
            data[i + 3] = 0;
          } else if (r > 200 && g > 190 && b > 190) {
            // Smooth edge anti-aliasing
            const whiteness = (g + b) / 2;
            const alpha = Math.max(0, Math.min(255, Math.round((245 - whiteness) * 4.5)));
            data[i + 3] = Math.min(data[i + 3], alpha);
          }
        }

        ctx.putImageData(imageData, 0, 0);
        const pngDataUrl = canvas.toDataURL('image/png');
        if (!cancelled) {
          setTransparentSrc(pngDataUrl);
        }
      } catch {
        // Fallback cleanly to direct image path
      }
    };

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <img
      src={transparentSrc}
      alt="湖北易通汽车进出口贸易有限公司公章"
      className={className}
      draggable={false}
      style={{
        objectFit: 'contain',
        mixBlendMode: 'multiply',
      }}
    />
  );
};
