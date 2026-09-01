/**
 * Key that `@sentry/webpack-plugin` stamps into every web chunk at build time, and that
 * `thirdPartyErrorFilterIntegration` matches frames against at runtime to tell our own code from
 * injected code (consent tools, tag managers, browser extensions).
 *
 * Both halves live in different worlds (bundler config and app source) and can only agree by literal
 * string, so they share this const. Keep this module free of imports: it is loaded by
 * `config/rsbuild/rsbuild.common.ts`, where module aliases are not resolved yet.
 */
const SENTRY_APPLICATION_KEY = 'expensify-app';

export default SENTRY_APPLICATION_KEY;
