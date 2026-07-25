# UNILAK Platform Upgrade - Technical Roadmap

**Objective**: Transform platform from school reviews → classes finder + student stories platform

---

## PHASE 1: FOUNDATION & DATABASE SETUP

### 1.1 Database Schema Updates
- [ ] Create `classes_table` in Supabase with fields:
  - `id` (UUID, primary key)
  - `course_name` (string, indexed)
  - `department` (string)
  - `academic_year` (string)
  - `program` (string)
  - `intake` (string)
  - `lecturer` (string)
  - `start_date` (date)
  - `end_date` (date) - status active/inactive is determined by this date
  - `cat_date` (date)
  - `exam_date` (date)
  - `classroom` (string)
  - `whatsapp_link` (string, nullable)
  - `cp_contact` (string, nullable)
  - `last_updated` (timestamp)
  - `status` (string - auto-determined by end_date)

- [ ] Add database functions:
  - `refresh_class_status()` - trigger function to update status based on end_date
  - Scheduled function to periodically refresh all class statuses (run daily/weekly)

- [ ] Add database triggers:
  - Auto-update `updated_at` on class modification
  - Auto-compute `status` field when `end_date` is changed

- [ ] Update `reviews_table` (rename conceptually to student_stories):
  - Keep structure the same (backend stays "reviews")
  - Add `reactions_count` (JSON) field for emoji reactions: `{ "👍": 5, "❤️": 3, ... }`
  - Add relationship tracking for student stories (reviews specific to students)

- [ ] Create `reactions_table` (user emoji reactions):
  - `id` (UUID)
  - `review_id` (FK to reviews_table)
  - `user_id` (FK to profiles_table)
  - `emoji_type` (string: 👍, ❤️, 🔥, etc.)
  - `created_at` (timestamp)
  - Unique constraint: (review_id, user_id, emoji_type)

### 1.2 Database Cleanup
- [ ] Review unused tables and fields
- [ ] Archive or remove obsolete data structures
- [ ] Create migration scripts for existing data

---

## PHASE 2: UI COMPONENT REFACTORING

### 2.1 Sticky Header Implementation
- [ ] Create new component `StickyHeader.tsx`:
  - Display community icon from `public/community-icon.png`
  - Show navigation button (Home icon, unless on home page)
  - Position: sticky top with z-index management
  - Responsive design (mobile/tablet/desktop)
  - Link to home when icon clicked
  - Collapse behavior on scroll (optional enhancement)

- [ ] Update [page.tsx](app/page.tsx):
  - Remove large hero header section
  - Integrate `StickyHeader` globally via layout.tsx

### 2.2 Home Page Card Structure
- [ ] Create `HomeCard.tsx` component:
  - Props: icon, title, description, href, color
  - Card styling: clickable, hover effects, shadow

- [ ] Create 4 new landing card components:
  - `FindCoursesCard.tsx` - navigates to `/find-classes`
  - `StudentStoriesCard.tsx` - navigates to `/reviews` (rebranded UI) //this is not in use by now
  - `MakeAnnouncementCard.tsx` - navigates to `/announcement`
  - `LearnMoreCard.tsx` - navigates to `/information`

- [ ] Refactor [page.tsx](app/page.tsx):
  - Remove stats section (positive/negative review bars)
  - Remove direction section
  - Keep announcement section at top
  - Keep join community button
  - Add 4-card grid layout (responsive: 1 col mobile, 2 col tablet, 4 col desktop)
  - Keep "Did You Know" slider
  - Keep footer

### 2.3 Student Stories (Reviews Rebranding)
- [ ] Update [ReviewCard.tsx](components/ReviewCard.tsx) → terminology only:
  - Change labels from "review" to "story" in UI text
  - Add emoji reaction display UI

- [ ] Create `ReactionButton.tsx` component:
  - Display common emojis: 👍, ❤️, 🔥, 😂, 😮, 😢
  - Show count per emoji
  - Handle click to add/remove reaction
  - Call backend API

