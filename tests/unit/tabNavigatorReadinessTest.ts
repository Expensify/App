import type * as TabNavigatorReadiness from '@libs/Navigation/helpers/tabNavigatorReadiness';

/**
 * Regression test for the deep-link / notification race fixed in issue #91777.
 *
 * TAB_NAVIGATOR is declared on the root navigator before its lazily-loaded child router mounts.
 * Deep-link and notification navigation must wait for that mount before dispatching a nested
 * NAVIGATE, otherwise the action is unhandled and the link is silently dropped. This module is a
 * lifecycle-driven readiness signal: TabNavigator flips it on mount and resets it on unmount so the
 * promise re-arms across a logout → login cycle.
 */
function loadHelper(): typeof TabNavigatorReadiness {
    // Fresh import each test so the module-level mounted flag and promise reset.
    return require<typeof TabNavigatorReadiness>('@libs/Navigation/helpers/tabNavigatorReadiness');
}

describe('tabNavigatorReadiness', () => {
    beforeEach(() => {
        jest.resetModules();
    });

    it('starts unmounted and exposes a pending promise', async () => {
        const {isTabNavigatorMounted, whenTabNavigatorReady, setTabNavigatorMounted} = loadHelper();
        expect(isTabNavigatorMounted()).toBe(false);

        let resolved = false;
        const promise = whenTabNavigatorReady().then(() => {
            resolved = true;
        });
        // Promise must not resolve until the navigator mounts.
        await Promise.resolve();
        expect(resolved).toBe(false);

        setTabNavigatorMounted();
        await promise;
        expect(resolved).toBe(true);
    });

    it('resolves a pending promise when the navigator mounts', async () => {
        const {whenTabNavigatorReady, setTabNavigatorMounted, isTabNavigatorMounted} = loadHelper();
        const promise = whenTabNavigatorReady();
        setTabNavigatorMounted();
        await expect(promise).resolves.toBeUndefined();
        expect(isTabNavigatorMounted()).toBe(true);
    });

    it('resolves immediately once already mounted', async () => {
        const {setTabNavigatorMounted, whenTabNavigatorReady, isTabNavigatorMounted} = loadHelper();
        setTabNavigatorMounted();
        expect(isTabNavigatorMounted()).toBe(true);
        await expect(whenTabNavigatorReady()).resolves.toBeUndefined();
    });

    it('re-arms the promise after an unmount (logout → login cycle)', async () => {
        const {setTabNavigatorMounted, setTabNavigatorUnmounted, whenTabNavigatorReady, isTabNavigatorMounted} = loadHelper();

        // First mount.
        setTabNavigatorMounted();
        expect(isTabNavigatorMounted()).toBe(true);

        // Logout: unmount resets the flag and arms a fresh promise.
        setTabNavigatorUnmounted();
        expect(isTabNavigatorMounted()).toBe(false);

        let resolved = false;
        const promise = whenTabNavigatorReady().then(() => {
            resolved = true;
        });
        await Promise.resolve();
        expect(resolved).toBe(false);

        // Login: mounting again resolves the new promise.
        setTabNavigatorMounted();
        await promise;
        expect(resolved).toBe(true);
        expect(isTabNavigatorMounted()).toBe(true);
    });

    it('stays ready while any instance remains mounted (ref-counted)', async () => {
        const {setTabNavigatorMounted, setTabNavigatorUnmounted, whenTabNavigatorReady, isTabNavigatorMounted} = loadHelper();

        // Two TAB_NAVIGATORs mounted at once (e.g. a cross-tab PUSH stacks a second one).
        setTabNavigatorMounted();
        setTabNavigatorMounted();
        expect(isTabNavigatorMounted()).toBe(true);

        // Popping the pushed navigator must not re-arm the signal while the underlying one is still mounted.
        setTabNavigatorUnmounted();
        expect(isTabNavigatorMounted()).toBe(true);
        await expect(whenTabNavigatorReady()).resolves.toBeUndefined();

        // Only once the last instance unmounts does the signal re-arm.
        setTabNavigatorUnmounted();
        expect(isTabNavigatorMounted()).toBe(false);
    });

    it('does not go negative on an unmount call when already unmounted', async () => {
        const {setTabNavigatorMounted, setTabNavigatorUnmounted, whenTabNavigatorReady, isTabNavigatorMounted} = loadHelper();

        // An unbalanced unmount must not push the ref count below zero.
        setTabNavigatorUnmounted();
        expect(isTabNavigatorMounted()).toBe(false);

        // A single mount must still flip the signal to ready (it would not if the count were now -1).
        setTabNavigatorMounted();
        expect(isTabNavigatorMounted()).toBe(true);
        await expect(whenTabNavigatorReady()).resolves.toBeUndefined();
    });
});
