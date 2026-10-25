# AccessWay SG Industry Project Pipeline

## Project direction

Build **AccessWay SG**, a mobile-first Leaflet application for wheelchair users and personal-mobility-aid users in Singapore. Its primary job is to help users inspect a route and nearby accessibility facilities before travelling, reducing uncertainty about steps, steep paths, lift access, path obstruction and accessible amenities.

The selected Leaflet pathway fits the brief because the map remains the application’s centrepiece, while search controls, filters, custom markers, route lines, facility layers and barrier reports alter or explain map content. The assessment requires HTML, CSS, a CSS framework, vanilla JavaScript, AJAX or API access, meaningful map interaction, responsive design and a clearly defined audience problem.[^1]

### Core statement

> **For wheelchair users planning unfamiliar Singapore journeys, AccessWay SG provides an interactive accessibility map that finds and explains lower-barrier routes, displays useful facilities and lets users flag obstacles before other users encounter them.**

### Audience and pain points

| Audience need | Pain point | Product response | Map evidence |
|---|---|---|---|
| Plan an unfamiliar journey | Ordinary walking routes may include steps or unsuitable paths | Start/destination search and accessibility-oriented route display | Route polyline, start/end markers and warning state |
| Understand route suitability | A distance alone does not explain effort or uncertainty | Route summary with distance, time, effort and known/unknown conditions | Route card synchronized with highlighted path |
| Find supporting facilities | Users may need lifts, ramps and accessible toilets | Filterable accessibility-facility layers | Custom facility markers and popups |
| Avoid temporary obstacles | A lift or path may be unavailable | Barrier-report workflow | User-created warning marker and report layer |
| Use the app while travelling | Desktop-only controls are difficult on the move | Mobile-first bottom sheet and large touch controls | Full-screen mobile map with expandable planner |

## Success definition

The MVP is successful when a user can complete this journey without instruction:

1. Open the application on a phone.
2. Enter or select a start point and destination.
3. Choose accessibility preferences using visible form controls.
4. Submit the form and receive a validated route or a clear failure message.
5. See the route, endpoints and accessibility facilities on Leaflet.
6. Select a marker to obtain meaningful information.
7. Toggle at least one custom layer without using Leaflet’s default layer control.
8. Report a barrier and see the map update immediately.

This journey should take no more than three principal actions after the places have been entered: submit the route, inspect a map feature and optionally start guided mode. This aligns with the rubric’s requirement that important information be quickly discoverable and generally available within three clicks.[^1]

## Technical scope

### Required stack

- HTML5 with semantic elements.
- CSS3 with mobile-first media queries.
- Bootstrap components or another approved CSS framework, customized beyond its default palette.
- Vanilla JavaScript only; no React, Vue or Angular.
- Leaflet as the map engine.
- AJAX through `fetch()`, `async` and `await`.
- At least one external JSON, GeoJSON or REST endpoint.
- Git and GitHub for version control and submission.

These are direct marking requirements. Bootstrap components do not earn JavaScript proficiency by themselves, and the default Bootstrap color scheme must not be left unchanged.[^1]

### Recommended architecture

```text
accessway-sg/
├── index.html
├── README.md
├── assets/
│   ├── images/
│   ├── icons/
│   └── screenshots/
├── css/
│   ├── variables.css
│   ├── base.css
│   ├── components.css
│   ├── map.css
│   └── responsive.css
├── js/
│   ├── config.js
│   ├── data-service.js
│   ├── map-service.js
│   ├── route-service.js
│   ├── report-store.js
│   ├── ui.js
│   ├── validation.js
│   └── app.js
├── data/
│   ├── facilities.geojson
│   └── demo-routes.json
├── docs/
│   ├── wireframes/
│   ├── site-map.png
│   ├── test-cases.md
│   └── attribution.md
└── tests/
    └── manual-test-checklist.md
```

This structure directly supports the workflow marks for organized folders, consistent filenames, separation of concerns and reusable functions across multiple CSS and JavaScript files.[^1]

