import React from 'react';

/**
 * Creates a new component from a base component and a set of default props.
 * The returned component makes all props optional — any prop passed at usage site
 * overrides the corresponding default, while omitted props keep their defaults.
 *
 * This enables a layered customization pattern where a base screen (e.g. FailureScreenBase)
 * is wrapped once with full defaults, and consumers can selectively override individual props
 * without redefining the entire element.
 *
 * @param Component - The base component. Its props type is inferred automatically.
 * @param defaultProps - Default prop values passed to the component.
 * @param displayName - Display name assigned to the returned component for debugging.
 * @returns A component that renders the original component with merged props (defaults + overrides).
 *
 * @example
 * const DefaultClientFailureScreen = createScreenWithDefaults(
 *     FailureScreenBase,
 *     {
 *         illustration: 'MagnifyingGlass',
 *         title: 'multifactorAuthentication.oops',
 *         subtitle: 'multifactorAuthentication.yourAttemptWasUnsuccessful',
 *     },
 *     'DefaultClientFailureScreen',
 * );
 *
 * // Use as-is (all defaults apply):
 * <DefaultClientFailureScreen />
 *
 * // Override only the title (illustration and subtitle keep their defaults):
 * <DefaultClientFailureScreen title="multifactorAuthentication.customTitle" />
 */
type ScreenWithDefaultsImplProps<P extends Record<string, unknown>> = {
    Component: React.ComponentType<P>;
    defaultProps: NoInfer<P>;
    overrideProps: Partial<P>;
};

function ScreenWithDefaultsImpl<P extends Record<string, unknown>>({Component, defaultProps, overrideProps}: ScreenWithDefaultsImplProps<P>) {
    const mergedProps: P = {...defaultProps, ...overrideProps};

    return <Component {...mergedProps} />;
}

function createScreenWithDefaults<P extends Record<string, unknown>>(Component: React.ComponentType<P>, defaultProps: NoInfer<P>, displayName: string): React.ComponentType<Partial<P>> {
    function Screen(overrideProps: Partial<P>) {
        return (
            <ScreenWithDefaultsImpl
                Component={Component}
                defaultProps={defaultProps}
                overrideProps={overrideProps}
            />
        );
    }

    Screen.displayName = displayName;

    return Screen;
}

export default createScreenWithDefaults;
