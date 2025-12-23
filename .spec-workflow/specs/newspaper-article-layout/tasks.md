# Tasks Document

## Implementation Instructions

After completing each task:
1. Update this file: Change `[ ]` to `[-]` when starting a task
2. Implement the task following the _Prompt guidelines
3. **Log implementation** using the `log-implementation` tool with detailed artifacts
4. Update this file: Change `[-]` to `[x]` when task is completed and logged

## Tasks

- [x] 1. Create base newspaper CSS module
  - File: src/client/styles/newspaper.css
  - Create foundational CSS for newspaper layout (typography, column utilities, drop cap base, pull quote base)
  - Configure CSS to load before template styles in cascade order
  - Purpose: Provide base styling layer that templates can override
  - _Leverage: src/client/styles/globals.css (existing CSS structure)_
  - _Requirements: 1.1, 1.2, 1.3, 1.5, 1.6_
  - _Prompt: Implement the task for spec newspaper-article-layout, first run spec-workflow-guide to get the workflow guide then implement the task: | Role: Frontend CSS Developer specializing in newspaper design and typography | Task: Create base newspaper.css module with professional newspaper typography (serif body, sans-serif headings), column layout utilities, drop cap base styles, and pull quote foundation following requirements 1.1, 1.2, 1.3, 1.5, 1.6. Ensure styles have low specificity to allow template overrides. | Restrictions: Keep file size under 5KB, use only CSS (no preprocessors), maintain compatibility with existing globals.css, ensure responsive breakpoints match project (mobile <768px, tablet 768-1023px, desktop ≥1024px), do not conflict with Tailwind utilities | _Leverage: src/client/styles/globals.css for existing patterns_ | Success: CSS file created with newspaper typography, column utilities defined, drop cap and pull quote base styles implemented, file size <5KB, no conflicts with existing styles, responsive at all breakpoints_

- [x] 2. Update Tailwind configuration for newspaper typography
  - File: tailwind.config.js
  - Add custom font families (serif for body, enhanced sans-serif for headings)
  - Add custom prose styles for newspaper content
  - Purpose: Extend Tailwind with newspaper-specific typography utilities
  - _Leverage: tailwind.config.js (existing configuration)_
  - _Requirements: 1.2, 1.6_
  - _Prompt: Implement the task for spec newspaper-article-layout, first run spec-workflow-guide to get the workflow guide then implement the task: | Role: Frontend Developer with expertise in Tailwind CSS configuration | Task: Extend tailwind.config.js to add custom font families (serif fonts like Georgia, Merriweather for body; enhanced sans-serif like Inter, Roboto for headings) and configure prose plugin with newspaper-appropriate styles following requirements 1.2 and 1.6. | Restrictions: Do not remove existing configuration, ensure font fallbacks for system fonts, maintain existing theme.extend structure, test that existing styles still work | _Leverage: existing tailwind.config.js structure_ | Success: Serif and sans-serif font families added to theme, prose plugin configured with newspaper styles, existing configuration preserved, fonts load with proper fallbacks_

- [x] 3. Create TypeScript interfaces for article layout components
  - File: src/client/types/articleLayout.ts (new file)
  - Define interfaces for all component props (NewspaperArticleProps, DropCapProps, PullQuoteProps, ImageCaptionProps, ArticleHeaderProps, RelatedArticlesSidebarProps, ColumnLayoutProps)
  - Purpose: Establish type safety for newspaper layout components
  - _Leverage: src/client/pages/PublicArticle.tsx (existing Article interface at lines 9-31)_
  - _Requirements: All (component contracts)_
  - _Prompt: Implement the task for spec newspaper-article-layout, first run spec-workflow-guide to get the workflow guide then implement the task: | Role: TypeScript Developer specializing in React component type definitions | Task: Create comprehensive TypeScript interfaces for all newspaper layout component props (NewspaperArticleProps, DropCapProps, PullQuoteProps, ImageCaptionProps, ArticleHeaderProps, RelatedArticlesSidebarProps, ColumnLayoutProps) following the component specifications in the design document. Extend existing Article interface from PublicArticle.tsx. | Restrictions: Use strict TypeScript, mark optional props with ?, include JSDoc comments for complex interfaces, do not duplicate Article interface (import and extend it), ensure all brand color props are optional strings | _Leverage: src/client/pages/PublicArticle.tsx lines 9-31 for Article interface_ | Success: All component interfaces defined with proper types, Article interface extended correctly, optional props marked, JSDoc comments added, strict TypeScript compliance_

