UNILAK COMMUNITY
========================

DESCRIPTION:
========================
Empowering students with a voice. Share your experiences, stay informed, and connect with the campus community.


TECH STACK
========================
FRAMEWORK: Next.js (App Router)
LANGUAGES: TypeScript, PLgSQL
STYLING: Tailwind CSS
BACKEND: Supabase (PostgreSQL + Auth + Storage)
HOSTING: Vercel

PAGES
====================================================

1. AUTHENTICATION PAGE
========================
* SIGN UP/IN form
* sign up Help

## AUTHENTICATION RULES

* Signup is required to add reviews
* Anonymous-first usernames
* Role-based naming

### Roles & Default Prefix

* Student → student_
* CP → cp_
* Lecturer → lecturer_
* Leader → leader_
* Alumni → alumni_
* Explorer → explorer_

Usernames auto-increment.

2. HOME PAGE
========================

#### Dynamic stats (overview)

* Total positive reviews
* Total negative reviews
* Progress sliders based on counts

#### Other sections

* Announcement (TOP SECTION)
* Navigation text: ASK > CLAIM > REVIEW
* Recent Reviews (latest 4)
* Did You Know (moderator-managed)
* ANNOUNCEMENT FEED

#### QUICK LINKS (footer)

* My Account
* Make announcement
* Feedback
* Community Usage Rules
* Privacy policy

3. REVIEWS PAGES
========================

#### 1 Topic Filters (horizontal scroll)

* Leadership
* Lecturers
* Students
* Week of Prayer
* Technology
* Knowledge
* Other Services

Page layout:

* Reviews cards (2x2)
* Floating 'ADD YOURS' button (FAB)

Submitting a review requires authentication.


TOPICS STRUCTURE
==========================================

### Main Topics + Subtopics

* LECTURERS

  * Secret
  * Individual
  * All

* LEADERSHIP
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
  * programm

* STUDENTS
  * All
  * Individual
  * International
  * Rwandan

* KNOWLEDGE
 * General

* OTHER SERVICES
 * General


## REVIEW DISPLAY STRUCTURE
==========================================

Each review shows:

* Profile avatar
* Username
* Description: `is talking about <topic> in UNILAK > <subtopic>, <type>`
* Review content
* Optional recommendation
* Timestamp
* 3-dot menu:

  * Owner: edit / delete
  * Moderator: delete
  * Others: report


============ 3 ADMIN DASHBOARD (moderator) ============

Capabilities:
==================================
* Manage reviews (delete)
* Manage reports (exmine reported reviews)
* Manage announcements (Screen, reject, approve, handle payments)
* Manage facts (update did you know)
* Manage users
* View the users feedback


## DEVELOPMENT PHASES
==================================

Phase 1 (MVP):
* Auth ✅
* Reviews ✅
* Announcements ✅
* chat modal and Whatsapp integration ✅
* Admin dashboard ✅
* SEO, Index, Seeding

Phase 2 (beta):
* real usage
* scaling
* Track the feedback

Phase 3:

* ongoing emprovements

## FINAL NOTE

Development will keep ongoing to improve the platform security, UI/UX

COMMUNITY USAGE RULES
==================================
1. ## Say it as it is
Be honest and transparent. Share your genuine experiences without filtering the truth.

2. ## Be respectful
Treat others with dignity. Harassment, hate speech, or disrespect will not be tolerated.

3. ## Use English language
To ensure everyone understands, please communicate in English across the platform.

4. ## Don't expose your personal information
Protect your privacy. Never share sensitive details like phone numbers or addresses publicly.

5. ## No fake/fraud/scam/spam content
Keep the community clean. Misleading information, scams, and spam are strictly prohibited.

6. ## Always remember rule N04
We cannot emphasize this enough: Your personal safety and privacy come first.