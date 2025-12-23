import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PullQuote from '../../../../src/client/components/ArticleLayout/PullQuote';

describe('PullQuote Component', () => {
  it('renders quote content correctly', () => {
    const quote = 'This is an important quote that deserves emphasis.';
    render(<PullQuote>{quote}</PullQuote>);

    expect(screen.getByText(quote)).toBeInTheDocument();
  });

  it('uses semantic blockquote element', () => {
    const quote = 'Semantic HTML test';
    const { container } = render(<PullQuote>{quote}</PullQuote>);

    const blockquote = container.querySelector('blockquote');
    expect(blockquote).toBeInTheDocument();
    expect(blockquote).toHaveClass('pull-quote');
  });

  it('renders attribution when provided', () => {
    const quote = 'Test quote';
    const attribution = 'John Doe, CEO';
    render(<PullQuote attribution={attribution}>{quote}</PullQuote>);

    expect(screen.getByText(`— ${attribution}`)).toBeInTheDocument();
  });

  it('does not render attribution when not provided', () => {
    const quote = 'Test quote';
    const { container } = render(<PullQuote>{quote}</PullQuote>);

    const cite = container.querySelector('cite');
    expect(cite).not.toBeInTheDocument();
  });

  it('applies brand color to left border', () => {
    const quote = 'Test quote';
    const brandColor = '#cc0000';
    const { container } = render(
      <PullQuote brandColor={brandColor}>{quote}</PullQuote>
    );

    const blockquote = container.querySelector('blockquote');
    expect(blockquote).toHaveStyle({ borderLeftColor: brandColor });
  });

  it('renders without brand color styling when not provided', () => {
    const quote = 'Test quote';
    const { container } = render(<PullQuote>{quote}</PullQuote>);

    const blockquote = container.querySelector('blockquote');
    expect(blockquote).not.toHaveAttribute('style');
  });

  it('has proper spacing classes', () => {
    const quote = 'Test quote';
    const { container } = render(<PullQuote>{quote}</PullQuote>);

    const blockquote = container.querySelector('blockquote');
    expect(blockquote).toHaveClass('my-8');
  });

  it('has correct styling classes', () => {
    const quote = 'Test quote';
    const { container } = render(<PullQuote>{quote}</PullQuote>);

    const blockquote = container.querySelector('blockquote');
    expect(blockquote).toHaveClass(
      'text-xl',
      'leading-relaxed',
      'italic',
      'pl-6',
      'pr-4',
      'py-6',
      'bg-gray-50'
    );
  });

  it('renders rich content as children', () => {
    render(
      <PullQuote>
        <span>First part</span>
        <strong> and important part</strong>
      </PullQuote>
    );

    expect(screen.getByText('First part')).toBeInTheDocument();
    expect(screen.getByText('and important part')).toBeInTheDocument();
  });

  it('attribution uses semantic cite element', () => {
    const quote = 'Test quote';
    const attribution = 'Jane Smith';
    const { container } = render(
      <PullQuote attribution={attribution}>{quote}</PullQuote>
    );

    const cite = container.querySelector('cite');
    expect(cite).toBeInTheDocument();
    expect(cite).toHaveClass('pull-quote-attribution');
  });

  it('attribution has correct styling', () => {
    const quote = 'Test quote';
    const attribution = 'Jane Smith';
    const { container } = render(
      <PullQuote attribution={attribution}>{quote}</PullQuote>
    );

    const cite = container.querySelector('cite');
    expect(cite).toHaveClass(
      'block',
      'mt-3',
      'text-sm',
      'not-italic',
      'text-right',
      'text-gray-600'
    );
  });

  it('handles both quote and attribution with brand color', () => {
    const quote = 'Complete test quote';
    const attribution = 'Full Name, Title';
    const brandColor = '#0066cc';
    const { container } = render(
      <PullQuote brandColor={brandColor} attribution={attribution}>
        {quote}
      </PullQuote>
    );

    const blockquote = container.querySelector('blockquote');
    expect(blockquote).toHaveStyle({ borderLeftColor: brandColor });
    expect(screen.getByText(quote)).toBeInTheDocument();
    expect(screen.getByText(`— ${attribution}`)).toBeInTheDocument();
  });
});
