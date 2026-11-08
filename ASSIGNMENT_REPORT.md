# Software Engineering Assignment #04 — Final Report

Smart Campus Room Availability Checker

---

## Task #01: Codebase Analysis

### Initial State

The project was a React + TypeScript + Vite application with a single fictional room, no filtering, no room selection, and 27 passing unit tests. All UI components and domain logic were inlined in a 440-line `App.tsx`. Domain types and availability logic shared a single module.

### Three Maintainability Risks Identified

1. **Monolithic App.tsx (440 lines)** — All UI rendering, state management, inline component definitions, and business logic lived in a single file. Any change required reading and modifying the entire file, increasing the risk of unintended side effects.

2. **Domain types coupled to implementation** — The `Booking`, `Room`, `AvailabilityInput`, and `AvailabilityOutcome` types were declared alongside the functions that used them. This created coupling between the data model and its implementation, making it harder to reuse types across modules or test logic in isolation.

3. **No UI or integration tests** — All 27 tests exercised pure functions only. No test verified that the React UI rendered correctly, responded to user input, or displayed appropriate feedback. Regressions in UI behavior could go undetected.

### Prioritized Improvement Plan

| Priority | Improvement | Rationale |
|---|---|---|
| 1 | Extract domain types into `types.ts` | Foundation for all other modularization; reduces coupling |
| 2 | Extract filtering logic into `filter.ts` | Enables new F1/F2 features as testable pure functions |
| 3 | Extract UI components into separate files | Reduces App.tsx complexity, enables component-level testing |
| 4 | Add UI/integration tests | Closes the largest testing gap |
| 5 | Extend fixtures to four rooms | Required for F1–F5 feature work |

### Rejected AI Suggestion

The AI assistant suggested introducing a state management library (Redux or Zustand) to manage the application's state. This was rejected because the application has a small number of state variables (selected room, time inputs, filter inputs, availability result) that are adequately managed by React's `useState` and `useMemo` hooks. Adding a state management library would introduce unnecessary dependencies and boilerplate for no benefit at the current application scale.

---

## Task #02: Feature Extension

### Features Added

- **Four-room catalog**: Expanded `fixtures.ts` from one room to four rooms with distinct capacities, equipment sets, and booking schedules.
- **Capacity filtering (F1)**: Added `filterByCapacity(rooms, minCapacity)` as a pure function. The UI provides a number input for minimum attendees.
- **Equipment filtering (F2)**: Added `filterByEquipment(rooms, requiredItems)` as a pure function. The UI provides toggleable equipment checkboxes.
- **Blocked-room handling (F3)**: Seminar Room D404 is marked `blocked: true`. `checkAvailability` returns unavailable for blocked rooms before checking bookings.
- **Empty-state feedback (F4)**: When `filteredRooms.length === 0`, the UI displays "No rooms match your requirements" with guidance to adjust filters.
- **Room switching (F5)**: Clicking a room card selects that room, updates the details panel and bookings list, and clears any previous availability result.

### Files Created

- `src/lib/filter.ts` — Pure filtering functions
- `src/components/RoomCard.tsx` — Room selection card component

### Files Modified

- `src/lib/fixtures.ts` — Expanded to four rooms with `ALL_EQUIPMENT` export
- `src/App.tsx` — Added filter UI, room catalog, selection state, empty state

---

## Task #03: Refactoring

### Changes Made

- **Extracted domain types** into `src/lib/types.ts` (35 lines) — `Booking`, `Room`, `AvailabilityInput`, `AvailabilityOutcome`, `ValidationResult`.
- **Extracted UI components** into five files:
  - `AvailabilityCard.tsx` (60 lines) — availability result display
  - `BookingRow.tsx` (30 lines) — single booking row
  - `RoomCard.tsx` (69 lines) — room selection card
  - `TimeField.tsx` (23 lines) — labelled time input
  - `ValidationHint.tsx` (21 lines) — inline validation message
- **App.tsx** became a container component that imports and composes these modules.

### Before/After Architecture Diagrams

#### Before (Monolithic)

```
App.tsx (440 lines)
├── Domain types (inline)
├── Availability logic (inline)
├── AvailabilityInput type (inline)
├── Inline component: availability display
├── Inline component: booking row
├── Inline component: time input
├── Inline component: validation hint
├── State management
├── Event handlers
└── All JSX rendering
```

#### After (Modular)

```
src/
├── App.tsx (455 lines — container: state + composition)
│   ├── imports types from lib/types.ts
│   ├── imports logic from lib/availability.ts
│   ├── imports filters from lib/filter.ts
│   ├── imports fixtures from lib/fixtures.ts
│   └── composes 5 extracted components:
│       ├── components/AvailabilityCard.tsx
│       ├── components/BookingRow.tsx
│       ├── components/RoomCard.tsx
│       ├── components/TimeField.tsx
│       └── components/ValidationHint.tsx
│
├── lib/
│   ├── types.ts         (domain types only)
│   ├── availability.ts  (validation + availability logic)
│   ├── filter.ts        (pure filtering functions)
│   └── fixtures.ts      (fictional data)
│
└── components/
    ├── AvailabilityCard.tsx
    ├── BookingRow.tsx
    ├── RoomCard.tsx
    ├── TimeField.tsx
    └── ValidationHint.tsx
```

### Two Design Decisions

1. **Pure functions for filtering** — `filterByCapacity` and `filterByEquipment` are pure functions that take an array and return a new array without side effects. This makes them trivially testable (no mocks, no DOM) and reusable in any context. The alternative — filtering logic embedded in React state — would be harder to test and impossible to reuse outside the component.

