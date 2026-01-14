-- UUID generation uses built-in gen_random_uuid() function (PostgreSQL 13+)
-- No extension needed for Supabase

-- Create enums
CREATE TYPE tackle_item_type AS ENUM ('rod', 'reel', 'lure', 'line', 'hook', 'other');
CREATE TYPE location_type AS ENUM ('pond', 'lake', 'river', 'stream', 'ocean', 'other');
CREATE TYPE friendship_status AS ENUM ('pending', 'accepted', 'blocked');

-- Users table (extends auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    state TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fish species table
CREATE TABLE public.fish_species (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    common_name TEXT NOT NULL,
    scientific_name TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tackle items table
CREATE TABLE public.tackle_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type tackle_item_type NOT NULL,
    brand TEXT,
    model TEXT,
    description TEXT,
    image_url TEXT,
    source_url TEXT,
    scraped_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tackle item tags (many-to-many with fish species)
CREATE TABLE public.tackle_item_tags (
    tackle_item_id UUID NOT NULL REFERENCES public.tackle_items(id) ON DELETE CASCADE,
    fish_species_id UUID NOT NULL REFERENCES public.fish_species(id) ON DELETE CASCADE,
    effectiveness INTEGER CHECK (effectiveness >= 1 AND effectiveness <= 5),
    PRIMARY KEY (tackle_item_id, fish_species_id)
);

-- Locations table (water bodies)
CREATE TABLE public.locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type location_type NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    state TEXT NOT NULL,
    fish_species UUID[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Catches table
CREATE TABLE public.catches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
    fish_species_id UUID NOT NULL REFERENCES public.fish_species(id),
    tackle_item_id UUID REFERENCES public.tackle_items(id) ON DELETE SET NULL,
    weight DECIMAL(8, 2),
    length DECIMAL(8, 2),
    photo_url TEXT,
    notes TEXT,
    caught_at TIMESTAMPTZ NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    weather_data JSONB,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Friendships table
CREATE TABLE public.friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status friendship_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_friendship UNIQUE (user_id, friend_id),
    CONSTRAINT no_self_friendship CHECK (user_id != friend_id)
);

-- Comments table
CREATE TABLE public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    catch_id UUID NOT NULL REFERENCES public.catches(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leaderboard cache table
CREATE TABLE public.leaderboard_cache (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    state TEXT NOT NULL,
    total_catches INTEGER DEFAULT 0,
    biggest_fish_weight DECIMAL(8, 2),
    biggest_fish_length DECIMAL(8, 2),
    total_points INTEGER DEFAULT 0,
    rank_state INTEGER,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_tackle_items_user_id ON public.tackle_items(user_id);
CREATE INDEX idx_catches_user_id ON public.catches(user_id);
CREATE INDEX idx_catches_caught_at ON public.catches(caught_at DESC);
CREATE INDEX idx_catches_location_id ON public.catches(location_id);
-- Geospatial index (requires PostGIS extension - enabled by default in Supabase)
-- Using a simpler btree index for now; can be upgraded to GIST with PostGIS if needed
CREATE INDEX idx_locations_lat_lng ON public.locations(latitude, longitude);
CREATE INDEX idx_friendships_user_id ON public.friendships(user_id);
CREATE INDEX idx_friendships_friend_id ON public.friendships(friend_id);
CREATE INDEX idx_friendships_status ON public.friendships(status);
CREATE INDEX idx_comments_catch_id ON public.comments(catch_id);
CREATE INDEX idx_leaderboard_cache_state ON public.leaderboard_cache(state);
CREATE INDEX idx_leaderboard_cache_total_points ON public.leaderboard_cache(total_points DESC);
CREATE INDEX idx_leaderboard_cache_total_catches ON public.leaderboard_cache(total_catches DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tackle_items_updated_at BEFORE UPDATE ON public.tackle_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON public.locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_friendships_updated_at BEFORE UPDATE ON public.friendships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate catch points
CREATE OR REPLACE FUNCTION calculate_catch_points(
    p_weight DECIMAL,
    p_length DECIMAL,
    p_species_id UUID
)
RETURNS INTEGER AS $$
DECLARE
    base_points INTEGER := 10;
    size_bonus INTEGER := 0;
    rarity_bonus INTEGER := 0;
    time_bonus INTEGER := 0;
    current_hour INTEGER;
BEGIN
    -- Base points
    base_points := 10;
    
    -- Size bonus (simplified - would need average weights per species)
    IF p_weight IS NOT NULL THEN
        size_bonus := LEAST(FLOOR(p_weight * 5)::INTEGER, 50);
    ELSIF p_length IS NOT NULL THEN
        size_bonus := LEAST(FLOOR(p_length * 2)::INTEGER, 50);
    END IF;
    
    -- Time bonus (early morning/evening)
    current_hour := EXTRACT(HOUR FROM NOW());
    IF current_hour >= 5 AND current_hour <= 8 THEN
        time_bonus := 5; -- Early morning
    ELSIF current_hour >= 18 AND current_hour <= 21 THEN
        time_bonus := 5; -- Evening
    END IF;
    
    -- Rarity bonus (would need species rarity data)
    rarity_bonus := 0;
    
    RETURN base_points + size_bonus + rarity_bonus + time_bonus;
END;
$$ LANGUAGE plpgsql;

-- Function to update leaderboard cache
CREATE OR REPLACE FUNCTION update_leaderboard_cache()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.leaderboard_cache (user_id, state, total_catches, biggest_fish_weight, biggest_fish_length, total_points, updated_at)
    SELECT 
        u.id,
        u.state,
        COUNT(c.id)::INTEGER,
        MAX(c.weight),
        MAX(c.length),
        COALESCE(SUM(c.points), 0)::INTEGER,
        NOW()
    FROM public.users u
    LEFT JOIN public.catches c ON c.user_id = u.id
    WHERE u.id = NEW.user_id AND u.state IS NOT NULL
    GROUP BY u.id, u.state
    ON CONFLICT (user_id) DO UPDATE SET
        total_catches = EXCLUDED.total_catches,
        biggest_fish_weight = EXCLUDED.biggest_fish_weight,
        biggest_fish_length = EXCLUDED.biggest_fish_length,
        total_points = EXCLUDED.total_points,
        updated_at = NOW();
    
    -- Update ranks
    WITH ranked AS (
        SELECT 
            user_id,
            state,
            ROW_NUMBER() OVER (PARTITION BY state ORDER BY total_points DESC) as rank
        FROM public.leaderboard_cache
    )
    UPDATE public.leaderboard_cache lc
    SET rank_state = r.rank
    FROM ranked r
    WHERE lc.user_id = r.user_id AND lc.state = r.state;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update leaderboard cache on catch insert/update
CREATE TRIGGER catch_leaderboard_update
AFTER INSERT OR UPDATE ON public.catches
FOR EACH ROW
EXECUTE FUNCTION update_leaderboard_cache();

-- Function to get leaderboard
CREATE OR REPLACE FUNCTION get_leaderboard(
    p_state TEXT DEFAULT NULL,
    p_metric TEXT DEFAULT 'points',
    p_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
    user_id UUID,
    username TEXT,
    display_name TEXT,
    avatar_url TEXT,
    total_catches INTEGER,
    biggest_fish_weight DECIMAL,
    biggest_fish_length DECIMAL,
    total_points INTEGER,
    rank INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        lc.user_id,
        u.username,
        u.display_name,
        u.avatar_url,
        lc.total_catches,
        lc.biggest_fish_weight,
        lc.biggest_fish_length,
        lc.total_points,
        lc.rank_state::INTEGER as rank
    FROM public.leaderboard_cache lc
    JOIN public.users u ON u.id = lc.user_id
    WHERE (p_state IS NULL OR lc.state = p_state)
    ORDER BY 
        CASE p_metric
            WHEN 'catches' THEN lc.total_catches
            WHEN 'weight' THEN lc.biggest_fish_weight
            WHEN 'length' THEN lc.biggest_fish_length
            ELSE lc.total_points
        END DESC NULLS LAST
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tackle_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fish_species ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_cache ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read all profiles"
    ON public.users FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.users FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Tackle items policies
CREATE POLICY "Users can read own tackle items"
    ON public.tackle_items FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tackle items"
    ON public.tackle_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tackle items"
    ON public.tackle_items FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tackle items"
    ON public.tackle_items FOR DELETE
    USING (auth.uid() = user_id);

-- Fish species policies (public read)
CREATE POLICY "Anyone can read fish species"
    ON public.fish_species FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert fish species"
    ON public.fish_species FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Locations policies (public read, authenticated write)
CREATE POLICY "Anyone can read locations"
    ON public.locations FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert locations"
    ON public.locations FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update locations"
    ON public.locations FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Catches policies
CREATE POLICY "Anyone can read catches"
    ON public.catches FOR SELECT
    USING (true);

CREATE POLICY "Users can insert own catches"
    ON public.catches FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own catches"
    ON public.catches FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own catches"
    ON public.catches FOR DELETE
    USING (auth.uid() = user_id);

-- Friendships policies
CREATE POLICY "Users can read own friendships"
    ON public.friendships FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can insert own friendships"
    ON public.friendships FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own friendships"
    ON public.friendships FOR UPDATE
    USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Comments policies
CREATE POLICY "Anyone can read comments"
    ON public.comments FOR SELECT
    USING (true);

CREATE POLICY "Users can insert own comments"
    ON public.comments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
    ON public.comments FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
    ON public.comments FOR DELETE
    USING (auth.uid() = user_id);

-- Leaderboard cache policies (public read)
CREATE POLICY "Anyone can read leaderboard cache"
    ON public.leaderboard_cache FOR SELECT
    USING (true);