### Data flow

```text
User form
   ↓ validate input
Place search/geocoding API
   ↓ normalized coordinates
Routing or local demo-route service
   ↓ route object
Accessibility screening function
   ↓ route status + warnings
Leaflet map service
   ↓ markers, polyline and layers
UI renderer
   ↓ summary, instructions and error state
Optional report store
   ↓ create/update/delete barrier records
Barrier layer refresh
```

Each service should return ordinary JavaScript objects rather than manipulating the page directly. `app.js` coordinates the workflow; `ui.js` manages DOM output; `map-service.js` owns Leaflet layers; and data modules own API calls and persistence.

## Phase 0 — Rubric setup

**Goal:** Convert the marking scheme into an executable checklist before coding.

### Steps

1. Create a GitHub repository named `accessway-sg`.
2. Add GitHub issues for every assessment category: HTML/CSS, JavaScript/DOM, Leaflet interaction, UX/UI and workflow.
3. Copy the traceability matrix from this plan into the README or a project board.
4. Add an `attribution.md` file immediately.
5. Record all external code, libraries, generated data, generated images and AI assistance as they are used.
6. Create branches such as `feature/map-shell`, `feature/route-search`, `feature/layers` and `feature/barrier-reports`.
7. Commit the empty structure with `chore: initialize project structure and rubric checklist`.

### Exit gate

- Repository is public or ready to become public.
- Folder and file names use one convention, preferably kebab-case.
- Every rubric item has an issue, checklist row or planned feature.
- Attribution process is documented.

Academic integrity is a delivery requirement, not a final-day task. The brief permits AI for explanation and mock-data generation with attribution, but the student remains responsible for understanding and explaining retained code.[^1]

## Phase 1 — User research

**Goal:** Define a narrow audience and prove that every proposed feature addresses a need.

### Steps

1. Define the primary persona: a Singapore wheelchair user who independently plans first/last-mile journeys on a mobile phone.
2. Conduct three to five short interviews if possible; otherwise document assumptions clearly and validate them with a tutor or representative user.
3. Ask task-focused questions: how routes are planned, what causes abandonment, which map details matter and what information must be known before departure.
4. Create an affinity list with four categories: route barriers, facility needs, trust concerns and mobile-use constraints.
5. Rank needs with MoSCoW:
   - **Must:** route search, map route, facility markers, route warnings, responsive interface.
   - **Should:** barrier reporting, layer filters, location control, route preference controls.
   - **Could:** favourites, dark mode, marker clustering, guided steps.
   - **Won’t for MVP:** turn-by-turn GPS, verified real-time lift outages and nationwide production-grade wheelchair routing.
6. Write user stories and acceptance criteria.

### User stories

- As a wheelchair user, I want to specify a start and destination so that I can inspect a route before leaving.
- As a manual-chair user, I want to avoid steep or step-based segments so that I can reduce physical strain.
- As a traveller, I want to see lifts, ramps and accessible toilets so that I can plan support stops.
- As a community member, I want to report a blocked path so that the map reflects a condition that may affect others.
- As a mobile user, I want the map and route controls to remain usable with one hand.

### Exit gate

- One core persona, not “everyone.”
- One primary need and three or four ranked pain points.
- Every MVP feature maps to a pain point.
- Claims not yet validated are labelled as assumptions.

## Phase 2 — UX and wireframes

**Goal:** Design the complete user journey before implementation.

### Steps

1. Draw a mobile wireframe first at approximately 375 px width.
2. Use a full-height map and an expandable bottom sheet for route controls and results.
3. Draw tablet and desktop adaptations: the bottom sheet becomes a side panel while Leaflet retains most of the screen.
4. Create five interface states:
   - Initial planner.
   - Loading/skeleton.
   - Valid route.
   - Route with a barrier warning.
   - API or validation failure.
