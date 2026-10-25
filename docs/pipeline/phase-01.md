# AccessWay SG: Phase 1 Design Thinking Documentation Report

---

## Executive Summary & Strategic Context

**AccessWay SG** is a mobile-first, interactive Leaflet mapping platform designed specifically for wheelchair and personal mobility aid (PMA) users navigating first- and last-mile urban transit across Singapore. Unfamiliar journeys often present hidden physical friction—steep gradients, unexpected curb steps, non-operational station lifts, or unannounced construction blockages—that can turn a standard 10-minute transit connection into a complete trip abandonment.

This document provides the complete **Design Thinking Framework (Phases 1–5)** for AccessWay SG. Incorporating human-centered design principles and technical implementation constraints, this report bridges qualitative user empathy, structured problem definition, feature prioritization, wireframing requirements, and risk management.

---

## 1. Phase 1: Empathize

### Primary Persona Definition

```
========================================================================================
PERSONA PROFILE: AHMAD TAN (34, Independent Commuter & Wheelchair User)
========================================================================================
- Role: Software Quality Analyst at One-North Tech Hub.
- Mobility Profile: Manual wheelchair user following a spinal injury; highly independent.
- Context: Uses MRT/LRT rail network combined with first/last-mile rolling path segments.
- Primary Device: Apple iPhone 13 (Mobile-first user; relies on single-handed operation).
- Primary Motivation: Minimize travel uncertainty, avoid unexpected physical obstacles, 
  and maintain personal schedule independence without relying on assistance.
- Core Quote: "A single missing ramp or 3-inch curb step isn't just an inconvenience—it's
  a complete dead end that forces me to backtrack 20 minutes in the Singapore heat."
========================================================================================

```

---

### Field Discovery & User Interview Synthesis

Qualitative insights were gathered through structured, task-focused interviews with **4 active wheelchair commuters in Singapore**. The interviews explored pre-departure planning, route evaluation, real-time adjustments, and root causes for trip abandonment.

#### Key Inquiry Areas & User Insights

```
+---------------------------+-------------------------------------------------------------+
| Inquiry Area              | Primary Field Insights & User Statements                    |
+---------------------------+-------------------------------------------------------------+
| Route Planning Practices  | - 100% of participants pre-inspect routes on Google Maps    |
|                           |   or Street View before traveling to new places.            |
|                           | - "Standard walking directions treat a 10% incline or 3     |
|                           |   flight of stairs the same as a flat paved footway."       |
+---------------------------+-------------------------------------------------------------+
| Departure Prerequisites   | - Knowing the exact location of accessible station lifts    |
|                           |   and barrier-free ramps is non-negotiable.                 |
|                           | - "If I don't know whether an MRT exit has a working lift,  |
|                           |   I won't risk taking that route."                          |
+---------------------------+-------------------------------------------------------------+
| Route Abandonment Triggers| - Temporary construction hoardings blocking footpaths.      |
|                           | - Unexpected curb drops without low-gradient ramps.         |
|                           | - Weather-related detours forced by unsheltered paths.      |
+---------------------------+-------------------------------------------------------------+

```

---

### Empathy Map Findings

```
+---------------------------------------------------------------------------------------+
|                                    EMPATHY MAP                                        |
+---------------------------------------------------------------------------------------+
| SAYS                                       | THINKS                                   |
| - "Standard maps ignore wheelchair needs." | - "Will I get stuck at the MRT exit?"    |
| - "Is there a shelter if it rains?"        | - "I hope the lift isn't under service." |
| - "I need to know before I leave home."    | - "Is this path too steep for my arms?"  |
+--------------------------------------------+------------------------------------------+
| DOES                                       | FEELS                                    |
| - Pre-checks satellite street imagery.     | - Anxious when approaching new areas.    |
| - Switches to road shoulders when blocked.| - Frustrated by lack of accessibility details|
| - Calls station staff to confirm lifts.   | - Empowered when paths are transparent.  |
+---------------------------------------------------------------------------------------+

```

