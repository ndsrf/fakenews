-- migrations/1.0.0/002_seed_default_brands.sql
-- Description: Seed 5 default fictional news brands
-- Version: 1.0.0
-- Date: 2024-12-08

-- Insert default fictional news brands
INSERT OR IGNORE INTO "NewsBrand" (id, name, tagline, description, primaryColor, accentColor, language, websiteUrl, categories, isActive)
VALUES
-- 1. The Daily Chronicle (traditional newspaper, EN)
(
    lower(hex(randomblob(16))),
    'The Daily Chronicle',
    'Truth in Every Story',
    'A traditional fictional newspaper covering world events, politics, and human interest stories.',
    '#1a1a1a',
    '#d4af37',
    'en',
    'https://dailychronicle.fictional',
    '["World News", "Politics", "Business", "Opinion", "Lifestyle"]',
    1
),
-- 2. Tech Insider Weekly (tech news, EN)
(
    lower(hex(randomblob(16))),
    'Tech Insider Weekly',
    'Tomorrow''s Technology Today',
    'A fictional technology news outlet covering innovation, startups, and digital trends.',
    '#0a0e27',
    '#00d4ff',
    'en',
    'https://techinsider.fictional',
    '["Technology", "Startups", "AI & ML", "Gadgets", "Cybersecurity"]',
    1
),
-- 3. El Mundo Ficticio (general news, ES)
(
    lower(hex(randomblob(16))),
    'El Mundo Ficticio',
    'Noticias del Mundo Imaginario',
    'Un periódico ficticio en español que cubre noticias internacionales, cultura y sociedad.',
    '#c41e3a',
    '#ffc72c',
    'es',
    'https://elmundoficticio.fictional',
    '["Internacional", "Política", "Cultura", "Deportes", "Sociedad"]',
    1
),
-- 4. The Metropolitan Post (local news, EN)
(
    lower(hex(randomblob(16))),
    'The Metropolitan Post',
    'Your City, Your News',
    'A fictional local newspaper covering community events, city politics, and regional stories.',
    '#2c3e50',
    '#e74c3c',
    'en',
    'https://metropolitanpost.fictional',
    '["Local News", "Community", "City Hall", "Education", "Real Estate"]',
    1
),
-- 5. Sports Arena Fiction (sports, EN)
(
    lower(hex(randomblob(16))),
    'Sports Arena Fiction',
    'Where Legends Are Made',
    'A fictional sports news outlet covering all major sports, athletes, and competitions.',
    '#16a085',
    '#f39c12',
    'en',
    'https://sportsarena.fictional',
    '["Football", "Basketball", "Baseball", "Soccer", "Olympics"]',
    1
);
