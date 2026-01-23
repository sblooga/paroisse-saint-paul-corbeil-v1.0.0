// scripts/supabase-to-neon.js
import { createClient } from '@supabase/supabase-js';
import pkg from 'pg';
const { Pool } = pkg;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;
const NEON_URL = process.env.NEON_DATABASE_URL;

if (!SUPABASE_URL || !SUPABASE_KEY || !NEON_URL) {
  console.error('Manque SUPABASE_URL / SUPABASE_ANON_KEY / NEON_DATABASE_URL');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const pool = new Pool({ connectionString: NEON_URL, ssl: { rejectUnauthorized: false } });

async function copyTable({ table, select, insertSql, mapRow }) {
  console.log(`\n=== ${table} ===`);
  const { data, error } = await supabase.from(table).select(select);
  if (error) throw error;
  console.log(`Supabase -> ${data.length} lignes`);
  for (const row of data) {
    const values = mapRow(row);
    await pool.query(insertSql, values);
  }
  console.log('OK');
}

// ---- Exemple activé : Articles ----
const insertArticle = `
  INSERT INTO "Article"
    (id, title_fr, title_pl, slug, content_fr, content_pl, excerpt_fr, excerpt_pl, "imageUrl", category, published, featured, "createdAt", "updatedAt")
  VALUES
    ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
  ON CONFLICT (slug) DO NOTHING;
`;

// ---- Pages ----
const insertPage = `
  INSERT INTO "Page"
    (id, slug, title_fr, title_pl, content_fr, content_pl, meta_title_fr, meta_title_pl, meta_description_fr, meta_description_pl, published, "createdAt", "updatedAt")
  VALUES
    ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
  ON CONFLICT (slug) DO NOTHING;
`;

// ---- Team ----
const insertTeam = `
  INSERT INTO "TeamMember"
    (id, name, role_fr, role_pl, "photoUrl", email, whatsapp, category, "order", active, community, bio_fr, bio_pl, "createdAt", "updatedAt")
  VALUES
    ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
  ON CONFLICT (id) DO NOTHING;
`;

// ---- Mass schedules ----
const insertMass = `
  INSERT INTO "MassSchedule"
    (id, day_code, day_fr, day_pl, time, location, location_fr, location_pl, description, description_fr, description_pl, is_special, special_date, language, "order", active, "createdAt", "updatedAt")
  VALUES
    ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
  ON CONFLICT (id) DO NOTHING;
`;

// ---- Footer links ----
const insertFooter = `
  INSERT INTO "FooterLink"
    (id, label, label_fr, label_pl, url, "sortOrder", active, "createdAt", "updatedAt")
  VALUES
    ($1,$2,$3,$4,$5,$6,$7,$8,$9)
  ON CONFLICT (id) DO NOTHING;
`;

// ---- Life stages ----
const insertLife = `
  INSERT INTO "LifeStage"
    (id, title_fr, title_pl, description_fr, description_pl, icon, "imageUrl", "sortOrder", active, "createdAt", "updatedAt")
  VALUES
    ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
  ON CONFLICT (id) DO NOTHING;
`;

// ---- FAQ categories ----
const insertFaqCat = `
  INSERT INTO "FaqCategory"
    (id, name, sort_order, active, "createdAt", "updatedAt")
  VALUES
    ($1,$2,$3,$4,$5,$6)
  ON CONFLICT (id) DO NOTHING;
`;

// ---- FAQ items ----
const insertFaqItem = `
  INSERT INTO "FaqItem"
    (id, question_fr, question_pl, answer_fr, answer_pl, "categoryId", sort_order, active, "createdAt", "updatedAt")
  VALUES
    ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
  ON CONFLICT (id) DO NOTHING;
`;

(async () => {
  try {
    await copyTable({
      table: 'articles', // nom de la table dans Supabase
      select: '*',
      insertSql: insertArticle,
      mapRow: (r) => [
        r.id,                 // mets null si tu veux laisser Neon générer
        r.title_fr,
        r.title_pl,
        r.slug,
        r.content_fr,
        r.content_pl,
        r.excerpt_fr,
        r.excerpt_pl,
        r.image_url || null,
        r.category || null,
        r.published ?? false,
        r.featured ?? false,
        r.created_at || new Date(),
        r.updated_at || new Date(),
      ],
    });

    // Pages
    await copyTable({
      table: 'pages',
      select: '*',
      insertSql: insertPage,
      mapRow: (r) => [
        r.id,
        r.slug,
        r.title_fr,
        r.title_pl,
        r.content_fr,
        r.content_pl,
        r.meta_title_fr,
        r.meta_title_pl,
        r.meta_description_fr,
        r.meta_description_pl,
        r.published ?? true,
        r.created_at || new Date(),
        r.updated_at || new Date(),
      ],
    });

    // Team
    await copyTable({
      table: 'team_members', // nom probable Supabase
      select: '*',
      insertSql: insertTeam,
      mapRow: (r) => [
        r.id,
        r.name,
        r.role_fr,
        r.role_pl,
        r.photo_url || null,
        r.email || null,
        r.whatsapp || null,
        r.category,
        r.order ?? 0,
        r.active ?? true,
        r.community || 'fr',
        r.bio_fr || null,
        r.bio_pl || null,
        r.created_at || new Date(),
        r.updated_at || new Date(),
      ],
    });

    // Mass schedules (horaires)
    await copyTable({
      table: 'mass_schedules',
      select: '*',
      insertSql: insertMass,
      mapRow: (r) => [
        r.id,
        r.day_code || 'autre',
        r.day_fr || null,
        r.day_pl || null,
        r.time,
        r.location || null,
        r.location_fr || null,
        r.location_pl || null,
        r.description || null,
        r.description_fr || null,
        r.description_pl || null,
        r.is_special ?? false,
        r.special_date || null,
        r.language || 'fr',
        r.order ?? 0,
        r.active ?? true,
        r.created_at || new Date(),
        r.updated_at || new Date(),
      ],
    });

    // Footer links
    await copyTable({
      table: 'footer_links',
      select: '*',
      insertSql: insertFooter,
      mapRow: (r) => [
        r.id,
        r.label,
        r.label_fr || null,
        r.label_pl || null,
        r.url,
        r.sort_order ?? 0,
        r.active ?? true,
        r.created_at || new Date(),
        r.updated_at || new Date(),
      ],
    });

    // Life stages
    await copyTable({
      table: 'life_stages',
      select: '*',
      insertSql: insertLife,
      mapRow: (r) => [
        r.id,
        r.title_fr,
        r.title_pl || null,
        r.description_fr,
        r.description_pl || null,
        r.icon || null,
        r.image_url || null,
        r.sort_order ?? 0,
        r.active ?? true,
        r.created_at || new Date(),
        r.updated_at || new Date(),
      ],
    });

    // FAQ categories
    await copyTable({
      table: 'faq_categories',
      select: '*',
      insertSql: insertFaqCat,
      mapRow: (r) => [
        r.id,
        r.name || 'FAQ',
        r.sort_order ?? 0,
        r.active ?? true,
        r.created_at || new Date(),
        r.updated_at || new Date(),
      ],
    });

    // FAQ items
    await copyTable({
      table: 'faq_items',
      select: '*',
      insertSql: insertFaqItem,
      mapRow: (r) => [
        r.id,
        r.question_fr,
        r.question_pl || null,
        r.answer_fr || null,
        r.answer_pl || null,
        r.category_id, // FK vers faq_categories.id
        r.sort_order ?? 0,
        r.active ?? true,
        r.created_at || new Date(),
        r.updated_at || new Date(),
      ],
    });

    await pool.end();
    console.log('\nTerminé.');
  } catch (err) {
    console.error('Erreur migration :', err);
    await pool.end();
    process.exit(1);
  }
})();