- [x] 4. Create DropCap component
  - File: src/client/components/ArticleLayout/DropCap.tsx
  - Implement decorative first-letter component with brand color support
  - Apply 2-3 line height with proper float and margin
  - Purpose: Provide newspaper-style drop cap for article opening
  - _Leverage: Brand color injection pattern from src/client/pages/PublicArticle.tsx:129_
  - _Requirements: 1.2_
  - _Prompt: Implement the task for spec newspaper-article-layout, first run spec-workflow-guide to get the workflow guide then implement the task: | Role: React Component Developer specializing in typography and styling | Task: Create DropCap component that renders the first character of article text as a decorative 2-3 line drop cap following requirement 1.2. Accept children (string) and optional brandColor prop. Use CSS float for proper text wrapping. | Restrictions: Use Tailwind classes where possible, supplement with inline styles only for brand color, ensure proper margin/padding for text flow, make it accessible (aria-hidden on decorative elements), test with various characters including Unicode | _Leverage: Brand color injection pattern from PublicArticle.tsx:129 style={{ color: article.brand.primaryColor }}_ | Success: Component renders first character at 2-3 line height, text flows correctly around drop cap, brand color applies when provided, accessible markup, works with all characters_

- [x] 5. Create PullQuote component
  - File: src/client/components/ArticleLayout/PullQuote.tsx
  - Implement styled blockquote with decorative quotation marks, brand color border, and attribution support
  - Ensure minimum 2rem spacing above/below
  - Purpose: Highlight important quotes with professional newspaper styling
  - _Leverage: Brand color pattern from PublicArticle.tsx, i18n from DisclaimerBanner.tsx:13_
  - _Requirements: 1.3_
  - _Prompt: Implement the task for spec newspaper-article-layout, first run spec-workflow-guide to get the workflow guide then implement the task: | Role: React Component Developer with expertise in semantic HTML and quotation design | Task: Create PullQuote component for blockquote elements with larger font size (1.25rem), decorative quotation marks (CSS ::before/::after), brand color border accent, and optional attribution text following requirement 1.3. | Restrictions: Use semantic <blockquote> element, add decorative quotes via CSS pseudo-elements, ensure 2rem minimum spacing (my-8), make attribution italic/smaller, support children as ReactNode for rich content, apply brand color to left border or background tint | _Leverage: Brand color pattern from PublicArticle.tsx, react-i18next if needed for attribution formatting_ | Success: Blockquotes render with enhanced styling, decorative quotation marks appear, brand color accent applied, attribution displays correctly, proper spacing enforced, semantic HTML maintained_

- [x] 6. Create ImageCaption component
  - File: src/client/components/ArticleLayout/ImageCaption.tsx
  - Implement image with caption and photo credit display
  - Add lazy loading and error handling
  - Purpose: Professional image presentation with attribution
  - _Leverage: Image rendering from PublicArticle.tsx:154-160_
  - _Requirements: 1.5_
  - _Prompt: Implement the task for spec newspaper-article-layout, first run spec-workflow-guide to get the workflow guide then implement the task: | Role: React Component Developer specializing in media handling and accessibility | Task: Create ImageCaption component that renders responsive images with caption and photo credit sections following requirement 1.5. Include lazy loading, alt text support, and error handling for broken images. | Restrictions: Use semantic <figure> and <figcaption> elements, implement lazy loading (loading="lazy"), handle image errors with onError handler, ensure alt text is always provided, make captions italic/smaller and credits even smaller gray text, maintain 1.5rem spacing from surrounding content | _Leverage: Image pattern from PublicArticle.tsx:154-160_ | Success: Images render responsively with proper lazy loading, captions and credits display correctly, broken images handled gracefully with alt text, semantic HTML structure, proper spacing maintained_

