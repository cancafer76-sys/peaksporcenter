import React, { useEffect, useState } from 'react';
import { resolveMediaUrl } from '../shared/media.js';

export function MediaImage({
  src,
  alt = '',
  className = '',
  style,
  loading = 'lazy',
  fallbackClassName = 'media-image-placeholder',
  fallback
}) {
  const [failed, setFailed] = useState(false);
  const resolved = resolveMediaUrl(src);

  useEffect(() => {
    setFailed(false);
  }, [resolved]);

  if (!resolved || failed) {
    if (fallback !== undefined) return fallback;
    const initial = alt?.trim().charAt(0).toUpperCase();
    return (
      <div className={fallbackClassName} aria-hidden={!initial}>
        {initial || '?'}
      </div>
    );
  }

  return (
    <img
      src={resolved}
      alt={alt}
      className={className}
      style={style}
      loading={loading}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
