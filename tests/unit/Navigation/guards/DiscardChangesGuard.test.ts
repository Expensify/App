import type {NavigationAction, NavigationState} from '@react-navigation/native';
import DiscardChangesGuard, {registerDiscardChangesScreen} from '@libs/Navigation/guards/DiscardChangesGuard';
import type {GuardContext} from '@libs/Navigation/guards/types';

const context: GuardContext = {
    isAuthenticated: true,
    isLoading: false,
    currentUrl: '',
};

/**
 * Mirrors the app's shape on browser back from the Track Distance tab navigator:
 * root stack > RHP > MoneyRequest > Create > tab navigator (map, odometer).
 */
const makeRootState = (tabIndex: number): NavigationState => ({
    key: 'stack-root',
    index: 1,
    routeNames: ['Home', 'RightModalNavigator'],
    routes: [
        {key: 'home', name: 'Home'},
        {
            key: 'rhp',
            name: 'RightModalNavigator',
            state: {
                index: 0,
                routes: [
                    {
                        key: 'money',
                        name: 'MoneyRequest',
                        state: {
                            index: 0,
                            routes: [
                                {
                                    key: 'create',
                                    name: 'Create',
                                    state: {
                                        index: tabIndex,
                                        routes: [
                                            {key: 'tab-map', name: 'map'},
                                            {key: 'tab-odometer', name: 'odometer'},
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
    ],
    stale: false,
    type: 'stack',
});

const makeResetAction = (payload: NavigationState): NavigationAction => ({type: 'RESET', payload});

/**
 * Variant where the focused tab hosts a nested stack: the registered screen sits INSIDE the tab,
 * so a tab switch unfocuses its ANCESTOR rather than the screen's own route.
 */
const makeNestedTabState = (tabIndex: number, innerIndex = 0): NavigationState => ({
    key: 'stack-root',
    index: 0,
    routeNames: ['RightModalNavigator'],
    routes: [
        {
            key: 'rhp',
            name: 'RightModalNavigator',
            state: {
                index: tabIndex,
                routes: [
                    {
                        key: 'tab-a',
                        name: 'tabA',
                        state: {
                            index: innerIndex,
                            routes: [
                                {key: 'inner-dirty', name: 'innerDirty'},
                                {key: 'inner-top', name: 'innerTop'},
                            ],
                        },
                    },
                    {key: 'tab-b', name: 'tabB'},
                ],
            },
        },
    ],
    stale: false,
    type: 'stack',
});

describe('DiscardChangesGuard', () => {
    const onBlocked = jest.fn();
    let hasUnsavedChanges = true;
    let unregister: (() => void) | undefined;

    const registerOdometerScreen = () => {
        unregister = registerDiscardChangesScreen('tab-odometer', {
            hasUnsavedChanges: () => hasUnsavedChanges,
            onBlocked,
        });
    };

    beforeEach(() => {
        jest.clearAllMocks();
        hasUnsavedChanges = true;
    });

    afterEach(() => {
        unregister?.();
        unregister = undefined;
    });

    it('allows non-RESET actions', () => {
        registerOdometerScreen();

        const result = DiscardChangesGuard.evaluate(makeRootState(1), {type: 'NAVIGATE', payload: {name: 'Home'}}, context);

        expect(result).toEqual({type: 'ALLOW'});
        expect(onBlocked).not.toHaveBeenCalled();
    });

    it('allows a RESET when no screens are registered', () => {
        const result = DiscardChangesGuard.evaluate(makeRootState(1), makeResetAction(makeRootState(0)), context);

        expect(result).toEqual({type: 'ALLOW'});
    });

    it('blocks a RESET that unfocuses a registered dirty screen and skips the browser history sync', () => {
        registerOdometerScreen();

        const action = makeResetAction(makeRootState(0));
        const result = DiscardChangesGuard.evaluate(makeRootState(1), action, context);

        expect(result).toEqual({type: 'BLOCK', reason: 'discard-changes-confirmation', shouldSkipBrowserHistorySync: true});
        expect(onBlocked).toHaveBeenCalledWith(action);
    });

    it('allows a RESET when the registered screen has no unsaved changes', () => {
        registerOdometerScreen();
        hasUnsavedChanges = false;

        const result = DiscardChangesGuard.evaluate(makeRootState(1), makeResetAction(makeRootState(0)), context);

        expect(result).toEqual({type: 'ALLOW'});
        expect(onBlocked).not.toHaveBeenCalled();
    });

    it('allows a RESET that keeps the focus unchanged', () => {
        registerOdometerScreen();

        const result = DiscardChangesGuard.evaluate(makeRootState(1), makeResetAction(makeRootState(1)), context);

        expect(result).toEqual({type: 'ALLOW'});
        expect(onBlocked).not.toHaveBeenCalled();
    });

    it('allows a RESET that removes the focused route instead of unfocusing it', () => {
        registerOdometerScreen();

        // Removals go through `beforeRemove`, not the guard
        const payload = makeRootState(1);
        const tabState = payload.routes.at(1)?.state?.routes.at(0)?.state?.routes.at(0)?.state;
        if (tabState) {
            // @ts-expect-error -- the test mutates its own fixture to drop the odometer tab
            tabState.routes = tabState.routes.slice(0, 1);
            // @ts-expect-error -- same fixture mutation
            tabState.index = 0;
        }
        const result = DiscardChangesGuard.evaluate(makeRootState(1), makeResetAction(payload), context);

        expect(result).toEqual({type: 'ALLOW'});
        expect(onBlocked).not.toHaveBeenCalled();
    });

    it('stops blocking after the screen unregisters', () => {
        registerOdometerScreen();
        unregister?.();
        unregister = undefined;

        const result = DiscardChangesGuard.evaluate(makeRootState(1), makeResetAction(makeRootState(0)), context);

        expect(result).toEqual({type: 'ALLOW'});
        expect(onBlocked).not.toHaveBeenCalled();
    });

    it('blocks a RESET that unfocuses an ancestor of a registered dirty screen', () => {
        unregister = registerDiscardChangesScreen('inner-dirty', {
            hasUnsavedChanges: () => true,
            onBlocked,
        });

        const action = makeResetAction(makeNestedTabState(1));
        const result = DiscardChangesGuard.evaluate(makeNestedTabState(0), action, context);

        expect(result.type).toBe('BLOCK');
        expect(onBlocked).toHaveBeenCalledWith(action);
    });

    it('allows a RESET when the registered screen is hidden behind the focused route of the unfocusing ancestor', () => {
        unregister = registerDiscardChangesScreen('inner-dirty', {
            hasUnsavedChanges: () => true,
            onBlocked,
        });

        // inner-dirty sits beneath inner-top, so the tab switch changes nothing visible for it
        const result = DiscardChangesGuard.evaluate(makeNestedTabState(0, 1), makeResetAction(makeNestedTabState(1, 1)), context);

        expect(result).toEqual({type: 'ALLOW'});
        expect(onBlocked).not.toHaveBeenCalled();
    });

    it('blocks a focus change at the root level too', () => {
        unregister = registerDiscardChangesScreen('rhp', {
            hasUnsavedChanges: () => true,
            onBlocked,
        });

        const payload = {...makeRootState(1), index: 0};
        const result = DiscardChangesGuard.evaluate(makeRootState(1), makeResetAction(payload), context);

        expect(result.type).toBe('BLOCK');
        expect(onBlocked).toHaveBeenCalledTimes(1);
    });
});
