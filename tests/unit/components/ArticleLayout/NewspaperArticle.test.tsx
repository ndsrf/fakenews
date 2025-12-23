import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import NewspaperArticle from '../../../../src/client/components/ArticleLayout/NewspaperArticle';

// Mock child components
jest.mock('../../../../src/client/components/ArticleLayout/ArticleHeader', () => ({
  __esModule: true,
  default: ({ title, subtitle, author, publishedAt, category, featuredImage, brandColor }: any) => (
    <div
      data-testid="article-header"
      data-title={title}
      data-subtitle={subtitle}
      data-author={author}
      data-published-at={publishedAt}
      data-category={category}
      data-featured-image={featuredImage}
      data-brand-color={brandColor}
    >
      Header: {title}
    </div>
  ),
}));

jest.mock('../../../../src/client/components/ArticleLayout/ColumnLayout', () => ({
  __esModule: true,
  default: ({ content, brandColor, includeDropCap }: any) => (
    <div
      data-testid="column-layout"
      data-content={content}
      data-brand-color={brandColor}
      data-include-drop-cap={includeDropCap}
    >
      Content
    </div>
  ),
}));

jest.mock('../../../../src/client/components/ArticleLayout/RelatedArticlesSidebar', () => ({
  __esModule: true,
  default: ({ articles, brandColor }: any) => (
    <div
      data-testid="related-sidebar"
      data-articles-count={articles?.length || 0}
      data-brand-color={brandColor}
    >
      Related Articles
    </div>
  ),
}));

