import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ArticleHeader from '../../../../src/client/components/ArticleLayout/ArticleHeader';

describe('ArticleHeader Component', () => {
  const defaultProps = {
    title: 'Major News Event Occurs',
    author: 'Jane Reporter',
    publishedAt: '2025-01-15T10:00:00Z',
    category: 'World News',
  };

  it('renders title correctly', () => {
    render(<ArticleHeader {...defaultProps} />);
    expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    const subtitle = 'Details are still emerging';
    render(<ArticleHeader {...defaultProps} subtitle={subtitle} />);
    expect(screen.getByText(subtitle)).toBeInTheDocument();
  });

  it('does not render subtitle when not provided', () => {
    const { container } = render(<ArticleHeader {...defaultProps} />);
    // Check that there's no paragraph element with subtitle text
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs.length).toBeLessThanOrEqual(1); // Only potential byline elements
  });

  it('renders author name', () => {
    render(<ArticleHeader {...defaultProps} />);
    expect(screen.getByText(defaultProps.author)).toBeInTheDocument();
  });

  it('renders formatted date', () => {
    render(<ArticleHeader {...defaultProps} />);
    // Date should be formatted as "Month Day, Year"
    expect(screen.getByText(/January 15, 2025/i)).toBeInTheDocument();
  });

  it('renders category', () => {
    render(<ArticleHeader {...defaultProps} />);
    expect(screen.getByText(defaultProps.category)).toBeInTheDocument();
  });

  it('renders read time when provided', () => {
    const readTime = 5;
    render(<ArticleHeader {...defaultProps} readTime={readTime} />);
    expect(screen.getByText(`${readTime} min read`)).toBeInTheDocument();
  });

  it('does not render read time when not provided', () => {
    render(<ArticleHeader {...defaultProps} />);
    expect(screen.queryByText(/min read/i)).not.toBeInTheDocument();
  });

  it('applies brand color to category badge', () => {
    const brandColor = '#cc0000';
    const { container } = render(
      <ArticleHeader {...defaultProps} brandColor={brandColor} />
    );

    const categorySpan = screen.getByText(defaultProps.category);
    expect(categorySpan).toHaveStyle({ backgroundColor: brandColor });
  });

  it('renders without brand color styling when not provided', () => {
    render(<ArticleHeader {...defaultProps} />);
    const categorySpan = screen.getByText(defaultProps.category);
    expect(categorySpan).not.toHaveAttribute('style');
  });

  it('uses semantic header element', () => {
    const { container } = render(<ArticleHeader {...defaultProps} />);
    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass('article-header');
  });

  it('uses semantic time element with datetime attribute', () => {
    const { container } = render(<ArticleHeader {...defaultProps} />);
    const time = container.querySelector('time');
    expect(time).toBeInTheDocument();
    expect(time).toHaveAttribute('datetime', defaultProps.publishedAt);
  });

  it('has bullet separators in byline', () => {
    render(<ArticleHeader {...defaultProps} readTime={5} />);
    const bullets = screen.getAllByText('•');
    // Should have 3 bullets: after author, after date, after category (before read time)
    expect(bullets.length).toBeGreaterThanOrEqual(2);
  });

  describe('with featured image', () => {
    const featuredImage = '/images/featured.jpg';

    it('renders featured image', () => {
      render(
        <ArticleHeader {...defaultProps} featuredImage={featuredImage} />
      );
      const img = screen.getByAltText(defaultProps.title);
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', featuredImage);
    });

    it('displays title over featured image', () => {
      const { container } = render(
        <ArticleHeader {...defaultProps} featuredImage={featuredImage} />
      );
      // Title should be in absolute positioned div
      const absoluteDiv = container.querySelector('.absolute.bottom-0');
      expect(absoluteDiv).toBeInTheDocument();
      expect(absoluteDiv).toHaveTextContent(defaultProps.title);
    });

    it('displays subtitle over featured image when provided', () => {
      const subtitle = 'Breaking details';
      const { container } = render(
        <ArticleHeader
          {...defaultProps}
          subtitle={subtitle}
          featuredImage={featuredImage}
        />
      );
      const absoluteDiv = container.querySelector('.absolute.bottom-0');
      expect(absoluteDiv).toHaveTextContent(subtitle);
    });

    it('has gradient overlay on featured image', () => {
      const { container } = render(
        <ArticleHeader {...defaultProps} featuredImage={featuredImage} />
      );
      const gradient = container.querySelector('.bg-gradient-to-t');
      expect(gradient).toBeInTheDocument();
      expect(gradient).toHaveClass('from-black/70', 'to-transparent');
    });

    it('title has larger font size on featured image', () => {
      const { container } = render(
        <ArticleHeader {...defaultProps} featuredImage={featuredImage} />
      );
      const title = screen.getByText(defaultProps.title);
      expect(title).toHaveClass('text-5xl');
    });
  });

  describe('without featured image', () => {
    it('does not render image element', () => {
      render(<ArticleHeader {...defaultProps} />);
      const img = screen.queryByRole('img');
      expect(img).not.toBeInTheDocument();
    });

    it('title has standard styling', () => {
      render(<ArticleHeader {...defaultProps} />);
      const title = screen.getByText(defaultProps.title);
      expect(title).toHaveClass('text-4xl', 'font-bold', 'text-gray-900');
    });

    it('subtitle has standard styling when provided', () => {
      const subtitle = 'Test subtitle';
      render(<ArticleHeader {...defaultProps} subtitle={subtitle} />);
      const subtitleElement = screen.getByText(subtitle);
      expect(subtitleElement).toHaveClass('text-xl', 'text-gray-700');
    });
  });

  it('byline has correct CSS classes', () => {
    const { container } = render(<ArticleHeader {...defaultProps} />);
    const byline = container.querySelector('.article-byline');
    expect(byline).toBeInTheDocument();
    expect(byline).toHaveClass('flex', 'flex-wrap', 'items-center', 'gap-2');
  });

  it('category badge has correct styling', () => {
    render(<ArticleHeader {...defaultProps} brandColor="#cc0000" />);
    const categorySpan = screen.getByText(defaultProps.category);
    expect(categorySpan).toHaveClass(
      'px-2',
      'py-0.5',
      'rounded',
      'text-white',
      'font-medium'
    );
  });

  it('handles all optional fields together', () => {
    const allProps = {
      ...defaultProps,
      subtitle: 'Full subtitle',
      readTime: 7,
      featuredImage: '/images/test.jpg',
      brandColor: '#0066cc',
    };
    render(<ArticleHeader {...allProps} />);

    expect(screen.getByText(allProps.title)).toBeInTheDocument();
    expect(screen.getByText(allProps.subtitle)).toBeInTheDocument();
    expect(screen.getByText(`${allProps.readTime} min read`)).toBeInTheDocument();
    expect(screen.getByAltText(allProps.title)).toBeInTheDocument();
  });
});