5. Create a barrier-report modal with a text field, radio-button barrier type, severity select menu and checkbox confirming current-location accuracy.
6. Build a simple site diagram showing the hub structure: map/planner as the hub, with report, information and saved items as overlays or secondary views.
7. Conduct a paper-prototype test: ask a user to find a route, toggle toilets and report a barrier.
8. Revise unclear labels before coding.

### Form-control plan

| Control | Purpose | JavaScript evidence |
|---|---|---|
| Text inputs | Start, destination and report notes | Value retrieval, trimming and validation |
| Radio buttons | Manual chair, powered chair or mobility scooter | Branching route preference logic |
| Checkboxes | Avoid slopes, prefer shelter and fewer crossings | Array creation and filtering |
| Select menu | Barrier severity or facility type | `change` event and map-layer update |

The marking scheme specifically requests meaningful form processing and recommends demonstrating a text box, radio controls, checkboxes and a select control, together with validation.[^1]

### Exit gate

- Mobile, tablet and desktop wireframes exist.
- All required controls appear naturally in the workflow.
- Loading, empty, error and success states are designed.
- The primary route action is visually dominant.

## Phase 3 — Design system

**Goal:** Establish visual consistency and responsive foundations before feature work.

### Steps

1. Define CSS custom properties for color, type, spacing, radius and shadows.
2. Use a calm neutral palette with one green accessibility accent; override Bootstrap’s default colors.
3. Use an easy-to-read sans-serif for application text and a restrained serif for a title or explanatory section so the typography criterion is visibly satisfied without hurting map usability.
4. Define a mobile-first type scale and spacing scale.
5. Build and customize Bootstrap components that improve the UX: modal, offcanvas/bottom sheet, alerts, form controls, badges and cards.
6. Demonstrate CSS Grid for page structure and Flexbox for toolbars, form rows and result metadata.
7. Intentionally use `relative`, `absolute`, `fixed` and `sticky` positioning where semantically appropriate.
8. Add visible keyboard focus states, 44 px touch targets, descriptive labels and sufficient contrast.
9. Verify 375 px, 768 px, 1280 px and 1920 px layouts.

### Exit gate

- No unmodified Bootstrap-primary appearance.
- Mobile layout has no horizontal overflow.
- Tablet and desktop are deliberate adaptations, not enlarged mobile pages.
- Buttons, markers and form controls are visibly interactive.
- Semantic HTML and accessibility attributes are present.

The rubric awards responsive quality across mobile, tablet and desktop, with additional credit for another viewport such as widescreen. It also rewards mixed layout techniques, advanced selectors, deliberate typography, positioning and accessibility.[^1]

## Phase 4 — Leaflet foundation

**Goal:** Make Leaflet the functional centre of the application.

### Steps

1. Initialize the map on `DOMContentLoaded`.
2. Use a tile provider other than the default OpenStreetMap presentation, with correct attribution.
3. Create named layer groups:
   - `routeLayer`
   - `facilityLayer`
   - `barrierLayer`
   - `userLocationLayer`
   - `searchResultLayer`
4. Load `facilities.geojson` through `fetch()`.
5. Convert GeoJSON features into customized icons.
6. Add popups with name, facility type, accessibility details and verification status.
7. Add custom HTML controls for toggling facilities and barriers using `map.addLayer()`, `map.removeLayer()` and `map.hasLayer()` rather than relying only on Leaflet’s default layer switcher.
8. Add a search result that pans or fits the map to selected data.
9. Add at least one meaningful circle or radius overlay, such as “facilities within 500 m.”
10. Add a Leaflet plugin that solves a real problem, preferably MarkerCluster for dense facility markers or Leaflet Control Geocoder for address search.
11. Customize Leaflet zoom controls and popup styling through CSS.

### Acceptance tests

- Toggling a checkbox immediately changes a corresponding layer.
- Selecting a facility type filters visible markers.
- Clicking every marker returns useful feedback.
- Search changes the viewport and highlighted map content.
- Custom markers remain understandable without relying on color alone.
- The plugin is acknowledged and explained in the README.

