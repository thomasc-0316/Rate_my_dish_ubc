# Project Plan

## 1. Coordination Strategy

Our team of five developers will collaborate through a lightweight, flexible workflow designed for consistent progress and adaptability.

**Team Roles**
- **Ryan (PM + Frontend):** Oversees coordination, schedules meetings, and ensures milestone progress. Assists with frontend when needed.
- **Daniel (Fullstack):** Implements core frontend and backend features.
- **Ivan (Fullstack):** Implements core frontend and backend features.
- **Thomas (Fullstack):** Implements core frontend and backend features.
- **Muk (Backend):** Implements and maintains backend functionality and database logic.

**Work Coordination**
Ryan will manage the overall workflow, maintain the task board, and ensure smooth communication across subteams. Task assignment and progress tracking will be done through GitHub Issues, linked to a project board that represents the current sprint/milestone tasks.

We will hold **quick online stand-ups** (10–15 minutes) twice a week to review progress and blockers. Longer **working sessions** will be scheduled as needed when integrating major features or preparing milestone submissions.  
Meeting agendas will be prepared and shared by Ryan beforehand, and summaries will be posted in the Discord server afterward.

*Rationale:*  
Our project scope and team size make short, asynchronous coordination the most efficient approach. Weekly milestones enforced by the course already provide external accountability, so we will focus our efforts on feature delivery rather than heavy management overhead.

---

## 2. Communication Tools

| Tool | Purpose | Alternatives Considered | Rationale |
|------|----------|--------------------------|------------|
| **Discord** | Real-time discussions, announcements, meeting coordination | Slack, Messenger | All members already use Discord; channels can be organized for dev, design, and bug triage. |
| **GitHub Issues** | Task assignment, feature tracking, and progress updates | Trello, Jira | GitHub integration keeps issues tied directly to commits and pull requests. |
| **Google Drive** | Centralized folder for shared docs, reports, and planning materials | Notion, Confluence | Lightweight and accessible for everyone; sufficient for collaborative writing. |

*Rationale:*  
These tools balance simplicity and structure. Discord handles fast communication, GitHub manages development tasks, and Drive stores documentation.

---

## 3. Component Ownership

| Component | Owner | Responsibilities |
|------------|--------|------------------|
| **Authentication & User Accounts** | Daniel | Implement login/register logic and connect frontend with backend auth API. |
| **Backend / Database Layer** | Muk | Set up database schema, API endpoints, and handle Nutrislice integration. |
| **Frontend Framework Setup & Navigation** | Ryan | Initialize React architecture, handle routing, and design base UI layout. |
| **Dish & Rating System** | Ivan | Build the rating submission flow and connect it to backend endpoints. |
| **Leaderboard Page & Data Aggregation** | Thomas | Implement leaderboard ranking logic and UI components. |
| **Shared Design & UI Polish** | All Members | Collaborate on consistent visual design and responsiveness across pages. |

*Rationale:*  
Ownership clarifies accountability while maintaining flexibility. Because several members are comfortable with both frontend and backend work, ownership focuses on responsibility for final correctness and delivery rather than strict boundaries.

---

## 4. Timeline & Milestones

The overall project runs from **now until December 5**.  
The timeline below represents internal goals aligned with the course’s weekly milestones.

| Week | Dates | Internal Focus | Expected Deliverables |
|------|--------|----------------|------------------------|
| **Week 1** | Nov 7–13 | Codebase setup, repo structure, CI setup | Base architecture scaffolded (frontend + backend folders, environment setup) |
| **Week 2** | Nov 14–20 | Authentication & navigation | Functional login/register, working navbar and routing between pages |
| **Week 3** | Nov 21–27 | Menu data & dining hall pages | Nutrislice API integration, dynamic dining hall pages with stations and dishes |
| **Week 4** | Nov 28–Dec 4 | Ratings system, leaderboard, and polish | Fully functional rating submission, leaderboard display, bug fixes, and manual testing |
| **Final Submission** | Dec 5 | Final polish and documentation | Verified MVP with all core requirements met |

*Rationale:*  
This timeline allows progressive development where each week builds on the last. Early focus on structure and authentication ensures later integration (menu, ratings, leaderboard) can happen smoothly.

---

## 5. Verification & Testing Plan

We will verify that requirements are met through a **requirement-based checklist** and **manual user testing**.  
After each merge to the main branch, the feature implementer and one reviewer will manually test the new functionality.

### Verification Methodology
- **Checklist Testing:** Each requirement from `requirements.md` will be listed and tested for expected behavior (pass/fail).  
- **Click-Through Testing:** Regular exploratory sessions to test the app from a user perspective, focusing on UI/UX flow.  
- **Peer Review:** Before merging pull requests, another team member will review the code for logical correctness and alignment with requirements.  

### Example Verification Mapping

| Requirement ID | Verification Method | Pass Criteria |
|----------------|---------------------|----------------|
| **R2.3.1** (User authentication) | Manual test with valid/invalid credentials | System correctly logs in valid users and rejects invalid ones with proper error message. |
| **R4.4.1** (Dish click → detail page) | Manual navigation test | Clicking a dish row navigates to the correct detail page. |
| **R5.4.10** (Rating submission) | Manual input test | Rating and optional comment appear immediately after submission. |
| **R6.2.1** (Leaderboard shows top 10 dishes) | Data mock test | Top 10 dishes sorted by rating, accurate and limited to 10 entries. |
| **R7.6.1** (Empty state for My Ratings) | UI test | Empty message appears correctly when user has no ratings. |

### Integration of Verification
- Manual verification conducted **immediately after each merge** to main.  
- Larger full-system tests performed **before milestone submissions**.  
- Testing feedback will be logged in GitHub Issues tagged as “bug” or “QA”.

*Rationale:*  
Because this is a user-facing product emphasizing UI/UX quality, manual testing ensures we validate both the interface and experience beyond simple unit tests.

---

**End of Document**