---

### Affinity Synthesis (4 Core Categories)

Interview data was grouped into **four key categories**, highlighting both physical environment challenges and mobile app requirements:

```
+---------------------------------------------------------------------------------------+
|                                AFFINITY CATEGORIES                                    |
+---------------------------------------------------------------------------------------+
| 1. ROUTE BARRIERS                          | 2. FACILITY NEEDS                        |
| - Steep inclines (>8% gradient).           | - Universal accessible toilets (HC).     |
| - Missing or poorly aligned curb ramps.   | - Station and overhead bridge lifts.     |
| - Physical steps and narrow turnstiles.    | - Continuous sheltered walkways (rain/sun)|
| - Temporary construction footway blocks.   | - Dedicated PMA-friendly charging spots. |
+--------------------------------------------+------------------------------------------+
| 3. TRUST CONCERNS                          | 4. MOBILE-USE CONSTRAINTS                |
| - Outdated static government map layers.   | - Glare/contrast under direct sunlight.  |
| - Anxiety around unexpected lift outages. | - One-handed thumb-zone operation.       |
| - Unverified user obstacle reports.        | - Touch targets hard to hit while rolling.|
+---------------------------------------------------------------------------------------+

```

---

## 2. Phase 2: Define

### Root Cause Analysis (Fishbone / Ishikawa Framework)

To uncover why wheelchair users abandon unfamiliar journeys, a **Fishbone Cause-and-Effect Analysis** was performed across four operational pillars:

```
  INFRASTRUCTURE             INFORMATION & DATA
  (Physical Obstacles)       (Map Gaps)
  
  Steep Gradients (>8%)      No Wheelchair Filters
           \                        \
  Missing Curb Ramps         Outdated Map Data
             \                        \
  Steps & Narrow Paths       No Gradient Info
              \                        \
───────────────┬────────────────────────┬──────────────────> ROUTE ABANDONMENT
               │                        │                    BY WHEELCHAIR USERS
               /                        /
  Unannounced Outages        Small Touch Targets
             /                        /
  Unsheltered Exposure       Direct Sun Glare
           /                        /
  Rain & Weather Detours     Two-Hand Navigation Needed
  
  ENVIRONMENT & WEATHER      MOBILE INTERFACE / UX

```

#### Detailed Breakdown of Causes

* **Infrastructure:** Physical barriers like unexpected stairs, high curbs, steep ramps, or construction hoardings that stop rolling movement.


* **Information & Data:** Conventional navigation apps optimize for distance or traffic speed, omitting slope degrees, step counts, and curb profiles.


* **Environment & Weather:** Singapore's heavy tropical rain and intense sunlight make unsheltered or steep routes hazardous for manual chair users.


* **Mobile Interface / UX:** Desktop-oriented interfaces with small buttons or complex multi-step menus are difficult to use while controlling a wheelchair outdoors.



---

### Core Statement & Point of View (POV)

Using the **4 Ws / Madlib Framework** (Who, What, Why, How), the project's core problem statement is defined as follows:

> **"For wheelchair users planning unfamiliar Singapore journeys, AccessWay SG provides an interactive accessibility map that finds and explains lower-barrier routes, displays useful facilities, and lets users flag obstacles before others encounter them."**
> 

---

### Phase 1 Exit Gate Verification & Assumptions Register

#### Exit Gate Checkpoints

* [x] **Single Core Persona Defined:** Ahmad Tan (Independent Singapore Wheelchair Commuter).


* [x] **Primary User Need Validated:** Transparent, lower-barrier route planning with obstacle visibility prior to departure.


* [x] **4 Ranked Pain Points Established:**
1. Unexpected physical steps and steep inclines on walking paths.


2. Lack of nearby accessible facility location data (lifts, toilets, shelters).


3. Unannounced physical footpath obstructions and lift breakdowns.


4. Poor mobile usability when managing navigation outdoors.





#### Explicit Assumptions Register