- [ ] Create `ReactionBar.tsx` component:
  - Aggregate all reactions for a story
  - Insert below story content

- [ ] Update [ReviewForm.tsx](components/ReviewForm.tsx):
  - Keep structure (still called "review" in backend)
  - Update labels: "Share Your Story" instead of "Write a Review"
  - Update success messages

- [ ] Update [reviews/page.tsx](app/reviews/page.tsx):
  - Rename page title from "Reviews" to "Student Stories"
  - Update page heading and descriptions
  - Integrate reaction components

### 2.4 Student Stories API Endpoint
- [ ] Create [api/reactions/route.ts](app/api/reactions/route.ts):
  - `POST /api/reactions` - add/remove emoji reaction
  - `GET /api/reactions/[id]` - get reactions for a story
  - Authentication: check user is logged in
  - Validation: prevent duplicate reactions from same user

---

## PHASE 3: NEW FEATURE - FIND CLASSES

### 3.1 Backend Setup
- [ ] Create [api/classes/route.ts](app/api/classes/route.ts):
  - `GET /api/classes` - list all classes (active or with future dates) with filters:
    - Query params: `department`, `program`, `intake`, `lecturer`, `status`
  - `POST /api/classes` (moderator only) - create/import new class
  - Include pagination (limit, offset)

- [ ] Create [api/classes/search/route.ts](app/api/classes/search/route.ts):
  - `POST /api/classes/search` - full-text search:
    - Search in: course_name, department, lecturer, program
    - Return ranked results

- [ ] Create [api/classes/[id]/route.ts](app/api/classes/[id]/route.ts):
  - `GET /api/classes/[id]` - get single class details
  - `PUT /api/classes/[id]` (moderator) - update class
  - `DELETE /api/classes/[id]` (moderator) - soft delete

### 3.2 UI Components
- [ ] Create `ClassCard.tsx`:
  - Display: course name, department, academic year, program, lecturer, dates (start/end/cat/exam)
  - show cp phone number (if available)
  - Show classroom and WhatsApp link
  - Show status (active/inactive based on end_date)

- [ ] Create `ClassFilters.tsx`:
  - Filters: department, program, intake, lecturer, status
  - Search input integration
  - Filter apply/reset buttons

- [ ] Create `ClassSearchBar.tsx`:
  - Real-time search input
  - Autocomplete suggestions
  - Search by course name, department, lecturer

### 3.3 Pages
- [ ] Create [app/find-classes/page.tsx](app/find-classes/page.tsx):
  - Search bar at top
  - Filter sidebar (or collapsible on mobile): department, program, intake, lecturer, status
  - Grid/list view toggle
  - Display class cards
  - Pagination
  - Empty state handling
  - Loading skeletons

- [ ] Create [app/find-classes/[id]/page.tsx](app/find-classes/[id]/page.tsx):
  - Class detail view:
    - Course name, department, program, intake
    - Lecturer name
    - Academic year
    - Important dates: start_date, end_date, CAT date, exam date
    - Classroom location
    - WhatsApp group link (if available)
    - Representative phone (if available)
    - Status badge
    - Back button

---

## PHASE 4: UI ENHANCEMENTS

### 4.1 Donation FAB (Floating Action Button)
- [ ] Create `DonationFAB.tsx`:
  - Position: fixed bottom-right
  - Icon: heart or donation symbol
  - Hover effect
  - Opens modal on click

- [ ] Create `DonationModal.tsx`:
  - Display support message
  - Inspirational copy about supporting platform
  - Donate button
  - Close button


- [ ] Integrate into [app/layout.tsx](app/layout.tsx):
  - Include `DonationFAB` globally
  - Ensure z-index doesn't conflict with other modals

---

## PHASE 5: MODERATOR FEATURES

