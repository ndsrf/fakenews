import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DisclaimerBanner from '../../../../src/client/components/PublicArticle/DisclaimerBanner';

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'disclaimer.banner': 'This is a fictional news article created for entertainment purposes only.',
      };
      return translations[key] || key;
    },
  }),
}));

describe('DisclaimerBanner', () => {
  it('should render the disclaimer banner', () => {
    render(<DisclaimerBanner />);

    const disclaimer = screen.getByText(/fictional news article/i);
    expect(disclaimer).toBeInTheDocument();
  });

  it('should have sticky positioning', () => {
    const { container } = render(<DisclaimerBanner />);

    const banner = container.querySelector('.sticky');
    expect(banner).toBeInTheDocument();
  });

  it('should have yellow warning styling', () => {
    const { container } = render(<DisclaimerBanner />);

    const banner = container.querySelector('.bg-yellow-100');
    expect(banner).toBeInTheDocument();

    const text = container.querySelector('.text-yellow-900');
    expect(text).toBeInTheDocument();
  });

  it('should have high z-index for visibility', () => {
    const { container } = render(<DisclaimerBanner />);

    const banner = container.querySelector('.z-50');
    expect(banner).toBeInTheDocument();
  });

  it('should be centered in container', () => {
    const { container } = render(<DisclaimerBanner />);

    const content = container.querySelector('.justify-center');
    expect(content).toBeInTheDocument();
  });
});
