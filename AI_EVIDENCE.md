# AI Evidence Appendix

## AI Assistant

**Bolt.new** — an AI-powered web development environment that generates and modifies React/TypeScript applications from natural-language instructions.

## Dates of AI-Assisted Work

All AI-assisted work was conducted on **November 8, 2026** within a single Bolt.new session.

## Summary of Selected Prompts

The following prompts were provided to the AI assistant across the assignment tasks. Prompts are summarized; the full text was provided as task instructions in the Bolt.new environment.

| Task | Prompt Summary |
|---|---|
| Task #01 | Read AGENTS.md; analyze the codebase; identify three maintainability risks; create a prioritized improvement plan; reject one AI suggestion with justification. |
| Task #02 | Extend the application from one room to four rooms; add capacity filtering (F1), equipment filtering (F2), blocked-room handling (F3), empty-state feedback (F4), and room switching (F5); preserve AC1–AC6. |
| Task #03 | Refactor the monolithic App.tsx; extract domain types, filtering logic, and UI components into separate modules; maintain existing behavior; provide before/after architecture diagrams and two design decisions. |
| Task #04 | Extend the automated test suite; add filter regression tests for F1–F3; add UI/integration tests using React Testing Library and jsdom; cover F4 and F5; preserve all 45 existing tests; run all four verification commands. |
| Task #05 | Evaluate quality improvements; create before/after comparison table; analyze maintainability, modularity, readability, separation of concerns, testability, reusability, and extensibility; discuss complexity; run verification commands. |
| Final Submission | Create README.md, ASSIGNMENT_REPORT.md, AI_REFLECTION.md, and AI_EVIDENCE.md; run final verification; confirm submission checklist. |

## AI-Generated Suggestions

| Suggestion | Source | Outcome |
|---|---|---|
| Separate domain types into `types.ts` | Task #01 analysis | Accepted — implemented in Task #03 |
| Extract filtering logic into `filter.ts` as pure functions | Task #01 analysis | Accepted — implemented in Task #02 |
| Extract UI components (AvailabilityCard, BookingRow, RoomCard, TimeField, ValidationHint) | Task #01 analysis | Accepted — implemented in Task #03 |
| Introduce Redux or Zustand for state management | Task #01 analysis | Rejected — application state is simple enough for React hooks |
| Add UI/integration tests with React Testing Library | Task #04 instructions | Accepted — implemented in Task #04 |
| Install jsdom for DOM-based test environment | Task #04 implementation | Accepted — added as dev dependency |
| Use `getByRole` and `getByLabelText` for accessible queries | Task #04 instructions | Accepted — used throughout UI tests |

## Accepted and Rejected Recommendations

### Accepted

1. **Separate domain types** — Moved `Booking`, `Room`, `AvailabilityInput`, `AvailabilityOutcome`, and `ValidationResult` into `types.ts`.
2. **Pure filtering functions** — `filterByCapacity` and `filterByEquipment` implemented as pure functions in `filter.ts`.
3. **Extract five UI components** — `AvailabilityCard`, `BookingRow`, `RoomCard`, `TimeField`, and `ValidationHint` extracted into separate files.
4. **UI/integration tests** — Added 19 UI tests across `App.test.tsx`, `AvailabilityCard.test.tsx`, and `RoomCard.test.tsx`.
5. **Accessible queries** — Used `getByRole`, `getByLabelText`, and `getByText` instead of CSS-class-based selectors.

### Rejected

1. **Redux/Zustand state management** — Rejected because the application has a small number of state variables (`selectedRoomId`, `startStr`, `endStr`, `result`, `attendeesInput`, `selectedEquipment`) that are adequately managed by `useState` and `useMemo`. Adding a state management library would introduce unnecessary dependencies and boilerplate with no benefit at this scale.

## Actual Code Changes

### Files Created (Application Code)

