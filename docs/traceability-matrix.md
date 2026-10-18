# AccessWay SG — Requirements Traceability Matrix

## Purpose

Track each assessment criterion from planned implementation through acceptance testing and evidence. This is a planning template, not confirmation that features are implemented or that any mark has been achieved.

Source: *SCTP_IndustryProject1MarkingSchemeFINAL.pdf*, sections A, B, C1, D and E (pages 3–11). C2 is the alternative non-Leaflet pathway and is not applicable to this project. A9 is bonus, B12 is optional CRUD, and E6 is described as optional but important in the rubric.

## Maintenance rules

- Treat every file path below as a proposed location until implementation exists.
- Replace planned evidence with working repository links, function names and test-result links.
- Add the GitHub issue link to each row as issues are created.
- Do not mark Verified until its acceptance test passes and actual evidence is linked.
- Re-test affected rows after changes; record failures rather than retaining stale verification.
- One feature may satisfy multiple criteria; retain a separate row for each criterion.
- These checks are project acceptance gates, not guarantees of distinction.

## Status definitions

| Status | Meaning |
|---|---|
| Planned | Defined, not started |
| In progress | Implementation underway |
| Implemented | Code exists; verification pending |
| Verified | Acceptance test passed and evidence linked |
| Blocked | Dependency prevents progress; record reason in issue |
| Deferred | Deliberately excluded; record reason and impact |
| Optional — undecided | Scope decision pending |

## Phase key

| Phase | Scope |
|---|---|
| 0 | Rubric setup and repository |
| 1 | Audience research and user stories |
| 2 | UX, user journey and wireframes |
| 3 | Design system and responsive shell |
| 4 | Leaflet foundation and layers |
| 5 | API/data pipeline |
| 6 | Primary route workflow |
| 7 | Barrier reports and optional CRUD |
| 8 | Rubric-driven refactor |
| 9 | Functional, responsive, accessibility and robustness testing |
| 10 | Documentation and evidence |
| 11 | Deployment and submission |

## Assessment matrix

### A — HTML and responsive design

| ID | Criterion | Planned implementation | Evidence location | Acceptance test | Phase / issue | Status |
|---|---|---|---|---|---|---|
| A1 | HTML elements | Semantic header, main, sections, forms and instruction lists | `index.html` | T-A1: Inspect semantic structure and heading order | 3; issue pending | Planned |
| A2 | Layout | CSS Grid page layout and Flexbox controls | `css/components.css` | T-A2: Both layouts work without overlap | 3; issue pending | Planned |
| A3 | Mobile responsive | Phone bottom sheet; tablet/desktop panel; widescreen adaptation | `css/responsive.css; docs/screenshots/` | T-A3: Test 375, 768, 1280 and 1920 px widths without page overflow | 3, 9; issue pending | Planned |
| A4 | CSS selectors | Class, ID, tag, attribute, descendant and pseudo-class selectors | `css/` | T-A4: Identify appropriate selectors and explain specificity | 3; issue pending | Planned |
| A5 | CSS box model | Consistent spacing, padding, borders and display rules | `css/variables.css; css/components.css` | T-A5: Inspect consistent spacing and content containment | 3; issue pending | Planned |
| A6 | CSS typography | Readable type scale, line height and alignment | `css/base.css` | T-A6: Read instructions on phone and at 200% zoom | 3, 9; issue pending | Planned |
| A7 | CSS framework | Customized Bootstrap forms, modal, alerts and cards | `index.html; css/components.css` | T-A7: Components function and use custom visual styling | 3; issue pending | Planned |
| A8 | CSS positioning | Relative shell, absolute tools, fixed overlay, sticky action | `css/map.css; css/components.css` | T-A8: Controls stay usable at supported sizes | 3, 9; issue pending | Planned |
| A9 | Bonus | Skip link, focus indicators, accessible labels, reduced motion | `index.html; css/; docs/test-cases.md` | T-A9: Complete primary task with keyboard; check reduced motion | 3, 9; issue pending | Planned |

