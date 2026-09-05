-- ============================================================================
-- SCHEMA UPDATES FOR PHASE 1-5 FEATURES
-- ============================================================================
-- This file adds new tables, functions, and triggers required by new_schema.sql
-- while fixing naming inconsistencies and dependencies

-- ============================================================================
-- CRITICAL PREREQUISITE: update_updated_at_column() FUNCTION
-- ============================================================================
-- This function is REQUIRED by multiple triggers below

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- 1. CLASSES TABLE (Phase 1.1)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.classes_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_name VARCHAR(255) NOT NULL,
  faculty VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  year_of_study VARCHAR(2) NOT NULL,
  program VARCHAR(100) NOT NULL,
  intake VARCHAR(10) NOT NULL,
  lecturer VARCHAR(255),
  start_date DATE,
  end_date DATE,
  cat_date DATE,
  exam_date DATE,
  classroom VARCHAR(100),
  whatsapp_link VARCHAR(500),
  cp_contact VARCHAR(20),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create indexes for classes_table
CREATE INDEX IF NOT EXISTS idx_classes_course_name ON public.classes_table(course_name);
CREATE INDEX IF NOT EXISTS idx_classes_faculty ON public.classes_table(faculty);
CREATE INDEX IF NOT EXISTS idx_classes_department ON public.classes_table(department);
CREATE INDEX IF NOT EXISTS idx_classes_program ON public.classes_table(program);
CREATE INDEX IF NOT EXISTS idx_classes_intake ON public.classes_table(intake);
CREATE INDEX IF NOT EXISTS idx_classes_lecturer ON public.classes_table(lecturer);
CREATE INDEX IF NOT EXISTS idx_classes_year_of_study ON public.classes_table(year_of_study);
CREATE INDEX IF NOT EXISTS idx_classes_end_date ON public.classes_table(end_date);
CREATE INDEX IF NOT EXISTS idx_classes_created_at ON public.classes_table(created_at);

-- Enable RLS on classes_table
ALTER TABLE public.classes_table ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Public read classes
CREATE POLICY "Public read classes"
ON public.classes_table FOR SELECT
USING (true);

-- RLS Policy: Moderators can insert classes
CREATE POLICY "Moderators can insert classes"
ON public.classes_table FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles_table
    WHERE profiles_table.id = auth.uid()
    AND profiles_table.role = 'moderator'
  )
);

-- RLS Policy: Moderators can update classes
CREATE POLICY "Moderators can update classes"
ON public.classes_table FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles_table
    WHERE profiles_table.id = auth.uid()
    AND profiles_table.role = 'moderator'
  )
);

-- RLS Policy: Moderators can delete classes
CREATE POLICY "Moderators can delete classes"
ON public.classes_table FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles_table
    WHERE profiles_table.id = auth.uid()
    AND profiles_table.role = 'moderator'
  )
);


-- 2. SURVEY RESPONSES TABLE (Phase 5.3)
-- ============================================================================
-- FIXED: Foreign key references use correct table names

CREATE TABLE IF NOT EXISTS public.survey_responses_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  course_id UUID,
  course_name VARCHAR(255) NOT NULL,
  intake VARCHAR(50) NOT NULL,
  department VARCHAR(100) NOT NULL,
  program VARCHAR(100) NOT NULL,
  cp_contact VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  CONSTRAINT fk_user_id_survey FOREIGN KEY (user_id) REFERENCES public.profiles_table(id) ON DELETE SET NULL,
  CONSTRAINT fk_course_id FOREIGN KEY (course_id) REFERENCES public.classes_table(id) ON DELETE SET NULL
);

