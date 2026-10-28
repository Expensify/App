import type {DevelopmentOrigins, Environment} from './csp';

/** Security headers and nonce generation shared by the static-assets and PR-testing Workers. */
import {getCSP} from './csp';

function generateNonce(): string {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return btoa(String.fromCharCode(...bytes));
}

function setSecurityHeaders(headers: Headers, environment: Environment, nonce: string, developmentOrigins?: DevelopmentOrigins) {
    headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    headers.set('Content-Security-Policy', getCSP(environment, nonce, developmentOrigins));
    headers.set('X-Frame-Options', 'SAMEORIGIN');
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Referrer-Policy', 'origin-when-cross-origin');
    // Used by react-native-release-profiler
    headers.set('Document-Policy', 'js-profiling');
}

export {generateNonce, setSecurityHeaders};