The Leaflet rubric separately scores custom interaction, meaningful layer groups, layer click behaviour, external data, plugins and map customization. Implementing these as separate, demonstrable features makes the evidence obvious to an assessor.[^1]

## Phase 5 — API pipeline

**Goal:** Implement robust asynchronous data retrieval and transformation.

### Steps

1. Add `searchPlaces(query)` in `data-service.js`.
2. Add `getRoute(start, destination, preferences)` in `route-service.js`.
3. Call independent facility and route requests with `Promise.all()` where appropriate to demonstrate parallel asynchronous execution.
4. Wrap each API boundary in `try...catch`.
5. Check `response.ok` before parsing.
6. Normalize external responses into app-owned objects.
7. Apply `parseFloat()` to coordinates and validate numeric ranges.
8. Transform arrays with visible, meaningful use of:
   - `filter()` for selected facility types.
   - `map()` for route steps or GeoJSON features.
   - `reduce()` for route totals or facility counts.
   - `forEach()` for layer rendering.
9. Show loading skeletons while requests run.
10. Provide a local JSON fallback or guided demo route when an API is unavailable, but label it clearly as demonstration data.
11. Never expose a secret API key directly in a public GitHub client; use a keyless service for the assessment or a small proxy approved by the course.

### Suggested response model

```js
{
  start: { name, lat, lng },
  destination: { name, lat, lng },
  distanceMeters,
  durationMinutes,
  coordinates: [[lat, lng]],
  instructions: [{ text, distanceMeters, warningType }],
  accessibility: {
    mappedSteps,
    mappedLifts,
    surfaceKnown,
    confidence
  }
}
```

### Exit gate

- At least one endpoint is consumed; two endpoints or two useful external sources are preferable.
- API data is processed rather than merely printed.
- The response changes both the map and the HTML result panel.
- Parallel asynchronous work is demonstrable.
- Failure, timeout and empty-result states are recoverable.

The JavaScript rubric explicitly scores `async`/`await`, parallel awaits, REST consumption, meaningful response processing, robust input handling and recovery from exceptions.[^1]

## Phase 6 — Route workflow

**Goal:** Complete the application’s primary need end to end.

### Steps

1. Handle the route form’s `submit` event and call `preventDefault()`.
2. Validate that start and destination are non-empty and different.
3. Read chair type, checkboxes and selects into a preferences object.
4. Resolve place names to coordinates.
5. Request or select the route.
6. Screen route instructions for known stairs, escalators or inaccessible features.
7. Branch into three outcomes:
   - Recommended or lower-barrier route.
   - Route returned with a known warning.
   - No usable route or service failure.
8. Clear the previous route layer before rendering the new route.
9. Draw a polyline and custom endpoint icons.
10. Fit map bounds with padding for the mobile bottom sheet.
11. Render time, distance, effort, confidence, features and route steps.
12. Bind result-step clicks to zoom to relevant map segments when coordinates are available.
13. Ensure a new search fully resets stale content and warnings.

### Exit gate

- The route journey works from form to map and map to result panel.
- Inputs produce visible branches and logical-operator use.
- Previous results do not leak into later searches.
- Invalid input is explained next to the relevant field.
- A failed API request preserves the user’s input and offers retry or demo mode.

## Phase 7 — Barrier reports

**Goal:** Add a useful community workflow and optional CRUD evidence.

### Steps

1. Let a user open the report modal from the header or selected map location.
2. Capture barrier type, severity, notes and coordinates.
3. Validate all required fields.
4. Create a report object with a unique ID and timestamp.
5. Persist reports using local storage if permitted, or an approved JSONBin/MongoDB endpoint if full persistence is desired.
6. Render the report as a customized warning marker.
7. Allow the creator to edit severity or notes through a proper form.
8. Allow deletion with an inline confirmation step.
9. Refresh only the barrier layer after create, update or delete.
10. Filter reports by type or severity.

