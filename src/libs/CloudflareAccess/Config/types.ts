/** Whether the QA auth feature is fully configured. Anything short of a complete config disables it */
type IsQAAuthConfigured = () => boolean;

/** Whether a URL may carry the QA bearer token. The security boundary for the whole feature */
type IsQAServerRequest = (url: string) => boolean;

/** Origin form of the QA API root */
type GetQAOrigin = () => string;

/** The OAuth redirect URI this client sends and handles */
type GetOAuthRedirectURI = () => string;

export type {GetOAuthRedirectURI, GetQAOrigin, IsQAAuthConfigured, IsQAServerRequest};
