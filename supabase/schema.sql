-- Creative Director Hub - Database Schema
-- Run this in your Supabase SQL Editor

-- ============================================
-- CREATIVES - All ads with performance data
-- ============================================
CREATE TABLE creatives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id TEXT NOT NULL,
    name TEXT NOT NULL,
    platform TEXT NOT NULL, -- meta, tiktok, youtube
    ad_type TEXT, -- ugc, studio, static, carousel
    hook_type TEXT,
    offer_id UUID REFERENCES offers(id),
    creator_name TEXT,
    thumbnail_url TEXT,
    video_url TEXT,
    launch_date DATE,
    status TEXT DEFAULT 'active', -- active, paused, killed
    spend DECIMAL(12,2) DEFAULT 0,
    roas DECIMAL(6,2),
    cpa DECIMAL(10,2),
    ctr DECIMAL(6,4),
    thumb_stop_rate DECIMAL(6,4),
    conversion_rate DECIMAL(6,4),
    impressions INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    meta_ad_id TEXT UNIQUE, -- For Meta API sync
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_creatives_brand ON creatives(brand_id);
CREATE INDEX idx_creatives_meta_ad_id ON creatives(meta_ad_id);
CREATE INDEX idx_creatives_status ON creatives(status);

-- ============================================
-- CREATIVE_METRICS - Daily time-series data
-- ============================================
CREATE TABLE creative_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creative_id UUID NOT NULL REFERENCES creatives(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    spend DECIMAL(12,2) DEFAULT 0,
    roas DECIMAL(6,2),
    cpa DECIMAL(10,2),
    ctr DECIMAL(6,4),
    thumb_stop_rate DECIMAL(6,4),
    impressions INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(creative_id, date)
);

CREATE INDEX idx_creative_metrics_creative ON creative_metrics(creative_id);
CREATE INDEX idx_creative_metrics_date ON creative_metrics(date);

-- ============================================
-- CREATIVE_TAGS - Environment, talent, style
-- ============================================
CREATE TABLE creative_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creative_id UUID NOT NULL REFERENCES creatives(id) ON DELETE CASCADE,
    environment TEXT, -- gym, home, outdoors, studio, office, garage, park
    talent_age_range TEXT, -- 18-24, 25-34, 35-44, 45-54, 55+
    talent_gender TEXT, -- male, female, mixed
    talent_body_type TEXT, -- athletic, average, muscular, slim
    talent_fitness_level TEXT, -- beginner, intermediate, advanced, pro
    filming_style TEXT, -- pov, talking-head, b-roll, demo, lifestyle, interview, screen-record, split-screen, asmr
    format TEXT, -- ugc, studio, static, carousel, motion-graphics
    props TEXT[], -- Array of props used
    setting_details TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_creative_tags_creative ON creative_tags(creative_id);

-- ============================================
-- OFFERS - Promotion library
-- ============================================
CREATE TABLE offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- discount, bundle, free-shipping, gift-with-purchase, bogo, financing
    value TEXT, -- e.g., "20%", "$50 off", "Free mat"
    conditions TEXT,
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'active', -- active, paused, expired
    avg_roas DECIMAL(6,2),
    avg_cpa DECIMAL(10,2),
    avg_conversion_rate DECIMAL(6,4),
    best_paired_angles TEXT[],
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_offers_brand ON offers(brand_id);
CREATE INDEX idx_offers_status ON offers(status);

-- ============================================
-- TESTS - A/B tests and experiments
-- ============================================
CREATE TABLE tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id TEXT NOT NULL,
    name TEXT NOT NULL,
    hypothesis TEXT,
    variables_tested JSONB, -- {hook: true, offer: false, format: true, ...}
    platform TEXT,
    start_date DATE,
    end_date DATE,
    results JSONB, -- Flexible results data
    winner TEXT,
    learning_summary TEXT,
    status TEXT DEFAULT 'active', -- active, complete, inconclusive
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tests_brand ON tests(brand_id);
CREATE INDEX idx_tests_status ON tests(status);

-- ============================================
-- LEARNINGS - Codified rules from tests
-- ============================================
CREATE TABLE learnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id TEXT NOT NULL,
    rule_text TEXT NOT NULL,
    source_test_id UUID REFERENCES tests(id),
    category TEXT, -- hook, offer, format, platform, audience, creative-element
    confidence TEXT DEFAULT 'medium', -- high, medium, low
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_learnings_brand ON learnings(brand_id);
CREATE INDEX idx_learnings_category ON learnings(category);

-- ============================================
-- COMPETITORS - Competitor profiles
-- ============================================
CREATE TABLE competitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id TEXT NOT NULL,
    name TEXT NOT NULL,
    url TEXT,
    logo_url TEXT,
    positioning TEXT,
    strengths TEXT,
    weaknesses TEXT,
    notes TEXT,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_competitors_brand ON competitors(brand_id);

