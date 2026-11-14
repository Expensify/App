/**
 * Placeholder in the CSP and in script tags (`web/index.html`, and Rsbuild's dev output) that the Worker replaces with a
 * per-request nonce. Kept free of Worker types, so the Rsbuild config can import it.
 */
const NONCE_PLACEHOLDER = 'nonce-random-value';

export default NONCE_PLACEHOLDER;
