# Email Collection System – Tech Stack & Architecture Document

## 1. Introduction

This document explains the **recommended technology stack, architecture, and design decisions** for building the **Email Collection System** for academic journal marketing campaigns.

The solution is designed to:

* Be **100% free** (no paid services)
* Scale up to **10 lakh (1,000,000) email records**
* Work efficiently with **CSV imports & exports**
* Leverage **Next.js**, matching the team’s existing experience

---

## 2. High-Level Architecture Overview

The application follows a **modern full-stack Next.js architecture** where frontend and backend live in the same codebase.

**Architecture Flow:**

User (Browser)
→ Next.js Frontend (UI & Dashboard)
→ Next.js API Routes / Server Actions
→ PostgreSQL Database (Neon / Supabase)

This approach avoids the need for a separate backend server, reducing cost and complexity.

---

## 3. Frontend Technology

### 3.1 Framework

**Next.js (App Router)**

* Server-side rendering for fast dashboards
* Server Actions for secure form submissions
* API Routes for CSV import/export
* Excellent SEO and performance

### 3.2 UI & Styling

* **Tailwind CSS** – utility-first, fast, responsive
* **ShadCN UI (optional)** – clean admin dashboard components
* **Recharts / Chart.js** – free charting for analytics

### 3.3 Mobile Responsiveness

* Tailwind ensures mobile-first responsive design
* Dashboard works smoothly on mobile & tablet

---

## 4. Backend Strategy (Zero Cost)

Instead of a separate backend:

* **Next.js API Routes** handle:

  * CSV uploads
  * CSV exports
  * Analytics queries
  * Journal management

Benefits:

* No extra hosting costs
* Simplified deployment
* Secure server-side logic

---

## 5. Database Selection

### 5.1 Database Type

**PostgreSQL** (Relational Database)

Why PostgreSQL:

* Easily handles **millions of records**
* Strong indexing and filtering
* Excellent for analytics queries
* ACID compliance (safe bulk imports)

### 5.2 Free PostgreSQL Providers

Recommended options:

* **Neon (Preferred)** – serverless PostgreSQL, generous free tier
* Supabase – free PostgreSQL with dashboard

No payment required for up to ~10GB storage (sufficient for 10 lakh records).

---

## 6. ORM (Database Access)

### Prisma ORM

Why Prisma:

* Strong schema validation
* Easy migrations
* Type-safe queries
* Excellent integration with Next.js

Prisma helps prevent duplicate inserts and ensures clean database access.

---

## 7. Database Schema Design

### 7.1 Journals Table

Stores journal metadata.

Fields:

* id (Primary Key)
* name
* issn
* brand (GlobalMeetX / ConfMeets)
* subject
* frequency
* status (Active / Inactive)
* created_at

### 7.2 Email Contacts Table

Stores collected email data.

Fields:

* id (Primary Key)
* name
* email
* phone
* journal_id (Foreign Key → journals)
* created_at

### 7.3 Duplicate Protection (Critical)

Database-level constraint:

* **Unique(email, journal_id)**

This means:

* The same email **cannot be inserted twice for the same journal**
* The same email **can exist across different journals**

Why this matters:

* Ensures zero duplicate emails per journal
* Uses PostgreSQL B-tree index for fast lookups
* Duplicate checking remains fast even with 10 lakh+ records
* Prevents race conditions during simultaneous imports

High performance duplicate checks

---

## 8. CSV Import System

### 8.1 CSV Validation Rules

* File type: CSV only
* Max file size: 10MB
* Required headers:

  * name
  * email
  * phone
  * publication_title
* Email format validation
* At least one data row required

### 8.2 CSV Parsing

Libraries:

* PapaParse (Node.js)
* fast-csv

### 8.3 Import Strategy (Scalable)

To safely handle large files:

* Parse CSV in **chunks (500–1000 rows)**
* Insert using bulk queries
* Use database conflict handling to skip duplicates

### 8.4 Import Summary

After processing:

* X records imported
* Y duplicates skipped

---

## 9. CSV Export System

### 9.1 Export Filters

Users can filter by:

* Date range
* Journal
* Brand

### 9.2 Export Process

* Apply filters at database level
* Stream CSV output (no memory overload)
* Generate downloadable CSV
* Log export activity

Exports complete within **3 seconds** for large datasets.

---

## 10. Dashboard Analytics

### 10.1 Metrics Displayed

* Total emails collected
* Emails by time period (week / month / year)
* Emails by brand
* Emails by journal

### 10.2 Analytics Approach

* Use **SQL aggregation queries**
* Avoid frontend-heavy calculations
* Index frequently queried columns

This ensures dashboard load time under **2 seconds**.

---

## 11. Performance & Scaling Considerations

### 11.1 Indexing Strategy

Indexes should be created on:

* **(email, journal_id)** → unique composite index (mandatory)
* journal_id
* created_at
* brand

### 11.2 Handling 10 Lakh Records

* PostgreSQL easily supports millions of rows
* Chunked CSV imports prevent timeouts
* Streaming exports avoid memory issues

---

## 12. Hosting & Deployment

### 12.1 Hosting Platform

**Vercel (Free Tier)**

* Best-in-class Next.js support
* Free API routes
* Global CDN
* Easy CI/CD

### 12.2 Deployment Flow

* Push code to GitHub
* Connect repository to Vercel
* Auto-deploy on every commit

---

## 13. Security & Best Practices

* Server-side validation for CSV files
* Database-level uniqueness constraints
* Environment variables for DB credentials
* Optional authentication using NextAuth

---

## 14. Final Tech Stack Summary

| Layer        | Technology                          |
| ------------ | ----------------------------------- |
| Frontend     | Next.js + Tailwind CSS              |
| Backend      | Next.js API Routes / Server Actions |
| Database     | PostgreSQL (Neon / Supabase)        |
| ORM          | Prisma                              |
| CSV Handling | PapaParse / fast-csv                |
| Charts       | Recharts / Chart.js                 |
| Hosting      | Vercel (Free)                       |

---

## 15. Conclusion

This architecture:

* Requires **zero monetary investment**
* Is production-ready
* Scales to **10 lakh+ records**
* Aligns perfectly with Next.js expertise

It is ideal for building a robust email collection and marketing data platform for academic journals.