To protect technical scope and project feasibility, unvalidated capabilities are explicitly categorized in the **Assumptions Register**:

```
+----+----------------------------------+------------------------+-------------------------------+
| ID | Assumption Description           | Risk Assessment        | Technical Scope Boundary      |
+----+----------------------------------+------------------------+-------------------------------+
| A1 | Real-time MRT lift outage APIs   | High Risk (No public   | Classified as ASSUMPTION.     |
|    | exist with low-latency updates.  | real-time API socket). | Handled via crowd reporting.  |
+----+----------------------------------+------------------------+-------------------------------+
| A2 | OpenStreetMap footway data       | Medium Risk (Missing   | Classified as ASSUMPTION.     |
|    | contains full slope gradients.   | localized elevation).  | Augmented with static GeoJSON.|
+----+----------------------------------+------------------------+-------------------------------+
| A3 | Users will proactively submit    | Medium Risk (Requires  | Classified as ASSUMPTION.     |
|    | community barrier reports.       | low-friction UI).      | Simplified form submission.   |
+----+----------------------------------+------------------------+-------------------------------+

```

---

## 3. Phase 3: Ideate & Feature Prioritization

### MoSCoW Prioritization Framework

Features are categorized using the **MoSCoW Method** to maintain focus on delivering a high-impact MVP.

```
+---------------------------------------------------------------------------------------+
|                               MoSCoW PRIORITIZATION                                  |
+---------------------------------------------------------------------------------------+
| MUST HAVE (Core MVP)                        | SHOULD HAVE (Value Add)                 |
| - Origin/Destination place search[cite: 1]. | - Crowd barrier report submission[cite: 1].    |
| - Interactive Leaflet map canvas[cite: 1].  | - Facility layer toggle controls[cite: 1].    |
| - Accessibility route polyline render[cite: 1].| - Current location auto-center[cite: 1].   |
| - Warning banner for known steps/slopes[cite: 1].| - Route preference adjustments[cite: 1].   |
| - Mobile-first responsive panel[cite: 1].   |                                         |
+---------------------------------------------+-----------------------------------------+
| COULD HAVE (Future Enhancements)            | WON'T HAVE (Out of Scope for MVP)       |
| - Saved favorite destinations[cite: 1].     | - Turn-by-turn voice GPS navigation[cite: 1]. |
| - High-contrast dark mode canvas[cite: 1].  | - Live automated lift outage feeds[cite: 1].  |
| - Marker clustering for dense points[cite: 1].| - Nationwide 3D elevation profiling[cite: 1]. |
| - Step-by-step image previews[cite: 1].     |                                         |
+---------------------------------------------------------------------------------------+

```

---

### Feature-to-Pain-Point Traceability & D/F/V Matrix

Each proposed feature is evaluated against user pain points using the **Desirability, Feasibility, and Viability (D/F/V)** assessment model:

```
+------------------------+-----------------------------+--------------+-------------+-----------+
| Feature Description    | Mapped User Pain Point      | Desirability | Feasibility | Viability |
+------------------------+-----------------------------+--------------+-------------+-----------+
| Low-Barrier Route      | Unexpected physical steps & | HIGH         | HIGH        | HIGH      |
| Route Planning Engine  | steep slope abandonment[cite: 1].| (Essential)  | (OpenRoute) | (Feasible)|
+------------------------+-----------------------------+--------------+-------------+-----------+
| Filterable Facility    | Difficulty locating toilets | HIGH         | HIGH        | HIGH      |
| GeoJSON Layers         | & station lifts outdoors[cite: 1].| (High Value) | (Static API)| (Low cost)|
+------------------------+-----------------------------+--------------+-------------+-----------+
| Community Barrier      | Unannounced obstacles &     | HIGH         | HIGH        | HIGH      |
| Flagging Workflow      | unexpected path blocks[cite: 1].| (Empowering) | (LocalStorage)|(Scalable) |
+------------------------+-----------------------------+--------------+-------------+-----------+
| Mobile Bottom-Sheet    | Difficulty operating desktop| HIGH         | HIGH        | HIGH      |
| Thumb-Zone Layout      | maps while rolling[cite: 1]. | (Ergonomic)  | (CSS Grid)  | (Standard)|
+------------------------+-----------------------------+--------------+-------------+-----------+

```

