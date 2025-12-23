import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ImageCaption from '../../../../src/client/components/ArticleLayout/ImageCaption';

describe('ImageCaption Component', () => {
  const defaultProps = {
    src: '/images/test-photo.jpg',
    alt: 'Test image description',
  };

  it('renders image with correct src and alt text', () => {
    render(<ImageCaption {...defaultProps} />);

    const img = screen.getByAltText(defaultProps.alt);
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', defaultProps.src);
  });

  it('has lazy loading attribute', () => {
    render(<ImageCaption {...defaultProps} />);

    const img = screen.getByAltText(defaultProps.alt);
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  it('uses semantic figure element', () => {
    const { container } = render(<ImageCaption {...defaultProps} />);

    const figure = container.querySelector('figure');
    expect(figure).toBeInTheDocument();
    expect(figure).toHaveClass('image-caption');
  });

  it('renders caption when provided', () => {
    const caption = 'The scene shows a beautiful landscape';
    render(<ImageCaption {...defaultProps} caption={caption} />);

    expect(screen.getByText(caption)).toBeInTheDocument();
  });

  it('renders credit when provided', () => {
    const credit = 'Photo by Jane Smith';
    render(<ImageCaption {...defaultProps} credit={credit} />);

    expect(screen.getByText(credit)).toBeInTheDocument();
  });

  it('renders both caption and credit', () => {
    const caption = 'Beautiful landscape';
    const credit = 'Photo by John Doe';
    render(
      <ImageCaption {...defaultProps} caption={caption} credit={credit} />
    );

    expect(screen.getByText(caption)).toBeInTheDocument();
    expect(screen.getByText(credit)).toBeInTheDocument();
  });

  it('does not render figcaption when caption and credit are missing', () => {
    const { container } = render(<ImageCaption {...defaultProps} />);

    const figcaption = container.querySelector('figcaption');
    expect(figcaption).not.toBeInTheDocument();
  });

  it('uses semantic figcaption element when caption or credit present', () => {
    const { container } = render(
      <ImageCaption {...defaultProps} caption="Test caption" />
    );

    const figcaption = container.querySelector('figcaption');
    expect(figcaption).toBeInTheDocument();
  });

  it('handles image load error gracefully', () => {
    render(<ImageCaption {...defaultProps} />);

    const img = screen.getByAltText(defaultProps.alt);
    fireEvent.error(img);

    // After error, alt text should still be visible (in error placeholder)
    expect(screen.getByText(defaultProps.alt)).toBeInTheDocument();
    // Image should no longer be in the document
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('displays error placeholder with alt text on image error', () => {
    const { container } = render(<ImageCaption {...defaultProps} />);

    const img = screen.getByAltText(defaultProps.alt);
    fireEvent.error(img);

    // Error placeholder should exist
    const errorPlaceholder = container.querySelector('.bg-gray-200');
    expect(errorPlaceholder).toBeInTheDocument();
    expect(screen.getByText(defaultProps.alt)).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    const customClass = 'custom-image-class';
    const { container } = render(
      <ImageCaption {...defaultProps} className={customClass} />
    );

    const figure = container.querySelector('figure');
    expect(figure).toHaveClass(customClass);
  });

  it('has proper spacing classes', () => {
    const { container } = render(<ImageCaption {...defaultProps} />);

    const figure = container.querySelector('figure');
    expect(figure).toHaveClass('my-6');
  });

  it('image has responsive classes', () => {
    render(<ImageCaption {...defaultProps} />);

    const img = screen.getByAltText(defaultProps.alt);
    expect(img).toHaveClass('w-full', 'h-auto', 'rounded-sm');
  });

  it('caption has correct styling', () => {
    const { container } = render(
      <ImageCaption {...defaultProps} caption="Test caption" />
    );

    const figcaption = container.querySelector('figcaption');
    expect(figcaption).toHaveClass(
      'mt-2',
      'text-sm',
      'leading-relaxed',
      'italic',
      'text-gray-600'
    );
  });

  it('credit has correct styling', () => {
    const { container } = render(
      <ImageCaption {...defaultProps} credit="Photo credit" />
    );

    const creditSpan = container.querySelector('.image-caption-credit');
    expect(creditSpan).toBeInTheDocument();
    expect(creditSpan).toHaveClass('block', 'mt-1', 'text-xs', 'text-gray-500');
  });

  it('credit is displayed below caption when both present', () => {
    const caption = 'Caption text';
    const credit = 'Credit text';
    const { container } = render(
      <ImageCaption {...defaultProps} caption={caption} credit={credit} />
    );

    const figcaption = container.querySelector('figcaption');
    const creditSpan = container.querySelector('.image-caption-credit');

    expect(figcaption).toContainElement(creditSpan);
  });
});