### B — JavaScript and DOM proficiency

| ID | Criterion | Planned implementation | Evidence location | Acceptance test | Phase / issue | Status |
|---|---|---|---|---|---|---|
| B1 | Variables and data types | const/let, arrays, objects and numeric coordinate conversion | `js/data-service.js; js/validation.js` | T-B1: No var; numeric fields are validated numbers | 5; issue pending | Planned |
| B2 | Branching | Valid/invalid input, route warnings and service-failure branches | `js/validation.js; js/app.js` | T-B2: Exercise each branch and check correct outcome | 5, 6; issue pending | Planned |
| B3 | Loops | At least two meaningful for/while loops in record validation or processing | `js/data-service.js; js/route-service.js` | T-B3: Identify and explain loops; use break/continue only if useful | 4, 5; issue pending | Planned |
| B4 | Array processing | filter facilities, map instructions, reduce counts | `js/data-service.js; js/ui.js` | T-B4: Filtered results and summary totals match source records | 4, 5; issue pending | Planned |
| B5 | Functions | Parameterized functions returning values; callbacks and closures where useful | `js/validation.js; js/data-service.js` | T-B5: Check outputs for valid and invalid inputs; explain callbacks | 5, 8; issue pending | Planned |
| B6 | Selecting DOM elements | querySelector/querySelectorAll including attribute/descendant selectors | `js/ui.js` | T-B6: Correctly select controls and active filters | 3, 6; issue pending | Planned |
| B7 | Manipulating DOM elements | Render results, append child nodes, change classes/data and relevant style | `js/ui.js` | T-B7: Results change without reload; user text is rendered safely | 6; issue pending | Planned |
| B8 | Handling events | DOMContentLoaded, submit, click, change and keyboard events | `js/app.js; js/ui.js` | T-B8: Handlers run correctly; submit uses preventDefault | 4, 6; issue pending | Planned |
| B9 | Asynchronous JavaScript | async/await and Promise.all for independent requests | `js/data-service.js; js/app.js` | T-B9: Success/failure clears loading; parallel requests are demonstrable | 5; issue pending | Planned |
| B10 | RESTful API | Consume a working location/routing endpoint and normalize its response | `js/data-service.js; js/route-service.js` | T-B10: Live REST data changes useful map/UI content | 5; issue pending | Planned |
| B11 | Form processing and validation | Process text, radio, checkbox and select controls | `index.html; js/validation.js` | T-B11: All controls affect behaviour; invalid inputs are rejected | 2, 6; issue pending | Planned |
| B12 | Optional CRUD | Create/read/update/delete persisted barrier reports | `js/report-store.js` | T-B12: Create, edit, delete and refresh; verify persistence | 7; issue pending | Optional — undecided |

### C1 — Leaflet interaction design

| ID | Criterion | Planned implementation | Evidence location | Acceptance test | Phase / issue | Status |
|---|---|---|---|---|---|---|
| C1.1 | Custom interaction | Search and HTML form filters alter map content | `js/app.js; js/map-service.js` | T-C1.1: Search/filter changes map beyond pan/zoom | 4, 6; issue pending | Planned |
| C1.2 | Layers and layer groups | Route, facilities, barriers and location groups; custom toggles | `js/map-service.js` | T-C1.2: Toggle facilities without removing route/barrier layers | 4; issue pending | Planned |
| C1.3 | Layer interaction | Facility popup with Use as destination action | `js/map-service.js; js/ui.js` | T-C1.3: Click marker; inspect detail; populate destination | 4, 6; issue pending | Planned |
| C1.4 | External data | Fetch facility GeoJSON and route geometry | `data/facilities.geojson; js/data-service.js` | T-C1.4: Fetched records determine rendered layers | 4, 5; issue pending | Planned |
| C1.5 | Leaflet plugins | Purposeful MarkerCluster integration for facility density | `js/map-service.js; docs/attribution.md` | T-C1.5: Clusters expand to show correct underlying markers | 4; issue pending | Planned |
| C1.6 | Map customization | OneMap tiles, custom icons and styled map controls | `js/map-service.js; css/map.css` | T-C1.6: Custom styling works and attribution remains visible | 4; issue pending | Planned |

