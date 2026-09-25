import navigationRef from '@libs/Navigation/navigationRef';

/**
 * The mounted navigation container, or a thrown error. Tests that spy on `dispatch` need the object itself, and a
 * silently `undefined` ref would turn a mounting failure into an assertion that never runs.
 */
function requireNavigationContainer(): NonNullable<typeof navigationRef.current> {
    const container = navigationRef.current;
    if (!container) {
        throw new Error('Expected the navigation container to be mounted');
    }
    return container;
}

export default requireNavigationContainer;
