import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import Watermark from '../../../../src/client/components/PublicArticle/Watermark';

describe('Watermark', () => {
  it('should render FICTIONAL text', () => {
    const { container } = render(<Watermark />);

    const watermarkText = container.textContent;
    expect(watermarkText).toContain('FICTIONAL');
  });

  it('should have fixed positioning', () => {
    const { container } = render(<Watermark />);

    const wrapper = container.querySelector('.fixed');
    expect(wrapper).toBeInTheDocument();
  });

  it('should have pointer-events-none to allow interaction with content beneath', () => {
    const { container } = render(<Watermark />);

    const wrapper = container.querySelector('.pointer-events-none');
    expect(wrapper).toBeInTheDocument();
  });

  it('should have low z-index to stay behind content', () => {
    const { container } = render(<Watermark />);

    const wrapper = container.querySelector('.z-0');
    expect(wrapper).toBeInTheDocument();
  });

  it('should be rotated -45 degrees', () => {
    const { container } = render(<Watermark />);

    const text = container.querySelector('.rotate-\\[-45deg\\]');
    expect(text).toBeInTheDocument();
  });

  it('should have very low opacity', () => {
    const { container } = render(<Watermark />);

    const text = container.querySelector('.opacity-\\[0\\.03\\]');
    expect(text).toBeInTheDocument();
  });

  it('should be centered on the page', () => {
    const { container } = render(<Watermark />);

    const centerContainer = container.querySelector('.items-center');
    expect(centerContainer).toBeInTheDocument();

    const justifyCenter = container.querySelector('.justify-center');
    expect(justifyCenter).toBeInTheDocument();
  });

  it('should not be selectable', () => {
    const { container } = render(<Watermark />);

    const text = container.querySelector('.select-none');
    expect(text).toBeInTheDocument();
  });

  it('should have large text size', () => {
    const { container } = render(<Watermark />);

    const text = container.querySelector('.text-8xl');
    expect(text).toBeInTheDocument();
  });
});
