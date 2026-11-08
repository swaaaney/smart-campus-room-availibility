# Smart Campus Room Availability Checker

A web application that lets students and staff check the availability of study rooms on a fictional smart campus. Users can filter rooms by capacity and equipment, select a room, enter a desired time interval, and instantly see whether the room is available — all without creating an actual booking.

> **Note:** All room and booking data is fictional and hard-coded for demonstration purposes. No backend, database, authentication, or booking creation is involved.

---

## Technologies Used

| Technology | Role |
|---|---|
| React 18 | UI library |
| TypeScript 5.5 | Static typing |
| Vite 5.4 | Build tool and dev server |
| Tailwind CSS 3.4 | Utility-first styling |
| Lucide React | Icon set |
| Vitest 2.1 | Test runner |
| React Testing Library 16 | Component and integration testing |
| @testing-library/jest-dom | DOM assertion matchers |
| @testing-library/user-event | User interaction simulation |
| jsdom 31 | DOM environment for tests |

---

## Installation

Prerequisites: Node.js 18+ and npm.

```bash
npm install
```

## Development Server

```bash
npm run dev
```

The dev server starts automatically in the Bolt.new environment. In a local clone, it serves at `http://localhost:5173`.

## Build

```bash
npm run build
```

Outputs production assets to `dist/`.

## Test Commands

| Command | Purpose |
|---|---|
| `npm test` | Run the full test suite (70 tests) |
| `npm run typecheck` | TypeScript type checking without emitting |
| `npm run lint` | ESLint static analysis |
| `npm run build` | Production build |

---

## Application Features

- **Four-room catalog** — Browse four fictional rooms with different capacities and equipment.
- **Capacity filtering** — Enter a minimum number of attendees to filter rooms by seating capacity.
- **Equipment filtering** — Select required equipment items (Projector, Whiteboard, Computers, Video Conferencing, Microphone) to narrow results.
- **Room selection** — Click any room card to view its details, existing bookings, and availability checker.
- **Availability checking** — Enter a start and end time, then click "Check Availability" to see if the room is free.
- **Blocked-room handling** — Blocked rooms are clearly marked and always reported as unavailable.
- **Empty-state feedback** — When no rooms match the filters, a clear message guides the user to adjust criteria.
- **Validation feedback** — Invalid time intervals (reversed, in the past, exceeding 120 minutes) show inline validation hints.
- **Responsive layout** — The UI adapts from mobile to desktop with a grid-based room catalog and stacked layout.

---

## Four-Room Catalog

| Room | ID | Capacity | Equipment | Blocked | Existing Booking |
|---|---|---|---|---|---|
| Study Room A101 | a101 | 6 | Projector, Whiteboard | No | 10:00–11:00 Group Study — CS210 |
| Computer Lab B202 | b202 | 25 | Computers, Projector, Whiteboard | No | 12:00–13:00 Lab Session — IT205 |
| Conference Room C303 | c303 | 15 | Projector, Video Conferencing, Whiteboard | No | 14:00–15:00 Department Meeting |
| Seminar Room D404 | d404 | 40 | Projector, Microphone, Whiteboard | Yes | 11:00–12:00 Guest Lecture — MG430 |

The current time is fixed at 09:00 for demonstration purposes.

---

## Requirements

### Acceptance Criteria AC1–AC6 (Original, Preserved)

| ID | Requirement |
|---|---|
| AC1 | Time intervals must use integer minute boundaries within the range 0–1440. Start must be strictly earlier than end. Start must be after the current time. |
| AC2 | Booking duration must not exceed 120 minutes. |
| AC3 | A blocked room is always reported as unavailable, regardless of bookings or time validity. |
| AC4 | Overlap detection treats touching endpoints as non-overlapping (e.g., 11:00–12:00 after 10:00–11:00 is allowed). |
| AC5 | Booking fixtures must not be mutated by availability checks or validation. |
| AC6 | Availability outcomes must be deterministic and well-typed (available or unavailable with a reason string). |

### Feature Requirements F1–F5 (New, Implemented in Assignment #04)

| ID | Requirement |
|---|---|
| F1 | Capacity filtering — rooms with sufficient capacity are included; rooms below the threshold are excluded; exact capacity boundaries are accepted. |
| F2 | Equipment filtering — a room must contain all selected equipment items; a room missing one required item is excluded; an empty equipment selection does not restrict results. |
| F3 | Blocked rooms — a blocked room is never reported as available, even with no conflicting bookings. |
| F4 | Empty state — when no rooms match the filters, the UI displays a clear empty-state message. |
| F5 | Room switching — selecting a different room updates its details, updates the bookings list, clears the previous availability result, and uses only the selected room's bookings for availability checks. |

---

## Project Structure

```
project/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── eslint.config.js
├── src/
│   ├── main.tsx                      # React entry point
│   ├── App.tsx                       # Container component (state + composition)
│   ├── App.test.tsx                  # UI/integration tests (13 tests)
│   ├── index.css                     # Tailwind directives + global styles
│   ├── vite-env.d.ts
│   ├── lib/
│   │   ├── types.ts                  # Domain type definitions
│   │   ├── availability.ts           # Validation + availability logic
│   │   ├── availability.test.ts      # AC1–AC6 + catalog tests (45 tests)
│   │   ├── filter.ts                 # Pure filtering functions
│   │   ├── filter.test.ts            # F1/F2 boundary tests (6 tests)
│   │   └── fixtures.ts               # Fictional room and booking data
│   ├── components/
│   │   ├── AvailabilityCard.tsx      # Availability result display
│   │   ├── AvailabilityCard.test.tsx # Component tests (3 tests)
│   │   ├── BookingRow.tsx            # Single booking display
│   │   ├── RoomCard.tsx              # Room selection card
│   │   ├── RoomCard.test.tsx         # Component tests (3 tests)
│   │   ├── TimeField.tsx             # Labelled time input
│   │   └── ValidationHint.tsx        # Inline validation message
│   └── test/
│       └── setup.ts                  # Vitest setup (jest-dom, cleanup)
```

---

## Known Limitations

- **Fictional data only** — All rooms and bookings are hard-coded in `fixtures.ts`.
- **No backend or database** — The application runs entirely in the browser; data does not persist across reloads.
- **No real booking creation** — The app checks availability but does not create, modify, or delete bookings.
- **No authentication** — There is no login or user accounts.
- **No automated visual testing** — UI tests run in jsdom; CSS layout, responsive breakpoints, animations, and color contrast are not verified by automated tests.
- **No code coverage measurement** — The project does not have coverage instrumentation configured; 70 passing tests indicate breadth, not complete path coverage.