2. **Container/presentation separation** — `App.tsx` acts as the container component (state management, event handlers, data flow) while the five extracted components are presentational (they receive props and render UI). This follows the single responsibility principle: App.tsx orchestrates, components display. The alternative — keeping components inline — would keep App.tsx at 700+ lines and prevent component-level testing.

---

## Task #04: Automated Testing

### Testing Tools

| Tool | Role |
|---|---|
| Vitest 2.1.9 | Test runner |
| React Testing Library 16 | Component rendering and DOM queries |
| @testing-library/jest-dom | DOM assertion matchers |
| @testing-library/user-event | User interaction simulation |
| jsdom 31 | DOM environment for tests |

### Test Suite Growth

| Test File | Tests | Scope |
|---|---|---|
| `availability.test.ts` | 45 | AC1–AC6, F1–F3, room catalog |
| `filter.test.ts` | 6 | F1/F2 boundary regression |
| `App.test.tsx` | 13 | UI/integration (F1–F5, validation) |
| `AvailabilityCard.test.tsx` | 3 | Component (display states) |
| `RoomCard.test.tsx` | 3 | Component (rendering, badges) |
| **Total** | **70** | |

### Defects Discovered

One test assumption error was found during development: the "clears availability result on room switch" test initially used default times (09:30–10:30) which overlap with A101's booking (10:00–11:00), producing "Unavailable" instead of the expected "Available". This was a test assumption error, not an application defect. The test was corrected to use 11:00–12:00 (a valid touching-endpoint interval per AC4).

No application code defects were found.

---

## Task #05: Quality Evaluation

### Before/After Metrics Table

All current values measured from the repository. Historical baseline values from Task #01.

| Metric | Before (Task #01 baseline) | After (Current, measured) |
|---|---|---|
| Supported rooms | 1 | 4 |
| Automated tests | 27 | 70 |
| Passing tests | 27 | 70 |
| Failing tests | 0 | 0 |
| Test files | 1 | 5 |
| UI components (separate files) | 0 | 5 |
| App.tsx line count | 440 | 455 |
| Availability logic module | 1 (combined with types) | 2 (`availability.ts` 132 lines + `types.ts` 35 lines) |
| Separate domain modules | 1 | 4 (`types.ts`, `availability.ts`, `filter.ts`, `fixtures.ts`) |
| UI/integration testing | None | Yes (RTL + jsdom) |
| Capacity filtering | No | Yes |
| Equipment filtering | No | Yes |
| Empty-state feedback | No | Yes |
| Room switching | No | Yes |
| Build status | Passed | Passed |
| Lint status | Passed | Passed |
| Typecheck status | Passed | Passed |

### Actual Verification Results

#### `npm test`

```
> vite-react-typescript-starter@0.0.0 test
> vitest run

 RUN  v2.1.9 /tmp/cc-agent/72151181/project

 ✓ src/lib/filter.test.ts (6 tests) 9ms
 ✓ src/lib/availability.test.ts (45 tests) 101ms
 ✓ src/components/AvailabilityCard.test.tsx (3 tests) 306ms
 ✓ src/components/RoomCard.test.tsx (3 tests) 987ms
 ✓ src/App.test.tsx (13 tests) 2807ms

 Test Files  5 passed (5)
      Tests  70 passed (70)
   Duration  18.90s

(exit 0)
```

#### `npm run build`

```
> vite-react-typescript-starter@0.0.0 build
> vite build

vite v5.4.8 building for production...
✓ 1576 modules transformed.
dist/index.html                   1.11 kB │ gzip:  0.54 kB
dist/assets/index-B0nfAQC6.css   21.84 kB │ gzip:  4.80 kB
dist/assets/index-BYIMeV-X.js   170.32 kB │ gzip: 52.49 kB
✓ built in 8.45s

(exit 0)
```

#### `npm run lint`

```
> vite-react-typescript-starter@0.0.0 lint
> eslint .

(exit 0)
```

#### `npm run typecheck`

```
> vite-react-typescript-starter@0.0.0 typecheck
> tsc --noEmit -p tsconfig.app.json

(exit 0)
```

### Quality Improvements Summary

| Dimension | Improvement |
|---|---|
| Maintainability | Domain logic changes isolated to single-purpose modules |
| Modularity | 1 module → 4 domain modules + 5 UI components |
| Readability | App.tsx composes named components instead of inline definitions |
| Separation of concerns | Types, logic, filtering, data, and presentation are in separate files |
| Testability | Pure functions tested without mocks; UI tested with RTL |
| Reusability | Components accept props and are not coupled to specific data |
| Extensibility | Adding rooms or filters requires minimal, localized changes |

---

## Remaining Limitations

| Limitation | Detail |
|---|---|
| Fictional data only | All rooms and bookings are hard-coded in `fixtures.ts` |
| No backend or database | Application runs entirely in the browser; no persistence |
| No real booking creation | Availability is checked but no booking is created |
| No authentication | No login or user accounts |
| No automated visual testing | UI tests run in jsdom; CSS, layout, and animations not verified |
| No code coverage measurement | Coverage instrumentation not configured; 70 tests indicate breadth, not complete path coverage |
| Manual browser testing not performed | No evidence of manual browser testing was recorded during this assignment |

---

## Final Conclusion

Assignment #04 transformed a single-room demonstration into a four-room application with filtering, room switching, and comprehensive automated testing. The refactoring decomposed a monolithic App.tsx into four domain modules and five UI components while preserving all original acceptance criteria (AC1–AC6). The test suite grew from 27 to 70 tests, including the project's first UI/integration tests. All four verification commands — test, build, lint, and typecheck — pass with zero failures and zero warnings.