### D — User experience and interface

| ID | Criterion | Planned implementation | Evidence location | Acceptance test | Phase / issue | Status |
|---|---|---|---|---|---|---|
| D1 | Primary needs and pain points | Route inspection, facility discovery and barrier information | `README.md — Audience and user stories` | T-D1: Map every core feature to a documented user need | 1, 2; issue pending | Planned |
| D2 | Visual design | Legible, calm, map-first interface for wheelchair users | `docs/wireframes/; docs/screenshots/` | T-D2: Representative user identifies primary action unprompted | 2, 3; issue pending | Planned |
| D3 | Typographic design | Sans-serif UI plus restrained serif heading/about section | `css/base.css; README.md — Design` | T-D3: Verify both families are intentional and readable | 3; issue pending | Planned |
| D4 | Color design | Custom palette and non-color-only status cues | `css/variables.css` | T-D4: Check contrast and warning labels; no default Bootstrap palette | 3, 9; issue pending | Planned |
| D5 | User journey and site structure | Direct route workflow and readily accessible facility details | `docs/user-flow.md` | T-D5: Key information reachable within three principal actions | 2, 9; issue pending | Planned |
| D6 | Layout and information hierarchy | Dominant route CTA, clear headings and grouped controls | `docs/wireframes/; css/components.css` | T-D6: User distinguishes actions, results and warnings | 2, 3; issue pending | Planned |
| D7 | Polish | Designed loading, empty, error and success states | `docs/test-results.md; deployed application` | T-D7: Primary journey has no critical bugs on deployed build | 9–11; issue pending | Planned |

### E — Workflow and best practices

| ID | Criterion | Planned implementation | Evidence location | Acceptance test | Phase / issue | Status |
|---|---|---|---|---|---|---|
| E1 | Folder structure | Separate css, js, data, assets and docs folders | `Repository tree` | T-E1: Files have clear and appropriate locations | 0; issue pending | Planned |
| E2 | File naming | Consistent kebab-case filenames | `Repository` | T-E2: Naming audit passes | 0, 8; issue pending | Planned |
| E3 | Code construction | Descriptive names, focused functions and useful comments | `js/; css/` | T-E3: Review readability and explain retained code | 8; issue pending | Planned |
| E4 | Git source control | Regular meaningful commits, branches and issues | `Git history; issues; pull requests` | T-E4: History demonstrates incremental development | All; issue pending | Planned |
| E5 | README | Audience, stories, features, design, wireframes, screenshots, tests, deployment | `README.md; docs/` | T-E5: Follow setup from a clean clone; check all sections | 10; issue pending | Planned |
| E6 | Software engineering — optional | Separate data, route, map, UI and validation responsibilities | `js/` | T-E6: Data services do not manipulate DOM; functions reusable | 5, 8; issue pending | Optional — undecided |
| E7 | Code robustness | Validation, try/catch, recoverable errors and honest fallback | `js/validation.js; js/route-service.js` | T-E7: Failure preserves input and offers a clear recovery path | 5, 9; issue pending | Planned |

## Project-specific safeguards

These are additional project decisions, not standalone rubric criteria.

