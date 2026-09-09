import type {GetOAuthRedirectURI, GetQAOrigins, GetQAResource, IsQAAuthConfigured, IsQAServerRequest} from './types';

/**
 * QA auth is web-only: receiving the OAuth callback needs claimed Universal/App Links, so the feature is
 * structurally off on native regardless of build configuration. Everything downstream gates on
 * isQAAuthConfigured(), which makes the remaining exports unreachable. They only satisfy the module shape.
 */
const isQAAuthConfigured: IsQAAuthConfigured = () => false;

const isQAServerRequest: IsQAServerRequest = () => false;

const getQAOrigins: GetQAOrigins = () => [];

const getQAResource: GetQAResource = () => '';

const getOAuthRedirectURI: GetOAuthRedirectURI = () => '';

export {getOAuthRedirectURI, getQAOrigins, getQAResource, isQAAuthConfigured, isQAServerRequest};