### CRUD mapping

| Operation | User action | Technical evidence |
|---|---|---|
| Create | Submit a new barrier | Form validation, object creation and persistence |
| Read | Open barrier popup/list | Array rendering and Leaflet popup |
| Update | Edit report details | Record lookup and DOM refresh |
| Delete | Remove own report | Confirmation and layer refresh |

CRUD is optional for the Leaflet pathway, so it should follow the core route workflow rather than delay it. If added, it provides extra JavaScript, DOM, validation and persistence evidence.[^1]

## Phase 8 — Rubric-driven refactor

**Goal:** Make every technical competency visible, understandable and defensible.

### JavaScript evidence checklist

- Use `const` by default and `let` only for reassignment; never use `var`.
- Maintain data as arrays and objects.
- Include meaningful `if / else if / else` branches with logical operators.
- Include at least two loops; use nested loops only where the data genuinely requires them.
- Use `filter`, `map` and `reduce` in business logic, not artificial demonstrations.
- Create parameterized functions that return values.
- Use a function as a callback, such as a comparator in `sort()`.
- Use `querySelector()` and `querySelectorAll()` with class, ID, attribute and descendant selectors.
- Demonstrate `innerHTML` where safe, `appendChild()` or `append()`, class changes, data attributes and a deliberate `.style` update.
- Handle `DOMContentLoaded`, `submit`, `click`, `change` and at least one additional appropriate event.
- Use `preventDefault()` and the event object.
- Use `async`/`await`, `Promise.all()` and `try...catch`.

These items map directly to the JavaScript and DOM criteria in the marking scheme, so each should be easy to locate during code review.[^1]

### Function-quality checklist

- One responsibility per function.
- Most functions under approximately 20–30 lines unless a clear reason exists.
- Verbs in names: `fetchFacilities`, `validateRouteForm`, `renderRouteSummary`.
- No API-specific property paths outside the normalization function.
- No Leaflet manipulation inside data-service functions.
- No repeated selectors inside loops when the element can be cached.
- Constants for API URLs and layer names.
- Comments explain decisions, not obvious syntax.

### Exit gate

- A reviewer can identify each rubric requirement within two minutes.
- Modules have clear ownership.
- No unexplained copied code remains.
- Every external snippet has attribution.

## Phase 9 — Testing

**Goal:** Raise the project from proof of concept to a credible MVP or soft-launch candidate.

### Functional test matrix

| ID | Scenario | Expected result |
|---|---|---|
| F01 | Valid known start and destination | Route and summary render; map fits route |
| F02 | Empty start | Inline validation; no request sent |
| F03 | Same start and destination | Specific error; values preserved |
| F04 | Unknown location | Empty-result message and correction action |
| F05 | API unavailable | Recoverable error and retry/demo option |
| F06 | Toggle toilets | Toilet layer is added or removed |
| F07 | Filter ramps | Only matching facilities remain |
| F08 | Click facility marker | Accessible popup content appears |
| F09 | Submit valid barrier | Marker and stored record appear |
| F10 | Edit barrier | Popup and stored record update |
| F11 | Delete barrier | Record and marker disappear after confirmation |
| F12 | Repeat route search | Old route and summary are cleared correctly |

### Responsive test matrix

- 375 × 812 phone.
- 390 × 844 phone.
- 768 × 1024 tablet.
- 1280 × 800 desktop.
- 1920 × 1080 widescreen.
- 200% browser zoom.
- Portrait and landscape where practical.

### Accessibility tests

- Complete primary route search with keyboard only.
- Verify visible focus on every control.
- Check form controls have labels and errors are programmatically associated.
- Test sensible tab order around the map and overlays.
- Confirm icons have text or accessible names.
- Verify color is not the only warning signal.
- Test reduced-motion preference.
- Run Lighthouse and an automated accessibility checker, then manually verify findings.

### Robustness tests

