# Requirements Document

## Introduction

The current article display system presents content in a single-column, blog-style format that lacks the visual richness and readability of professional digital newspapers. This feature will transform the article viewing experience to emulate modern digital journalism platforms (e.g., The New York Times, The Guardian, Medium) by implementing multi-column layouts, enhanced typography, styled quotes, strategic whitespace, and improved visual hierarchy. This enhancement will make fictional news articles more immersive and authentic-looking while maintaining clear disclaimers that content is fictional.

## Alignment with Product Vision

This feature enhances the core value proposition of the fictional news generator by:
- **Professional Presentation**: Making generated articles visually indistinguishable from real digital newspapers, increasing immersion and demonstration value
- **User Experience**: Improving readability and engagement through proven newspaper design patterns
- **Brand Differentiation**: Each brand's visual identity (colors, typography) will be more prominently featured through enhanced styling
- **Multilingual Support**: Enhanced layouts will adapt to both EN/ES content while maintaining design consistency

## Relationship to Template System

### Current Template System
The application currently uses a template system (see Prisma schema: Template model) where:
- Templates are extracted from real news websites (type: 'default', 'custom', 'extracted')
- Each template contains `cssStyles` and `htmlStructure` fields
- Articles are linked to templates via `templateId`
- Template CSS is injected directly into article views via `<style>` tags

### How This Spec Affects Templates

**This specification introduces a BASE STYLING LAYER, not template modifications:**

1. **Foundation Layer**: The newspaper layout features will be implemented as a foundational CSS/component layer that loads BEFORE template-specific styles
2. **Template Preservation**: Existing templates and their CSS will NOT be modified or regenerated
3. **CSS Cascade Strategy**:
   - Base newspaper styles (lower specificity) load first
   - Template-specific CSS (higher specificity) loads second and can override base styles
   - This allows extracted templates to maintain their unique appearance while benefiting from layout improvements
4. **Default Template Enhancement**: Articles using minimal or default templates will immediately benefit from professional newspaper styling
5. **Extracted Template Compatibility**: Articles using extracted templates from real news sites will blend base styles with extracted styles for best results

### Implementation Approach

- **Component Library**: Create React components (ColumnLayout, PullQuote, DropCap, etc.) that structure content properly
- **Base CSS Module**: Provide foundational newspaper styling via Tailwind classes and a dedicated CSS module
- **No Database Changes**: The Template table schema remains unchanged
- **Opt-in Overrides**: Templates can include CSS variables or classes to customize newspaper layout features (e.g., column count, typography scale)

This approach ensures backward compatibility while significantly improving the visual quality of all articles, especially those using default templates.

## Requirements

### Requirement 1: Multi-Column Article Layout

**User Story:** As a reader, I want article content to be displayed in newspaper-style columns, so that I can enjoy a more authentic and readable newspaper experience similar to professional digital publications.

#### Acceptance Criteria

1. WHEN viewing an article on desktop (≥1024px) THEN the system SHALL display the main article text in a two-column layout after the first paragraph
2. WHEN viewing an article on tablet (768px-1023px) THEN the system SHALL display a single-column layout with newspaper-appropriate line widths
3. WHEN viewing an article on mobile (<768px) THEN the system SHALL display a single-column layout optimized for narrow screens
4. WHEN the article contains images or pull quotes THEN the system SHALL break columns appropriately to accommodate full-width elements
5. WHEN text flows between columns THEN the system SHALL maintain consistent vertical rhythm and prevent orphaned lines

### Requirement 2: Enhanced Typography

**User Story:** As a reader, I want professional newspaper typography with drop caps and refined text styling, so that articles are more visually appealing and easier to read.

#### Acceptance Criteria

1. WHEN an article is displayed THEN the system SHALL render the first letter of the first paragraph as a decorative drop cap (2-3 lines tall)
2. WHEN displaying article text THEN the system SHALL use serif fonts for body content and sans-serif for headlines (matching newspaper conventions)
3. WHEN rendering text THEN the system SHALL apply optimal line height (1.6-1.8) and letter spacing for readability
4. WHEN displaying headings (H2, H3) within content THEN the system SHALL style them with appropriate hierarchy and spacing
5. WHEN text contains emphasis (bold, italic) THEN the system SHALL render these with typographically appropriate styles

### Requirement 3: Styled Pull Quotes

**User Story:** As a reader, I want important quotes to be visually highlighted as pull quotes, so that key statements stand out and break up long text sections.

#### Acceptance Criteria

1. WHEN article content contains blockquote elements THEN the system SHALL render them as visually distinct pull quotes with increased font size
2. WHEN a pull quote is displayed THEN the system SHALL include decorative quotation marks and a border or background color accent
3. WHEN viewing on desktop THEN pull quotes SHALL optionally float to the side of columns when appropriate
4. WHEN a pull quote includes attribution THEN the system SHALL style the attribution text distinctly (smaller, italic, or different color)
5. WHEN pull quotes are rendered THEN the system SHALL ensure adequate whitespace above and below (minimum 2rem)

