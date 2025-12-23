-- Description: Add system configuration table for editable disclaimers
-- Version: 1.2.0
-- Date: 2024-12-14
-- Purpose: Store system-wide configuration including disclaimers in EN/ES

-- Create SystemConfig table
CREATE TABLE IF NOT EXISTS SystemConfig (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default disclaimer configurations
INSERT OR IGNORE INTO SystemConfig (id, key, value) VALUES
  (lower(hex(randomblob(16))), 'disclaimer_banner_en', '⚠️ FICTIONAL CONTENT - This article is entirely fictional'),
  (lower(hex(randomblob(16))), 'disclaimer_banner_es', '⚠️ CONTENIDO FICTICIO - Este artículo es completamente ficticio'),
  (lower(hex(randomblob(16))), 'disclaimer_footer_en', 'This article is entirely fictional and created for entertainment purposes only. All names, characters, events, and locations are products of imagination. Any resemblance to actual persons, living or dead, or actual events is purely coincidental.'),
  (lower(hex(randomblob(16))), 'disclaimer_footer_es', 'Este artículo es completamente ficticio y creado solo con fines de entretenimiento. Todos los nombres, personajes, eventos y ubicaciones son productos de la imaginación. Cualquier parecido con personas reales, vivas o muertas, o eventos reales es pura coincidencia.');