- [x] 7. Create ArticleHeader component
  - File: src/client/components/ArticleLayout/ArticleHeader.tsx
  - Implement article header with title, subtitle, byline, metadata, and optional featured image with gradient overlay
  - Display author, date, read time, and category with brand color accents
  - Purpose: Professional article header matching newspaper standards
  - _Leverage: Existing header structure from PublicArticle.tsx:139-151, useTranslation from DisclaimerBanner.tsx_
  - _Requirements: 1.5, 1.6_
  - _Prompt: Implement the task for spec newspaper-article-layout, first run spec-workflow-guide to get the workflow guide then implement the task: | Role: React Component Developer with expertise in article layout and responsive design | Task: Create ArticleHeader component rendering article title (text-4xl font-bold), optional subtitle, byline (author • date • category), optional read time, and optional featured image with gradient overlay and overlaid title following requirements 1.5 and 1.6. Apply brand color to category badge. | Restrictions: Use semantic <header> element, format date with toLocaleDateString(), handle missing subtitle/featuredImage/readTime gracefully, apply gradient overlay to featured images (bg-gradient-to-t from-black/70 to-transparent), overlay title in white when image present, use bullet separators (•) in byline, apply brand color to category text or badge | _Leverage: PublicArticle.tsx:139-151 for metadata structure, useTranslation for any labels, brand color pattern_ | Success: Header displays title and metadata correctly, featured image with gradient and overlaid title works, missing optional fields handled, brand color applied to category, responsive on all devices, semantic HTML_

