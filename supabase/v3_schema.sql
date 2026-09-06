-- ============================================================================
-- EVENTS FEATURE
-- ============================================================================

-- Moderators publish event flyers for students to discover.
CREATE TABLE IF NOT EXISTS public.events_table (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	title VARCHAR(180) NOT NULL,
	category VARCHAR(50) NOT NULL CHECK (
		category IN ('Academic', 'prayer', 'Sports', 'Clubs', 'Social', 'Career', 'Other')
	),
	flyer_url TEXT NOT NULL,
	start_date TIMESTAMP WITH TIME ZONE,
	end_date TIMESTAMP WITH TIME ZONE,
	duration TEXT,
	venue VARCHAR(20) CHECK (venue IN ('online', 'on-site')),
	venue_value TEXT,
	interest_count INTEGER NOT NULL DEFAULT 0 CHECK (interest_count >= 0),
	status VARCHAR(20) NOT NULL DEFAULT 'published' CHECK (
		status IN ('draft', 'published', 'archived')
	),
	created_by UUID REFERENCES public.profiles_table(id) ON DELETE SET NULL,
	created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	published_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_events_status_published_at
	ON public.events_table(status, published_at DESC);

ALTER TABLE public.events_table
	ADD COLUMN IF NOT EXISTS venue VARCHAR(20),
	ADD COLUMN IF NOT EXISTS venue_value TEXT;

CREATE TABLE IF NOT EXISTS public.event_interests_table (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	event_id UUID NOT NULL REFERENCES public.events_table(id) ON DELETE CASCADE,
	user_id UUID NOT NULL REFERENCES public.profiles_table(id) ON DELETE CASCADE,
	created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	CONSTRAINT unique_event_interest UNIQUE (event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_interests_event_id
	ON public.event_interests_table(event_id);

ALTER TABLE public.events_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_interests_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published events" ON public.events_table;
CREATE POLICY "Public can view published events"
ON public.events_table FOR SELECT
USING (status = 'published');

CREATE POLICY "Moderators can manage events"
ON public.events_table FOR ALL
USING (
	EXISTS (
		SELECT 1 FROM public.profiles_table
		WHERE profiles_table.id = auth.uid()
		AND profiles_table.role = 'moderator'
	)
)
WITH CHECK (
	EXISTS (
		SELECT 1 FROM public.profiles_table
		WHERE profiles_table.id = auth.uid()
		AND profiles_table.role = 'moderator'
	)
);

CREATE POLICY "Users can express interest in events"
ON public.event_interests_table FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their event interest"
ON public.event_interests_table FOR DELETE
USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_event_interest_count()
RETURNS TRIGGER AS $$
BEGIN
	IF TG_OP = 'INSERT' THEN
		UPDATE public.events_table
		SET interest_count = interest_count + 1
		WHERE id = NEW.event_id;
		RETURN NEW;
	END IF;

	UPDATE public.events_table
	SET interest_count = GREATEST(interest_count - 1, 0)
	WHERE id = OLD.event_id;
	RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_event_interest_count_on_insert
AFTER INSERT ON public.event_interests_table
FOR EACH ROW EXECUTE FUNCTION public.update_event_interest_count();

CREATE TRIGGER update_event_interest_count_on_delete
AFTER DELETE ON public.event_interests_table
FOR EACH ROW EXECUTE FUNCTION public.update_event_interest_count();

-- Create this public bucket manually in Supabase Storage before uploading flyers.
-- Bucket name: event-flyers

CREATE POLICY "Public can view event flyers"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-flyers');

CREATE POLICY "Moderators can upload event flyers"
ON storage.objects FOR INSERT
WITH CHECK (
	 bucket_id = 'event-flyers'
	 AND EXISTS (
		 SELECT 1 FROM public.profiles_table
		 WHERE profiles_table.id = auth.uid()
		 AND profiles_table.role = 'moderator'
	 )
);

CREATE POLICY "Moderators can update event flyers"
ON storage.objects FOR UPDATE
USING (
	 bucket_id = 'event-flyers'
	 AND EXISTS (
		 SELECT 1 FROM public.profiles_table
		 WHERE profiles_table.id = auth.uid()
		 AND profiles_table.role = 'moderator'
	 )
)
WITH CHECK (
	 bucket_id = 'event-flyers'
	 AND EXISTS (
		 SELECT 1 FROM public.profiles_table
		 WHERE profiles_table.id = auth.uid()
		 AND profiles_table.role = 'moderator'
	 )
);

CREATE POLICY "Moderators can delete event flyers"
ON storage.objects FOR DELETE
USING (
	 bucket_id = 'event-flyers'
	 AND EXISTS (
		 SELECT 1 FROM public.profiles_table
		 WHERE profiles_table.id = auth.uid()
		 AND profiles_table.role = 'moderator'
	 )
);
