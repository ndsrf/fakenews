import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ColumnLayout from '../../../../src/client/components/ArticleLayout/ColumnLayout';

// Mock child components
jest.mock('../../../../src/client/components/ArticleLayout/DropCap', () => ({
  __esModule: true,
  default: ({ children, brandColor }: any) => (
    <div data-testid="drop-cap" data-brand-color={brandColor}>
      {children}
    </div>
  ),
}));

jest.mock('../../../../src/client/components/ArticleLayout/PullQuote', () => ({
  __esModule: true,
  default: ({ children, brandColor, attribution }: any) => (
    <div
      data-testid="pull-quote"
      data-brand-color={brandColor}
      data-attribution={attribution}
    >
      {children}
    </div>
  ),
}));

jest.mock('../../../../src/client/components/ArticleLayout/ImageCaption', () => ({
  __esModule: true,
  default: ({ src, alt, caption, className }: any) => (
    <div
      data-testid="image-caption"
      data-src={src}
      data-alt={alt}
      data-caption={caption}
      data-classname={className}
    >
      Image: {alt}
    </div>
  ),
}));

describe('ColumnLayout Component', () => {
  it('renders empty state when no content provided', () => {
    const { container } = render(<ColumnLayout content="" />);
    expect(container.querySelector('.column-layout')).toBeInTheDocument();
  });

  it('parses simple paragraph and applies DropCap', () => {
    const content = '<p>This is the first paragraph.</p>';
    render(<ColumnLayout content={content} />);

    const dropCap = screen.getByTestId('drop-cap');
    expect(dropCap).toBeInTheDocument();
    expect(dropCap).toHaveTextContent('This is the first paragraph.');
  });

  it('renders first paragraph without DropCap when includeDropCap is false', () => {
    const content = '<p>This is the first paragraph.</p>';
    const { container } = render(
      <ColumnLayout content={content} includeDropCap={false} />
    );

    expect(screen.queryByTestId('drop-cap')).not.toBeInTheDocument();
    const paragraph = container.querySelector('p.newspaper-article');
    expect(paragraph).toBeInTheDocument();
    expect(paragraph).toHaveTextContent('This is the first paragraph.');
  });

  it('passes brand color to DropCap', () => {
    const content = '<p>First paragraph.</p>';
    const brandColor = '#cc0000';
    render(<ColumnLayout content={content} brandColor={brandColor} />);

    const dropCap = screen.getByTestId('drop-cap');
    expect(dropCap).toHaveAttribute('data-brand-color', brandColor);
  });

  it('parses and renders blockquote as PullQuote', () => {
    const content = '<blockquote>This is an important quote.</blockquote>';
    render(<ColumnLayout content={content} />);

    const pullQuote = screen.getByTestId('pull-quote');
    expect(pullQuote).toBeInTheDocument();
    expect(pullQuote).toHaveTextContent('This is an important quote.');
  });

  it('parses blockquote with attribution from cite element', () => {
    const content =
      '<blockquote>Important quote<cite>Author Name</cite></blockquote>';
    render(<ColumnLayout content={content} />);

    const pullQuote = screen.getByTestId('pull-quote');
    expect(pullQuote).toHaveAttribute('data-attribution', 'Author Name');
  });

  it('passes brand color to PullQuote', () => {
    const content = '<blockquote>Quote</blockquote>';
    const brandColor = '#0066cc';
    render(<ColumnLayout content={content} brandColor={brandColor} />);

    const pullQuote = screen.getByTestId('pull-quote');
    expect(pullQuote).toHaveAttribute('data-brand-color', brandColor);
  });

  it('parses and renders image as ImageCaption', () => {
    const content = '<img src="/test.jpg" alt="Test image" />';
    render(<ColumnLayout content={content} />);

    const imageCaption = screen.getByTestId('image-caption');
    expect(imageCaption).toBeInTheDocument();
    expect(imageCaption).toHaveAttribute('data-src', '/test.jpg');
    expect(imageCaption).toHaveAttribute('data-alt', 'Test image');
  });

  it('parses figure with image and caption as ImageCaption', () => {
    const content =
      '<figure><img src="/fig.jpg" alt="Figure" /><figcaption>Caption text</figcaption></figure>';
    render(<ColumnLayout content={content} />);

    const imageCaption = screen.getByTestId('image-caption');
    expect(imageCaption).toHaveAttribute('data-src', '/fig.jpg');
    expect(imageCaption).toHaveAttribute('data-alt', 'Figure');
    expect(imageCaption).toHaveAttribute('data-caption', 'Caption text');
  });

  it('applies column-break class to ImageCaption', () => {
    const content = '<img src="/test.jpg" alt="Test" />';
    render(<ColumnLayout content={content} />);

    const imageCaption = screen.getByTestId('image-caption');
    expect(imageCaption).toHaveAttribute('data-classname', 'column-break');
  });

  it('parses multiple paragraphs correctly', () => {
    const content = '<p>First paragraph.</p><p>Second paragraph.</p><p>Third paragraph.</p>';
    const { container } = render(<ColumnLayout content={content} />);

    // First paragraph gets DropCap
    expect(screen.getByTestId('drop-cap')).toHaveTextContent('First paragraph.');

    // Remaining paragraphs rendered in columns
    const columns = container.querySelector('.newspaper-columns');
    expect(columns).toBeInTheDocument();
  });

  it('has responsive column CSS classes', () => {
    const content = '<p>First.</p><p>Second.</p>';
    const { container } = render(<ColumnLayout content={content} />);

    const columns = container.querySelector('.newspaper-columns');
    expect(columns).toHaveClass(
      'newspaper-columns-1',
      'lg:newspaper-columns-responsive'
    );
  });

  it('renders mixed content with paragraphs, blockquotes, and images', () => {
    const content = `
      <p>First paragraph.</p>
      <p>Second paragraph.</p>
      <blockquote>Important quote.</blockquote>
      <img src="/image.jpg" alt="Article image" />
      <p>Third paragraph.</p>
    `;
    render(<ColumnLayout content={content} />);

    expect(screen.getByTestId('drop-cap')).toBeInTheDocument();
    expect(screen.getByTestId('pull-quote')).toBeInTheDocument();
    expect(screen.getByTestId('image-caption')).toBeInTheDocument();
  });

  it('handles malformed HTML gracefully', () => {
    const malformedContent = '<p>Unclosed paragraph<div>Random div';
    const { container } = render(<ColumnLayout content={malformedContent} />);

    // Should not crash
    expect(container.querySelector('.column-layout')).toBeInTheDocument();
  });

  it('handles empty HTML string', () => {
    render(<ColumnLayout content="" />);
    const dropCap = screen.queryByTestId('drop-cap');
    expect(dropCap).not.toBeInTheDocument();
  });

  it('handles content with no paragraphs', () => {
    const content = '<div>Just a div</div><span>Just a span</span>';
    const { container } = render(<ColumnLayout content={content} />);

    // No first paragraph, no DropCap
    expect(screen.queryByTestId('drop-cap')).not.toBeInTheDocument();

    // Content should still be rendered
    const columns = container.querySelector('.newspaper-columns');
    expect(columns).toBeInTheDocument();
  });

  it('renders other HTML elements with dangerouslySetInnerHTML', () => {
    const content = '<p>First.</p><div class="custom">Custom content</div>';
    const { container } = render(<ColumnLayout content={content} />);

    const customDiv = container.querySelector('.custom');
    expect(customDiv).toBeInTheDocument();
    expect(customDiv).toHaveTextContent('Custom content');
  });

  it('applies newspaper-article class to rendered elements', () => {
    const content = '<p>First.</p><p>Second.</p>';
    const { container } = render(<ColumnLayout content={content} />);

    const newspaperArticles = container.querySelectorAll('.newspaper-article');
    expect(newspaperArticles.length).toBeGreaterThan(0);
  });

  it('renders first paragraph in separate div with mb-6', () => {
    const content = '<p>First paragraph.</p><p>Second.</p>';
    const { container } = render(<ColumnLayout content={content} />);

    const firstParagraphContainer = container.querySelector('.mb-6');
    expect(firstParagraphContainer).toBeInTheDocument();
  });

  it('uses useMemo for content parsing (memoization behavior)', () => {
    const content = '<p>Test paragraph.</p>';
    const { rerender } = render(<ColumnLayout content={content} />);

    // First render
    expect(screen.getByTestId('drop-cap')).toHaveTextContent('Test paragraph.');

    // Rerender with same content (useMemo should prevent reparsing)
    rerender(<ColumnLayout content={content} />);
    expect(screen.getByTestId('drop-cap')).toHaveTextContent('Test paragraph.');

    // Rerender with different content (should reparse)
    rerender(<ColumnLayout content="<p>New paragraph.</p>" />);
    expect(screen.getByTestId('drop-cap')).toHaveTextContent('New paragraph.');
  });

  it('handles blockquote without cite element', () => {
    const content = '<blockquote>Quote without attribution</blockquote>';
    render(<ColumnLayout content={content} />);

    const pullQuote = screen.getByTestId('pull-quote');
    expect(pullQuote).toHaveTextContent('Quote without attribution');
    // attribution should be undefined (converted to empty string by data attribute)
    expect(pullQuote.getAttribute('data-attribution')).toBeFalsy();
  });

  it('handles figure without img element', () => {
    const content = '<figure><figcaption>Caption only</figcaption></figure>';
    const { container } = render(<ColumnLayout content={content} />);

    // Should not render ImageCaption if no img found
    expect(screen.queryByTestId('image-caption')).not.toBeInTheDocument();
  });

  it('extracts elements before first paragraph correctly', () => {
    const content = '<div>Before</div><p>First paragraph.</p><p>Second.</p>';
    const { container } = render(<ColumnLayout content={content} />);

    // First paragraph gets DropCap
    expect(screen.getByTestId('drop-cap')).toHaveTextContent('First paragraph.');

    // Element before first paragraph should be in remaining content
    expect(container).toHaveTextContent('Before');
  });

  it('renders content with complex HTML structure', () => {
    const content = `
      <h2>Heading</h2>
      <p>First paragraph with <strong>bold</strong> and <em>italic</em> text.</p>
      <blockquote>Quote with <span>inline elements</span></blockquote>
      <ul><li>List item</li></ul>
      <img src="/test.jpg" alt="Test" />
    `;
    const { container } = render(<ColumnLayout content={content} />);

    expect(screen.getByTestId('drop-cap')).toBeInTheDocument();
    expect(screen.getByTestId('pull-quote')).toBeInTheDocument();
    expect(screen.getByTestId('image-caption')).toBeInTheDocument();
    expect(container.querySelector('h2')).toHaveTextContent('Heading');
    expect(container.querySelector('ul')).toBeInTheDocument();
  });
});
