# Deployment (GitHub Pages)

The site (including the **Resource Finder** app at `/shelter-finder`) is deployed via GitHub Actions to the `gh-pages` branch.

## Required: Pages source

**GitHub Pages must be set to serve from the `gh-pages` branch.**

1. Repo **Settings** → **Pages**
2. Under **Build and deployment**, set **Source** to **Deploy from a branch**
3. **Branch**: `gh-pages` / **Folder**: `/(root)`
4. Save

If Pages is set to `main` instead, the shelter-finder app will 404 because it is only built and published to `gh-pages`.

## What gets deployed

- Root site: `index.html`, `index2.html`, `main.js`, `style.css`, `CNAME`, `images/`, `pizza/`
- **Resource Finder** (built from `shelter-finder/`): `shelter-finder/`

The workflow runs on pushes to `main` that touch those paths or `shelter-finder/**`.

## Run the app locally

```bash
cd shelter-finder
npm install
npm run dev
```

App: [http://localhost:5173](http://localhost:5173)
