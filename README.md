UNILAK COMMUNITY – Developer README & Supabase Spec
================================================================== 

Purpose of this document:

Define frontend behavior exactly
Define Supabase backend design (tables, RLS, triggers, storage)


Tech Stack
===================================================================
* Framework: Next.js (App Router)
* Language: TypeScript
* Styling: Tailwind CSS (dark UI)
* Backend: Supabase (PostgreSQL + Auth + Storage)**
* Hosting: Vercel


Review Cards

* Positive: Blue tile
* Negative: Orange tile

Avatars

* Auto-generated alphabet avatar
* No real photos by default

ROUTES / PAGES
====================================================================

========================= 1 OVERVIEW (HOME) ========================

#### Dynamic stats (from backend)

* Total positive reviews
* Total negative reviews
* Progress sliders based on counts

#### Sections

* Announcement (moderator-managed)
* Navigation text: EXPLORE, ASK, CLAIM or leave a REVIEW
* Recent Reviews (latest 2, clickable)
* Did You Know (moderator-managed)

Footer links:

* My Account
* Terms of Use
* Community Usage Rules
* Make Announcement
* Request Take Down

====================== COMMUNITY USAGE RULES =========================
Last updated: (date)
1. Say it as it is
2. Show respect and use English language
3. Don't expose your personal information
4. No fake/fraud/scam/spam content
5. Always remember rule N03


=============================== 2 REVIEWS ===================================

#### 1 Topic Filters (horizontal scroll)

* Leadership
* Lecturers
* Students
* Week of Prayer
* Technology
* Knowledge
* Other Services

Rules:

* Selected topic → blue circle
* Unselected → gray circle

Page layout:

* Thin announcement section
* Reviews list
* Floating 'ADD YOURS' button


### 2 Review Creation Flow

Step-based form (progressive reveal):

1. "I'm talking about:"
   Main category + sub-options

2. "My review is:"

   Positive / Negative

3. "Review / Claim / Issue"

   Textarea
   Recommendation encouraged

Submit requires authentication.


## TOPIC STRUCTURE (DATA-DRIVEN)

### Main Topics + Subtopics

* LECTURERS

  * Secret
  * Individual
  * All

* LEADERSHIP

  * Secret
  * Principal
  * Dean of Studies
  * Recovery Office
  * HOD CIS
  * HOD ESM
  * Security
  * IT Office
  * Individual

* TECHNOLOGY

  * MIS / Elearning
  * Smart Attendance
  * Smart Boards
  * Network / WIFI
  * Other

* WEEK OF PRAYER

  * General

* STUDENTS

  * Secret
  * All
  * Individual
  * International
  * Rwandan

* KNOWLEDGE

* OTHER SERVICES


## REVIEW DISPLAY RULES

Each review shows:

* Alphabet avatar
* Username
* Description: `is talking about <topic> in UNILAK > <subtopic>, <type>`
* Review content
* Optional recommendation
* Timestamp
* 3-dot menu:

  * Owner: edit / delete
  * Moderator: delete
  * Others: report



## AUTHENTICATION RULES

* Signup required to add reviews
* Anonymous-first usernames
* Role-based naming

### Roles & Default Prefix

* Student → anon_student
* CP → anon_cp
* Alumni → anon_alumni
* Explorer → anon_explorer
* Lecturer → anon_lecturer
* Leader → anon_leader

Usernames auto-increment.


## MODERATOR DASHBOARD `/moderator`

Capabilities:

* Delete reviews
* Update announcements
* Update did you know
* View take-down requests
* View announcement requests


## DEVELOPMENT PHASES
=====================================================================================

Phase 1:

* Auth
* Reviews
* Topics & filters

Phase 2:

* Moderator dashboard
* Announcements

Phase 3:

* Monetization & scaling

## FINAL NOTE

This platform is opinion-first, anonymous-first and moderation-backed.
