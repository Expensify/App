/**
 * Jest manual mock for Navigation.
 *
 * Used automatically when a test calls `jest.mock('@libs/Navigation/Navigation')` without a factory.
 * Tests that need custom behavior can still pass a factory to override specific methods.
 */
export default {
    navigate: jest.fn(),
    goBack: jest.fn(),
    getActiveRoute: jest.fn(() => ''),
    getActiveRouteWithoutParams: jest.fn(() => ''),
    getReportRHPActiveRoute: jest.fn(() => ''),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    dismissModal: jest.fn(),
    dismissModalWithReport: jest.fn(),
    setNavigationActionToMicrotaskQueue: jest.fn((callback: () => void) => callback?.()),
    setParams: jest.fn(),
    clearPreloadedRoutes: jest.fn(),
    isTopmostRouteModalScreen: jest.fn(() => false),
};
