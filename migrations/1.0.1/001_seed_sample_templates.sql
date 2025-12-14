-- migrations/1.0.1/001_seed_sample_templates.sql
-- Description: Seed sample article templates for existing news brands
-- Version: 1.0.1
-- Date: 2024-12-09

-- Insert sample templates for each brand
-- Note: Using subqueries to get brand IDs dynamically

-- 1. The Daily Chronicle Templates (Traditional Newspaper)
INSERT OR IGNORE INTO "Template" (id, name, type, brandId, cssStyles, htmlStructure, hasSidebar, language, isActive, layoutMetadata)
SELECT
    lower(hex(randomblob(16))),
    'Classic Column Layout',
    'article',
    id,
    'body { font-family: Georgia, serif; line-height: 1.8; color: #1a1a1a; background: #f9f9f9; } .article-header { border-bottom: 3px solid #d4af37; margin-bottom: 2rem; padding-bottom: 1rem; } h1 { font-size: 2.5rem; font-weight: bold; margin-bottom: 0.5rem; } .subtitle { font-size: 1.2rem; color: #666; font-style: italic; } .byline { font-size: 0.9rem; color: #888; margin: 1rem 0; } .article-content { column-count: 2; column-gap: 2rem; text-align: justify; } .article-content p { margin-bottom: 1rem; } .sidebar { background: #fff; padding: 1.5rem; border: 1px solid #ddd; }',
    '<div class="article-header"><h1>{{title}}</h1><p class="subtitle">{{subtitle}}</p><p class="byline">By {{author}} | {{date}}</p></div><div class="article-content">{{content}}</div>',
    1,
    'en',
    1,
    '{"columns": 2, "headerStyle": "classic", "fontFamily": "serif"}'
FROM "NewsBrand" WHERE name = 'The Daily Chronicle' LIMIT 1;

INSERT OR IGNORE INTO "Template" (id, name, type, brandId, cssStyles, htmlStructure, hasSidebar, language, isActive, layoutMetadata)
SELECT
    lower(hex(randomblob(16))),
    'Feature Story Layout',
    'feature',
    id,
    'body { font-family: Georgia, serif; line-height: 1.8; color: #1a1a1a; } .hero-image { width: 100%; height: 400px; object-fit: cover; margin-bottom: 2rem; } h1 { font-size: 3rem; font-weight: bold; margin-bottom: 1rem; text-align: center; } .lead-paragraph { font-size: 1.3rem; font-weight: 500; color: #333; margin-bottom: 2rem; text-align: center; max-width: 800px; margin-left: auto; margin-right: auto; } .article-content { max-width: 700px; margin: 0 auto; } .pullquote { font-size: 1.8rem; font-style: italic; color: #d4af37; border-left: 4px solid #d4af37; padding-left: 1.5rem; margin: 2rem 0; }',
    '<img src="{{featuredImage}}" class="hero-image" alt="{{title}}"><h1>{{title}}</h1><p class="lead-paragraph">{{excerpt}}</p><div class="article-content">{{content}}</div>',
    0,
    'en',
    1,
    '{"layout": "centered", "heroImage": true, "hasPullquote": true}'
FROM "NewsBrand" WHERE name = 'The Daily Chronicle' LIMIT 1;

-- 2. Tech Insider Weekly Templates (Modern Tech)
INSERT OR IGNORE INTO "Template" (id, name, type, brandId, cssStyles, htmlStructure, hasSidebar, language, isActive, layoutMetadata)
SELECT
    lower(hex(randomblob(16))),
    'Tech News Card',
    'article',
    id,
    'body { font-family: "Inter", -apple-system, sans-serif; line-height: 1.6; color: #e0e0e0; background: #0a0e27; } .tech-header { background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%); padding: 3rem 2rem; border-radius: 12px; margin-bottom: 2rem; } h1 { font-size: 2.5rem; font-weight: 700; color: #00d4ff; margin-bottom: 0.5rem; } .meta { display: flex; gap: 1rem; color: #888; font-size: 0.9rem; } .article-body { background: #151932; padding: 2rem; border-radius: 8px; border-left: 4px solid #00d4ff; } .code-block { background: #0a0e27; padding: 1rem; border-radius: 6px; font-family: "Fira Code", monospace; color: #00d4ff; margin: 1rem 0; }',
    '<div class="tech-header"><h1>{{title}}</h1><div class="meta"><span>{{author}}</span><span>{{date}}</span><span>{{readTime}} min read</span></div></div><div class="article-body">{{content}}</div>',
    1,
    'en',
    1,
    '{"theme": "dark", "codeHighlighting": true, "modernUI": true}'
