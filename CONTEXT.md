# CONTEXT.md

# GeoJunk – System Architecture, Purpose, and Development Context

*(For ChatGPT-in-VSCode integration – maintain as the canonical project overview)*

## 🧭 Purpose of GeoJunk

GeoJunk is a **field fossil & rock specimen inventorying system** intended for:

* Personal and (eventually) wider community use
* Capturing **Trips → Localities → Photos → Specimens**
* Importing **geotagged field photos** from Google Photos
* Storing structured data in **Postgres + Prisma**
* Syncing exported data to **Google Sheets** (one doc per user)
* Supporting specimen cataloging, batch ID generation, and locality metadata

The user flow is built around the idea that the collector has already taken field photos, and those photos contain the spatial + temporal anchors the system uses.

---

# 🏛️ Overall Architecture

GeoJunk is built as a **Next.js App Router** application with:

* **React** frontend
* **Next.js server components + server actions**
* **Prisma ORM**
* **PostgreSQL** database (local or cloud)
* **Google Photos Library API** (album-scoped searching)
* **Google Sheets API** (structured append-based syncing)
* **OpenAI ChatGPT** used in VS Code for development support

The stack is fully TypeScript.

---

# 🗺️ Data Model (Prisma Schema Summary)

## User

Represents an authenticated user and their Google integration state.

Fields include:

* `id`, `email`, `googleUserId`
* `googleRefreshToken` (stored securely server-side)
* `defaultSheetId`, `defaultAlbumId`

Relationships:

* `trips`, `localities`, `specimens`, `photos`

---

## Trip

A specific field outing.

Fields:

* `id`
* `userId`
* `name` (e.g. “Wolf Creek with Evan – 2025-03-02”)
* `date`
* `notes`

Relations:

* `localities`
* `specimens`
* `photos`

---

## Locality

Location within a trip (often a single outcrop, riffle, or roadcut).

Fields:

* `id`
* `userId`
* `tripId`
* `name`
* `latitude`, `longitude`
* `nearestTown`
* `accessNotes`
* Optional geology metadata:

  * `formation`
  * `stratUnit`
  * `age`

Relations:

* `specimens`
* `photos`

---

## Specimen

A single cataloged item (fossil, rock, mineral, matrix specimen).

Fields:

* `id` (catalog ID, e.g. `CM-2025-003`)
* `tripId`, `localityId`, `userId`
* `collectionDate`
* `shortDescription`
* `category` (“fossil”, “rock”, “mineral”, “matrix”)
* `storageLocation`
* Advanced fields:

  * `lithology`
  * `fossilGroup`
  * `prepStatus`
  * `keepTradeStatus`
  * `notes`

Relations:

* `photos`

---

## Photo

Metadata for a Google Photos media item.

Fields:

* `id`
* `userId`
* `specimenId` (optional)
* `tripId`, `localityId`
* `googleMediaItemId`
* `googlePhotosUrl`
* `takenAt`
* `gpsLat`, `gpsLon`
* `caption`

---

# 🔄 Core Workflow Summary

## 🥾 1. Trip creation

User enters:

* Name
* Date
* Notes

Creates a new Trip row and renders `/trips/[tripId]`.

Currently working in the app:

* `/trips` list page
* Trip creation form
* Trip list auto-refresh using server actions

---

## 🗺️ 2. Locality creation

On `/trips/[tripId]`, user adds:

* Locality name
* latitude / longitude
* nearest town
* access notes

Stored in DB under the Trip.

Later enhancement (planned):

* Google Maps picker UI
* Reverse geocoding for nearest town

---

## 📸 3. Google Photos integration (planned)

User must authorize the Photos API.

Flow:

1. Onboarding step: pick an album OR create a dedicated album (`GeoJunk – Field Photos`)
2. Only album-scoped searches used:

   * `mediaItems.search` with `albumId`
3. Batch photo selection grid
4. Photos become `Photo` records tied to Trip + Locality

GPS + EXIF are extracted from each selected photo.

---

## 🧪 4. Specimen batch grid (planned)

After selecting photos, user sees a **spreadsheet-like grid**:

| Include | Specimen ID | Thumb | Description | Category | Date | Storage | Advanced… |

Features:

* Auto-generate sequential specimen IDs with user prefix
* Prefill date from Trip or EXIF
* One row per *candidate specimen* (one row per photo initially)
* Ability to merge rows (multiple photos = one specimen)
* On save:

  * Create Specimen records
  * Attach Photos to specimens
  * Append to Google Sheets

---

## 📊 5. Google Sheets Integration (planned)

User selects or creates a Google Sheet during onboarding.

The sheet must have 4 tabs:

* `Trips`
* `Localities`
* `Specimens`
* `Photos`

On save:

* App appends rows to the appropriate tabs
* DB remains source-of-truth; Sheets acts as export

---

# 🧰 Project State (as of last update)

### Working:

* Next.js app boots cleanly
* Postgres running locally via WSL2
* Prisma schema migrated
* `/trips` page:

  * Lists Trips from DB
  * Server action creates Trips
* `/trips/[tripId]`:

  * Displays a Trip
  * Creates Localities

### Stubs exist for:

* Google Photos API handler
* Google Sheets API handler
* Trips API routes

### Next recommended slice:

**Add Google Maps picker + then the Photo import flow.**

---

# 🧠 Notes for ChatGPT (in VS Code)

When assisting in this repo:

* Maintain compatibility with **Next.js App Router**
* Use **server components + server actions** when possible
* Avoid client hydration unless UI requires interactive elements
* Respect the existing Prisma schema
* Treat this document as the source of truth for system behavior
* When generating new code:

  * Use TypeScript
  * Keep files under `src/app/`, `src/lib/`, or `src/components/`
  * Follow the Trip → Locality → Photo → Specimen hierarchy
* Avoid inventing new workflow steps not described here
* When unsure, prefer determinism over guesswork
