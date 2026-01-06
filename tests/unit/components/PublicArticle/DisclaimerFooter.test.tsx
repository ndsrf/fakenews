import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DisclaimerFooter from '../../../../src/client/components/PublicArticle/DisclaimerFooter';

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'disclaimer.footer.title': 'Important Disclaimer',
        'disclaimer.footer.content': 'This article is entirely fictional and created for entertainment. Any resemblance to real events or people is purely coincidental.',
      };
      return translations[key] || key;
    },
  }),
}));

describe('DisclaimerFooter', () => {
  it('should render the disclaimer footer', () => {
    render(<DisclaimerFooter />);

    const title = screen.getByText(/important disclaimer/i);
    expect(title).toBeInTheDocument();
  });

  it('should display disclaimer content', () => {
    render(<DisclaimerFooter />);

    const content = screen.getByText(/entirely fictional/i);
    expect(content).toBeInTheDocument();
  });

  it('should use semantic footer element', () => {
    const { container } = render(<DisclaimerFooter />);

    const footer = container.querySelector('footer');
    expect(footer).toBeInTheDocument();
  });

  it('should have gray background styling', () => {
    const { container } = render(<DisclaimerFooter />);

    const footer = container.querySelector('.bg-gray-100');
    expect(footer).toBeInTheDocument();
  });

  it('should have top border', () => {
    const { container } = render(<DisclaimerFooter />);

    const footer = container.querySelector('.border-t-2');
    expect(footer).toBeInTheDocument();
  });

  it('should have responsive margins', () => {
    const { container } = render(<DisclaimerFooter />);

    const footer = container.querySelector('.mt-12');
    expect(footer).toBeInTheDocument();
  });

  it('should render title as h3', () => {
    render(<DisclaimerFooter />);

    const title = screen.getByRole('heading', { level: 3 });
    expect(title).toBeInTheDocument();
  });
});