FROM "NewsBrand" WHERE name = 'Tech Insider Weekly' LIMIT 1;

INSERT OR IGNORE INTO "Template" (id, name, type, brandId, cssStyles, htmlStructure, hasSidebar, language, isActive, layoutMetadata)
SELECT
    lower(hex(randomblob(16))),
    'Product Review Layout',
    'review',
    id,
    'body { font-family: "Inter", sans-serif; color: #e0e0e0; background: #0a0e27; } .review-header { display: grid; grid-template-columns: 1fr 300px; gap: 2rem; margin-bottom: 2rem; } .product-image { width: 100%; border-radius: 12px; } .rating-box { background: #151932; padding: 2rem; border-radius: 12px; text-align: center; } .rating-score { font-size: 4rem; color: #00d4ff; font-weight: bold; } .pros-cons { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin: 2rem 0; } .pros, .cons { background: #151932; padding: 1.5rem; border-radius: 8px; } .pros { border-top: 3px solid #00ff88; } .cons { border-top: 3px solid #ff4444; }',
    '<div class="review-header"><div><img src="{{productImage}}" class="product-image"><h1>{{title}}</h1></div><div class="rating-box"><div class="rating-score">{{rating}}</div><p>Overall Rating</p></div></div><div class="pros-cons"><div class="pros"><h3>Pros</h3>{{pros}}</div><div class="cons"><h3>Cons</h3>{{cons}}</div></div><div>{{content}}</div>',
    1,
    'en',
    1,
    '{"type": "review", "hasRating": true, "hasProsAndCons": true}'
FROM "NewsBrand" WHERE name = 'Tech Insider Weekly' LIMIT 1;

-- 3. El Mundo Ficticio Templates (Spanish News)
INSERT OR IGNORE INTO "Template" (id, name, type, brandId, cssStyles, htmlStructure, hasSidebar, language, isActive, layoutMetadata)
SELECT
    lower(hex(randomblob(16))),
    'Artículo Estándar',
    'article',
    id,
    'body { font-family: "Merriweather", serif; line-height: 1.8; color: #2c2c2c; } .cabecera { background: linear-gradient(to right, #c41e3a, #d4374f); color: white; padding: 2rem; margin-bottom: 2rem; } h1 { font-size: 2.8rem; font-weight: bold; margin-bottom: 0.5rem; } .bajada { font-size: 1.3rem; opacity: 0.95; line-height: 1.5; } .firma { color: #ffc72c; font-weight: 500; margin-top: 1rem; } .contenido { max-width: 750px; margin: 0 auto; } .contenido p { margin-bottom: 1.5rem; text-align: justify; } .destacado { background: #fff8e1; border-left: 4px solid #ffc72c; padding: 1.5rem; margin: 2rem 0; font-style: italic; }',
    '<div class="cabecera"><h1>{{title}}</h1><p class="bajada">{{subtitle}}</p><p class="firma">Por {{author}} | {{date}}</p></div><div class="contenido">{{content}}</div>',
    1,
    'es',
    1,
    '{"language": "es", "layout": "traditional", "accentColor": "#ffc72c"}'
FROM "NewsBrand" WHERE name = 'El Mundo Ficticio' LIMIT 1;

