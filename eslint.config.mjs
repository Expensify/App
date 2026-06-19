// Re-export the real config from config/eslint/ so editor integrations,
// `npx eslint`, and anything else using ESLint's flat-config autodiscovery
// can find it at the repo root. The real config lives in config/eslint/
// (see contributingGuides/LINTING.md).
export {default} from './config/eslint/eslint.config.mjs';