describe('NewspaperArticle Component', () => {
  const mockArticle = {
    id: '1',
    title: 'Test Article Title',
    subtitle: 'Test Subtitle',
    content: '<p>Article content here...</p>',
    authorName: 'John Doe',
    publishedAt: '2025-01-15T10:00:00Z',
    category: 'Technology',
    featuredImage: '/images/featured.jpg',
    brand: {
      id: '1',
      name: 'Test Brand',
      primaryColor: '#cc0000',
      secondaryColor: '#333333',
    },
    relatedArticles: [
      {
        id: '2',
        title: 'Related Article 1',
        category: 'Tech',
      },
      {
        id: '3',
        title: 'Related Article 2',
        category: 'Science',
      },
    ],
  };

  it('uses semantic article element', () => {
    const { container } = render(<NewspaperArticle article={mockArticle} />);
    const article = container.querySelector('article');
    expect(article).toBeInTheDocument();
    expect(article).toHaveClass('newspaper-article');
  });

  it('has correct article container styling', () => {
    const { container } = render(<NewspaperArticle article={mockArticle} />);
    const article = container.querySelector('article');
    expect(article).toHaveClass(
      'bg-white',
      'rounded-lg',
      'shadow-lg',
      'p-8',
      'max-w-7xl',
      'mx-auto'
    );
  });

  it('renders ArticleHeader with correct props', () => {
    render(<NewspaperArticle article={mockArticle} />);

    const header = screen.getByTestId('article-header');
    expect(header).toBeInTheDocument();
    expect(header).toHaveAttribute('data-title', mockArticle.title);
    expect(header).toHaveAttribute('data-subtitle', mockArticle.subtitle);
    expect(header).toHaveAttribute('data-author', mockArticle.authorName);
    expect(header).toHaveAttribute('data-published-at', mockArticle.publishedAt);
    expect(header).toHaveAttribute('data-category', mockArticle.category);
    expect(header).toHaveAttribute('data-featured-image', mockArticle.featuredImage);
    expect(header).toHaveAttribute('data-brand-color', mockArticle.brand.primaryColor);
  });

  it('renders ColumnLayout with correct props', () => {
    render(<NewspaperArticle article={mockArticle} />);

    const columnLayout = screen.getByTestId('column-layout');
    expect(columnLayout).toBeInTheDocument();
    expect(columnLayout).toHaveAttribute('data-content', mockArticle.content);
    expect(columnLayout).toHaveAttribute('data-brand-color', mockArticle.brand.primaryColor);
    expect(columnLayout).toHaveAttribute('data-include-drop-cap', 'true');
  });

  it('has responsive grid layout', () => {
    const { container } = render(<NewspaperArticle article={mockArticle} />);
    const grid = container.querySelector('.grid');
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveClass('grid-cols-1', 'lg:grid-cols-3', 'gap-8');
  });

  it('main content area has correct column span', () => {
    const { container } = render(<NewspaperArticle article={mockArticle} />);
    const mainContent = container.querySelector('.lg\\:col-span-2');
    expect(mainContent).toBeInTheDocument();
    expect(mainContent).toContainElement(screen.getByTestId('column-layout'));
  });

  it('renders RelatedArticlesSidebar when related articles exist', () => {
    render(<NewspaperArticle article={mockArticle} />);

    const sidebar = screen.getByTestId('related-sidebar');
    expect(sidebar).toBeInTheDocument();
    expect(sidebar).toHaveAttribute('data-articles-count', '2');
    expect(sidebar).toHaveAttribute('data-brand-color', mockArticle.brand.primaryColor);
  });

  it('sidebar has correct column span', () => {
    const { container } = render(<NewspaperArticle article={mockArticle} />);
    const sidebarContainer = container.querySelector('.lg\\:col-span-1');
    expect(sidebarContainer).toBeInTheDocument();
    expect(sidebarContainer).toContainElement(screen.getByTestId('related-sidebar'));
  });

  it('does not render sidebar when relatedArticles is empty array', () => {
    const articleWithoutRelated = {
      ...mockArticle,
      relatedArticles: [],
    };
    render(<NewspaperArticle article={articleWithoutRelated} />);

    expect(screen.queryByTestId('related-sidebar')).not.toBeInTheDocument();
  });

  it('does not render sidebar when relatedArticles is undefined', () => {
    const articleWithoutRelated = {
      ...mockArticle,
      relatedArticles: undefined,
    };
    render(<NewspaperArticle article={articleWithoutRelated as any} />);

    expect(screen.queryByTestId('related-sidebar')).not.toBeInTheDocument();
  });

  it('propagates brand color to all child components', () => {
    const customBrandColor = '#0066cc';
    const articleWithCustomColor = {
      ...mockArticle,
      brand: {
        ...mockArticle.brand,
        primaryColor: customBrandColor,
      },
    };
    render(<NewspaperArticle article={articleWithCustomColor} />);

    const header = screen.getByTestId('article-header');
    const columnLayout = screen.getByTestId('column-layout');
    const sidebar = screen.getByTestId('related-sidebar');

    expect(header).toHaveAttribute('data-brand-color', customBrandColor);
    expect(columnLayout).toHaveAttribute('data-brand-color', customBrandColor);
    expect(sidebar).toHaveAttribute('data-brand-color', customBrandColor);
  });

  it('renders without subtitle when not provided', () => {
    const articleWithoutSubtitle = {
      ...mockArticle,
      subtitle: undefined,
    };
    render(<NewspaperArticle article={articleWithoutSubtitle as any} />);

    const header = screen.getByTestId('article-header');
    expect(header).not.toHaveAttribute('data-subtitle');
  });

  it('renders without featured image when not provided', () => {
    const articleWithoutImage = {
      ...mockArticle,
      featuredImage: undefined,
    };
    render(<NewspaperArticle article={articleWithoutImage as any} />);

    const header = screen.getByTestId('article-header');
    expect(header).not.toHaveAttribute('data-featured-image');
  });

  it('renders all three main components in correct order', () => {
    const { container } = render(<NewspaperArticle article={mockArticle} />);

    const article = container.querySelector('article');
    const children = Array.from(article?.children || []);

    // ArticleHeader should be first
    expect(children[0]).toContainElement(screen.getByTestId('article-header'));

    // Grid with content should be second
    expect(children[1]).toHaveClass('grid');
  });

  it('renders with minimal article data', () => {
    const minimalArticle = {
      id: '1',
      title: 'Minimal Title',
      content: '<p>Content</p>',
      authorName: 'Author',
      publishedAt: '2025-01-15T10:00:00Z',
      category: 'News',
      brand: {
        id: '1',
        name: 'Brand',
        primaryColor: '#000000',
        secondaryColor: '#ffffff',
      },
    };

    render(<NewspaperArticle article={minimalArticle as any} />);

    expect(screen.getByTestId('article-header')).toBeInTheDocument();
    expect(screen.getByTestId('column-layout')).toBeInTheDocument();
    expect(screen.queryByTestId('related-sidebar')).not.toBeInTheDocument();
  });

  it('grid layout contains both main content and sidebar areas', () => {
    const { container } = render(<NewspaperArticle article={mockArticle} />);

    const grid = container.querySelector('.grid');
    const mainArea = grid?.querySelector('.lg\\:col-span-2');
    const sidebarArea = grid?.querySelector('.lg\\:col-span-1');

    expect(mainArea).toBeInTheDocument();
    expect(sidebarArea).toBeInTheDocument();
  });

  it('includeDropCap is always true for ColumnLayout', () => {
    render(<NewspaperArticle article={mockArticle} />);

    const columnLayout = screen.getByTestId('column-layout');
    expect(columnLayout).toHaveAttribute('data-include-drop-cap', 'true');
  });
});
