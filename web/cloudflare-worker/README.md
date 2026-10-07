# New Expensify Cloudflare Worker

This package serves the New Expensify web build (`dist/`) from Cloudflare with [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/).

The build and the Worker are uploaded together as one Worker version. A deploy is therefore atomic, and a rollback restores both the code and the assets.

## What the Worker does

Every request runs the Worker first (`run_worker_first: true`), which reads the file from the `ASSETS` binding and then:

| Request | Response |
| --- | --- |
| Any path | Security headers: HSTS, CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Document-Policy` |
| HTML (`/`, `/index.html`, any SPA deep link) | Each `<script nonce="nonce-random-value">` gets a per-request nonce that matches the CSP. `Cache-Control: no-cache`, with no `ETag` or `Last-Modified`, since a 304 would pair a cached body with a new nonce |
| Content-hashed files (`main-<16 hex>.bundle.js`, `name.<10 hex>.css`) | `Cache-Control: public, max-age=31536000, immutable` |
| Files with fixed names (`version.json`, `service-worker.js`, `manifest.json`, ...) | Default `public, max-age=0, must-revalidate`, with an `ETag` |
| A file path that does not exist (`/main-<old hash>.bundle.js`) | `404`, so a stale tab gets a `ChunkLoadError` and recovers instead of parsing HTML as JavaScript |
| Any other path that does not exist (`/r/123`) | The app shell (`index.html`) with `200` |
| `/.well-known/apple-app-site-association` and `/apple-app-site-association` | The same file with `Content-Type: application/json` |

[`.assetsignore`](.assetsignore) keeps the Brotli twins (`*.br`) and source maps (`*.map`) out of the upload. `npm run prepare-dist` copies it into `dist/` before every `dev` run.

The CSP lives in [`src/csp.ts`](src/csp.ts). The `ENVIRONMENT` variable in [`wrangler.jsonc`](wrangler.jsonc) selects the staging or production policy.

## Running it locally

`wrangler dev` runs the Worker in workerd, the same runtime Cloudflare uses, and serves `dist/` exactly as a deploy would. No Cloudflare account or credentials are needed.

### 1. Install

This package has its own dependencies. They are not installed by the root `npm install`.

```bash
cd web/cloudflare-worker
npm ci
```

### 2. Get a web build in `dist/`

Either build one from the App root:

```bash
npm run build-staging   # or `npm run build` for production
```

Or, to skip the build, download a released one into the App root:

```bash
gh release download <version> --repo Expensify/App --pattern webBuild.tar.gz
tar -xzf webBuild.tar.gz   # creates dist/
```

### 3. Start the Worker

```bash
npm run dev               # http://localhost:8787 with the staging CSP
npm run dev:production    # the same, with the production CSP
```

`wrangler dev` reloads when `dist/` changes, so you can rebuild or swap builds without restarting it.

To check the CSP exactly as browsers enforce it in production, serve over HTTPS:

```bash
npm run dev -- --local-protocol https
```

Over plain HTTP, a few third-party scripts that load protocol-relative URLs (Convert, Group-IB) request `http://` resources that the HTTPS-only CSP blocks. Over HTTPS there should be no CSP violations in the console.

> [!WARNING]
> The Worker sends `Strict-Transport-Security`. Open the HTTPS session in a throwaway browser profile, so `localhost` is not pinned to HTTPS for your other local projects.

### What you can't test locally

The API at `www.expensify.com`, and Google Sign-In, only accept requests from known origins. The app loads to the sign-in page, but signing in fails with CORS errors. Everything the Worker is responsible for can be tested locally; signing in is verified on a deployed test hostname.

## Checking the behavior

### Automated tests

```bash
npm test          # integration tests: the real wrangler.jsonc in workerd, against tests/fixtures/webBuild
npm run typecheck # regenerates worker-configuration.d.ts with `wrangler types`, then type-checks src/ and tests/
```

### Comparing headers with a live host

```bash
npm run compare-headers -- https://staging.new.expensify.com http://localhost:8787
npm run compare-headers -- https://new.expensify.com http://localhost:8787   # run `npm run dev:production` first
```

The script diffs status, caching and security headers for a fixed set of paths. Nonces are masked, and CSP differences are reported per directive.

### Manual checks in a browser

1. **CSP:** Open the app and check the console for CSP violations (over HTTPS, see above).
2. **Deep links:** Open a deep link such as `/settings/profile` directly and reload it.
3. **Service worker:** Check that it registers. In DevTools > Application > Service workers, its source is `/service-worker.js`.
4. **A deploy with a tab left open:**
   1. Open the app on one build.
   2. Replace `dist/` with a newer build and run `npm run prepare-dist`.
   3. Navigate to a page that lazy-loads code.
   4. Verify that the old chunk request returns `404`, the app reloads onto the new build, and `/version.json` reports the new version.

## Deploying

| Environment | Worker | Route |
| --- | --- | --- |
| `staging` | `staging-new-expensify-assets` | `test-staging.new.expensify.com/*` until switchover, then `staging.new.expensify.com/*` |
| `production` | `new-expensify-assets` | None until switchover, then `new.expensify.com/*` |

Deploys will run `wrangler deploy --env staging|production` from CI, with `CLOUDFLARE_ACCOUNT_ID` and a scoped `CLOUDFLARE_API_TOKEN` supplied as environment secrets. Run `npm run prepare-dist` first so `.assetsignore` is applied.

To check the config without credentials or uploading anything:

```bash
npm run prepare-dist && npx wrangler deploy --dry-run --env staging
```

Never commit credentials, account IDs or `.dev.vars` files here. This is a public repository.
