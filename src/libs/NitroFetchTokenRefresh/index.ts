const AUTH_TOKEN_HEADER = 'authToken';

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Keep the web signature aligned with the native token refresh implementation.
function registerPrefetchTokenRefresh(credentials: unknown): void {
    // Native startup prefetch does not run on web.
}

export {AUTH_TOKEN_HEADER, registerPrefetchTokenRefresh};
