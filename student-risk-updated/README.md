# Student Dropout Risk Management System

A frontend-only, locally embedded student dropout risk-management demo. The interface is built with semantic HTML, CSS, and vanilla JavaScript ES modules. It has no backend, remote data requests, chart library, or icon dependency.

## Run locally

From the workspace root (the package uses the monorepo workspace dependency catalog):

```sh
pnpm install
pnpm --filter @workspace/student-risk dev
```

Open the Vite URL printed in the terminal. This starts a local development server only; the app itself has no API, database, or remote data requests. The project’s existing Vite configuration and package scripts are retained.

To serve the static files directly from the workspace root without Vite:

```sh
python3 -m http.server 8000 --directory artifacts/student-risk
```

Then open `http://localhost:8000/`. Because the app uses JavaScript ES modules, do not rely on double-clicking `index.html` and opening it as a `file://` URL; browser security rules may block the modules.

Static build:

```sh
pnpm --filter @workspace/student-risk build
```

To serve without Vite, use any local static HTTP server with this directory as its root. ES modules should be served over HTTP rather than opened as a `file://` URL.

## Workspace features

- Overview dashboard with synthetic counts and inline SVG charts
- Student directory with search, review-band/course filters, score/admission-grade sorting, pagination, keyboard-accessible detail modal, and CSV export
- Validated demo assessment with reset, print, and a clearly described local heuristic
- Filterable analytics charts drawn locally as accessible SVG
- Notebook data-cleaning timeline, sample synthetic records, and target-construction notes
- Approximate notebook-comment model comparison chart and project/about notes
- Responsive mobile navigation and accessible toast feedback

## Data and interpretation

All 24 records and every displayed student count are generated, synthetic examples embedded in `js/data.js`. Names, references, grades, and course display groups are illustrative; course display groups do not map to UCI course codes. They are not real students, real outcomes, or predictions. The assessment is a simulated heuristic using three source-aligned numeric fields; the synthetic course reference is display-only. The assessment is not the notebook’s target formula, a complete model input, or a trained Random Forest prediction.

The supplied Python notebook is the reference for UCI dataset 697, synthetic missingness/outliers/duplicate rows, median imputation, IQR capping, duplicate removal, parental qualification grouping, predictor leakage exclusions, and regression comparisons. This browser demo does not fetch that dataset or run its preprocessing. The notebook leaves 30 source columns after excluding six target-construction fields; one-hot encoding expands the grouped parent qualification columns. Cleaning counts, exact test metrics, and exact cross-validation metrics are not loaded. Notebook-comment R² values are marked approximate and are not verified live evaluation.

Risk bands are Low (<33), Medium (33 to <66), and High (>=66). Treat any risk indicator as a prompt for human review and supportive outreach, never as a certainty or a basis for limiting opportunity.
