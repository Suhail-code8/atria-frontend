# Atria Project Overview & Codebase Documentation

This document provides a comprehensive overview of the **Atria Platform**, a full-stack web application designed for comprehensive event management, competition execution, and participant submissions.

The project is logically divided into an `Atria-Frontend` client app and an `Atria-Backend` server API.

---

## 1. Technology Stack

### Frontend (`d:\Atria-Frontend`)
The frontend is a modern Single Page Application (SPA) utilizing a high-performance build tool and utility-first styling.
*   **Core framework:** React 18, Vite (TypeScript).
*   **Routing:** `react-router-dom` (v6) for centralized route handling.
*   **Styling:** TailwindCSS alongside `postcss` and `autoprefixer`.
*   **HTTP Client:** `axios` with configured request/response interceptors.
*   **Authentication:** `@react-oauth/google` for Google Sign-in.
*   **Icons:** `lucide-react`.

### Backend (`d:\Desktop\Atria-Backend`)
The backend is an Express-based REST API that communicates with a MongoDB database, featuring real-time socket connections and file handling.
*   **Core framework:** Node.js, Express 5, TypeScript.
*   **Database:** MongoDB utilizing `mongoose` ODM.
*   **Authentication:** JSON Web Tokens (`jsonwebtoken`) and `bcrypt` for password hashing, plus `google-auth-library`.
*   **File Uploads:** `multer` combined with `multer-storage-cloudinary` for cloud-based asset management (`cloudinary`).
*   **Real-time & Hooks:** `socket.io` for event-driven real-time updates and `nodemailer` for email alerts.

---

## 2. Backend Codebase Structure & Modules

The backend (`src/`) is built around a domain-driven modular architecture under the `src/modules/` directory. Each module inherently contains its own `routes`, `controller`, `service`, and Mongoose `model`.

### Key Modules:
*   **`events`**: The core structural module. Events have lifecycles (`DRAFT`, `PUBLISHED`, `REGISTRATION_OPEN`, `ONGOING`, `COMPLETED`), capability flags (whether to allow submissions, scaling, or teams), and custom configurations.
*   **`participation`**: Handles the registration of users into specific events. Collects dynamically generated custom form answers when users register.
*   **`competitions`**: A highly advanced module handling team-based and individual competition structures. Features include setting up categories, leaderboards, and scoring metrics (Points or Grades).
*   **`submissions`**: Allows participants to upload documents (`ABSTRACT`, `PAPER`, `FILE`, `LINK`, `CUSTOM`), which are then subjected to a pipeline (`SUBMITTED` -> `UNDER_REVIEW` -> `ACCEPTED`/`REJECTED`). Organizers/Judges can review these and assign numerical scores and text feedback.
*   **`users`**: Role-Based Access Control system distinguishing between `PARTICIPANT`, `ORGANIZER`, and `JUDGE`.
*   **`auth`**: Handles token generation and validation middlewares.
*   **`announcements`**: Tools for organizers to broadcast messages or emails to event participants.

---

## 3. Frontend Codebase Structure

The frontend (`src/`) is a mirror of the backend functionalities, ensuring a scalable and clean React architecture.

### Directory Breakdown:
*   **`api/`**: Centralized Axios abstraction. Each backend module has a corresponding API file here (e.g., `events.api.ts`, `submissions.api.ts`) abstracting the endpoints, ensuring strong typing for payloads.
*   **`auth/`**: Contains the React Context (`AuthContext`) responsible for storing the current user, local storage JWTs, and providing global login state to the application.
*   **`routes.tsx`**: A crucial file that maps URLs to React components. Utilizes a `<ProtectedRoute>` wrapper to block unauthorized access to deeply nested organizer and participant dashboards.

### Core Views & Features:
*   **`events/`**: 
    *   `EventDetails.tsx`: The public/participant-facing view for reading about an event and hitting the "Register" button.
    *   `EventManage.tsx`: The Organizer's control panel. Refactored into tabs (Analytics, Configuration, Teams, Scoring, Promotion) for deep event modifications.
*   **`submissions/`**:
    *   `CreateSubmission.tsx` & `SubmissionEditor.tsx`: Participant tools to write abstracts, upload files, and save drafts before final submittal.
    *   `OrganizerSubmissions.tsx` & `SubmissionViewer.tsx`: Organizer tools to list all incoming files, view uploaded Cloudinary assets natively, and trigger Accept/Reject workflows with assigned grades.
*   **`components/`**: 
    *   Contains highly reusable UI fragments: `Button`, `Modal`, `Badge`, `Input`, and `Loader`.
    *   `FormBuilder.tsx`: A complex component allowing Organizers to drag-and-drop or define dynamic inputs (text, select, checkbox) that participants must fill out during Event Registration.
    *   Sub-directories (`events`, `competitions`, `announcements`) house specific complex widget pieces like the `AnalyticsTab` or the `FestSetup`.

---

## 4. Communication & Flow

1.  **Authentication Flow**: A user logs in via Google or native credentials on the frontend -> Server validates and issues a JWT -> Frontend stores the JWT and passes it as a Bearer token via Axios interceptors on every subsequent request.
2.  **Event Lifecycle**: Organizer creates an Event (`DRAFT`) -> Configures Capabilities and dynamic Registration Forms in `EventManage.tsx` -> Publishes Event.
3.  **Participant Flow**: Participant browses to Event Details -> Fills out dynamic forms -> Submits via `participation` API -> Once registered, can access the `MySubmissions` tab to upload files for review.
4.  **Judging Flow**: Organizers browse to `OrganizerSubmissions.tsx` -> Review uploaded Cloudinary assets -> Score out of 100 -> Submission status updates -> Backend fires a Nodemailer email to the participant informing them of their Accepted/Rejected status.