---

## 4. Phase 4: Prototype & Requirements

### User Stories & Explicit Acceptance Criteria

#### User Story 1: Route Search & Pre-Inspection

* **As a** wheelchair user planning a trip,
* **I want to** enter my start point and destination on a mobile map,
* **So that I can** see a safe, low-barrier route before leaving home.



```
ACCEPTANCE CRITERIA (US-01):
1. GIVEN the user opens the mobile application planner,
   WHEN valid start and destination locations are submitted,
   THEN the Leaflet engine renders a distinct polyline path, displays distance/duration,
   and adjusts view bounds using map.fitBounds() with sheet padding[cite: 1].
2. GIVEN an empty or invalid location query,
   WHEN the search form is submitted,
   THEN inline validation highlights missing fields, calls e.preventDefault(),
   and blocks external network requests[cite: 1].

```

#### User Story 2: Barrier Avoidance & Incline Screening

* **As a** manual wheelchair user with limited upper-body strength,
* **I want to** receive immediate alerts about steep slopes or stairs on a route,
* **So that I can** choose an alternative path or prepare ahead of time.



```
ACCEPTANCE CRITERIA (US-02):
1. GIVEN a calculated route containing steps or gradients exceeding 8%,
   WHEN the route results panel opens,
   THEN a highlighted warning banner displays the hazard type and step index[cite: 1].
2. GIVEN the user selects the "Avoid Slopes" preference checkbox,
   WHEN the search is executed,
   THEN the routing algorithm filters out high-incline nodes[cite: 1].

```

#### User Story 3: Facility Layer Overlay

* **As a** commuter with mobility needs,
* **I want to** toggle map overlays for accessible toilets and station lifts,
* **So that I can** quickly locate assistance facilities along my path.



```
ACCEPTANCE CRITERIA (US-03):
1. GIVEN the map view is active,
   WHEN the user toggles the "Accessible Toilet" filter option,
   THEN matching markers are added to or removed from the map instantly without a full page refresh[cite: 1].
2. GIVEN facility markers rendered on the canvas,
   WHEN a marker is clicked,
   THEN an interactive popup displays its official name, accessibility features, and verification badge[cite: 1].

```

#### User Story 4: Community Barrier Reporting

* **As a** local wheelchair commuter encountering an obstacle,
* **I want to** flag a temporary path blockage or broken lift on the map,
* **So that I can** warn other community members in real time.



```
ACCEPTANCE CRITERIA (US-04):
1. GIVEN an active hazard on the ground,
   WHEN a user submits a report with hazard type, severity, and location notes,
   THEN a custom warning marker appears on the map and saves to LocalStorage[cite: 1].
2. GIVEN a report created by the current user session,
   WHEN inspecting the marker popup,
   THEN options to edit details or delete the report are functional[cite: 1].

```

#### User Story 5: One-Handed Mobile Responsiveness

* **As an** active user holding a phone while steering a PMA,
* **I want** controls located within easy thumb reach at the bottom of the screen,
* **So that I can** safely operate the map with one hand.



```
ACCEPTANCE CRITERIA (US-05):
1. GIVEN a mobile viewport width (375px–480px),
   WHEN viewing the application,
   THEN primary search inputs and actions render inside an expandable bottom sheet[cite: 1].
2. GIVEN interactive buttons and marker targets,
   WHEN rendered on mobile touchscreens,
   THEN all touch targets maintain a minimum size of 44x44px[cite: 1].

```

---

### Mobile-First Prototyping & Ergonomic Layout Strategy

The application layout prioritizes mobile ergonomics, placing key interactions within natural thumb reach on small screens:

