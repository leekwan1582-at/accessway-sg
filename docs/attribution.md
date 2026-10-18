# Attribution and Third-Party Resources

## Purpose and current status

This register records external libraries, services, data, assets, adapted code and AI assistance used in **AccessWay SG**.

**Status:** Initial project register. No application source code, dependency manifest or deployed build has been audited for this document. Resources marked **Candidate** are being considered, not confirmed as installed, approved, licensed for a particular use or integrated. Update this register as implementation proceeds.

A documentation entry does not replace attribution required inside the map, application interface, distributed source files or licence notices. Confirm terms against the actual resource and version used before release.

## Status definitions

| Status | Meaning |
|---|---|
| Confirmed — planning only | Used in project planning/documentation, not necessarily application code |
| Candidate | Proposed; not confirmed in the application |
| Used | Included in the implementation; evidence and terms must be recorded |
| Removed | Previously considered or used, but not in the current release |

## Project brief

| Resource | Creator / source | Contribution | Status |
|---|---|---|---|
| SCTP_IndustryProject1MarkingSchemeFINAL.pdf | Course-provided project marking scheme; issuer not independently verified | Requirements analysis, development phases and assessment traceability | Confirmed — planning only |

The course brief requires acknowledgement of non-original content and responsibility for retained AI-generated code. Consult the original brief when assessing whether adapted work is eligible for technical marks. Do not assume attribution alone makes copied work original or grants permission to use it.

## Libraries and frameworks

The following are candidates from the implementation plan. Confirm exact versions and corresponding licence files before changing their status to Used.

| Resource | Official source | Intended use | Version / licence verification | Status |
|---|---|---|---|---|
| Leaflet | https://leafletjs.com/ | Interactive map, layers, markers, popups and route display | Not recorded; inspect licence for installed version | Candidate |
| Bootstrap | https://getbootstrap.com/ | Responsive interface, forms, dialogs and components | Not recorded; inspect licence for installed version | Candidate |
| Leaflet.markercluster | https://github.com/Leaflet/Leaflet.markercluster | Cluster dense facility markers | Not recorded; inspect licence for installed version | Candidate |

For every library actually used, record its version, distribution/CDN URL, affected files and required notices in the implementation records below. Credit a library separately from any example code copied or adapted from its documentation.

## Map tiles and routing services

| Resource | Official source | Intended use | Terms / attribution action | Status |
|---|---|---|---|---|
| OneMap, Singapore Land Authority | https://www.onemap.gov.sg/ | Candidate map tiles and Singapore location services | Review current terms and exact map attribution; retain required visible map credits | Candidate |
| OneMap Barrier-Free Access API | https://www.onemap.gov.sg/apidocs/bfa | Preferred accessibility-oriented route provider | Confirm approval, authentication, permitted use and response retention before integration | Candidate — approval not confirmed |
| OpenRouteService | https://openrouteservice.org/ | Candidate wheelchair-profile routing fallback | Verify chosen service plan, current terms, attribution and restrictions before use | Candidate |
| OpenStreetMap contributors | https://www.openstreetmap.org/copyright | Potential underlying map/routing data through chosen providers | Confirm actual data provenance and all provider/data attribution obligations | Candidate — indirect use not confirmed |

### Map attribution checks

- [ ] Record the exact tile endpoint and provider terms.
- [ ] Copy required attribution from the provider's official instructions; do not invent or paraphrase mandatory wording.
- [ ] Preserve required links in Leaflet's visible attribution control.
- [ ] Check attribution remains visible on mobile and beneath dialogs/bottom sheets.
- [ ] If multiple providers or datasets are used, include all applicable credits.
- [ ] Check routing-provider attribution independently of tile-provider attribution.
- [ ] Confirm screenshot/publication credit requirements where applicable.

**Do not describe a route as OneMap BFA-sourced unless it actually came from that service.** Alternative routes and illustrative routes must retain their own source labels and limitations.

## Datasets and route provenance

No external dataset or field-survey result is confirmed by this register. Creating a local JSON or GeoJSON file does not make its underlying information original.

| Planned local file | Intended contents | Source / verification state | Status |
|---|---|---|---|
| data/facilities.geojson | Accessibility-related facilities | Source not selected; record individual source datasets and licences before use | Candidate |
| data/routes.geojson | Supported route geometries | Illustrative unless actual provider provenance or documented survey exists | Candidate |
| data/route-catalog.json | Journey labels, source metadata and warnings | Source not recorded; align with actual route provenance | Candidate |

### Dataset record template

Duplicate and complete this block for every dataset actually used:

```text
Dataset name:
Publisher / contributors:
Original dataset URL:
Download or access date:
Version / last-updated date, if available:
Licence / terms URL:
Required attribution wording:
Application files using it:
Fields retained:
Transformations or filtering performed:
Coverage and known limitations:
Redistribution / caching restrictions checked:
Evidence or commit:
```

### Route labelling rules

