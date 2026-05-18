import {withSanitizedDeepLinkParams} from '@libs/Navigation/AppNavigator/createRootStackNavigator/GetStateForActionHandlers';

describe('withSanitizedDeepLinkParams', () => {
    describe('deep-link chain detection (gated on `params.screen` presence)', () => {
        it('strips the full RN initial-state chain when `params.screen` is set, preserving non-chain keys', () => {
            const route = {
                key: 'k-1',
                name: 'WorkspaceSplit',
                params: {
                    screen: 'WorkspaceOverview',
                    params: {nested: true},
                    path: '/workspace/123',
                    initial: false,
                    state: {routes: [{name: 'X'}]},
                    policyID: 'p1',
                    customFlag: 'preserve-me',
                },
            };

            const result = withSanitizedDeepLinkParams(route, undefined);

            expect(result.params).toEqual({policyID: 'p1', customFlag: 'preserve-me'});
            expect('params' in result).toBe(true);
        });

        it('OMITS `params` from the result entirely when `params.screen` is set AND every key is part of the chain', () => {
            // Identity / shape regression: previously this case silently set `params: undefined`,
            // flipping `'params' in result` from false to true downstream. New behaviour is to
            // remove the property entirely.
            const route = {
                key: 'k-1',
                name: 'WorkspaceSplit',
                params: {
                    screen: 'WorkspaceOverview',
                    initial: false,
                    path: '/workspace/123',
                },
            };

            const result = withSanitizedDeepLinkParams(route, undefined);

            expect('params' in result).toBe(false);
            expect(result.params).toBeUndefined();
        });

        it('PRESERVES `params` as-is when `params.screen` is absent, even if other "chain-like" keys are present', () => {
            // False-positive defense: legitimate user-set `path`, `initial`, etc. on a route
            // that was NOT created by deep-link hydration must survive untouched.
            const route = {
                key: 'k-1',
                name: 'CustomScreen',
                params: {
                    path: 'user/data', // user data, not a deep-link path hint
                    initial: true, // user data, not RN's initial flag
                    customKey: 'preserve-me',
                },
            };

            const result = withSanitizedDeepLinkParams(route, undefined);

            expect(result.params).toEqual(route.params);
            expect('params' in result).toBe(true);
        });

        it('PRESERVES `params` containing the legitimate user key `pop` when no `screen` is set', () => {
            // Specific regression: the prior `STALE_DEEP_LINK_PARAM_KEYS` included `'pop'`,
            // which is too generic - some screens may use `pop` as a real param name. The
            // shape-detection (gated on `screen`) means `pop` is now safely preserved here.
            const route = {
                key: 'k-1',
                name: 'AnimatedScreen',
                params: {pop: true, foo: 1},
            };

            const result = withSanitizedDeepLinkParams(route, undefined);

            expect(result.params).toEqual({pop: true, foo: 1});
        });
    });

    describe('focus-supplied params take precedence', () => {
        it('writes `focusParams` even when no deep-link chain is present on the route', () => {
            const route = {
                key: 'k-1',
                name: 'CustomScreen',
                params: {existing: 'value'},
            };

            const result = withSanitizedDeepLinkParams(route, {newKey: 'newValue'});

            expect(result.params).toEqual({newKey: 'newValue'});
        });

        it('writes `focusParams` and ignores the existing chain when both are present', () => {
            const route = {
                key: 'k-1',
                name: 'CustomScreen',
                params: {screen: 'X', initial: false, custom: 'preserve'},
            };

            const result = withSanitizedDeepLinkParams(route, {policyID: 'p1'});

            expect(result.params).toEqual({policyID: 'p1'});
        });
    });

    describe('identity-preservation when no rewrite is required', () => {
        it('does not introduce a `params` property when both `r.params` and `focusParams` are absent', () => {
            const route: {key: string; name: string; params?: Record<string, unknown>} = {key: 'k-1', name: 'CustomScreen'};

            const result = withSanitizedDeepLinkParams(route, undefined);

            expect('params' in result).toBe(false);
            expect(result.params).toBeUndefined();
        });

        it('does not introduce a `params: undefined` shape when chain is present but missing the `screen` trigger', () => {
            // Edge: `path` and `initial` set without `screen` is NOT a deep-link hint per RN,
            // so no stripping happens; existing params survive verbatim.
            const route = {
                key: 'k-1',
                name: 'CustomScreen',
                params: {path: '/foo', initial: true},
            };

            const result = withSanitizedDeepLinkParams(route, undefined);

            expect(result.params).toEqual({path: '/foo', initial: true});
            expect('params' in result).toBe(true);
        });
    });
});
