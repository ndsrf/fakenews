import { PullQuoteProps } from '../../types/articleLayout';

/**
 * PullQuote Component
 *
 * Displays a styled blockquote with decorative quotation marks,
 * brand color border accent, and optional attribution text.
 *
 * @example
 * <PullQuote
 *   brandColor="#cc0000"
 *   attribution="John Doe, CEO"
 * >
 *   This is an important quote that deserves emphasis.
 * </PullQuote>
 */
export default function PullQuote({
  children,
  attribution,
  brandColor,
}: PullQuoteProps) {
  const borderStyle = brandColor
    ? { borderLeftColor: brandColor }
    : undefined;

  return (
    <blockquote
      className="pull-quote my-8 text-xl leading-relaxed italic pl-6 pr-4 py-6 relative bg-gray-50"
      style={borderStyle}
    >
      <div className="relative z-10">{children}</div>
      {attribution && (
        <cite className="pull-quote-attribution block mt-3 text-sm not-italic text-right text-gray-600">
          — {attribution}
        </cite>
      )}
    </blockquote>
  );
}
