const fetch = (...args: Parameters<typeof globalThis.fetch>) => globalThis.fetch(...args);
const prefetchOnAppStart = jest.fn(() => Promise.resolve());
const registerTokenRefresh = jest.fn();
const clearTokenRefresh = jest.fn();

export {fetch, prefetchOnAppStart, registerTokenRefresh, clearTokenRefresh};
