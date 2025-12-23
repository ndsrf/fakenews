import { useMemo } from 'react';
import { ColumnLayoutProps } from '../../types/articleLayout';
import DropCap from './DropCap';
import PullQuote from './PullQuote';
import ImageCaption from './ImageCaption';

/**
 * ColumnLayout Component
 *
 * Parses HTML content and distributes it into newspaper-style columns.
 * First paragraph gets DropCap and stays single-column.
 * Subsequent content flows into 2 columns on desktop.
 * Blockquotes render as PullQuote, images use ImageCaption.
 *
 * @example
 * <ColumnLayout
 *   content="<p>Article content...</p><blockquote>Quote</blockquote>"
 *   brandColor="#cc0000"
 *   includeDropCap={true}
 * />
 */
export default function ColumnLayout({
  content,
  brandColor,
  includeDropCap = true,
}: ColumnLayoutProps) {
  const parsedContent = useMemo(() => {
    if (!content) return { firstParagraph: '', remainingContent: [] };

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      const body = doc.body;

      if (!body) return { firstParagraph: '', remainingContent: [] };

      const elements: HTMLElement[] = Array.from(body.children) as HTMLElement[];

      // Find first paragraph for drop cap
      const firstParagraphIndex = elements.findIndex(
        (el) => el.tagName.toLowerCase() === 'p'
      );

      if (firstParagraphIndex === -1) {
        // No paragraphs found, just render all content
        return {
          firstParagraph: '',
          remainingContent: elements,
        };
      }

      const firstParagraph = elements[firstParagraphIndex].textContent || '';
      const remainingElements = [
        ...elements.slice(0, firstParagraphIndex),
        ...elements.slice(firstParagraphIndex + 1),
      ];

      return {
        firstParagraph,
        remainingContent: remainingElements,
      };
    } catch (error) {
      console.error('Error parsing HTML content:', error);
      return { firstParagraph: '', remainingContent: [] };
    }
  }, [content]);

  const renderElement = (element: HTMLElement, index: number) => {
    const tagName = element.tagName.toLowerCase();

    // Render blockquote as PullQuote
    if (tagName === 'blockquote') {
      const text = element.textContent || '';
      // Try to find citation
      const cite = element.querySelector('cite');
      const attribution = cite?.textContent || undefined;
      const quoteText = cite ? text.replace(attribution || '', '').trim() : text;

      return (
        <PullQuote key={index} brandColor={brandColor} attribution={attribution}>
          {quoteText}
        </PullQuote>
      );
    }

    // Render image as ImageCaption
    if (tagName === 'img' || tagName === 'figure') {
      const img = tagName === 'img' ? element : element.querySelector('img');
      if (!img) return null;

      const src = img.getAttribute('src') || '';
      const alt = img.getAttribute('alt') || '';
      const figcaption = element.querySelector('figcaption');
      const caption = figcaption?.textContent || undefined;

      return (
        <ImageCaption
          key={index}
          src={src}
          alt={alt}
          caption={caption}
          className="column-break"
        />
      );
    }

    // Render other HTML elements
    return (
      <div
        key={index}
        dangerouslySetInnerHTML={{ __html: element.outerHTML }}
        className="newspaper-article"
      />
    );
  };

  return (
    <div className="column-layout">
      {/* First paragraph with optional drop cap - single column */}
      {parsedContent.firstParagraph && (
        <div className="mb-6">
          {includeDropCap ? (
            <DropCap brandColor={brandColor}>
              {parsedContent.firstParagraph}
            </DropCap>
          ) : (
            <p className="text-lg leading-relaxed newspaper-article">
              {parsedContent.firstParagraph}
            </p>
          )}
        </div>
      )}

      {/* Remaining content in responsive columns */}
      {parsedContent.remainingContent.length > 0 && (
        <div className="newspaper-columns newspaper-columns-1 lg:newspaper-columns-responsive">
          {parsedContent.remainingContent.map((element, index) =>
            renderElement(element, index)
          )}
        </div>
      )}
    </div>
  );
}
