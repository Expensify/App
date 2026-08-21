/**
 * RFC 8414 authorization server metadata discovery for the QA server's Managed OAuth. The authorize and
 * token endpoints are fetched from the well-known document Cloudflare serves on the QA origin rather than
 * assumed, and validated against the configured team domain before anything is sent to them.
 */
import {isRecord} from '@libs/ObjectUtils';

import CONFIG from '@src/CONFIG';

import {getQAOrigin} from './Config';

/** RFC 8414 §3 fixes the path. Cloudflare serves the document at the edge on the protected origin */
const WELL_KNOWN_PATH = '/.well-known/oauth-authorization-server';

/** A hung metadata fetch would stall the sign-in flow (and, via refresh, the cross-tab lock) */
const METADATA_TIMEOUT_MS = 10_000;

type AuthServerEndpoints = {
    /** Where the browser navigates to authorize (RFC 8414 `authorization_endpoint`) */
    authorizationEndpoint: string;

    /** Where codes and refresh tokens are exchanged (RFC 8414 `token_endpoint`) */
    tokenEndpoint: string;
};

let metadataPromise: Promise<AuthServerEndpoints> | null = null;

/** The single issuer this client trusts, pinned by configuration before any fetched endpoint is believed */
function getExpectedIssuer(): string {
    return `https://${CONFIG.QA_AUTH.TEAM_DOMAIN}`;
}

function validateEndpoint(value: unknown, issuerOrigin: string, name: string): string {
    let parsed: URL;
    try {
        parsed = new URL(typeof value === 'string' ? value : '');
    } catch {
        throw new Error(`Authorization server metadata has a missing or malformed ${name}`);
    }
    // Endpoints receive the authorization code and refresh tokens, so they must live on the pinned issuer
    if (parsed.origin !== issuerOrigin) {
        throw new Error(`Authorization server metadata ${name} does not belong to the expected issuer`);
    }
    return parsed.href;
}

async function fetchAndValidateMetadata(): Promise<AuthServerEndpoints> {
    const response = await fetch(new URL(WELL_KNOWN_PATH, getQAOrigin()).href, {
        credentials: 'omit',
        signal: AbortSignal.timeout(METADATA_TIMEOUT_MS),
    });
    if (!response.ok) {
        throw new Error(`Authorization server metadata request failed with HTTP ${response.status}`);
    }
    const json: unknown = await response.json().catch(() => null);
    if (!isRecord(json)) {
        throw new Error('Authorization server metadata is not a JSON object');
    }
    // RFC 8414 §3.3: the issuer in the document must exactly match the issuer the client expects
    const expectedIssuer = getExpectedIssuer();
    if (json.issuer !== expectedIssuer) {
        throw new Error('Authorization server metadata issuer does not match the configured team domain');
    }
    // This client only implements S256 (RFC 7636), so an issuer without it could never complete a flow
    if (!Array.isArray(json.code_challenge_methods_supported) || !json.code_challenge_methods_supported.includes('S256')) {
        throw new Error('Authorization server does not support the S256 PKCE challenge method');
    }
    const issuerOrigin = new URL(expectedIssuer).origin;
    return {
        authorizationEndpoint: validateEndpoint(json.authorization_endpoint, issuerOrigin, 'authorization_endpoint'),
        tokenEndpoint: validateEndpoint(json.token_endpoint, issuerOrigin, 'token_endpoint'),
    };
}

/**
 * Single-flight and cached for the page's lifetime. The metadata is static per environment. A failure
 * clears the cache so the next attempt retries, and rejects as a plain error: transient for the callers'
 * terminal/transient split, never an OAuthError.
 */
function getAuthServerEndpoints(): Promise<AuthServerEndpoints> {
    metadataPromise ??= fetchAndValidateMetadata().catch((error: unknown) => {
        metadataPromise = null;
        throw error;
    });
    return metadataPromise;
}

export {getAuthServerEndpoints};
export type {AuthServerEndpoints};
