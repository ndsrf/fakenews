import { useState } from 'react';
import { ImageCaptionProps } from '../../types/articleLayout';

/**
 * ImageCaption Component
 *
 * Renders a responsive image with caption and optional photo credit.
 * Includes lazy loading and error handling for broken images.
 *
 * @example
 * <ImageCaption
 *   src="/images/photo.jpg"
 *   alt="Description of the photo"
 *   caption="The scene shows..."
 *   credit="Photo by Jane Smith"
 * />
 */
export default function ImageCaption({
  src,
  alt,
  caption,
  credit,
  className = '',
}: ImageCaptionProps) {
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
  };

  return (
    <figure className={`image-caption my-6 ${className}`}>
      {!hasError ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={handleError}
          className="w-full h-auto rounded-sm"
        />
      ) : (
        <div className="w-full aspect-video bg-gray-200 rounded-sm flex items-center justify-center">
          <span className="text-gray-500 text-sm">{alt}</span>
        </div>
      )}
      {(caption || credit) && (
        <figcaption className="mt-2 text-sm leading-relaxed italic text-gray-600">
          {caption}
          {credit && (
            <span className="image-caption-credit block mt-1 text-xs text-gray-500">
              {credit}
            </span>
          )}
        </figcaption>
      )}
    </figure>
  );
}