- [x] 8. Create RelatedArticlesSidebar component
  - File: src/client/components/ArticleLayout/RelatedArticlesSidebar.tsx
  - Implement sticky sidebar (desktop) with related article cards and horizontal scrollable list (mobile/tablet)
  - Include thumbnails, titles, and category badges with brand colors
  - Purpose: Display related content with responsive layout
  - _Leverage: Existing sidebar from PublicArticle.tsx:186-203, useTranslation_
  - _Requirements: 1.4, 1.6_
  - _Prompt: Implement the task for spec newspaper-article-layout, first run spec-workflow-guide to get the workflow guide then implement the task: | Role: React Component Developer specializing in responsive sidebar layouts | Task: Create RelatedArticlesSidebar component with sticky positioning on desktop (top-24), card-based layout for related articles (thumbnail, title, category badge), and horizontal scrollable or stacked list on mobile/tablet following requirements 1.4 and 1.6. | Restrictions: Use sticky positioning (lg:sticky lg:top-24), render nothing if articles array is empty, handle missing thumbnails with placeholder or text-only cards, apply brand color to category badges or links, ensure click handlers navigate correctly, respect footer (don't overlap), use horizontal scroll on mobile with snap points or stacked list | _Leverage: PublicArticle.tsx:186-203 structure, useTranslation for "Related Articles" heading, brand color pattern_ | Success: Sidebar is sticky on desktop, scrolls with content on mobile, related articles display with images/titles/categories, brand color applied, empty state handled, footer not overlapped, responsive across breakpoints_

- [x] 9. Create ColumnLayout component
  - File: src/client/components/ArticleLayout/ColumnLayout.tsx
  - Parse article HTML content and distribute into newspaper-style columns
  - Apply DropCap to first paragraph, render PullQuote for blockquotes, use ImageCaption for images
  - Implement responsive column count (1 col mobile/tablet, 2 cols desktop after first paragraph)
  - Purpose: Core layout engine for newspaper article presentation
  - _Leverage: dangerouslySetInnerHTML from PublicArticle.tsx:165, useMemo for parsing optimization, DropCap/PullQuote/ImageCaption components_
  - _Requirements: 1.1, 1.2, 1.3, 1.5, 1.6_
  - _Prompt: Implement the task for spec newspaper-article-layout, first run spec-workflow-guide to get the workflow guide then implement the task: | Role: Senior React Developer with expertise in HTML parsing and complex layout logic | Task: Create ColumnLayout component that parses HTML content string, identifies paragraphs/blockquotes/images, and distributes them into responsive newspaper columns following requirements 1.1-1.3, 1.5-1.6. First paragraph gets DropCap and stays single-column, subsequent content flows into 2 columns on desktop, blockquotes render as PullQuote, images use ImageCaption. | Restrictions: Use browser DOMParser API to parse HTML (no external libraries), sanitize content with rehype-sanitize if available, use useMemo to cache parsed content, implement CSS columns (column-count) or CSS Grid, first paragraph always single-column with DropCap, break columns for full-width elements (images/quotes), prevent orphaned lines (break-inside: avoid), maintain semantic HTML structure, handle malformed HTML gracefully | _Leverage: dangerouslySetInnerHTML pattern from PublicArticle.tsx:165, useMemo hook, DropCap/PullQuote/ImageCaption components_ | Success: Content parsed correctly from HTML, first paragraph with DropCap in single column, multi-column layout on desktop (2 cols), single column on mobile/tablet, blockquotes render as PullQuote, images use ImageCaption, layout breaks correctly for full-width elements, no orphaned lines, malformed HTML handled_

- [x] 10. Create NewspaperArticle wrapper component
  - File: src/client/components/ArticleLayout/NewspaperArticle.tsx
  - Compose all layout components (ArticleHeader, ColumnLayout, RelatedArticlesSidebar) into complete article presentation
  - Implement responsive grid layout (main content + sidebar)
  - Purpose: Main orchestration component for newspaper layout
  - _Leverage: Grid layout from PublicArticle.tsx:116, all ArticleLayout components, useTranslation_
  - _Requirements: All_
  - _Prompt: Implement the task for spec newspaper-article-layout, first run spec-workflow-guide to get the workflow guide then implement the task: | Role: React Component Developer specializing in component composition and layout orchestration | Task: Create NewspaperArticle wrapper component that composes ArticleHeader, ColumnLayout, and RelatedArticlesSidebar into complete newspaper article presentation with responsive grid layout (2/3 content, 1/3 sidebar on desktop; stacked on mobile) covering all requirements. | Restrictions: Use grid layout (grid grid-cols-1 lg:grid-cols-3 gap-8) similar to PublicArticle.tsx:116, wrap in semantic <article> element, conditionally render sidebar only if relatedArticles.length > 0, pass brand colors to child components, ensure main content is lg:col-span-2, sidebar is lg:col-span-1, handle all optional props gracefully, maintain shadow/rounded styling for cards | _Leverage: PublicArticle.tsx:116 grid pattern, all ArticleLayout components (ArticleHeader, ColumnLayout, RelatedArticlesSidebar), useTranslation if needed_ | Success: All components composed correctly, responsive grid works (2/3 + 1/3 desktop, stacked mobile), brand colors propagated to children, sidebar conditional on relatedArticles, semantic article element used, styling consistent with existing design_

- [x] 11. Import newspaper CSS in application entry point
  - File: src/client/main.tsx or src/client/App.tsx (identify correct entry point)
  - Import newspaper.css to load base styles before template styles
  - Ensure CSS cascade order: globals → newspaper → components → templates
  - Purpose: Integrate newspaper styles into application CSS cascade
  - _Leverage: Existing CSS imports in entry files_
  - _Requirements: 1.7 (Template Integration)_
  - _Prompt: Implement the task for spec newspaper-article-layout, first run spec-workflow-guide to get the workflow guide then implement the task: | Role: Frontend Build Engineer with expertise in CSS cascade and import ordering | Task: Import newspaper.css in the application entry point (main.tsx or App.tsx) ensuring it loads after globals.css but before component styles and template styles following requirement 1.7. Verify CSS cascade order. | Restrictions: Identify correct entry point (check main.tsx, App.tsx, or index.tsx), import after globals.css, import before any component-specific CSS, do not break existing import order, verify in browser DevTools that newspaper.css loads in correct order | _Leverage: Existing CSS import patterns in entry files_ | Success: newspaper.css imported in correct file, loads in proper cascade order (after globals, before templates), verified in browser, existing styles still work_

- [x] 12. Update PublicArticle page to use NewspaperArticle component
  - File: src/client/pages/PublicArticle.tsx
  - Replace existing article markup (lines 115-204) with NewspaperArticle component
  - Preserve DisclaimerBanner, Watermark, DisclaimerFooter, Helmet, loading/error states
  - Purpose: Integrate newspaper layout into public article viewing
  - _Leverage: Existing PublicArticle.tsx structure, NewspaperArticle component_
  - _Requirements: All_
  - _Prompt: Implement the task for spec newspaper-article-layout, first run spec-workflow-guide to get the workflow guide then implement the task: | Role: React Developer with expertise in component refactoring and integration | Task: Update PublicArticle.tsx to use NewspaperArticle component, replacing existing article markup (lines 115-204) while preserving DisclaimerBanner, Watermark, DisclaimerFooter, Helmet, and loading/error states. Ensure article data structure matches NewspaperArticle expectations. | Restrictions: Preserve all existing functionality (fetch logic, error handling, loading states, SEO meta tags, disclaimer components), only replace article markup section (lines 115-204), ensure article object matches NewspaperArticleProps interface, maintain same route params and fetch URL, keep Helmet configuration unchanged, preserve container/spacing structure | _Leverage: Existing PublicArticle.tsx structure (lines 1-114 for fetch/state logic, disclaimer components), NewspaperArticle component_ | Success: PublicArticle.tsx uses NewspaperArticle component, all existing functionality preserved (disclaimers, SEO, loading/error, fetch logic), article data properly passed, no TypeScript errors, page renders correctly_

- [x] 13. Create unit tests for DropCap component
  - File: tests/unit/components/ArticleLayout/DropCap.test.tsx
  - Test rendering of first character, brand color application, accessibility
  - Purpose: Ensure DropCap reliability and catch regressions
  - _Leverage: React Testing Library patterns from existing test files, @testing-library/jest-dom_
  - _Requirements: 1.2_
  - _Prompt: Implement the task for spec newspaper-article-layout, first run spec-workflow-guide to get the workflow guide then implement the task: | Role: QA Engineer specializing in React component testing with Jest and Testing Library | Task: Create comprehensive unit tests for DropCap component covering rendering, brand color styling, accessibility, and edge cases following requirement 1.2. | Restrictions: Use React Testing Library and Jest (already configured), test component in isolation (no dependencies on other components), test both with and without brand color, test various characters including Unicode, check accessibility (aria attributes), verify CSS classes/inline styles, ensure tests are deterministic | _Leverage: React Testing Library (render, screen), @testing-library/jest-dom matchers_ | Success: Tests cover rendering first character, brand color application, default styling, accessibility markup, edge cases (empty string, Unicode), all tests pass, good coverage (>80%)_

- [x] 14. Create unit tests for PullQuote component
  - File: tests/unit/components/ArticleLayout/PullQuote.test.tsx
  - Test quote rendering, attribution display, brand color border, spacing
  - Purpose: Ensure PullQuote reliability
  - _Leverage: React Testing Library, existing test patterns_
  - _Requirements: 1.3_
  - _Prompt: Implement the task for spec newspaper-article-layout, first run spec-workflow-guide to get the workflow guide then implement the task: | Role: QA Engineer specializing in React component testing | Task: Create unit tests for PullQuote component covering quote content rendering, optional attribution, brand color border application, spacing requirements, and semantic HTML following requirement 1.3. | Restrictions: Use React Testing Library and Jest, test with and without attribution, verify brand color applied to border/background, check semantic blockquote element used, verify spacing (my-8 or equivalent), test children as ReactNode (text and rich content) | _Leverage: React Testing Library, @testing-library/jest-dom_ | Success: Tests cover quote rendering, attribution display, brand color styling, semantic HTML, spacing, all tests pass_

- [x] 15. Create unit tests for ImageCaption component
  - File: tests/unit/components/ArticleLayout/ImageCaption.test.tsx
  - Test image rendering, caption/credit display, lazy loading, error handling
  - Purpose: Ensure ImageCaption reliability
  - _Leverage: React Testing Library, existing test patterns_
  - _Requirements: 1.5_
  - _Prompt: Implement the task for spec newspaper-article-layout, first run spec-workflow-guide to get the workflow guide then implement the task: | Role: QA Engineer with expertise in testing media components | Task: Create unit tests for ImageCaption component covering image rendering with alt text, caption/credit display, lazy loading attribute, broken image error handling, and semantic HTML (figure/figcaption) following requirement 1.5. | Restrictions: Use React Testing Library and Jest, test semantic HTML structure (figure/figcaption), verify lazy loading attribute (loading="lazy"), test missing caption/credit scenarios, simulate image load errors (fireEvent on img onError), check alt text presence | _Leverage: React Testing Library, fireEvent for error simulation_ | Success: Tests cover image rendering, caption/credit display, lazy loading, error handling, semantic HTML, missing optional fields, all tests pass_

- [x] 16. Create unit tests for ArticleHeader component
  - File: tests/unit/components/ArticleLayout/ArticleHeader.test.tsx
  - Test title/subtitle rendering, byline metadata, featured image with overlay, brand color application
  - Purpose: Ensure ArticleHeader reliability
  - _Leverage: React Testing Library, existing test patterns_
  - _Requirements: 1.5, 1.6_
  - _Prompt: Implement the task for spec newspaper-article-layout, first run spec-workflow-guide to get the workflow guide then implement the task: | Role: QA Engineer specializing in React component testing | Task: Create unit tests for ArticleHeader component covering title/subtitle rendering, byline metadata (author, date, category, read time), featured image with gradient overlay, brand color on category, and handling of optional fields following requirements 1.5 and 1.6. | Restrictions: Use React Testing Library and Jest, test with and without optional fields (subtitle, featuredImage, readTime), verify date formatting (toLocaleDateString), check brand color applied to category, test gradient overlay on featured image, verify semantic header element | _Leverage: React Testing Library, @testing-library/jest-dom_ | Success: Tests cover all metadata rendering, optional fields handled, date formatting, brand color styling, featured image overlay, semantic HTML, all tests pass_

- [x] 17. Create unit tests for RelatedArticlesSidebar component
  - File: tests/unit/components/ArticleLayout/RelatedArticlesSidebar.test.tsx
  - Test related articles rendering, empty state, brand color on badges, sticky positioning
  - Purpose: Ensure RelatedArticlesSidebar reliability
  - _Leverage: React Testing Library, existing test patterns_
  - _Requirements: 1.4, 1.6_
  - _Prompt: Implement the task for spec newspaper-article-layout, first run spec-workflow-guide to get the workflow guide then implement the task: | Role: QA Engineer with expertise in testing list components and responsive behavior | Task: Create unit tests for RelatedArticlesSidebar component covering related article rendering (title, category, thumbnail), empty array handling (no render), brand color application to badges/links, and sticky positioning CSS following requirements 1.4 and 1.6. | Restrictions: Use React Testing Library and Jest, test with populated articles array and empty array, verify component renders nothing when empty, check brand color styling, test thumbnail fallback for missing images, verify sticky CSS class (lg:sticky lg:top-24), test semantic aside element | _Leverage: React Testing Library, @testing-library/jest-dom for CSS class assertions_ | Success: Tests cover article list rendering, empty state (no render), brand color styling, thumbnail handling, sticky positioning CSS, semantic HTML, all tests pass_

- [x] 18. Create unit tests for ColumnLayout component
  - File: tests/unit/components/ArticleLayout/ColumnLayout.test.tsx
  - Test HTML parsing, DropCap integration, PullQuote/ImageCaption rendering, responsive columns
  - Purpose: Ensure ColumnLayout reliability and content parsing
  - _Leverage: React Testing Library, existing test patterns_
  - _Requirements: 1.1, 1.2, 1.3, 1.5, 1.6_
  - _Prompt: Implement the task for spec newspaper-article-layout, first run spec-workflow-guide to get the workflow guide then implement the task: | Role: Senior QA Engineer with expertise in testing complex parsing and layout logic | Task: Create comprehensive unit tests for ColumnLayout component covering HTML content parsing, DropCap application to first paragraph, PullQuote rendering for blockquotes, ImageCaption for images, responsive column layout (CSS classes), and malformed HTML handling following requirements 1.1-1.3, 1.5-1.6. | Restrictions: Use React Testing Library and Jest, mock DropCap/PullQuote/ImageCaption components to isolate ColumnLayout logic, test content parsing with various HTML structures (paragraphs, blockquotes, images), verify first paragraph gets DropCap, verify responsive column CSS classes, test malformed HTML gracefully handled, use useMemo mocking if needed | _Leverage: React Testing Library, jest.mock for child components_ | Success: Tests cover HTML parsing, DropCap integration, PullQuote/ImageCaption rendering, responsive column CSS, malformed HTML handling, child components receive correct props, all tests pass, good coverage_

- [-] 19. Create unit tests for NewspaperArticle component
  - File: tests/unit/components/ArticleLayout/NewspaperArticle.test.tsx
  - Test component composition, grid layout, conditional sidebar rendering, brand color propagation
  - Purpose: Ensure NewspaperArticle integration and orchestration
  - _Leverage: React Testing Library, existing test patterns_
  - _Requirements: All_
  - _Prompt: Implement the task for spec newspaper-article-layout, first run spec-workflow-guide to get the workflow guide then implement the task: | Role: QA Engineer specializing in integration testing of composed React components | Task: Create unit tests for NewspaperArticle wrapper component covering composition of ArticleHeader/ColumnLayout/RelatedArticlesSidebar, responsive grid layout CSS, conditional sidebar rendering based on relatedArticles, brand color propagation to children, and semantic article element following all requirements. | Restrictions: Use React Testing Library and Jest, mock child components (ArticleHeader, ColumnLayout, RelatedArticlesSidebar) to test composition, verify grid layout CSS classes (grid lg:grid-cols-3), test sidebar renders only when relatedArticles.length > 0, verify brand colors passed as props to children, check semantic article element used | _Leverage: React Testing Library, jest.mock for child components_ | Success: Tests cover all child components rendered with correct props, grid layout CSS, conditional sidebar logic, brand color propagation, semantic HTML, all tests pass_

- [ ] 20. Create integration test for PublicArticle with NewspaperArticle
  - File: tests/integration/pages/PublicArticle.test.tsx
  - Test full article rendering flow: fetch → parse → render with all newspaper components
  - Mock fetch API and verify complete layout integration
  - Purpose: Ensure PublicArticle page integrates correctly with NewspaperArticle
  - _Leverage: Supertest patterns from existing integration tests, React Testing Library_
  - _Requirements: All_
  - _Prompt: Implement the task for spec newspaper-article-layout, first run spec-workflow-guide to get the workflow guide then implement the task: | Role: QA Engineer specializing in integration testing and API mocking | Task: Create integration test for PublicArticle page verifying full rendering flow with NewspaperArticle component: fetch article data, render all newspaper layout components (header, columns, sidebar), verify disclaimers, SEO meta tags, loading/error states covering all requirements. | Restrictions: Use React Testing Library and Jest, mock global fetch API with test article data, test complete rendering with all components (DisclaimerBanner, NewspaperArticle, DisclaimerFooter, Watermark), verify SEO meta tags (Helmet), test loading state, test error state (404), ensure async fetch completes with waitFor, verify all article sections render | _Leverage: React Testing Library, jest.fn() for fetch mocking, waitFor for async operations_ | Success: Test covers fetch flow, full article rendering with newspaper layout, all components present (disclaimers, header, content, sidebar), SEO meta tags correct, loading/error states work, test passes reliably_

- [ ] 21. Create E2E test for newspaper layout on desktop
  - File: tests/e2e/newspaper-layout-desktop.spec.ts
  - Test article viewing with two-column layout, drop cap, pull quotes, sticky sidebar on desktop viewport
  - Purpose: Validate desktop user experience with newspaper layout
  - _Leverage: Playwright patterns from existing E2E tests_
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.6_
  - _Prompt: Implement the task for spec newspaper-article-layout, first run spec-workflow-guide to get the workflow guide then implement the task: | Role: QA Automation Engineer with expertise in Playwright E2E testing | Task: Create end-to-end test for newspaper layout on desktop viewport (1920x1080) covering article viewing with two-column layout, drop cap on first paragraph, pull quote styling, sticky sidebar behavior, and overall visual presentation following requirements 1.1-1.4, 1.6. | Restrictions: Use Playwright (already configured), set viewport to desktop (1920x1080), navigate to test article URL, verify two-column layout exists (check column CSS or layout structure), verify drop cap visible on first paragraph, verify pull quotes styled differently, verify sidebar is sticky (check CSS position), test scrolling behavior, take screenshot for visual verification if needed | _Leverage: Playwright test patterns from existing E2E tests (tests/e2e/)_ | Success: E2E test navigates to article, desktop viewport set, two-column layout verified, drop cap visible, pull quotes styled, sticky sidebar confirmed, test passes reliably_

- [ ] 22. Create E2E test for newspaper layout on mobile
  - File: tests/e2e/newspaper-layout-mobile.spec.ts
  - Test article viewing with single-column layout, related articles below content, responsive images on mobile viewport
  - Purpose: Validate mobile user experience with newspaper layout
  - _Leverage: Playwright patterns from existing E2E tests_
  - _Requirements: 1.1, 1.4, 1.5, 1.6_
  - _Prompt: Implement the task for spec newspaper-article-layout, first run spec-workflow-guide to get the workflow guide then implement the task: | Role: QA Automation Engineer specializing in mobile testing with Playwright | Task: Create end-to-end test for newspaper layout on mobile viewport (375x667 iPhone) covering single-column layout, related articles appearing below main content, responsive images, and overall mobile presentation following requirements 1.1, 1.4-1.6. | Restrictions: Use Playwright, set mobile viewport (375x667 or similar), navigate to test article, verify single-column layout (no multi-column CSS), verify related articles appear below content (not in sidebar), check images are responsive and fit viewport, test touch interactions if applicable, verify disclaimers visible | _Leverage: Playwright test patterns, mobile device emulation_ | Success: E2E test navigates to article on mobile viewport, single-column layout verified, related articles below content, images responsive, disclaimers visible, test passes reliably_

- [ ] 23. Create E2E test for accessibility compliance
  - File: tests/e2e/newspaper-layout-accessibility.spec.ts
  - Test keyboard navigation, screen reader semantics, color contrast, focus indicators
  - Purpose: Ensure newspaper layout meets WCAG AA accessibility standards
  - _Leverage: Playwright accessibility testing, axe-core integration if available_
  - _Requirements: 1.6 (Responsive Design and Accessibility)_
  - _Prompt: Implement the task for spec newspaper-article-layout, first run spec-workflow-guide to get the workflow guide then implement the task: | Role: Accessibility QA Engineer with expertise in WCAG compliance and automated accessibility testing | Task: Create end-to-end accessibility test for newspaper layout covering keyboard navigation (tab through all interactive elements), screen reader semantics (proper heading hierarchy, semantic HTML), color contrast (WCAG AA 4.5:1 body text, 3:1 large text), and visible focus indicators following requirement 1.6. | Restrictions: Use Playwright with @axe-core/playwright if available or manual checks, test keyboard navigation (Tab key through links, related articles), verify heading hierarchy (h1 → h2 → h3), check semantic elements (article, header, aside, blockquote, figure), verify focus indicators visible, run axe accessibility scan if available, check color contrast programmatically or note for manual review | _Leverage: Playwright, @axe-core/playwright if installed or plan to install_ | Success: Accessibility test covers keyboard navigation, semantic HTML structure verified, focus indicators visible, axe scan passes (or manual checks documented), WCAG AA compliance confirmed_

- [ ] 24. Update package.json scripts if needed for new test files
  - File: package.json
  - Ensure new test files are included in test commands (test:unit, test:integration, test:e2e)
  - Purpose: Integrate new tests into CI/CD pipeline
  - _Leverage: Existing test scripts in package.json_
  - _Requirements: All (testing strategy)_
  - _Prompt: Implement the task for spec newspaper-article-layout, first run spec-workflow-guide to get the workflow guide then implement the task: | Role: DevOps Engineer with expertise in npm scripts and test automation | Task: Verify and update package.json test scripts to include new test files (unit tests in tests/unit/components/ArticleLayout/, integration test in tests/integration/pages/, E2E tests in tests/e2e/) ensuring they run with existing test commands (npm test, npm run test:unit, npm run test:integration, npm run test:e2e). | Restrictions: Do not modify existing test script functionality, verify that test file patterns in Jest/Playwright config match new test locations, update only if necessary (existing patterns may already include new files), test that all new tests run with npm test and specific test commands | _Leverage: Existing test scripts and configurations in package.json, jest.config.js, playwright.config.ts_ | Success: New test files are included in test runs, npm test runs all tests, test:unit/integration/e2e commands work, CI/CD pipeline runs all tests, verified by running test commands locally_

- [ ] 25. Create documentation for newspaper layout components
  - File: .spec-workflow/specs/newspaper-article-layout/IMPLEMENTATION.md
  - Document component API, usage examples, customization options, template integration guide
  - Purpose: Provide developer documentation for newspaper layout system
  - _Leverage: Component interfaces from src/client/types/articleLayout.ts_
  - _Requirements: All_
  - _Prompt: Implement the task for spec newspaper-article-layout, first run spec-workflow-guide to get the workflow guide then implement the task: | Role: Technical Writer with expertise in component documentation and developer guides | Task: Create comprehensive implementation documentation covering all newspaper layout components (NewspaperArticle, DropCap, PullQuote, ImageCaption, ArticleHeader, ColumnLayout, RelatedArticlesSidebar), usage examples, props API, customization options, CSS cascade strategy, and template integration guide. | Restrictions: Include code examples for each component, document all props with types, explain CSS cascade order (globals → newspaper → components → templates), provide customization examples (brand colors, layout overrides), document responsive behavior, include troubleshooting section for common issues, write in clear markdown format | _Leverage: Component interfaces from articleLayout.ts, design document specifications_ | Success: Documentation is comprehensive and clear, covers all components with examples, props documented, CSS cascade explained, customization guide provided, troubleshooting included, markdown formatting correct_

## Summary

**Total Tasks**: 25

**Breakdown by Category**:
- Setup & Configuration: 3 tasks (CSS module, Tailwind config, interfaces)
- Component Implementation: 7 tasks (DropCap, PullQuote, ImageCaption, ArticleHeader, RelatedArticlesSidebar, ColumnLayout, NewspaperArticle)
- Integration: 2 tasks (CSS import, PublicArticle update)
- Unit Testing: 7 tasks (one per component)
- Integration Testing: 1 task
- E2E Testing: 3 tasks (desktop, mobile, accessibility)
- DevOps & Documentation: 2 tasks (package.json, documentation)

**Estimated Complexity**:
- High: Tasks 9 (ColumnLayout parsing), 10 (NewspaperArticle composition), 18 (ColumnLayout tests), 20 (integration test)
- Medium: Tasks 1-8, 11-19, 21-23
- Low: Tasks 24-25
