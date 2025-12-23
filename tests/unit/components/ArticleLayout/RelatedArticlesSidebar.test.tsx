import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RelatedArticlesSidebar from '../../../../src/client/components/ArticleLayout/RelatedArticlesSidebar';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue: string) => defaultValue,
  }),
}));

describe('RelatedArticlesSidebar Component', () => {
  const mockArticles = [
    {
      id: '1',
      title: 'First Related Article',
      category: 'Technology',
      featuredImage: '/images/article1.jpg',
    },
    {
      id: '2',
      title: 'Second Related Article',
      category: 'Science',
      featuredImage: '/images/article2.jpg',
    },
    {
      id: '3',
      title: 'Third Related Article Without Image',
      category: 'World',
    },
  ];

  it('renders nothing when articles array is empty', () => {
    const { container } = render(<RelatedArticlesSidebar articles={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when articles is undefined', () => {
    const { container } = render(
      <RelatedArticlesSidebar articles={undefined as any} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders heading for related articles', () => {
    render(<RelatedArticlesSidebar articles={mockArticles} />);
    expect(screen.getByText('Related Articles')).toBeInTheDocument();
  });

  it('uses semantic aside element', () => {
    const { container } = render(
      <RelatedArticlesSidebar articles={mockArticles} />
    );
    const aside = container.querySelector('aside');
    expect(aside).toBeInTheDocument();
    expect(aside).toHaveClass('related-articles');
  });

  it('has sticky positioning CSS classes', () => {
    const { container } = render(
      <RelatedArticlesSidebar articles={mockArticles} />
    );
    const aside = container.querySelector('aside');
    expect(aside).toHaveClass('lg:sticky', 'lg:top-24');
  });

  it('renders all article titles', () => {
    render(<RelatedArticlesSidebar articles={mockArticles} />);
    expect(screen.getAllByText('First Related Article')).toHaveLength(2); // Desktop + mobile
    expect(screen.getAllByText('Second Related Article')).toHaveLength(2);
    expect(
      screen.getAllByText('Third Related Article Without Image')
    ).toHaveLength(2);
  });

  it('renders all article categories', () => {
    render(<RelatedArticlesSidebar articles={mockArticles} />);
    expect(screen.getAllByText('Technology')).toHaveLength(2); // Desktop + mobile
    expect(screen.getAllByText('Science')).toHaveLength(2);
    expect(screen.getAllByText('World')).toHaveLength(2);
  });

  it('renders thumbnails when featuredImage is provided', () => {
    render(<RelatedArticlesSidebar articles={mockArticles} />);
    const images = screen.getAllByAltText('First Related Article');
    expect(images.length).toBeGreaterThan(0);
    expect(images[0]).toHaveAttribute('src', '/images/article1.jpg');
  });

  it('does not render thumbnail when featuredImage is missing', () => {
    render(<RelatedArticlesSidebar articles={mockArticles} />);
    // Third article has no image, so shouldn't have an img with that alt text
    const images = screen.queryAllByAltText(
      'Third Related Article Without Image'
    );
    // Should have no images (no alt text match)
    expect(images).toHaveLength(0);
  });

  it('applies brand color to category badges', () => {
    const brandColor = '#cc0000';
    const { container } = render(
      <RelatedArticlesSidebar articles={mockArticles} brandColor={brandColor} />
    );

    const badges = container.querySelectorAll('.inline-block.text-xs');
    badges.forEach((badge) => {
      expect(badge).toHaveStyle({ backgroundColor: brandColor });
    });
  });

  it('renders without brand color styling when not provided', () => {
    const { container } = render(
      <RelatedArticlesSidebar articles={mockArticles} />
    );

    const firstBadge = container.querySelector('.inline-block.text-xs');
    expect(firstBadge).not.toHaveAttribute('style');
  });

  it('calls onArticleClick when article is clicked', () => {
    const mockOnClick = jest.fn();
    render(
      <RelatedArticlesSidebar
        articles={mockArticles}
        onArticleClick={mockOnClick}
      />
    );

    // Click the first article in desktop view
    const buttons = screen.getAllByRole('button');
    const firstDesktopButton = buttons[0];
    fireEvent.click(firstDesktopButton);

    expect(mockOnClick).toHaveBeenCalledWith('1');
  });

  it('handles missing onArticleClick gracefully', () => {
    render(<RelatedArticlesSidebar articles={mockArticles} />);

    const buttons = screen.getAllByRole('button');
    // Should not throw error when clicked
    expect(() => fireEvent.click(buttons[0])).not.toThrow();
  });

  it('renders desktop layout with flex-col', () => {
    const { container } = render(
      <RelatedArticlesSidebar articles={mockArticles} />
    );

    const desktopContainer = container.querySelector('.hidden.lg\\:flex');
    expect(desktopContainer).toBeInTheDocument();
    expect(desktopContainer).toHaveClass('flex-col', 'gap-4');
  });

  it('renders mobile/tablet layout with horizontal scroll', () => {
    const { container } = render(
      <RelatedArticlesSidebar articles={mockArticles} />
    );

    const mobileContainer = container.querySelector('.lg\\:hidden.overflow-x-auto');
    expect(mobileContainer).toBeInTheDocument();
  });

  it('article cards have correct styling classes', () => {
    const { container } = render(
      <RelatedArticlesSidebar articles={mockArticles} />
    );

    const cards = container.querySelectorAll('.related-article-card');
    expect(cards.length).toBeGreaterThan(0);
    cards.forEach((card) => {
      expect(card).toHaveClass('text-left');
    });
  });

  it('thumbnail images have correct CSS class', () => {
    const { container } = render(
      <RelatedArticlesSidebar articles={mockArticles} />
    );

    const thumbnails = container.querySelectorAll('.related-article-thumbnail');
    expect(thumbnails.length).toBeGreaterThan(0);
    thumbnails.forEach((thumbnail) => {
      expect(thumbnail).toHaveClass('mb-2');
    });
  });

  it('category badges have correct styling', () => {
    const { container } = render(
      <RelatedArticlesSidebar articles={mockArticles} brandColor="#0066cc" />
    );

    const badges = container.querySelectorAll('.inline-block.text-xs');
    badges.forEach((badge) => {
      expect(badge).toHaveClass(
        'px-2',
        'py-0.5',
        'rounded',
        'text-white'
      );
    });
  });

  it('renders correct number of articles', () => {
    render(<RelatedArticlesSidebar articles={mockArticles} />);
    const buttons = screen.getAllByRole('button');
    // 3 articles × 2 (desktop + mobile) = 6 buttons
    expect(buttons).toHaveLength(6);
  });

  it('article titles are clamped to 2 lines', () => {
    const { container } = render(
      <RelatedArticlesSidebar articles={mockArticles} />
    );

    const titles = container.querySelectorAll('h3');
    titles.forEach((title) => {
      expect(title).toHaveClass('line-clamp-2');
    });
  });
});