- Empty, whitespace-only and extremely long inputs.
- Invalid coordinates and malformed API records.
- Missing GeoJSON properties.
- Duplicate barrier submissions.
- Offline mode or blocked endpoint.
- Rapid repeated form submissions.
- Geolocation denied.
- Browser refresh with stored reports.

The rubric’s polish scale distinguishes unfinished work, functional proofs of concept, MVPs and launch-ready applications. Comprehensive testing, designed failure states and documented evidence are necessary to move beyond a basic functional score.[^1]

## Phase 10 — Documentation

**Goal:** Make the GitHub repository assessable and portfolio-ready.

### README structure

1. Project title and one-sentence value proposition.
2. Live demo and repository links.
3. Screenshots for mobile, tablet, desktop and widescreen.
4. Target audience, primary need and pain points.
5. User stories.
6. Feature-to-pain-point mapping.
7. Technologies and external APIs.
8. Architecture and folder structure.
9. UX process, wireframes and site diagram.
10. Color, typography and layout decisions.
11. Installation and local-run instructions.
12. Deployment steps.
13. Test cases and test results.
14. Known limitations.
15. Future improvements.
16. Credits, data attribution, plugin licences and AI-use disclosure.

The README marking criterion specifically expects project description, user stories, audience problems, corresponding features, technologies, design reasoning, wireframes, site diagrams, multi-device screenshots, tests and deployment instructions.[^1]

### AI disclosure

Use a concise, honest entry such as:

> Generative AI was used to discuss architecture, explain concepts and draft initial mock data. All retained code was reviewed, rewritten where needed, tested and is explainable by the project author. Generated or adapted assets are listed in `docs/attribution.md`.

Do not submit generated code that cannot be explained. Prepare to describe every service, event handler, array transformation and Leaflet layer during assessment.

## Phase 11 — Deployment

**Goal:** Submit a stable GitHub project with a working public build.

### Steps

1. Remove debug logs and dead code.
2. Confirm API keys are absent from the repository history.
3. Validate relative asset paths.
4. Test from a clean clone rather than the development folder.
5. Deploy to GitHub Pages.
6. Retest APIs under HTTPS and from the deployed domain.
7. Verify external attribution and licences.
8. Add the live URL to the repository description and README.
9. Tag a release such as `v1.0.0`.
10. Create a final submission commit: `release: complete AccessWay SG industry project`.

Submission is through GitHub, and the assessment explicitly rewards regular, meaningful commits, feature branches and issue tracking rather than a single final code dump.[^1]

## Suggested execution schedule

The brief contains two different timing signals: the preamble describes a one-work-week project, while the submission section says the deadline is two months after the handout. Clarify the actual date with the trainer; the following schedule supports a one-week build while leaving later weeks for refinement.[^1]

| Day | Main output | Minimum commit points |
|---|---|---|
| Day 1 | Rubric matrix, audience, user stories, wireframes, repository | Project initialization; research/wireframes |
| Day 2 | Design system, semantic shell, responsive map layout | Base HTML/CSS; responsive structure |
| Day 3 | Leaflet initialization, GeoJSON, custom markers, layer controls | Map foundation; facility layers |
| Day 4 | Search, route request, async pipeline, route rendering | API service; route workflow |
| Day 5 | Form variants, validation, barrier reports, plugin | Validation; report layer; plugin |
| Day 6 | Refactor, robustness, mobile/tablet/desktop testing | Modularization; bug fixes |
| Day 7 | README, screenshots, deployment, rubric audit | Documentation; release |

If the full two-month window is available, spread each day into a week and add representative-user testing, persistent CRUD, more complete data validation and two formal polish iterations.

## Traceability matrix