---

## Summary
Atria is a robust, modular platform. The architecture emphasizes **Capability-driven design** (events can have any combination of features toggled on or off) and **Domain-driven backend modules**, ensuring that as the platform scales to support larger competitions, new modules can be plugged in seamlessly.

---

## 5. Complete Folder Structures

### Backend Structure (d:\Desktop\Atria-Backend\src)
``text
+-- app.ts
+-- config
|   +-- cloudinary.ts
|   +-- db.ts
|   \-- env.ts
+-- middlewares
|   +-- auth.middleware.ts
|   +-- error.middleware.ts
|   +-- role.middleware.ts
|   \-- upload.middleware.ts
+-- modules
|   +-- announcements
|   |   +-- announcement.controller.ts
|   |   +-- announcement.model.ts
|   |   +-- announcement.routes.ts
|   |   \-- announcement.service.ts
|   +-- auth
|   |   +-- auth.controller.ts
|   |   +-- auth.routes.ts
|   |   \-- auth.service.ts
|   +-- competitions
|   |   +-- category.controller.ts
|   |   +-- category.model.ts
|   |   +-- category.routes.ts
|   |   +-- category.service.ts
|   |   +-- competitionEntry.model.ts
|   |   +-- competitionItem.controller.ts
|   |   +-- competitionItem.model.ts
|   |   +-- competitionItem.routes.ts
|   |   +-- competitionItem.service.ts
|   |   +-- entry.controller.ts
|   |   +-- entry.routes.ts
|   |   +-- entry.service.ts
|   |   +-- result.controller.ts
|   |   +-- result.model.ts
|   |   +-- result.routes.ts
|   |   +-- result.service.ts
|   |   +-- team.controller.ts
|   |   +-- team.model.ts
|   |   +-- team.routes.ts
|   |   \-- team.service.ts
|   +-- events
|   |   +-- event.controller.ts
|   |   +-- event.lifecycle.ts
|   |   +-- event.model.ts
|   |   +-- event.routes.ts
|   |   \-- event.service.ts
|   +-- participation
|   |   +-- participation.controller.ts
|   |   +-- participation.model.ts
|   |   +-- participation.routes.ts
|   |   \-- participation.service.ts
|   +-- submissions
|   |   +-- submission.controller.ts
|   |   +-- submission.model.ts
|   |   +-- submission.routes.ts
|   |   \-- submission.service.ts
|   \-- users
|       +-- Atria-Backend.code-workspace
|       +-- user.controller.ts
|       +-- user.model.ts
|       \-- user.routes.ts
+-- scripts
|   \-- reset-db.mts
+-- server.ts
+-- types
|   \-- express.d.ts
\-- utils
    \-- email.service.ts
``

### Frontend Structure (d:\Atria-Frontend\src)
``text
+-- api
|   +-- announcement.api.ts
|   +-- auth.api.ts
|   +-- axios.ts
|   +-- competition.api.ts
|   +-- events.api.ts
|   +-- participation.api.ts
|   +-- result.api.ts
|   +-- submissions.api.ts
|   \-- team.api.ts
+-- App.tsx
+-- auth
|   +-- AuthContext.tsx
|   +-- Login.tsx
|   \-- Register.tsx
+-- components
|   +-- announcements
|   |   +-- EventAnnouncements.tsx
|   |   \-- OrganizerAnnouncements.tsx
|   +-- Badge.tsx
|   +-- Button.tsx
|   +-- competitions
|   |   +-- FestSetup.tsx
|   |   +-- IndividualLeaderboard.tsx
|   |   +-- Leaderboard.tsx
|   |   +-- ScoringDashboard.tsx
|   |   \-- TeamDashboard.tsx
|   +-- events
|   |   +-- AnalyticsTab.tsx
|   |   +-- EditEventForm.tsx
|   |   \-- EventPosterManager.tsx
|   +-- FormBuilder.tsx
|   +-- Input.tsx
|   +-- Loader.tsx
|   +-- Modal.tsx
|   +-- ProtectedRoute.tsx
|   \-- RegistrationModal.tsx
+-- events
|   +-- CreateEvent.tsx
|   +-- EventCard.tsx
|   +-- EventDetails.tsx
|   +-- EventLayout.tsx
|   +-- EventList.tsx
|   +-- EventManage.tsx
|   +-- EventManagement.tsx
|   +-- EventOverview.tsx
|   +-- EventTeamHub.tsx
|   +-- MyEvents.tsx
|   \-- MyRegistrations.tsx
+-- index.css
+-- layout
|   +-- Navbar.tsx
|   \-- PageLayout.tsx
+-- main.tsx
+-- routes.tsx
+-- submissions
|   +-- CreateSubmission.tsx
|   +-- MySubmissions.tsx
|   +-- OrganizerSubmissions.tsx
|   +-- ParticipantSubmission.tsx
|   +-- SubmissionEditor.tsx
|   \-- SubmissionViewer.tsx
+-- types
|   \-- index.ts
+-- utils
|   \-- formatters.ts
\-- vite-env.d.ts
``
