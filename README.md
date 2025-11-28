# GeoJunk (ChatGPT-initiated personal project)

*A field fossil & rock specimen inventory system for Trips → Localities → Photos → Specimens.*

GeoJunk is a modern, highly structured collection management tool designed for fossil and rock collectors who want:

* Accurate locality data
* Batch-driven specimen cataloging
* Google Photos integration (album-scoped)
* Google Sheets syncing
* A personal database behind a clean web interface

It is built around the idea that **your field photos are the anchor** — the app extracts GPS/time metadata from geo-tagged photos and uses that to structure your collection.

This repository contains the **Next.js + Prisma + Postgres** application that powers GeoJunk.

---

# 🚀 Current Features

### ✅ **Trips**
fffffffff
* Create trips with name, date, and notes
* List trips in reverse chronological order
* Server actions + Prisma + Postgres
* Fully wired backend + frontend flow

### ✅ **Localities**

* Add one or more Localities to each Trip
* Fields include:

  * Latitude / longitude
  * Locality name
  * Nearest town
  * Access notes
* Data persisted via Prisma → Postgres
* Revalidation + live update on save

### 🧱 **Foundation in place**

* Project bootstrapped with Next.js App Router
* Postgres database running (local/WSL2 or cloud)
* Prisma schema for:

  * User
  * Trip
  * Locality
  * Specimen
  * Photo

---

# 🛠️ In Progress / Planned

### 📸 **Google Photos Integration**

* Users select an album (or create a new “GeoJunk – Field Photos” album)
* Scoped media search via `mediaItems.search`
* Batch photo import UI for Trips
* EXIF extraction for:

  * GPS
  * Timestamp
  * Captions

### 🧪 **Specimen Grid**

A spreadsheet-like interface where each selected photo becomes a candidate specimen:

| Include | Specimen ID | Photo | Description | Category | Date | Storage | Advanced… |

Features include:

* Auto-generation of catalog IDs (`CM-YYYY-NNN`)
* Merge multiple photos → one specimen
* Quick tagging (brachiopod / chert / trace fossil / etc.)
* High-throughput batch entry

### 📊 **Google Sheets Sync**

* Onboard user selects or creates a Google Sheet
* App creates 4 tabs:

  * `Trips`
  * `Localities`
  * `Specimens`
  * `Photos`
* On save, GeoJunk:

  * Appends rows to the user’s sheets
  * Uses DB as source-of-truth

### 🗺️ **Map UX**

* Google Maps picker for Localities
* Reverse geocoding for nearest town
* Click map to fill latitude/longitude

---

# 🧩 Tech Stack

| Layer              | Technology                                                       |
| ------------------ | ---------------------------------------------------------------- |
| Frontend           | **Next.js (App Router) + React + TypeScript**                    |
| Backend            | **Next.js server actions + API routes**                          |
| ORM                | **Prisma**                                                       |
| Database           | **PostgreSQL** (local via WSL2 or Docker; production TBD)        |
| Cloud Integrations | **Google Photos API**, **Google Sheets API**, **Google Maps JS** |
| Auth               | **Google OAuth** (planned)                                       |
| UI                 | Vanilla Tailwind-like classes (using Next.js built-in styling)   |

---

# 📦 Project Structure

```
src/
  app/
    page.tsx                 # Entry
    trips/
      page.tsx               # Trip list + creation
      [tripId]/
        page.tsx             # Trip detail + Locality creation
    api/
      google/
        photos/route.ts      # (Stub) mediaItems.search handler
        sheets/init/route.ts # (Stub) sheet creation
      trips/route.ts         # (Optional API equivalent)
  lib/
    prisma.ts                # Prisma client
  prisma/
    schema.prisma            # Data model
```

---

# 🧰 Local Development Setup

## 1. Install dependencies

```bash
npm install
```

## 2. Start Postgres (WSL2 Ubuntu)

```bash
sudo service postgresql start
```

Create the role + database:

```bash
sudo -u postgres psql
CREATE ROLE geojunk WITH LOGIN PASSWORD 'geojunk_password';
ALTER ROLE geojunk CREATEDB;
CREATE DATABASE geojunkdb OWNER geojunk;
\q
```

## 3. Set the environment variable

Create `.env` in the project root:

```
DATABASE_URL="postgresql://geojunk:geojunk_password@localhost:5432/geojunkdb?schema=public"
```

## 4. Apply Prisma schema

```bash
npx prisma generate
npx prisma migrate dev --name init
```

## 5. Run the dev server

```bash
npm run dev
```

Visit:
**[http://localhost:3000](http://localhost:3000)**

---

# 🧑‍💻 Contributing / Development Guidelines

* Keep code in **TypeScript**
* Server actions > client actions where possible
* Avoid guessing user behavior — workflows should be explicit and structured
* Maintain the Trip → Locality → Photo → Specimen hierarchy
* Use `CONTEXT.md` as the architectural reference
* Keep components small and composable
* When in doubt about flow logic, prefer determinism over heuristics

---

# 📘 See Also

* [`CONTEXT.md`](./CONTEXT.md) — **The full system overview**
* Prisma docs — [https://www.prisma.io/docs](https://www.prisma.io/docs)
* Next.js App Router — [https://nextjs.org/docs/app](https://nextjs.org/docs/app)
* Google Photos API — [https://developers.google.com/photos/library](https://developers.google.com/photos/library)
* Google Sheets API — [https://developers.google.com/sheets/api](https://developers.google.com/sheets/api)