| File | Lines | Purpose |
|---|---|---|
| `src/lib/types.ts` | 35 | Domain type definitions |
| `src/lib/filter.ts` | 14 | Pure filtering functions |
| `src/components/AvailabilityCard.tsx` | 60 | Availability result display |
| `src/components/BookingRow.tsx` | 30 | Single booking row |
| `src/components/RoomCard.tsx` | 69 | Room selection card |
| `src/components/TimeField.tsx` | 23 | Labelled time input |
| `src/components/ValidationHint.tsx` | 21 | Inline validation message |

### Files Created (Tests)

| File | Lines | Tests | Purpose |
|---|---|---|---|
| `src/lib/filter.test.ts` | 43 | 6 | F1/F2 boundary regression |
| `src/App.test.tsx` | 198 | 13 | UI/integration tests |
| `src/components/AvailabilityCard.test.tsx` | 35 | 3 | Component tests |
| `src/components/RoomCard.test.tsx` | 33 | 3 | Component tests |
| `src/test/setup.ts` | 7 | — | Vitest setup (jest-dom, cleanup) |

### Files Created (Documentation)

| File | Purpose |
|---|---|
| `README.md` | Project documentation |
| `ASSIGNMENT_REPORT.md` | Full assignment report |
| `AI_REFLECTION.md` | AI usage reflection (200–300 words) |
| `AI_EVIDENCE.md` | AI evidence appendix (this file) |

### Files Modified

| File | Change |
|---|---|
| `src/App.tsx` | Added filter UI, room catalog, room selection, empty state; refactored to import extracted components and modules |
| `src/lib/fixtures.ts` | Expanded from 1 room to 4 rooms; added `ALL_EQUIPMENT` export |
| `src/lib/availability.ts` | Re-exports types from `types.ts` instead of defining them inline |
| `vite.config.ts` | Added Vitest test configuration (jsdom environment, setup file) |
| `package.json` | Added 4 dev dependencies: `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom` |

### New Development Dependencies

| Package | Version | Purpose |
|---|---|---|
| `@testing-library/react` | ^16.3.3 | Component rendering and DOM queries |
| `@testing-library/jest-dom` | ^7.0.1 | DOM assertion matchers |
| `@testing-library/user-event` | ^14.6.8 | User interaction simulation |
| `jsdom` | ^31.0.0 | DOM environment for tests |

## Verification Commands and Results

All commands were run on November 8, 2026.

### `npm test`

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

### `npm run build`

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

### `npm run lint`

```
> vite-react-typescript-starter@0.0.0 lint
> eslint .

(exit 0)
```

### `npm run typecheck`

```
> vite-react-typescript-starter@0.0.0 typecheck
> tsc --noEmit -p tsconfig.app.json

(exit 0)
```

## Human Review Activities

- Reviewed the AI-generated code for correctness against AC1–AC6 and F1–F5 requirements.
- Verified that all 45 original test assertions were preserved without modification.
- Reviewed the rejected AI suggestion (Redux/Zustand) and confirmed the rejection was justified.
- Inspected the failed test ("clears availability result on room switch") and identified the root cause as a test assumption error (default times overlapping an existing booking), not an application defect.
- Confirmed that no application business logic, fixture values, or UI design were changed during testing or documentation tasks.
- Verified that the AI reflection text matches the required content exactly.

## Limitations

- **No manual browser testing was performed.** All UI verification was done through jsdom-based automated tests. Visual appearance, CSS rendering, animations, and responsive behavior were not verified in a real browser.
- **No code coverage measurement.** The project does not have coverage instrumentation configured. 70 passing tests indicate requirement coverage breadth, not complete code-path coverage.
- **AI-generated content was reviewed but not independently rewritten.** The AI assistant generated code, tests, and documentation; the human reviewer checked correctness and made targeted corrections (e.g., fixing the test assumption error, removing an unused variable flagged by ESLint) but did not rewrite the output from scratch.
- **Single-session work.** All tasks were completed in one Bolt.new session on one date. No iterative refinement across multiple sessions occurred.
