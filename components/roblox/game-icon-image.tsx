'use client';

import Image from 'next/image';
import { useState } from 'react';

const PLACEHOLDER_IMG = '/images/game-placeholder.svg';

type Props = {
  src: string;
  alt: string;
  title?: string;
  className?: string;
};

export function GameIconImage({ src, alt, title, className }: Props) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      title={title}
      className={className}
      fill
      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
      unoptimized
      onError={() => setImgSrc(PLACEHOLDER_IMG)}
    />
  );
}
