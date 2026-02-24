# Repository Guidelines

All repository guidelines and instructions have been consolidated into [CLAUDE.md](./CLAUDE.md). Please read that file for project structure, build commands, coding style, and testing guidelines.

## Cursor Cloud specific instructions

### Services overview

This is a client-side React Native web app (SPA) with no local backend. All API calls go to remote Expensify servers (`www.expensify.com` / `staging.expensify.com`) through a local CORS proxy.

### Running the web dev server

- **Command**: `USE_WEB_PROXY=true npm run web`
- The `USE_WEB_PROXY=true` env override is **required** because the Cursor Cloud environment injects `USE_WEB_PROXY=false` via secrets. Without the override, the local proxy on port 9000 won't start and API requests will fail with CORS/network errors.
- The dev server runs at `https://dev.new.expensify.com:8082/` and takes ~2-3 minutes for the initial webpack build.
- The first page load may show a "No data found for key nvp_onboarding" error modal; dismiss it to reach the login screen.

### HTTPS and hosts prerequisites

These are already set up in the VM snapshot but are noted here for context:
- mkcert CA is installed and HTTPS certs are at `config/webpack/key.pem` and `config/webpack/certificate.pem`.
- `/etc/hosts` contains `127.0.0.1 dev.new.expensify.com`.
- The mkcert root CA is imported into Chrome's NSS database (`~/.pki/nssdb`), but Chrome may still show "Not secure" in the address bar.

### Lint / Typecheck / Test

Standard commands from `package.json`:
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript (takes ~2.5 min, uses `--max_old_space_size=8192`)
- `npm run test` — Jest unit tests
- `npx eslint <files> --max-warnings=0` — lint specific files
- `npx prettier --write <files>` — format specific files

### Node version

Strict engine enforcement (`engine-strict=true` in `.npmrc`): must use Node `20.19.5` / npm `10.8.2`. Use `nvm use` in the workspace root to activate the correct version from `.nvmrc`.
