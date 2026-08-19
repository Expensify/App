import {DYNAMIC_ROUTES} from '@src/ROUTES';

/**
 * Dynamic route paths are flattened into the react-navigation linking config, which runs
 * `checkForDuplicatedConfigs` at NavigationContainer mount. Two DYNAMIC_ROUTES that emit the
 * same `path` pattern (regardless of their `entryScreens`) crash the whole app at boot. This
 * guard fails fast in CI instead of at runtime. Regression guard for #83850, where a per diem
 * `destination` suffix collided with Sage Intacct's existing `destination` suffix.
 */
describe('DYNAMIC_ROUTES', () => {
    it('has globally unique path patterns', () => {
        const paths = Object.values(DYNAMIC_ROUTES).map((route) => route.path);
        const duplicates = paths.filter((path, index) => paths.indexOf(path) !== index);
        expect(duplicates).toEqual([]);
    });
});