-- ============================================
-- COMPETITOR_ADS - Individual competitor ads
-- ============================================
CREATE TABLE competitor_ads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competitor_id UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
    platform TEXT,
    screenshot_url TEXT,
    video_url TEXT,
    hook_text TEXT,
    cta TEXT,
    angle TEXT,
    format TEXT,
    ad_type TEXT,
    estimated_spend TEXT,
    date_spotted DATE DEFAULT CURRENT_DATE,
    rewritten_hook TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_competitor_ads_competitor ON competitor_ads(competitor_id);

-- ============================================
-- TRENDS - Trending sounds, formats, hooks
-- ============================================
CREATE TABLE trends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id TEXT NOT NULL,
    platform TEXT NOT NULL, -- tiktok, instagram, youtube
    category TEXT NOT NULL, -- sound, format, hook, hashtag, viral-ad
    title TEXT NOT NULL,
    description TEXT,
    example_urls TEXT[],
    relevance_score TEXT DEFAULT 'medium', -- high, medium, low
    adaptation_notes TEXT,
    estimated_window_days INTEGER,
    date_spotted DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'active', -- active, peaked, archived
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trends_brand ON trends(brand_id);
CREATE INDEX idx_trends_status ON trends(status);
CREATE INDEX idx_trends_date ON trends(date_spotted);

-- ============================================
-- AVATARS - Customer avatar profiles
-- ============================================
CREATE TABLE avatars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id TEXT NOT NULL,
    name TEXT NOT NULL,
    demographics JSONB, -- {age, gender, income, location, ...}
    psychographics JSONB, -- {values, interests, lifestyle, ...}
    pain_points TEXT[],
    desires TEXT[],
    language_samples TEXT[],
    awareness_level TEXT, -- unaware, problem-aware, solution-aware, product-aware, most-aware
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_avatars_brand ON avatars(brand_id);

-- ============================================
-- OBJECTIONS - Customer objections + counters
-- ============================================
CREATE TABLE objections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id TEXT NOT NULL,
    objection_text TEXT NOT NULL,
    frequency TEXT DEFAULT 'occasional', -- common, occasional, rare
    counter_arguments TEXT[],
    proof_points TEXT[],
    source TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_objections_brand ON objections(brand_id);

-- ============================================
-- COMMENTS - Ad comment mining
-- ============================================
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id TEXT NOT NULL,
    creative_id UUID REFERENCES creatives(id) ON DELETE SET NULL,
    platform TEXT,
    comment_text TEXT NOT NULL,
    theme TEXT, -- objection, praise, question, use-case, comparison, trigger
    sentiment TEXT, -- positive, negative, neutral, question
    is_golden_nugget BOOLEAN DEFAULT FALSE,
    date_spotted DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_brand ON comments(brand_id);
CREATE INDEX idx_comments_creative ON comments(creative_id);
CREATE INDEX idx_comments_theme ON comments(theme);
CREATE INDEX idx_comments_golden ON comments(is_golden_nugget);

-- ============================================
-- PLATFORM_NOTES - Platform playbook content
-- ============================================
CREATE TABLE platform_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id TEXT NOT NULL,
    platform TEXT NOT NULL, -- meta, tiktok, youtube
    section TEXT NOT NULL, -- best-practices, specs, trends, algorithm, rules
    content TEXT, -- Markdown content
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_platform_notes_brand ON platform_notes(brand_id);
CREATE INDEX idx_platform_notes_platform ON platform_notes(platform);

-- ============================================
-- Enable Row Level Security (configure policies later)
-- ============================================
ALTER TABLE creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE creative_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE creative_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE learnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE objections ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_notes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies (permissive for now - tighten later)
-- ============================================
CREATE POLICY "Allow all for now" ON creatives FOR ALL USING (true);
CREATE POLICY "Allow all for now" ON creative_metrics FOR ALL USING (true);
CREATE POLICY "Allow all for now" ON creative_tags FOR ALL USING (true);
CREATE POLICY "Allow all for now" ON offers FOR ALL USING (true);
CREATE POLICY "Allow all for now" ON tests FOR ALL USING (true);
CREATE POLICY "Allow all for now" ON learnings FOR ALL USING (true);
CREATE POLICY "Allow all for now" ON competitors FOR ALL USING (true);
CREATE POLICY "Allow all for now" ON competitor_ads FOR ALL USING (true);
CREATE POLICY "Allow all for now" ON trends FOR ALL USING (true);
CREATE POLICY "Allow all for now" ON avatars FOR ALL USING (true);
CREATE POLICY "Allow all for now" ON objections FOR ALL USING (true);
CREATE POLICY "Allow all for now" ON comments FOR ALL USING (true);
CREATE POLICY "Allow all for now" ON platform_notes FOR ALL USING (true);