### 5.1 Class Management Page
- [ ] Create [app/moderator/classes/page.tsx](app/moderator/classes/page.tsx):
  - Table view of all classes
  - Columns: course name, department, program, lecturer, start_date, end_date, status
  - Actions: edit, delete, toggle status
  - Create/import class button

- [ ] Create [app/moderator/classes/create/page.tsx](app/moderator/classes/create/page.tsx):
  - Form to manually add class
  - Fields: course_name, department, program, academic_year, intake, lecturer, start_date, end_date, cat_date, exam_date, classroom, whatsapp_link, cp_contact
  - Save button

### 5.2 AI-Powered Class Import (PDF Timetable to Classes)
- [ ] Create `PDFUploadForm.tsx`:
  - File input for university timetable/course list PDF
  - Drag-and-drop support
  - File validation (PDF only, size limit)
  - Upload button

- [ ] Create [api/classes/import-pdf/route.ts](app/api/classes/import-pdf/route.ts):
  - `POST /api/classes/import-pdf`
  - Handle file upload
  - Parse PDF (use library like `pdfjs-dist` or `pdf-parse`)
  - Extract course/class data from PDF
  - Call AI API (OpenAI/Claude) to convert to JSON:
    - Input: extracted PDF text containing course listings
    - Output: JSON array of classes with schema matching `classes_table` fields:
      - course_name, department, program, academic_year, intake, lecturer, start_date, end_date, cat_date, exam_date, classroom, whatsapp_link, cp_contact
  - Validate AI output against schema
  - Return parsed data for review before insert

- [ ] Create [app/moderator/classes/import/page.tsx](app/moderator/classes/import/page.tsx):
  - Display `PDFUploadForm`
  - Show preview of parsed data (table format)
  - Confirm/Edit/Delete options before inserting individual classes
  - Insert button to save to database
  - Success/error messages

- [ ] Update [app/moderator/layout.tsx](app/moderator/layout.tsx):
  - Add "Manage Classes" link to sidebar

### 5.3 Survey Form & Data Collection
- [ ] Create `survey_responses_table` in Supabase with fields:
  - `id` (UUID, primary key)
  - `user_id` (FK to profiles_table, nullable for anonymous submissions)
  - `course_id` (FK to classes_table)
  - `course_name` (string - denormalized for reference)
  - `intake` (string)
  - `department` (string)
  - `program` (string)
  - `academic_year` (string)
  - `cp_contact` (string) - class representative phone number
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

- [ ] Create `SurveyForm.tsx` component:
  - Accessible via FAB on home page
  - Form fields (in order):
    - Dropdown for intake
    - Dropdown for department
    - Dropdown for program
    - Dropdown for academic year
    - **Dropdown for course selection (ONLY SHOWS COURSES MATCHING selected intake + department + program + academic_year)**
    - Text input for CP contact (phone number)
  - Submit button with validation
  - Success/error toast notifications
  - Call API endpoint to save response
  - Modal or drawer UI for form display
  - **Note**: Course dropdown should be disabled/hidden until intake, department, and academic year are selected. Fetch only relevant courses based on these three filters to narrow down the list and improve UX.

- [ ] Create `SurveyFAB.tsx` component:
  - Fixed position bottom-right (stacked with DonationFAB)
  - Icon: clipboard or survey icon
  - Tooltip: "Help us improve - Share your class info"
  - Opens SurveyForm on click
  - Z-index management to prevent overlap with other FABs

- [ ] Create [api/survey/route.ts](app/api/survey/route.ts):
  - `POST /api/survey` - submit survey response
  - `GET /api/survey` (moderator only) - get all survey responses with filters
  - `GET /api/survey/courses?intake=X&department=Y&program=Z&academic_year=W` - get filtered course list based on intake, department, program, and academic_year
  - Authentication: allow anonymous or logged-in users for POST; moderator only for GET filters
  - Validation: validate phone number format, required fields
  - Return success/error messages