INSERT OR IGNORE INTO "Template" (id, name, type, brandId, cssStyles, htmlStructure, hasSidebar, language, isActive, layoutMetadata)
SELECT
    lower(hex(randomblob(16))),
    'Reportaje Especial',
    'feature',
    id,
    'body { font-family: "Merriweather", serif; color: #2c2c2c; } .portada { position: relative; height: 500px; background-size: cover; background-position: center; margin-bottom: 2rem; } .portada-overlay { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(196, 30, 58, 0.95), transparent); color: white; padding: 3rem; } .portada h1 { font-size: 3.5rem; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); } .entradilla { font-size: 1.4rem; font-weight: 500; max-width: 800px; margin: 2rem auto; padding: 0 2rem; color: #c41e3a; } .texto { max-width: 700px; margin: 0 auto; padding: 0 2rem; } .capitular:first-letter { font-size: 4rem; float: left; line-height: 1; margin-right: 0.5rem; color: #c41e3a; font-weight: bold; }',
    '<div class="portada" style="background-image: url({{featuredImage}})"><div class="portada-overlay"><h1>{{title}}</h1></div></div><p class="entradilla">{{excerpt}}</p><div class="texto"><p class="capitular">{{content}}</p></div>',
    0,
    'es',
    1,
    '{"layout": "magazine", "hasDropCap": true, "fullWidthHero": true}'
FROM "NewsBrand" WHERE name = 'El Mundo Ficticio' LIMIT 1;

-- 4. The Metropolitan Post Templates (Local News)
INSERT OR IGNORE INTO "Template" (id, name, type, brandId, cssStyles, htmlStructure, hasSidebar, language, isActive, layoutMetadata)
SELECT
    lower(hex(randomblob(16))),
    'Community News',
    'article',
    id,
    'body { font-family: "Roboto", sans-serif; line-height: 1.7; color: #2c3e50; background: #ecf0f1; } .header-section { background: #2c3e50; color: white; padding: 2rem; margin-bottom: 2rem; } h1 { font-size: 2.3rem; font-weight: 700; margin-bottom: 0.5rem; } .location-tag { background: #e74c3c; color: white; padding: 0.3rem 0.8rem; border-radius: 4px; font-size: 0.8rem; display: inline-block; margin-bottom: 1rem; } .content-area { background: white; padding: 2rem; max-width: 800px; margin: 0 auto; box-shadow: 0 2px 4px rgba(0,0,0,0.1); } .community-note { background: #e8f5e9; border: 2px solid #4caf50; padding: 1rem; margin: 1.5rem 0; border-radius: 4px; }',
    '<div class="header-section"><span class="location-tag">{{location}}</span><h1>{{title}}</h1><p>{{subtitle}}</p></div><div class="content-area">{{content}}</div>',
    1,
    'en',
    1,
    '{"focus": "local", "hasLocationTag": true, "communityStyle": true}'
FROM "NewsBrand" WHERE name = 'The Metropolitan Post' LIMIT 1;

INSERT OR IGNORE INTO "Template" (id, name, type, brandId, cssStyles, htmlStructure, hasSidebar, language, isActive, layoutMetadata)
SELECT
    lower(hex(randomblob(16))),
    'Event Coverage',
    'event',
    id,
    'body { font-family: "Roboto", sans-serif; color: #2c3e50; } .event-banner { background: linear-gradient(135deg, #e74c3c, #c0392b); color: white; padding: 3rem 2rem; text-align: center; margin-bottom: 2rem; } .event-date { font-size: 1.1rem; font-weight: 500; margin-bottom: 0.5rem; } h1 { font-size: 2.8rem; margin-bottom: 1rem; } .event-location { font-size: 1.2rem; opacity: 0.9; } .event-details { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin: 2rem 0; } .detail-card { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: center; } .detail-icon { font-size: 2rem; margin-bottom: 0.5rem; } .photo-gallery { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin: 2rem 0; }',
    '<div class="event-banner"><p class="event-date">{{eventDate}}</p><h1>{{title}}</h1><p class="event-location">{{location}}</p></div><div class="event-details">{{eventDetails}}</div><div>{{content}}</div><div class="photo-gallery">{{photos}}</div>',
    1,
    'en',
    1,
    '{"type": "event", "hasGallery": true, "hasEventDetails": true}'
