'use client';

import React from 'react';

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
}

export function ClientImage({ src, fallback = '/placeholder.png', alt, ...props }: Props) {
  const [imgSrc, setImgSrc] = React.useState(src);

  return (
    <img
      {...props}
      src={imgSrc || fallback}
      alt={alt}
      onError={() => setImgSrc(fallback)}
    />
  );
}
