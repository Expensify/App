import type PinnedDomains from './types';

/**
 * Pinned domains and their accepted public key hashes.
 *
 * IMPORTANT: This is the JS-side mirror of the canonical pin list in
 * `config/certificatePinning/pins.json`. The actual enforcement happens in native code
 * (Android `network_security_config.xml` + `CertificatePinning.kt`, iOS TrustKit in
 * `CertificatePinning.swift`); this object is the single reference consumed by the JS layer
 * for telemetry/diagnostics and must be kept in sync with the native pins.
 *
 * Each domain pins two hashes:
 *  1. The leaf certificate SPKI hash (primary).
 *  2. The issuing intermediate CA SPKI hash (durable backup that survives leaf rotation).
 *
 * Regenerate with `scripts/generateCertificatePins.sh`.
 */
// Group A: leaf CN=expensify.com + Let's Encrypt YE1 intermediate
const GROUP_A_EXPENSIFY_COM = ['cSP5K9Slk59AgwZPst+dLPuNE+ZhypUlYRQNW1XC/fc=', 'brzvtCELCIZUo4sD/qPX0ccRtPsd3DY6RfmxpOU9oB4='];
// Group B: leaf CN=expensify.com + Google Trust Services WE1 intermediate
const GROUP_B_NEW_EXPENSIFY = ['G2v6PWWl92F5vVHCtAYwScBHqNtPMkxb++SFoBJq5F4=', 'kIdp6NNEd8wsugYyyIYFsi1ylMCED3hZbSR8ZFsa/A4='];
// Group C: leaf CN=integrations.expensify.com + Let's Encrypt R13 intermediate
const GROUP_C_INTEGRATIONS = ['7D0dEgdEKEMYRTgVwvnhJv19B4apk0QM/GPnRAKRGUs=', 'AlSQhgtJirc8ahLyekmtX+Iw+v46yPYRLJt9Cq1GlB0='];
// Group D: travel leaf + Google Trust Services WE1 intermediate
const GROUP_D_TRAVEL = ['Qb3qmTdRt/xHEN5PVtn+YhKoGqF/lhRX88cSFuSCJqM=', 'kIdp6NNEd8wsugYyyIYFsi1ylMCED3hZbSR8ZFsa/A4='];
// Group E: leaf *.cloudfront.net + Amazon RSA 2048 M01 intermediate
const GROUP_E_CLOUDFRONT = ['P9HBoLji8YncXSnb0AnAm72fJO/vpmxZrsl4fvUBkxc=', 'DxH4tt40L+eduF6szpY6TONlxhZhBd+pJ9wbHlQ2fuw='];

/* eslint-disable @typescript-eslint/naming-convention -- keys are hostnames, not identifiers */
const PINNED_DOMAINS: PinnedDomains = {
    // Production
    'www.expensify.com': GROUP_A_EXPENSIFY_COM,
    'secure.expensify.com': GROUP_A_EXPENSIFY_COM,
    'new.expensify.com': GROUP_B_NEW_EXPENSIFY,
    'integrations.expensify.com': GROUP_C_INTEGRATIONS,
    'travel.expensify.com': GROUP_D_TRAVEL,
    'd2k5nsl2zxldvw.cloudfront.net': GROUP_E_CLOUDFRONT,

    // Staging (required because beta/TestFlight release builds resolve their runtime environment
    // to STAGING and hit staging.* APIs while still having `__DEV__ === false`)
    'staging.expensify.com': GROUP_A_EXPENSIFY_COM,
    'staging-secure.expensify.com': GROUP_A_EXPENSIFY_COM,
    'staging.new.expensify.com': GROUP_B_NEW_EXPENSIFY,
    'staging.travel.expensify.com': GROUP_D_TRAVEL,
};
/* eslint-enable @typescript-eslint/naming-convention */

export default PINNED_DOMAINS;