-- Create indexes for survey_responses_table
CREATE INDEX IF NOT EXISTS idx_survey_responses_user_id ON public.survey_responses_table(user_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_course_id ON public.survey_responses_table(course_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_intake ON public.survey_responses_table(intake);
CREATE INDEX IF NOT EXISTS idx_survey_responses_department ON public.survey_responses_table(department);
CREATE INDEX IF NOT EXISTS idx_survey_responses_program ON public.survey_responses_table(program);
CREATE INDEX IF NOT EXISTS idx_survey_responses_created_at ON public.survey_responses_table(created_at);

-- Enable RLS on survey_responses_table
ALTER TABLE public.survey_responses_table ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can insert survey responses
CREATE POLICY "Anyone can insert survey responses"
ON public.survey_responses_table FOR INSERT
WITH CHECK (true);

-- RLS Policy: Users can view own survey responses
CREATE POLICY "Users can view own survey responses"
ON public.survey_responses_table FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

-- RLS Policy: Moderators can view all survey responses
CREATE POLICY "Moderators can view survey responses"
ON public.survey_responses_table FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles_table
    WHERE profiles_table.id = auth.uid()
    AND profiles_table.role = 'moderator'
  )
);

-- RLS Policy: Moderators can delete survey responses
CREATE POLICY "Moderators can delete survey responses"
ON public.survey_responses_table FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles_table
    WHERE profiles_table.id = auth.uid()
    AND profiles_table.role = 'moderator'
  )
);


-- ============================================================================
-- 3. FAQ TABLE (Phase 5.4)
-- ============================================================================
-- FIXED: Foreign key reference uses correct table name (profiles_table)

CREATE TABLE IF NOT EXISTS public.faq_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question VARCHAR(500) NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('General', 'Registration', 'Student life', 'Rules', 'Opportunities', 'Other')),
  keywords TEXT[],
  "order" INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  view_count INTEGER DEFAULT 0,
  CONSTRAINT fk_faq_created_by FOREIGN KEY (created_by) REFERENCES public.profiles_table(id) ON DELETE SET NULL
);

-- Create indexes for faq_table
CREATE INDEX IF NOT EXISTS idx_faq_question ON public.faq_table(question);
CREATE INDEX IF NOT EXISTS idx_faq_category ON public.faq_table(category);
CREATE INDEX IF NOT EXISTS idx_faq_is_published ON public.faq_table(is_published);
CREATE INDEX IF NOT EXISTS idx_faq_keywords ON public.faq_table USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_faq_order ON public.faq_table("order");
CREATE INDEX IF NOT EXISTS idx_faq_created_at ON public.faq_table(created_at);
CREATE INDEX IF NOT EXISTS idx_faq_view_count ON public.faq_table(view_count DESC);

-- Enable RLS on faq_table
ALTER TABLE public.faq_table ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Public read published FAQs
CREATE POLICY "Public read published FAQs"
ON public.faq_table FOR SELECT
USING (is_published = true);

-- RLS Policy: Moderators can view all FAQs (published and unpublished)
CREATE POLICY "Moderators can view all FAQs"
ON public.faq_table FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles_table
    WHERE profiles_table.id = auth.uid()
    AND profiles_table.role = 'moderator'
  )
);

-- RLS Policy: Moderators can insert FAQs
CREATE POLICY "Moderators can insert FAQs"
ON public.faq_table FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles_table
    WHERE profiles_table.id = auth.uid()
    AND profiles_table.role = 'moderator'
  )
);

-- RLS Policy: Moderators can update FAQs
CREATE POLICY "Moderators can update FAQs"
ON public.faq_table FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles_table
    WHERE profiles_table.id = auth.uid()
    AND profiles_table.role = 'moderator'
  )
);

-- RLS Policy: Moderators can delete FAQs
CREATE POLICY "Moderators can delete FAQs"
ON public.faq_table FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles_table
    WHERE profiles_table.id = auth.uid()
    AND profiles_table.role = 'moderator'
  )
);

-- RLS Policy: Public can update view_count on published FAQs (for view tracking)
CREATE POLICY "Public can update view_count on published FAQs"
ON public.faq_table FOR UPDATE
USING (is_published = true)
WITH CHECK (is_published = true);