### Requirement 4: Related Articles Sidebar

**User Story:** As a reader, I want to see related articles displayed in a sidebar with clear navigation links, so that I can easily discover more content.

#### Acceptance Criteria

1. WHEN viewing an article with related articles THEN the system SHALL display them in a sticky sidebar on desktop
2. WHEN displaying related articles THEN each item SHALL include title, thumbnail image (if available), and category tag
3. WHEN a user clicks a related article link THEN the system SHALL navigate to that article
4. WHEN viewing on mobile/tablet THEN related articles SHALL appear below the main content in a horizontal scrollable carousel or stacked list
5. WHEN the sidebar is sticky THEN it SHALL respect the viewport bounds and not overlap the footer

### Requirement 5: Visual Enhancements and Layout Refinements

**User Story:** As a reader, I want articles to have professional visual enhancements like section dividers, image captions, and strategic spacing, so that content is easier to scan and more visually engaging.

#### Acceptance Criteria

1. WHEN article content contains images THEN each image SHALL be accompanied by a caption and photo credit section below
2. WHEN displaying multiple content sections THEN the system SHALL include subtle dividers or increased spacing between sections
3. WHEN rendering the article header THEN it SHALL include a prominent featured image with overlay gradient and title positioning (if image exists)
4. WHEN displaying byline information THEN it SHALL include author name, publication date, read time, and social share icons in a styled header section
5. WHEN text wraps around images THEN the system SHALL maintain minimum 1.5rem spacing between text and images
6. WHEN the article uses brand colors THEN accents (links, borders, section dividers) SHALL incorporate the brand's primary/accent colors

### Requirement 6: Responsive Design and Accessibility

**User Story:** As a reader on any device, I want the newspaper layout to adapt seamlessly to my screen size while remaining accessible, so that I can read comfortably regardless of how I access the content.

#### Acceptance Criteria

1. WHEN the viewport width changes THEN the layout SHALL smoothly transition between breakpoints without content jumping
2. WHEN using keyboard navigation THEN all interactive elements (links, related articles) SHALL be focusable with visible focus indicators
3. WHEN using screen readers THEN the semantic HTML structure SHALL properly convey article hierarchy (article, header, main, aside)
4. WHEN images fail to load THEN alt text SHALL be displayed with appropriate styling
5. WHEN text is zoomed to 200% THEN the layout SHALL remain usable without horizontal scrolling

### Requirement 7: Template Integration

**User Story:** As a user generating articles with custom templates, I want the newspaper layout enhancements to integrate with extracted template styles, so that brand-specific designs are preserved and enhanced.

#### Acceptance Criteria

1. WHEN an article uses a custom template THEN the newspaper layout SHALL apply on top of template CSS without conflicts
2. WHEN template CSS defines typography THEN the newspaper enhancements SHALL respect those settings while adding layout improvements
3. WHEN brand colors are defined THEN the system SHALL use them for accents, borders, and decorative elements
4. WHEN a template includes custom styles for blockquotes THEN the system SHALL merge those with pull quote enhancements
5. IF template styles conflict with newspaper layout THEN the system SHALL provide clear CSS specificity to resolve conflicts

## Non-Functional Requirements

### Code Architecture and Modularity

- **Single Responsibility Principle**: Newspaper styling components shall be separate from article data fetching logic
- **Modular Design**: Create reusable components for PullQuote, DropCap, ImageCaption, ColumnLayout that can be used across both PublicArticle.tsx and ArticleView.tsx
- **Dependency Management**: Minimize dependencies by using Tailwind CSS utilities and CSS Grid/Flexbox for layouts
- **Clear Interfaces**: Define TypeScript interfaces for article content structure that supports enhanced layout features

### Performance

- **Initial Render**: Article pages shall render within 2 seconds on 3G connections
- **Column Layout Calculation**: Column distribution shall complete within 100ms to prevent layout shift
- **Image Loading**: Implement lazy loading for related article thumbnails and below-the-fold images
- **CSS Bundle Size**: Newspaper layout styles shall add no more than 5KB to the production CSS bundle

### Security

- **XSS Prevention**: All user-generated content rendered in columns and quotes shall be sanitized
- **Content Security Policy**: Inline styles from templates shall comply with CSP directives
- **Image Sources**: Validate image URLs to prevent loading from untrusted domains

### Reliability

- **Graceful Degradation**: If CSS Grid is not supported, fall back to single-column layout
- **Error Handling**: Missing or malformed content (images, quotes) shall not break the overall layout
- **Cross-Browser Compatibility**: Support latest 2 versions of Chrome, Firefox, Safari, and Edge

### Usability

- **Reading Comfort**: Body text shall maintain 45-75 characters per line for optimal readability
- **Color Contrast**: All text shall meet WCAG AA standards (4.5:1 for body, 3:1 for large text)
- **Touch Targets**: Related article links shall be minimum 44x44px on mobile devices
- **Scan-ability**: Visual hierarchy shall allow users to quickly scan headlines, quotes, and images
