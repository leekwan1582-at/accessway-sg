Phase 11 shifts focus from local code completion to continuous integration, production deployment, post-launch verification, and assessment packaging.

Here is the complete Phase 11 execution blueprint tailored for your **AccessWay SG** GitHub repository and assessment delivery.

---

## Phase 11: Deployment & Post-Launch Verification

### 1. GitHub Repository & Pages Automation

#### A. Pre-Deployment Repository Cleanup

* **Clean System Artifacts**: Ensure `.DS_Store`, `node_modules/`, local `.env`, or temporary build files are listed in `.gitignore`.
* **Standardized Commit History**: Flatten or clean your Git commit log to reflect structured progression (e.g., `feat(map): initialize leaflet canvas`, `fix(ui): resolve Chrome layout overflow`).
* **Main Branch Lock**: Ensure all 7 ES6 modules (`report-store.js`, `api-service.js`, `route-service.js`, `map-service.js`, `ui-controller.js`, `barrier-controller.js`, `app.js`) and dataset files are merged directly into `main`.

#### B. Automated CI/CD Action (`.github/workflows/deploy.yml`)

Set up a GitHub Action to automate linting and static deployment whenever changes land on `main`:

```yaml
name: Deploy AccessWay SG to GitHub Pages

on:
  push:
    branches: [ "main" ]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup GitHub Pages
        uses: actions/configure-pages@v4

      - name: Upload Pages Artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: '.'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4

```

---

### 2. Post-Deployment Live Verification Audit

Once deployed live at `https://<your-username>.github.io/accessway-sg/`, perform this live sanity check:

| Audit Domain | Test Action | Expected Production Result |
| --- | --- | --- |
| **HTTPS Security** | Open site via `https://` protocol | SSL padlock icon displays green; no mixed-content HTTP console warnings. |
| **Asset Path Integrity** | Inspect network tab (`F12`) | All `.css`, `.js`, `.json`, and `.geojson` files load with `HTTP 200` (no `404 Not Found`). |
| **Module Resolution** | Check ES6 module imports | Vanilla `type="module"` scripts resolve correctly relative to the root URL path. |
| **Leaflet Tile Rendering** | Pan and zoom OpenStreetMap view | Map tiles load cleanly without watermarks or tile grid breakage. |
| **OneMap API CORS** | Trigger geocoding search | `[https://www.onemap.gov.sg/api/](https://www.onemap.gov.sg/api/)...` resolves without Cross-Origin Resource Sharing (CORS) blocks. |
| **LocalStorage Isolation** | Add a barrier hazard pin & refresh | Hazard pin persists across hard page reloads (`Ctrl + F5`). |

---

### 3. Assessment Submission Deliverables Package

Prepare your final submission assets according to the BELLS assessment criteria:

1. **Repository Links**:
* **Live Application URL**: `https://<your-username>.github.io/accessway-sg/`
* **Public Repository URL**: `[https://github.com/](https://github.com/)<your-username>/accessway-sg`


2. **Release Tagging**:
* Create a Git release tag to mark the exact code version evaluated during your grading:
```bash
git tag -a v1.0.0-mvp -m "AccessWay SG BELLS Assessment Production Release"
git push origin v1.0.0-mvp

```




3. **Oral Defense Cheat-Sheet Preparation**:
* Be ready to demonstrate the 7-module ES6 flow during the 15-minute presentation.
* Highlight defensive programming features: request timeout races in `api-service.js`, XSS HTML escaping in `ui-controller.js`, and `LocalStorage` corruption fallbacks in `report-store.js`.



---