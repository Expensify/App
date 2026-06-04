export const fetch = (...args: Parameters<typeof globalThis.fetch>) => globalThis.fetch(...args);
export const prefetchOnAppStart = jest.fn(() => Promise.resolve());
export const registerTokenRefresh = jest.fn();
export const clearTokenRefresh = jest.fn();
