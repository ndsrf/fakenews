/**
 * TypeScript interfaces for newspaper layout components
 *
 * These interfaces define the props for all newspaper article layout components,
 * providing type safety and documentation for component usage.
 */

import { ReactNode } from 'react';

/**
 * Core article interface (extends the Article type from PublicArticle.tsx)
 */
export interface Article {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  excerpt: string;
  slug: string;
  language: string;
  category: string;
  authorName: string;
  featuredImage?: string;
  tags: string[];
  publishedAt: string;
  brand: {
    id: string;
    name: string;
    tagline?: string;
    logoUrl?: string;
    primaryColor: string;
    accentColor: string;
  };
  relatedArticles: RelatedArticle[];
}

/**
 * Related article interface
 */
export interface RelatedArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt?: string;
  featuredImage?: string;
  brandSlug?: string;
  publishedAt?: string;
}

/**
 * Props for the DropCap component
 * Renders the first character of text as a decorative drop cap
 */
export interface DropCapProps {
  /** The text content (first character will be styled as drop cap) */
  children: string;
  /** Optional brand color to apply to the drop cap */
  brandColor?: string;
}

/**
 * Props for the PullQuote component
 * Displays a styled blockquote with decorative elements
 */
export interface PullQuoteProps {
  /** The quote text content (can be ReactNode for rich content) */
  children: ReactNode;
  /** Optional attribution text (author/source) */
  attribution?: string;
  /** Optional brand color for border/accent */
  brandColor?: string;
}

/**
 * Props for the ImageCaption component
 * Renders an image with caption and optional photo credit
 */
export interface ImageCaptionProps {
  /** Image source URL */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Caption text describing the image */
  caption?: string;
  /** Photo credit/attribution */
  credit?: string;
  /** Optional CSS class names */
  className?: string;
}

/**
 * Props for the ArticleHeader component
 * Displays article title, metadata, and optional featured image
 */
export interface ArticleHeaderProps {
  /** Article title */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Author name */
  author: string;
  /** Publication date */
  publishedAt: string;
  /** Article category */
  category: string;
  /** Optional estimated read time in minutes */
  readTime?: number;
  /** Optional featured image URL */
  featuredImage?: string;
  /** Brand primary color for category accent */
  brandColor?: string;
}

/**
 * Props for the RelatedArticlesSidebar component
 * Displays a list of related articles in a sidebar (sticky on desktop)
 */
export interface RelatedArticlesSidebarProps {
  /** Array of related articles to display */
  articles: RelatedArticle[];
  /** Optional brand color for badges/links */
  brandColor?: string;
  /** Optional callback when an article is clicked */
  onArticleClick?: (articleId: string) => void;
}

/**
 * Props for the ColumnLayout component
 * Parses HTML content and distributes it into newspaper-style columns
 */
export interface ColumnLayoutProps {
  /** HTML content string to parse and render */
  content: string;
  /** Brand primary color for styling elements */
  brandColor?: string;
  /** Whether to apply drop cap to first paragraph (default: true) */
  includeDropCap?: boolean;
}

/**
 * Props for the NewspaperArticle wrapper component
 * Main orchestration component that composes all layout elements
 */
export interface NewspaperArticleProps {
  /** Complete article data */
  article: Article;
}
