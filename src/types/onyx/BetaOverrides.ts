import type Beta from './Beta';

/** Local overrides for beta feature flags, set from the Test Tool Menu. A `true`/`false` entry takes precedence over the server-provided betas; absent entries fall back to the server state */
type BetaOverrides = Partial<Record<Beta, boolean>>;

export default BetaOverrides;
