import { DropCapProps } from '../../types/articleLayout';

/**
 * DropCap Component
 *
 * Renders the first character of text as a decorative drop cap
 * with 2-3 line height and proper text wrapping.
 *
 * @example
 * <DropCap brandColor="#cc0000">
 *   The story begins here...
 * </DropCap>
 */
export default function DropCap({ children, brandColor }: DropCapProps) {
  if (!children || children.length === 0) {
    return null;
  }

  const firstChar = children.charAt(0);
  const restOfText = children.slice(1);

  return (
    <p className="text-lg leading-relaxed newspaper-article">
      <span
        className="float-left text-6xl font-bold leading-[0.85] mr-0.5 mt-0.5 font-serif"
        style={brandColor ? { color: brandColor } : undefined}
        aria-hidden="true"
      >
        {firstChar}
      </span>
      {restOfText}
    </p>
  );
}