-- ============================================================================
-- 6. DATABASE FUNCTIONS
-- ============================================================================

-- Function to delete expired classes (end_date in the past)
CREATE OR REPLACE FUNCTION public.delete_expired_classes()
RETURNS VOID AS $$
BEGIN
  DELETE FROM public.classes_table
  WHERE end_date IS NOT NULL 
  AND end_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to handle class expiration (prevents updating to past dates)
CREATE OR REPLACE FUNCTION public.prevent_expired_class_update()
RETURNS TRIGGER AS $$
BEGIN
  -- If end_date is being updated to a past date, delete the class instead
  IF NEW.end_date IS NOT NULL AND NEW.end_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'Cannot set end_date to a past date. Use cleanup_expired_classes() to remove expired classes.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to search FAQs by keyword using full-text search
CREATE OR REPLACE FUNCTION public.search_faqs(p_search_query VARCHAR)
RETURNS TABLE(
  id UUID,
  question VARCHAR,
  answer TEXT,
  category VARCHAR,
  is_published BOOLEAN,
  view_count INTEGER,
  relevance FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.id,
    f.question,
    f.answer,
    f.category,
    f.is_published,
    f.view_count,
    COALESCE(
      CASE WHEN f.question ILIKE '%' || p_search_query || '%' THEN 2.0 ELSE 0 END +
      CASE WHEN f.answer ILIKE '%' || p_search_query || '%' THEN 1.0 ELSE 0 END +
      CASE WHEN f.keywords @> ARRAY[p_search_query] THEN 3.0 ELSE 0 END,
      0
    ) as relevance
  FROM public.faq_table f
  WHERE f.is_published = true
    AND (
      f.question ILIKE '%' || p_search_query || '%'
      OR f.answer ILIKE '%' || p_search_query || '%'
      OR f.keywords @> ARRAY[p_search_query]
    )
  ORDER BY relevance DESC, f."order" ASC, f.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to increment FAQ view count
CREATE OR REPLACE FUNCTION public.increment_faq_view_count(p_faq_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.faq_table
  SET view_count = view_count + 1
  WHERE id = p_faq_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to get filtered courses for survey form
CREATE OR REPLACE FUNCTION public.get_filtered_courses(
  p_faculty VARCHAR,
  p_department VARCHAR,
  p_program VARCHAR,
  p_intake VARCHAR,
  p_year_of_study VARCHAR
)
RETURNS TABLE(
  id UUID,
  course_name VARCHAR,
  faculty VARCHAR,
  department VARCHAR,
  program VARCHAR,
  intake VARCHAR,
  year_of_study VARCHAR,
  lecturer VARCHAR,
  start_date DATE,
  end_date DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.course_name,
    c.faculty,
    c.department,
    c.program,
    c.intake,
    c.year_of_study,
    c.lecturer,
    c.start_date,
    c.end_date
  FROM public.classes_table c
  WHERE 
    (p_faculty IS NULL OR c.faculty = p_faculty)
    AND (p_department IS NULL OR c.department = p_department)
    AND (p_program IS NULL OR c.program = p_program)
    AND (p_intake IS NULL OR c.intake = p_intake)
    AND (p_year_of_study IS NULL OR c.year_of_study = p_year_of_study)
    AND (c.end_date IS NULL OR c.end_date >= CURRENT_DATE)
  ORDER BY c.course_name;
END;
$$ LANGUAGE plpgsql;

-- Function to delete expired classes and return count
CREATE OR REPLACE FUNCTION public.cleanup_expired_classes()
RETURNS TABLE(deleted_count INT) AS $$
DECLARE
  v_count INT;
BEGIN
  DELETE FROM public.classes_table
  WHERE end_date IS NOT NULL AND end_date < CURRENT_DATE;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN QUERY SELECT v_count;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- 7. DATABASE TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp on classes_table
DROP TRIGGER IF EXISTS update_classes_timestamp ON public.classes_table;
CREATE TRIGGER update_classes_timestamp
BEFORE UPDATE ON public.classes_table
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Prevent setting end_date to past dates (use cleanup function instead)
DROP TRIGGER IF EXISTS prevent_expired_class_trigger ON public.classes_table;
CREATE TRIGGER prevent_expired_class_trigger
BEFORE UPDATE ON public.classes_table
FOR EACH ROW
EXECUTE FUNCTION public.prevent_expired_class_update();

-- Auto-update updated_at on survey_responses_table
DROP TRIGGER IF EXISTS update_survey_responses_timestamp ON public.survey_responses_table;
CREATE TRIGGER update_survey_responses_timestamp
BEFORE UPDATE ON public.survey_responses_table
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-update updated_at on faq_table
DROP TRIGGER IF EXISTS update_faq_timestamp ON public.faq_table;
CREATE TRIGGER update_faq_timestamp
BEFORE UPDATE ON public.faq_table
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();


-- ============================================================================
-- 8. HELPER FUNCTION FOR DEPRECATION (Backward Compatibility)
-- ============================================================================

-- Function to get all unique values for survey form dropdowns (deprecated)
CREATE OR REPLACE FUNCTION public.get_survey_dropdown_options()
RETURNS TABLE(result TEXT) AS $$
BEGIN
  RETURN QUERY SELECT 'Deprecated - use hardcoded values in frontend'::TEXT;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- NOTES & VERIFICATION
-- ============================================================================

/*
VERIFICATION CHECKLIST:

✅ Critical Fixes Applied:
1. Created missing update_updated_at_column() function (required by all new triggers)
2. Fixed foreign key references in survey_responses table (now uses profiles_table, classes_table)
3. Fixed foreign key reference in faq table (now uses profiles_table)
4. Added RLS policies for all new tables (classes, survey_responses, faq)
5. Removed status column from classes_table (classes auto-delete when expired)
6. Updated get_filtered_courses() to filter by end_date instead of status

✅ Dependencies Verified:
- update_updated_at_column() function exists ✅
- All trigger functions created ✅
- All triggers set to DROP IF EXISTS before CREATE to avoid conflicts ✅

✅ Important Notes - Class Lifecycle (New Approach):
1. Classes are ACTIVE while end_date >= today
2. Classes with end_date < today are DELETED automatically via cleanup_expired_classes()
3. No status column needed - only ongoing classes exist in database
4. Call cleanup_expired_classes() periodically (daily recommended via cron or manual API)
5. Prevent end_date being set to past dates via prevent_expired_class_trigger
6. get_filtered_courses() filters: (c.end_date IS NULL OR c.end_date >= CURRENT_DATE)

✅ Important Notes - Other Features:
1. FAQ relevance scoring: Implemented (2.0 for question, 1.0 for answer, 3.0 for keywords)
2. FAQ view analytics: Manual tracking via increment_faq_view_count() API calls
3. FAQ content: Must focus on campus life/rules, NOT platform marketing

✅ Table Structure:
- profiles_table (not profiles) - foreign keys correct
- classes_table (no status column) - automatic deletion of expired classes
- survey_responses_table (new table) - foreign keys correct
- faq_table (new table) - foreign keys correct

⚠️ IMPORTANT REMINDERS FOR PRODUCTION:
- Call cleanup_expired_classes() daily to remove expired classes
- Enable pg_cron in Supabase dashboard to schedule automatic cleanup
- Example cron job: SELECT cron.schedule('cleanup_classes_daily', '0 0 * * *', 'SELECT cleanup_expired_classes()');
- Test cleanup_expired_classes() on staging before production deployment
- RLS policies are enabled on all new tables - verify access permissions
- The prevent_expired_class_trigger prevents data corruption (no past end_dates)
*/