| Rubric area | Planned evidence | Verification |
|---|---|---|
| Semantic HTML | Header, main, sections, form, lists, dialog and footer | HTML inspection |
| Layout | CSS Grid page shell, Flexbox controls, Bootstrap modal/offcanvas | Responsive screenshots |
| Responsive design | Phone, tablet, desktop and widescreen breakpoints | Viewport test matrix |
| CSS selectors | IDs, classes, attributes, descendants and pseudo-classes | Stylesheet review |
| CSS framework | Customized Bootstrap forms, modal, alert, badges and cards | Visual inspection |
| Positioning | Relative map shell, absolute controls, fixed modal, sticky CTA | Cross-device test |
| Variables/data | Route, facility and report arrays/objects | Code review |
| Branching | Validation, route warning and API-result states | F01–F05 |
| Loops/arrays | Marker rendering, filters, route-step mapping and totals | Code review and UI output |
| Functions | Parameterized service, validation and rendering functions | Unit-level console checks |
| DOM selection | `querySelector`, `querySelectorAll`, attribute selectors | Code review |
| DOM manipulation | Render lists, append markers/cards, class/style changes | Interaction tests |
| Events | DOMContentLoaded, submit, click, change and keyboard events | Manual interaction test |
| Async/API | `fetch`, `async`/`await`, `Promise.all`, `try...catch` | Network and failure tests |
| Form processing | Text, radio, checkbox and select controls | Validation tests |
| Leaflet interaction | Search, custom filters, report placement and route steps | End-to-end demo |
| Layer groups | Route, facilities, barriers and location | Toggle tests |
| Layer interaction | Marker popup and result synchronization | Marker test |
| External data | API/GeoJSON-derived markers and route line | Network/data inspection |
| Plugin | MarkerCluster or geocoder | Dense-marker/search test |
| Map customization | Non-default tiles, icons and control styling | Visual inspection |
| Audience needs | Route, facilities, warnings and reports | User-story acceptance tests |
| UX hierarchy | One dominant route CTA and map-first composition | Usability test |
| Workflow | Organized repository, issues, branches and commits | GitHub history |
| README | Process, screenshots, tests and deployment | Documentation audit |
| Robustness | Validation, fallback states and exception recovery | Error test matrix |

## Scope priorities

### Must finish before polish

1. Responsive semantic page shell.
2. Leaflet map and external tiles.
3. External facility data and custom markers.
4. Custom layer controls.
5. Search or route workflow.
6. Form validation and asynchronous error handling.
7. Mobile, tablet and desktop support.
8. README and attribution.

### Add for a stronger score

1. A purposeful Leaflet plugin.
2. Parallel API requests.
3. Barrier CRUD with persistence.
4. Route-step-to-map synchronization.
5. Marker filtering with `filter`, summary counts with `reduce` and route transformations with `map`.
6. Widescreen optimization.
7. Accessibility and automated test evidence.
8. Git branches, pull requests and issue-based development.

### Cut first if time is short

1. Dark mode.
2. Favourites.
3. Full guided navigation.
4. Multiple route alternatives.
5. Complex animations.
6. Accounts and authentication.

The correct priority is a complete, robust user journey that solves the audience’s central pain point. Optional features should not displace form validation, map interaction, responsive behaviour, documentation or code quality.

## Final submission gate

Do not submit until every statement is true:

- The deployed URL opens without console errors.
- Leaflet is visibly the application centrepiece.
- Search or route controls change map content.
- At least one external source populates a meaningful Leaflet layer.
- Custom icons, popups and custom layer controls work.
- A purposeful plugin is present and acknowledged.
- Text, radio, checkbox and select controls are processed and validated.
- `async`/`await`, `Promise.all()` and `try...catch` are demonstrable.
- Array processing is useful rather than decorative.
- Mobile, tablet, desktop and widescreen layouts are tested.
- Bootstrap components are customized beyond the default visual scheme.
- Empty, loading, success and error states are polished.
- Repository history shows regular commits and feature development.
- README contains user stories, design process, wireframes, screenshots, tests and deployment steps.
- External code, libraries, data and AI assistance are attributed.
- The author can explain every retained code path.

Completing these gates gives the project a coherent path toward distinction across all five assessed categories rather than optimizing only the visual prototype.[^1]

---



