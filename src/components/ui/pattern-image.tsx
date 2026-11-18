"use client";

import React, { useState, useEffect } from "react";
import { resolvePatternImage, DEFAULT_PATTERN_IMAGE } from "@/lib/pattern-image";

interface PatternImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src?: string | null;
  slug?: string;
  alt: string;
  className?: string;
}

export function PatternImage({
  src,
  slug,
  alt,
  className,
  ...props
}: PatternImageProps) {
  const initialResolved = resolvePatternImage(src, slug);
  const [currentSrc, setCurrentSrc] = useState<string>(initialResolved);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setCurrentSrc(resolvePatternImage(src, slug));
    setHasError(false);
  }, [src, slug]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      const fallback = resolvePatternImage(null, slug);
      setCurrentSrc(fallback !== currentSrc ? fallback : DEFAULT_PATTERN_IMAGE);
    }
  };

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
}
