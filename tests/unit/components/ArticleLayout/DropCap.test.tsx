import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DropCap from '../../../../src/client/components/ArticleLayout/DropCap';

describe('DropCap Component', () => {
  it('renders the first character as drop cap', () => {
    const text = 'The story begins here...';
    const { container } = render(<DropCap>{text}</DropCap>);

    // Check that the first character is in the drop cap span
    const dropCapSpan = container.querySelector('span');
    expect(dropCapSpan).toHaveTextContent('T');
    expect(dropCapSpan).toHaveClass('float-left');

    // Check that the rest of the text is rendered
    expect(screen.getByText('he story begins here...', { exact: false })).toBeInTheDocument();
  });

  it('applies brand color when provided', () => {
    const text = 'Test text';
    const brandColor = '#cc0000';
    const { container } = render(<DropCap brandColor={brandColor}>{text}</DropCap>);

    const dropCapSpan = container.querySelector('span');
    expect(dropCapSpan).toHaveStyle({ color: brandColor });
  });

  it('renders with default styling when no brand color provided', () => {
    const text = 'Test text';
    const { container } = render(<DropCap>{text}</DropCap>);

    const dropCapSpan = container.querySelector('span');
    expect(dropCapSpan).not.toHaveAttribute('style');
  });

  it('handles empty string gracefully', () => {
    const { container } = render(<DropCap>{''}</DropCap>);
    expect(container.firstChild).toBeNull();
  });

  it('handles Unicode characters', () => {
    const text = '日本語テキスト';
    render(<DropCap>{text}</DropCap>);
    expect(screen.getByText('日', { exact: false })).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    const text = 'Accessible text';
    const { container } = render(<DropCap>{text}</DropCap>);

    const dropCapSpan = container.querySelector('span');
    expect(dropCapSpan).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies correct CSS classes for styling', () => {
    const text = 'Styled text';
    const { container } = render(<DropCap>{text}</DropCap>);

    const dropCapSpan = container.querySelector('span');
    expect(dropCapSpan).toHaveClass('float-left', 'text-6xl', 'font-bold');
  });
});