| ID | Requirement | Acceptance test | Evidence location | Status |
|---|---|---|---|---|
| P01 | Visible route provenance | Every route identifies provider and live/surveyed/demo status | Route summary; T-P01 | Planned |
| P02 | Honest fallback | Failed live routing never silently displays an illustrative route as live | Failure-path tests; T-P02 | Planned |
| P03 | Meaningful preferences | Every enabled preference changes supported behaviour; unsupported settings are disabled or explained | Preference tests; T-P03 | Planned |
| P04 | Credential protection | No account passwords or private service credentials in client code or repository history | Security review; T-P04 | Planned |
| P05 | Attribution | Record datasets, tiles, plugins, adapted code and AI assistance | docs/attribution.md; T-P05 | Planned |
| P06 | Accessible interaction | Keyboard users can reach planner, results and dialogs; modal focus is managed | Accessibility tests; T-P06 | Planned |
| P07 | Supported demo scope | Predefined demo journeys are clearly labelled and cannot imply arbitrary live routing | Demo-mode tests; T-P07 | Planned |
| P08 | Location privacy | Request geolocation only after user action; explain use; avoid unnecessary retention | Privacy note; T-P08 | Planned |

## API dependency register

Keep implementation dependencies separate from assessment completion. A pending OneMap BFA request must not be recorded as an implemented REST integration.

| Dependency | Planned role | Contingency | Current state |
|---|---|---|---|
| OneMap BFA | Preferred barrier-free route source | Provider adapter and explicitly labelled alternative/demo mode | Access not confirmed |
| Alternative wheelchair-routing API | Candidate live fallback | Validate real Singapore requests before adoption | Feasibility not confirmed |
| Local GeoJSON routes | Reliable demonstration of supported journeys | Facilities-only map when no matching journey exists | Planned |
| Working REST endpoint | Evidence for B10 | Select a feasible location/facility endpoint if routing is blocked | Planned |

**Assessment distinction:** fetching local JSON/GeoJSON can demonstrate AJAX and data-driven map layers, but it does not by itself demonstrate consumption of a RESTful service for B10. Keep at least one genuine REST integration in scope.

## Acceptance-test template

Store detailed procedures in `docs/test-cases.md` and outcomes in `docs/test-results.md`.

```markdown
### T-C1.2 — Independent facility-layer toggle

Requirements: C1.2, C1.1, B8
Precondition: Facility data and a route have loaded.

Steps:
1. Enable Toilets.
2. Confirm toilet markers appear.
3. Disable Toilets.
4. Confirm toilet markers disappear.
5. Confirm route and barrier markers remain visible.

Expected: Only the toilet layer changes.
Actual: Not run.
Result: Not run.
Environment: Record browser, viewport and deployment URL when executed.
Commit: Record tested commit SHA when executed.
Evidence: Add screenshot, recording or test-log link after execution.
```

## Evidence conventions

- Code: link to the relevant file/function, ideally a commit-specific permalink for final submission.
- Test: link to the detailed procedure and dated result.
- Visual: link to screenshots for mobile, tablet, desktop and widescreen.
- Workflow: link to issue, pull request or meaningful commit history.
- Research/design: link to actual user stories, wireframes and design rationale.
- Attribution: disclose external assets, libraries, adapted snippets and AI use; retain only code the author understands.

Suggested issue title: `[C1.2] Implement independent facility-layer toggles`.

## Phase 0 exit checklist

- [ ] All applicable assessment rows are present.
- [ ] Optional criteria have an explicit scope decision or decision issue.
- [ ] Each row has a planned feature and observable acceptance test.
- [ ] Each row has a phase and a GitHub issue after issue creation.
- [ ] Evidence destinations follow the repository structure.
- [ ] API approval and fallback risks are tracked separately.
- [ ] README links to this matrix or contains this content.

## Final audit checklist

- [ ] Replace proposed evidence paths with actual links.
- [ ] Resolve every Blocked row or document its impact.
- [ ] Mark Verified only with passing test evidence.
- [ ] Check live REST evidence independently of local JSON loading.
- [ ] Verify Leaflet plugin and CSS framework evidence.
- [ ] Confirm all form-control types are genuinely processed.
- [ ] Confirm fallback labels and unsupported preferences are honest.
- [ ] Confirm screenshots, tests, wireframes, deployment instructions and attribution exist.
- [ ] Re-test the deployed release, not just the local development build.