FROM "NewsBrand" WHERE name = 'The Metropolitan Post' LIMIT 1;

-- 5. Sports Arena Fiction Templates (Sports)
INSERT OR IGNORE INTO "Template" (id, name, type, brandId, cssStyles, htmlStructure, hasSidebar, language, isActive, layoutMetadata)
SELECT
    lower(hex(randomblob(16))),
    'Game Recap',
    'recap',
    id,
    'body { font-family: "Oswald", "Arial Black", sans-serif; color: #1a1a1a; background: #f5f5f5; } .game-header { background: linear-gradient(135deg, #16a085, #1abc9c); color: white; padding: 2rem; text-align: center; margin-bottom: 2rem; } .score-display { display: flex; justify-content: center; align-items: center; gap: 3rem; font-size: 3rem; font-weight: bold; margin: 1rem 0; } .team-name { font-size: 1.5rem; margin-bottom: 0.5rem; } .game-details { font-size: 1rem; opacity: 0.9; } .stats-box { background: white; padding: 2rem; margin: 2rem 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); } .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; text-align: center; } .stat-item { padding: 1rem; background: #f9f9f9; border-radius: 4px; } .highlight-play { background: #fff3cd; border-left: 4px solid #f39c12; padding: 1.5rem; margin: 1.5rem 0; }',
    '<div class="game-header"><div class="score-display"><div><p class="team-name">{{homeTeam}}</p><span>{{homeScore}}</span></div><span>-</span><div><p class="team-name">{{awayTeam}}</p><span>{{awayScore}}</span></div></div><p class="game-details">{{date}} | {{venue}}</p></div><div class="stats-box"><h2>Game Statistics</h2><div class="stats-grid">{{stats}}</div></div><div>{{content}}</div>',
    1,
    'en',
    1,
    '{"type": "gameRecap", "hasScore": true, "hasStats": true}'
FROM "NewsBrand" WHERE name = 'Sports Arena Fiction' LIMIT 1;

INSERT OR IGNORE INTO "Template" (id, name, type, brandId, cssStyles, htmlStructure, hasSidebar, language, isActive, layoutMetadata)
SELECT
    lower(hex(randomblob(16))),
    'Player Profile',
    'profile',
    id,
    'body { font-family: "Oswald", sans-serif; color: #1a1a1a; } .profile-hero { display: grid; grid-template-columns: 400px 1fr; gap: 2rem; background: linear-gradient(to right, #16a085, #1abc9c); color: white; padding: 3rem; margin-bottom: 2rem; } .player-photo { width: 100%; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.3); } .player-info h1 { font-size: 3rem; margin-bottom: 0.5rem; } .player-position { font-size: 1.5rem; opacity: 0.9; margin-bottom: 1rem; } .career-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-top: 2rem; } .stat-box { background: rgba(255,255,255,0.2); padding: 1rem; border-radius: 6px; text-align: center; } .stat-number { font-size: 2rem; font-weight: bold; } .achievements { background: #f39c12; color: white; padding: 2rem; margin: 2rem 0; border-radius: 8px; } .achievement-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-top: 1rem; }',
    '<div class="profile-hero"><img src="{{playerPhoto}}" class="player-photo"><div class="player-info"><h1>{{playerName}}</h1><p class="player-position">{{position}} | {{team}}</p><div class="career-stats">{{careerStats}}</div></div></div><div class="achievements"><h2>Achievements & Awards</h2><div class="achievement-list">{{achievements}}</div></div><div>{{content}}</div>',
    1,
    'en',
    1,
    '{"type": "profile", "hasStats": true, "hasAchievements": true}'
FROM "NewsBrand" WHERE name = 'Sports Arena Fiction' LIMIT 1;
