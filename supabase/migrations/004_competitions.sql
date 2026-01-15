-- Competition types and status enums
CREATE TYPE competition_type AS ENUM ('daily', 'weekly', 'monthly', 'yearly');
CREATE TYPE competition_status AS ENUM ('pending', 'active', 'completed', 'cancelled');
CREATE TYPE competition_metric AS ENUM ('points', 'catches', 'weight', 'length');

-- Competitions table
CREATE TABLE public.competitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    type competition_type NOT NULL,
    metric competition_metric NOT NULL DEFAULT 'points',
    target_species_id UUID REFERENCES public.fish_species(id),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    status competition_status DEFAULT 'pending',
    is_public BOOLEAN DEFAULT false,
    max_participants INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_dates CHECK (end_date > start_date)
);

-- Competition participants table
CREATE TABLE public.competition_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    score DECIMAL(12, 2) DEFAULT 0,
    catch_count INTEGER DEFAULT 0,
    best_catch_id UUID REFERENCES public.catches(id),
    rank INTEGER,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_participation UNIQUE (competition_id, user_id)
);

-- Competition invitations table
CREATE TABLE public.competition_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
    inviter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    invitee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    responded_at TIMESTAMPTZ,
    CONSTRAINT unique_invitation UNIQUE (competition_id, invitee_id)
);

-- Indexes
CREATE INDEX idx_competitions_creator ON public.competitions(creator_id);
CREATE INDEX idx_competitions_status ON public.competitions(status);
CREATE INDEX idx_competitions_dates ON public.competitions(start_date, end_date);
CREATE INDEX idx_competition_participants_competition ON public.competition_participants(competition_id);
CREATE INDEX idx_competition_participants_user ON public.competition_participants(user_id);
CREATE INDEX idx_competition_participants_rank ON public.competition_participants(competition_id, rank);
CREATE INDEX idx_competition_invitations_invitee ON public.competition_invitations(invitee_id);

-- Triggers
CREATE TRIGGER update_competitions_updated_at BEFORE UPDATE ON public.competitions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update competition status based on dates
CREATE OR REPLACE FUNCTION update_competition_status()
RETURNS void AS $$
BEGIN
    -- Activate pending competitions that have started
    UPDATE public.competitions
    SET status = 'active'
    WHERE status = 'pending'
    AND start_date <= NOW();

    -- Complete active competitions that have ended
    UPDATE public.competitions
    SET status = 'completed'
    WHERE status = 'active'
    AND end_date <= NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to update participant scores when a catch is logged
CREATE OR REPLACE FUNCTION update_competition_scores()
RETURNS TRIGGER AS $$
DECLARE
    comp RECORD;
    participant_id UUID;
    new_score DECIMAL;
    new_catch_count INTEGER;
BEGIN
    -- Find active competitions the user is participating in
    FOR comp IN
        SELECT c.id, c.metric, c.target_species_id
        FROM public.competitions c
        INNER JOIN public.competition_participants cp ON cp.competition_id = c.id
        WHERE cp.user_id = NEW.user_id
        AND c.status = 'active'
        AND NEW.caught_at >= c.start_date
        AND NEW.caught_at <= c.end_date
    LOOP
        -- Check if catch matches target species (if specified)
        IF comp.target_species_id IS NOT NULL AND comp.target_species_id != NEW.fish_species_id THEN
            CONTINUE;
        END IF;

        -- Calculate new score based on metric
        SELECT
            cp.id,
            CASE comp.metric
                WHEN 'points' THEN COALESCE(SUM(cat.points), 0)
                WHEN 'catches' THEN COUNT(cat.id)
                WHEN 'weight' THEN COALESCE(MAX(cat.weight), 0)
                WHEN 'length' THEN COALESCE(MAX(cat.length), 0)
            END,
            COUNT(cat.id)
        INTO participant_id, new_score, new_catch_count
        FROM public.competition_participants cp
        LEFT JOIN public.catches cat ON cat.user_id = cp.user_id
            AND cat.caught_at >= (SELECT start_date FROM public.competitions WHERE id = comp.id)
            AND cat.caught_at <= (SELECT end_date FROM public.competitions WHERE id = comp.id)
            AND (comp.target_species_id IS NULL OR cat.fish_species_id = comp.target_species_id)
        WHERE cp.competition_id = comp.id
        AND cp.user_id = NEW.user_id
        GROUP BY cp.id;

        -- Update participant score
        UPDATE public.competition_participants
        SET score = new_score, catch_count = new_catch_count
        WHERE id = participant_id;

        -- Update ranks for all participants in this competition
        WITH ranked AS (
            SELECT
                id,
                ROW_NUMBER() OVER (ORDER BY score DESC, catch_count DESC, joined_at ASC) as new_rank
            FROM public.competition_participants
            WHERE competition_id = comp.id
        )
        UPDATE public.competition_participants cp
        SET rank = r.new_rank
        FROM ranked r
        WHERE cp.id = r.id;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update competition scores on new catch
CREATE TRIGGER catch_competition_score_update
AFTER INSERT ON public.catches
FOR EACH ROW
EXECUTE FUNCTION update_competition_scores();

-- RLS Policies

ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_invitations ENABLE ROW LEVEL SECURITY;

-- Competitions policies
CREATE POLICY "Anyone can read public competitions"
    ON public.competitions FOR SELECT
    USING (is_public = true OR creator_id = auth.uid() OR 
           EXISTS (SELECT 1 FROM public.competition_participants WHERE competition_id = id AND user_id = auth.uid()));

CREATE POLICY "Users can create competitions"
    ON public.competitions FOR INSERT
    WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their competitions"
    ON public.competitions FOR UPDATE
    USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete pending competitions"
    ON public.competitions FOR DELETE
    USING (auth.uid() = creator_id AND status = 'pending');

-- Participants policies
CREATE POLICY "Anyone can read competition participants"
    ON public.competition_participants FOR SELECT
    USING (true);

CREATE POLICY "Users can join competitions"
    ON public.competition_participants FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave pending competitions"
    ON public.competition_participants FOR DELETE
    USING (auth.uid() = user_id AND 
           (SELECT status FROM public.competitions WHERE id = competition_id) = 'pending');

-- Invitations policies
CREATE POLICY "Users can read their invitations"
    ON public.competition_invitations FOR SELECT
    USING (inviter_id = auth.uid() OR invitee_id = auth.uid());

CREATE POLICY "Users can create invitations for their competitions"
    ON public.competition_invitations FOR INSERT
    WITH CHECK (auth.uid() = inviter_id AND 
                EXISTS (SELECT 1 FROM public.competitions WHERE id = competition_id AND creator_id = auth.uid()));

CREATE POLICY "Invitees can update invitation status"
    ON public.competition_invitations FOR UPDATE
    USING (invitee_id = auth.uid());
