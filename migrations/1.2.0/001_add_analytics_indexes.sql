-- Description: Add indexes for analytics query performance optimization
-- Version: 1.2.0
-- Date: 2024-12-14
-- Purpose: Improve query performance for analytics dashboard and reporting

-- Add index on PageView timestamp for time-series queries
CREATE INDEX IF NOT EXISTS idx_pageview_timestamp ON PageView(timestamp);

-- Add index on PageView articleId for article-specific analytics
CREATE INDEX IF NOT EXISTS idx_pageview_articleid ON PageView(articleId);

-- Add index on PageView country for geographic distribution queries
CREATE INDEX IF NOT EXISTS idx_pageview_country ON PageView(country);

-- Add index on Article status for filtering published articles
CREATE INDEX IF NOT EXISTS idx_article_status ON Article(status);

-- Add index on Article publishedAt for date-based queries
CREATE INDEX IF NOT EXISTS idx_article_publishedat ON Article(publishedAt);