- [ ] Create [api/survey/stats/route.ts](app/api/survey/stats/route.ts):
  - `GET /api/survey/stats` (moderator only) - get survey analytics
  - Return: count of responses, breakdown by course/intake/department/program
  - Export functionality for CSV report

- [ ] Create [app/moderator/survey/page.tsx](app/moderator/survey/page.tsx):
  - Admin dashboard to view survey responses
  - Table view with columns: course, intake, department, program, academic_year, cp_contact, submitted_date
  - Filters: by course, intake, department, program, date range
  - Sort by any column
  - Export to CSV button
  - Search functionality
  - Pagination
  - Stats summary at top: total responses, breakdown by course
  - Option to use CP contact data to update classes table
  - "Suggest Update" button to pre-fill class edit form with CP contact from survey

- [ ] Create [app/moderator/survey/[id]/page.tsx](app/moderator/survey/[id]/page.tsx):
  - Single survey response detail view
  - Display all fields
  - Option to mark response as "used for update"
  - Link to update associated class
  - Delete option

- [ ] Update [app/moderator/layout.tsx](app/moderator/layout.tsx):
  - Add "Survey Responses" link to sidebar

### 5.4 FAQ Management (Information Room)
- [ ] Create `faq_table` in Supabase with fields:
  - `id` (UUID, primary key)
  - `question` (string, indexed for search)
  - `answer` (text, rich text/markdown)
  - `category` (string: General, Classes, Student Stories, Features, Account)
  - `keywords` (TEXT[], indexed for full-text search)
  - `order` (integer, for manual ordering within category)
  - `is_published` (boolean, default true)
  - `created_by` (FK to profiles_table - moderator who created)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)
  - `view_count` (integer, for analytics)

- [ ] Create `FAQCard.tsx` component:
  - Display: question, answer (collapsible)
  - Show category badge
  - Smooth expand/collapse animation
  - Optional: show view count

- [ ] Create `FAQSearch.tsx` component:
  - Real-time search input
  - Search through question and keywords
  - Category filter buttons
  - Clear button

- [ ] Create [api/faq/route.ts](app/api/faq/route.ts):
  - `GET /api/faq` - get all published FAQs with filters:
    - Query params: `category`, `search` (keyword search)
    - Include pagination
  - `POST /api/faq` (moderator only) - create new FAQ
  - Return list with filtered results

- [ ] Create [api/faq/search/route.ts](app/api/faq/search/route.ts):
  - `POST /api/faq/search` - full-text search:
    - Search in: question, answer, keywords
    - Return ranked results by relevance
    - Increment view_count when FAQ is viewed

- [ ] Create [api/faq/[id]/route.ts](app/api/faq/[id]/route.ts):
  - `GET /api/faq/[id]` - get single FAQ
  - `PUT /api/faq/[id]` (moderator only) - update FAQ
  - `DELETE /api/faq/[id]` (moderator only) - delete FAQ

- [ ] Create [app/information/page.tsx](app/information/page.tsx) (Information Room - Public):
  - Display `FAQSearch` component at top
  - Grid/list view toggle for FAQs
  - Display filtered `FAQCard` components
  - Category filters: General, Classes, Student Stories, Features, Account
  - Pagination for large FAQ lists
  - Empty state with helpful message
  - "Can't find answer?" section with contact/support option
  - Loading skeletons while fetching

- [ ] Create [app/moderator/faq/page.tsx](app/moderator/faq/page.tsx):
  - Table view of all FAQs (published and unpublished)
  - Columns: question, category, is_published, view_count, created_by, created_at, actions
  - Filters: by category, by publish status
  - Search functionality
  - Sort by any column
  - Edit button (opens edit form/modal)
  - Delete button with confirmation
  - Create new FAQ button
  - Bulk actions: publish/unpublish multiple
  - Analytics: total FAQs, most viewed FAQs
  - Import/Export FAQ list (CSV/JSON)

