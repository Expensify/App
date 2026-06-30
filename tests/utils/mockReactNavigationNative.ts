/**
 * Spreads the real `@react-navigation/native` into a `jest.mock` factory so `NavigationRouteContext` survives —
 * without it, any component calling `useContext(NavigationRouteContext)` (e.g. `GenericPressable`) crashes with
 * `Cannot read properties of undefined (reading '$$typeof')`. Import under a `mock`-prefixed name (jest hoisting):
 *   jest.mock('@react-navigation/native', () => ({...mockReactNavigationNative(), useIsFocused: () => true}));
 */
function mockReactNavigationNative(overrides: Record<string, unknown> = {}): Record<string, unknown> {
    return {
        ...jest.requireActual<Record<string, unknown>>('@react-navigation/native'),
        ...overrides,
    };
}

export default mockReactNavigationNative;