```
+-----------------------------------+  <-- 0px (Top of Viewport)
| [=] AccessWay SG       [GPS Target]|  Header / App Bar
+-----------------------------------+
|                                   |
|                                   |
|          LEAFLET MAP              |
|          CANVAS AREA              |  Full-bleed interactive map canvas
|                                   |  (Zoom/Pan touch gestures enabled)
|         [Marker]                  |
|                                   |
+-----------------------------------+  <-- Bottom-sheet overlay boundary
|  ==== (Swipe / Drag Handle) ====  |  
| [ Start Location Search        ]  |  THUMB ZONE (375px - 480px)
| [ Destination Location Search  ]  |  Primary input controls placed lower
| ( ) Manual  (*) Power  [ ] Sheltered|  on the screen for one-handed reach
| [=== FIND ACCESSIBLE ROUTE ===]   |  Large 48px action button
+-----------------------------------+  <-- 812px (Bottom of Screen)

```

---

## 5. Phase 5: Test & Risk Analysis

### Usability Testing Plan

```
+------------------------+--------------------------------------------------------------+
| Test Parameter         | Specification & Operational Rules                            |
+------------------------+--------------------------------------------------------------+
| Target Participant Pool| 4 Manual/Power Wheelchair Users + 2 Accessibility Mentors.    |
+------------------------+--------------------------------------------------------------+
| Primary Test Scenario  | Task 1: Search route from "Dhoby Ghaut MRT" to "Plaza SG"[cite: 1].|
|                        | Task 2: Filter map to show accessible toilets along route[cite: 1].|
|                        | Task 3: Flag a temporary footpath obstruction hazard[cite: 1]. |
+------------------------+--------------------------------------------------------------+
| Key Usability Metrics  | - Task Completion Rate (Target: > 90% without guidance)[cite: 1].|
|                        | - Single-hand Task Completion Time (< 45 seconds)[cite: 1].   |
|                        | - System Usability Scale (SUS) Score (Target: > 80/100).     |
+------------------------+--------------------------------------------------------------+

```

---

### Risk Analysis & Management Matrix

Potential project risks are identified alongside practical mitigation strategies:

```
+--------------------+------------+--------+----------------------------------------------------+
| Risk Description   | Likelihood | Impact | Mitigation & Technical Control Strategy            |
+--------------------+------------+--------+----------------------------------------------------+
| False or Malicious | Medium     | High   | - Require barrier type & severity selections.     |
| Community Reports  |            |        | - Add timestamp tags to show report age.           |
|                    |            |        | - Allow community upvoting/verification[cite: 1].   |
+--------------------+------------+--------+----------------------------------------------------+
| Third-Party API    | Medium     | High   | - Wrap network calls in try/catch blocks.          |
| Unavailability     |            |        | - Fallback to cached `demo-routes.json` file       |
|                    |            |        |   if requests time out or fail[cite: 1].            |
+--------------------+------------+--------+----------------------------------------------------+
| Incomplete Open    | High       | Medium | - Augment route data with static GeoJSON layers    |
| StreetMap Data     |            |        |   for high-traffic MRT corridors[cite: 1, 5].        |
+--------------------+------------+--------+----------------------------------------------------+
| Screen Glare Outdoors| High     | Medium | - Enforce high-contrast UI theme (WCAG AA).        |
|                    |            |        | - Add clear visual icons alongside text labels[cite: 1].|
+--------------------+------------+--------+----------------------------------------------------+

```

---

## 6. Document Sign-Off & Phase Transition

This Phase 1 Design Thinking Documentation establishes the requirements baseline for **AccessWay SG**. The identified user needs, prioritized features, and risk mitigations directly inform the application's implementation and testing phases.

* **Document Author:** Lead UI/UX & Frontend Developer (AccessWay SG Team).


* **Approved Phase:** Phase 1 Design Thinking Complete -> Proceed to **Phase 2 Development & Phase 9 Testing**.