- [ ] Create [app/moderator/faq/create/page.tsx](app/moderator/faq/create/page.tsx):
  - Form to create new FAQ
  - Fields:
    - Question input (required)
    - Answer textarea (rich text editor with markdown support)
    - Category dropdown (General, Classes, Student Stories, Features, Account)
    - Keywords input (comma-separated tags)
    - Order number input
    - Is published toggle
  - Save button
  - Cancel button
  - Preview mode to see how FAQ will appear
  - Auto-save draft functionality

- [ ] Create [app/moderator/faq/[id]/page.tsx](app/moderator/faq/[id]/page.tsx):
  - Edit existing FAQ
  - Same form as create page
  - Pre-filled with existing data
  - Show created_by and created_at info
  - Show view_count and last updated info
  - Delete button
  - Back button

- [ ] Update [app/moderator/layout.tsx](app/moderator/layout.tsx):
  - Add "Manage FAQs" link to sidebar

---

## PHASE 6: CONTENT & COPY UPDATES

### 6.1 Terminology Changes
- [ ] Audit all UI text for "review" → "student story" replacements:
  - Page titles
  - Button labels
  - Section headers
  - Help text
  - Metadata/SEO tags

- [ ] Update [metadata](app/page.tsx#L15-L29):
  - Home page description
  - Open Graph tags
  - Update to reflect new platform focus

### 6.2 Help & Documentation
- [ ] Update [app/rules/page.tsx](app/rules/page.tsx):
  - Add section about student stories
  - Add section about finding classes
  - Remove review-specific guidelines (if applicable)
  - Add reaction guidelines

### 6.3 Information Room
- [ ] The [app/information/page.tsx](app/information/page.tsx) and all FAQ management features are fully implemented in Phase 5.4 above

---

## PHASE 7: TESTING & CLEANUP

### 7.1 Testing
- [ ] Unit tests for new components:
  - `ClassFilters.tsx`
  - `ReactionBar.tsx`
  - API endpoints

- [ ] Integration tests:
  - Search functionality
  - Filter application
  - Reaction creation/deletion

- [ ] E2E tests:
  - Find classes flow
  - Student story with reactions
  - Moderator class import flow

### 7.2 Bug Fixes & Optimization
- [ ] Remove unused components/pages (old direction section, etc.)
- [ ] Optimize images and assets
- [ ] Review and optimize database queries
- [ ] Check performance of new search functionality

### 7.3 Deployment
- [ ] Database migration script execution
- [ ] Deploy schema changes
- [ ] Deploy backend APIs
- [ ] Deploy frontend changes
- [ ] Test on staging environment
- [ ] Production rollout

---

## PHASE 8: POST-LAUNCH

### 8.1 Monitoring
- [ ] Monitor API performance
- [ ] Track usage of new features
- [ ] Gather user feedback
---

## DEPENDENCY GRAPH

```
Database Schema (Phase 1.1)
    ↓
Classes Table → Survey Table (Phase 5.3) → FAQ Table (Phase 5.4)
    ↓
API Endpoints (Phase 3.1, Phase 4, Phase 5.2, Phase 5.3, Phase 5.4)
    ↓
UI Components (Phase 2, Phase 3.2, Phase 4, Phase 5.1, Phase 5.3, Phase 5.4)
    ↓
Pages (Phase 3.3, Phase 5, Phase 5.3, Phase 5.4)
    ↓
Testing (Phase 7.1)
    ↓
Deployment (Phase 7.3)
```

---

## IMPLEMENTATION NOTES

### Components to Create (New)
- `StickyHeader.tsx`
- `HomeCard.tsx`
- `FindCoursesCard.tsx`
- `StudentStoriesCard.tsx`
- `MakeAnnouncementCard.tsx`
- `LearnMoreCard.tsx`
- `ReactionButton.tsx`
- `ReactionBar.tsx`
- `ClassCard.tsx`
- `ClassFilters.tsx`
- `ClassSearchBar.tsx`
- `DonationFAB.tsx`
- `DonationModal.tsx`
- `PDFUploadForm.tsx`
- `SurveyForm.tsx`
- `SurveyFAB.tsx`
- `FAQCard.tsx`
- `FAQSearch.tsx`

### Components to Refactor
- [page.tsx](app/page.tsx) - Complete redesign
- [ReviewCard.tsx](components/ReviewCard.tsx) - Add reactions UI
- [ReviewForm.tsx](components/ReviewForm.tsx) - Update labels/text
- [Header.tsx](components/Header.tsx) - Update navigation
- [layout.tsx](app/layout.tsx) - Add sticky header & FAB

### Pages to Create
- [app/find-classes/page.tsx](app/find-classes/page.tsx)
- [app/find-classes/[id]/page.tsx](app/find-classes/[id]/page.tsx)
- [app/information/page.tsx](app/information/page.tsx)
- [app/moderator/classes/page.tsx](app/moderator/classes/page.tsx)
- [app/moderator/classes/create/page.tsx](app/moderator/classes/create/page.tsx)
- [app/moderator/classes/import/page.tsx](app/moderator/classes/import/page.tsx)
- [app/moderator/survey/page.tsx](app/moderator/survey/page.tsx)
- [app/moderator/survey/[id]/page.tsx](app/moderator/survey/[id]/page.tsx)

### API Routes to Create
- [api/reactions/route.ts](app/api/reactions/route.ts)
- [api/classes/route.ts](app/api/classes/route.ts)
- [api/classes/search/route.ts](app/api/classes/search/route.ts)
- [api/classes/[id]/route.ts](app/api/classes/[id]/route.ts)
- [api/classes/import-pdf/route.ts](app/api/classes/import-pdf/route.ts)
- [api/survey/route.ts](app/api/survey/route.ts)
- [api/survey/stats/route.ts](app/api/survey/stats/route.ts)
- [api/faq/route.ts](app/api/faq/route.ts)
- [api/faq/search/route.ts](app/api/faq/search/route.ts)
- [api/faq/[id]/route.ts](app/api/faq/[id]/route.ts)

### Dependencies to Add
- `pdfjs-dist` or `pdf-parse` (for PDF parsing of university timetables)
- AI SDK (OpenAI/Claude for extracting class data from PDF text and converting to JSON)
- Potentially: `react-dropzone` (drag-drop file upload)

### Database Changes Summary
- 4 new tables: `classes` (for university courses), `reactions` (for emoji reactions on stories), `survey_responses` (for survey form submissions), `faq` (for FAQ items)
- 6 new database functions: refresh_class_status(), update_reactions_count(), search_faqs(), increment_faq_view_count(), get_filtered_courses(), get_survey_dropdown_options()
- 4 new triggers for auto-updating timestamps on classes, reactions, survey_responses, and faq tables
- 1 updated table: `reviews` (add reactions_count field)
- Full-text search support for FAQs and classes with relevance ranking
- Migration scripts for existing reviews data

---

## Estimated Timeline (Rough)
- **Phase 1**: 2-3 days (database setup)
- **Phase 2**: 3-4 days (home page refactor + student stories)
- **Phase 3**: 4-5 days (find classes feature)
- **Phase 4**: 1-2 days (FAB + navigation)
- **Phase 5**: 3-4 days (moderator features + class import)
- **Phase 5.3**: 2-3 days (survey form + admin dashboard)
- **Phase 6**: 1-2 days (content updates + information page)
- **Phase 7**: 2-3 days (testing + cleanup)
- **Phase 8**: Ongoing (monitoring + enhancements)

**Total**: ~2-3.5 weeks for full implementation

---

## Risk Mitigation
- [ ] Backup database before schema changes
- [ ] Test migrations on staging first
- [ ] Keep old review terminology in code (backend stays "reviews")
- [ ] Feature flags for gradual rollout
- [ ] Fallback UI for PDF parsing failures
