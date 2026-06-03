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
/* eslint-disable @typescript-eslint/naming-convention -- keys are hostnames, not identifiers */
const PINNED_DOMAINS: PinnedDomains = {
    // Production
    'www.expensify.com': ['cSP5K9Slk59AgwZPst+dLPuNE+ZhypUlYRQNW1XC/fc=', 'brzvtCELCIZUo4sD/qPX0ccRtPsd3DY6RfmxpOU9oB4='],
    'secure.expensify.com': ['cSP5K9Slk59AgwZPst+dLPuNE+ZhypUlYRQNW1XC/fc=', 'brzvtCELCIZUo4sD/qPX0ccRtPsd3DY6RfmxpOU9oB4='],
    'new.expensify.com': ['G2v6PWWl92F5vVHCtAYwScBHqNtPMkxb++SFoBJq5F4=', 'kIdp6NNEd8wsugYyyIYFsi1ylMCED3hZbSR8ZFsa/A4='],
    'integrations.expensify.com': ['7D0dEgdEKEMYRTgVwvnhJv19B4apk0QM/GPnRAKRGUs=', 'AlSQhgtJirc8ahLyekmtX+Iw+v46yPYRLJt9Cq1GlB0='],
    'travel.expensify.com': ['Qb3qmTdRt/xHEN5PVtn+YhKoGqF/lhRX88cSFuSCJqM=', 'kIdp6NNEd8wsugYyyIYFsi1ylMCED3hZbSR8ZFsa/A4='],
    'd2k5nsl2zxldvw.cloudfront.net': ['P9HBoLji8YncXSnb0AnAm72fJO/vpmxZrsl4fvUBkxc=', 'DxH4tt40L+eduF6szpY6TONlxhZhBd+pJ9wbHlQ2fuw='],

    // Staging (required because beta/TestFlight release builds resolve their runtime environment
    // to STAGING and hit staging.* APIs while still having `__DEV__ === false`)
    'staging.expensify.com': ['cSP5K9Slk59AgwZPst+dLPuNE+ZhypUlYRQNW1XC/fc=', 'brzvtCELCIZUo4sD/qPX0ccRtPsd3DY6RfmxpOU9oB4='],
    'staging-secure.expensify.com': ['cSP5K9Slk59AgwZPst+dLPuNE+ZhypUlYRQNW1XC/fc=', 'brzvtCELCIZUo4sD/qPX0ccRtPsd3DY6RfmxpOU9oB4='],
    'staging.new.expensify.com': ['G2v6PWWl92F5vVHCtAYwScBHqNtPMkxb++SFoBJq5F4=', 'kIdp6NNEd8wsugYyyIYFsi1ylMCED3hZbSR8ZFsa/A4='],
    'staging.travel.expensify.com': ['Qb3qmTdRt/xHEN5PVtn+YhKoGqF/lhRX88cSFuSCJqM=', 'kIdp6NNEd8wsugYyyIYFsi1ylMCED3hZbSR8ZFsa/A4='],
};
/* eslint-enable @typescript-eslint/naming-convention */

export default PINNED_DOMAINS;