- API-derived routes: record the provider and relevant request/response provenance, subject to privacy and provider retention rules.
- Surveyed routes: record who checked them, the actual survey date, observations and limitations; do not imply certification.
- Illustrative or AI-assisted routes: label **Demo — not for navigation**; do not imply a survey or live route calculation.
- Unknown accessibility attributes: preserve them as unknown rather than converting missing values into claims of accessibility.
- Community reports: distinguish user-submitted observations from independently verified data.

## Images, icons and fonts

No particular image, icon set or font family is confirmed as used. Register these when selected, including resources loaded through a CDN.

| Asset category | Current state | Required record before release |
|---|---|---|
| Logo / illustrations | Not recorded | Creator, original/generated/adapted status, files and permission or terms |
| Photographs | Not recorded | Photographer, source URL, licence and edits |
| Icons / marker artwork | Not recorded | Icon set or creator, version, licence and required notices |
| Fonts | Not recorded | Family, designer/foundry, distribution source and licence |
| Screenshots | Not recorded | Capture date, app version and any visible third-party credits |

Do not claim an asset is original merely because its colors, crop or dimensions were changed. If AI generated an asset, also record it under AI assistance.

## Adapted code and technical references

No specific third-party code snippet has been audited as included in the application. Register every copied or adapted snippet separately from general documentation consulted.

| Record type | What to capture |
|---|---|
| Documentation reference | Page title, URL, access date and concept consulted |
| Copied/adapted code | Author, original URL, licence/permission, affected function/files and changes made |
| Tutorial influence | Tutorial title, creator, URL, scope of influence and independently implemented differences |
| Unclear permission | Do not include until permission or applicable licence has been established |

### Adapted-code record template

```text
Reference ID:
Author / organization:
Page or repository title:
Original URL:
Access date:
Licence / permission:
Affected project file and function:
What was copied or adapted:
Changes made:
Reason retained:
Author's explanation / understanding:
Required notice location:
Commit reference:
```

For substantial adaptations, include a short nearby source comment as well as this record. Never claim technical authorship of a library's implementation or an unmodified external snippet.

## AI assistance disclosure

**Confirmed planning assistance:** During project planning on 18 October 2026, a conversational AI assistant helped develop the AccessWay SG concept, implementation phases, routing fallback options, rubric traceability matrix and this attribution-register draft. These are planning/documentation contributions; they do not establish that an application was implemented or tested.

The assistant was presented in the conversation as Perplexity. The exact underlying model/version is not independently verified here. No generated application code, route dataset, image asset or external-source licence has been audited for this register.

| Contribution | Current disclosure | Review state |
|---|---|---|
| Project concept and phase plan | AI-assisted suggestions and drafting | Project author must validate scope and feasibility |
| Routing-provider and fallback discussion | AI-assisted explanation and research synthesis | Verify against current provider documentation before implementation |
| Traceability matrix | AI-assisted planning and Markdown generation | Reconcile with original marking scheme and actual code |
| Attribution register | AI-assisted first draft | Confirm actual resources, terms and final wording |
| Application code, mock data or images | Not confirmed by this register | Add individual records if used |

### AI implementation record template

Complete this for any additional AI contribution retained in the release:

```text
Tool / provider:
Model / version, if known:
Date:
Task / prompt summary:
Generated or modified files:
Contribution retained:
Human changes:
How correctness was checked:
Limitations or remaining uncertainty:
Commit reference:
```

### Author responsibility

Before submission, the project author must review retained AI-assisted material, verify factual and technical claims, test implemented behaviour, and be able to explain the submitted code. Do not change an unverified item to verified merely because an AI system produced it. Do not send private credentials or sensitive user-location records to AI services.

## Community contributions

No community contributions are confirmed. If reports, photographs, code or other user submissions are introduced, record consent/permissions, contribution terms and moderation arrangements. Credit contributors only with consent and avoid publishing private names or precise personal-location histories unnecessarily.

## Implementation record

Create one completed record per resource actually included in the release. Candidate entries above do not replace these records.

```text
Resource ID:
Name and version:
Creator / publisher:
Source URL:
Access date:
Purpose:
Affected project files:
Licence / terms URL:
Required attribution wording:
Where the notice is displayed or stored:
Modifications:
Verification performed:
Status:
Evidence / commit:
```

## Release review

- [ ] Audit actual HTML imports, JavaScript imports, stylesheets, fonts and network requests.
- [ ] Change Candidate entries to Used or Removed based on the actual release.
- [ ] Record exact versions and verified licence/terms links.
- [ ] Preserve required source/distribution licence notices.
- [ ] Verify visible map attribution on all supported viewports.
- [ ] Confirm every dataset has a source, permitted use and honest verification status.
- [ ] Record adapted code and AI contributions without overstating originality.
- [ ] Ensure no passwords, private tokens or sensitive user records appear in this document or repository.
- [ ] Link this document from README.md.
- [ ] Review again whenever providers, dependencies, datasets or assets change.

## Suggested README link

```markdown
## Credits and Attribution

See [Attribution and Third-Party Resources](docs/attribution.md) for
resource sources, third-party notices, data provenance and AI assistance.
```
