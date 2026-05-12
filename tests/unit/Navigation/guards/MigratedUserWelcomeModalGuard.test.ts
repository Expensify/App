import type {NavigationAction, NavigationState} from '@react-navigation/native';
import Onyx from 'react-native-onyx';
import MigratedUserWelcomeModalGuard, {onSessionOrLoadingAppChanged, resetSessionFlag} from '@libs/Navigation/guards/MigratedUserWelcomeModalGuard';
import type {GuardContext} from '@libs/Navigation/guards/types';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import waitForBatchedUpdates from '../../../utils/waitForBatchedUpdates';

const mockNavigate = jest.fn();
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: (...args: unknown[]) => {
        mockNavigate(...args);
    },
}));

describe('MigratedUserWelcomeModalGuard', () => {
    const mockState: NavigationState = {
        key: 'root',
        index: 0,
        routeNames: [SCREENS.HOME],
        routes: [{key: 'home', name: SCREENS.HOME}],
        stale: false,
        type: 'root',
    };

    const mockAction: NavigationAction = {
        type: 'NAVIGATE',
        payload: {name: SCREENS.HOME},
    };

    const defaultContext: GuardContext = {
        isAuthenticated: true,
        isLoading: false,
        currentUrl: '',
    };

    beforeEach(async () => {
        // Reset module-level session/loading state first so stale values from
        // previous tests don't trigger navigation during Onyx.clear() callbacks
        onSessionOrLoadingAppChanged(undefined, true);
        resetSessionFlag();
        mockNavigate.mockClear();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('should allow when app is loading', () => {
        const result = MigratedUserWelcomeModalGuard.evaluate(mockState, mockAction, {...defaultContext, isLoading: true});
        expect(result.type).toBe('ALLOW');
    });

    it('should allow when user has not been added to nudge migration', async () => {
        await Onyx.merge(ONYXKEYS.NVP_TRY_NEW_DOT, {
            nudgeMigration: null,
        });
        await waitForBatchedUpdates();

        const result = MigratedUserWelcomeModalGuard.evaluate(mockState, mockAction, defaultContext);
        expect(result.type).toBe('ALLOW');
    });

    it('should redirect when user has been added to nudge migration and modal not dismissed', async () => {
        await Onyx.merge(ONYXKEYS.NVP_TRY_NEW_DOT, {
            nudgeMigration: {
                timestamp: new Date(),
                cohort: 'test',
            },
        });
        await waitForBatchedUpdates();

        const result = MigratedUserWelcomeModalGuard.evaluate(mockState, mockAction, defaultContext);
        expect(result.type).toBe('REDIRECT');
        if (result.type === 'REDIRECT') {
            expect(result.route).toBe(ROUTES.MIGRATED_USER_WELCOME_MODAL.getRoute());
        }
    });

    it('should allow when modal has been dismissed', async () => {
        await Onyx.merge(ONYXKEYS.NVP_TRY_NEW_DOT, {
            nudgeMigration: {
                timestamp: new Date(),
                cohort: 'test',
            },
        });
        await Onyx.merge(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {
            migratedUserWelcomeModal: {
                timestamp: new Date().toISOString(),
                dismissedMethod: 'click',
            },
        });
        await waitForBatchedUpdates();

        const result = MigratedUserWelcomeModalGuard.evaluate(mockState, mockAction, defaultContext);
        expect(result.type).toBe('ALLOW');
    });

    it('should not redirect multiple times in the same session', async () => {
        await Onyx.merge(ONYXKEYS.NVP_TRY_NEW_DOT, {
            nudgeMigration: {
                timestamp: new Date(),
                cohort: 'test',
            },
        });
        await waitForBatchedUpdates();

        const firstResult = MigratedUserWelcomeModalGuard.evaluate(mockState, mockAction, defaultContext);
        expect(firstResult.type).toBe('REDIRECT');

        const secondResult = MigratedUserWelcomeModalGuard.evaluate(mockState, mockAction, defaultContext);
        expect(secondResult.type).toBe('ALLOW');
    });

    it('should allow when already on the migrated user welcome modal screen', async () => {
        await Onyx.merge(ONYXKEYS.NVP_TRY_NEW_DOT, {
            nudgeMigration: {
                timestamp: new Date(),
                cohort: 'test',
            },
        });
        await waitForBatchedUpdates();

        const modalState: NavigationState = {
            key: 'root',
            index: 0,
            routeNames: [SCREENS.MIGRATED_USER_WELCOME_MODAL.ROOT],
            routes: [
                {
                    key: 'migratedUserModal',
                    name: SCREENS.MIGRATED_USER_WELCOME_MODAL.ROOT,
                },
            ],
            stale: false,
            type: 'root',
        };

        const result = MigratedUserWelcomeModalGuard.evaluate(modalState, mockAction, defaultContext);
        expect(result.type).toBe('ALLOW');
    });

    it('should allow when RESET action targets the migrated user welcome modal screen', async () => {
        await Onyx.merge(ONYXKEYS.NVP_TRY_NEW_DOT, {
            nudgeMigration: {
                timestamp: new Date(),
                cohort: 'test',
            },
        });
        await waitForBatchedUpdates();

        const resetAction: NavigationAction = {
            type: 'RESET',
            payload: {
                key: 'root',
                index: 0,
                routeNames: [SCREENS.MIGRATED_USER_WELCOME_MODAL.ROOT],
                routes: [
                    {
                        key: 'migratedUserModal',
                        name: SCREENS.MIGRATED_USER_WELCOME_MODAL.ROOT,
                    },
                ],
                stale: false,
                type: 'root',
            },
        };

        const result = MigratedUserWelcomeModalGuard.evaluate(mockState, resetAction, defaultContext);
        expect(result.type).toBe('ALLOW');
    });

    it('should reset session flag when modal is dismissed via Onyx', async () => {
        await Onyx.merge(ONYXKEYS.NVP_TRY_NEW_DOT, {
            nudgeMigration: {
                timestamp: new Date(),
                cohort: 'test',
            },
        });
        await waitForBatchedUpdates();

        // Trigger redirect to set session flag
        const firstResult = MigratedUserWelcomeModalGuard.evaluate(mockState, mockAction, defaultContext);
        expect(firstResult.type).toBe('REDIRECT');

        // Second call should ALLOW due to session flag
        const secondResult = MigratedUserWelcomeModalGuard.evaluate(mockState, mockAction, defaultContext);
        expect(secondResult.type).toBe('ALLOW');

        // Dismiss the modal via Onyx — this resets the session flag
        await Onyx.merge(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {
            migratedUserWelcomeModal: {
                timestamp: new Date().toISOString(),
                dismissedMethod: 'click',
            },
        });
        await waitForBatchedUpdates();

        // Now it should ALLOW because modal is dismissed (not redirect again)
        const thirdResult = MigratedUserWelcomeModalGuard.evaluate(mockState, mockAction, defaultContext);
        expect(thirdResult.type).toBe('ALLOW');
    });

    describe('shouldBlockWhileModalActive', () => {
        const stateWithModalOnTop: NavigationState = {
            key: 'root',
            index: 1,
            routeNames: [SCREENS.HOME, NAVIGATORS.MIGRATED_USER_MODAL_NAVIGATOR],
            routes: [
                {key: 'home', name: SCREENS.HOME},
                {
                    key: 'migratedUserModal',
                    name: NAVIGATORS.MIGRATED_USER_MODAL_NAVIGATOR,
                },
            ],
            stale: false,
            type: 'stack',
        };

        const tabSwitchAction: NavigationAction = {
            type: CONST.NAVIGATION.ACTION_TYPE.PUSH,
            payload: {name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR},
        };

        const dismissModalAction: NavigationAction = {
            type: CONST.NAVIGATION.ACTION_TYPE.DISMISS_MODAL,
        };

        const goBackAction: NavigationAction = {
            type: CONST.NAVIGATION.ACTION_TYPE.GO_BACK,
        };

        it('should block tab switches when the migrated user modal is on top', async () => {
            await Onyx.merge(ONYXKEYS.NVP_TRY_NEW_DOT, {
                nudgeMigration: {
                    timestamp: new Date(),
                    cohort: 'test',
                },
            });
            await waitForBatchedUpdates();

            // Trigger redirect first to set hasRedirectedToMigratedUserModal
            MigratedUserWelcomeModalGuard.evaluate(mockState, mockAction, defaultContext);

            const result = MigratedUserWelcomeModalGuard.evaluate(stateWithModalOnTop, tabSwitchAction, defaultContext);
            expect(result.type).toBe('BLOCK');
        });

        it('should allow DISMISS_MODAL when the migrated user modal is on top', async () => {
            await Onyx.merge(ONYXKEYS.NVP_TRY_NEW_DOT, {
                nudgeMigration: {
                    timestamp: new Date(),
                    cohort: 'test',
                },
            });
            await waitForBatchedUpdates();

            // Trigger redirect first
            MigratedUserWelcomeModalGuard.evaluate(mockState, mockAction, defaultContext);

            const result = MigratedUserWelcomeModalGuard.evaluate(stateWithModalOnTop, dismissModalAction, defaultContext);
            expect(result.type).not.toBe('BLOCK');
        });

        it('should allow GO_BACK when the migrated user modal is on top', async () => {
            await Onyx.merge(ONYXKEYS.NVP_TRY_NEW_DOT, {
                nudgeMigration: {
                    timestamp: new Date(),
                    cohort: 'test',
                },
            });
            await waitForBatchedUpdates();

            // Trigger redirect first
            MigratedUserWelcomeModalGuard.evaluate(mockState, mockAction, defaultContext);

            const result = MigratedUserWelcomeModalGuard.evaluate(stateWithModalOnTop, goBackAction, defaultContext);
            expect(result.type).not.toBe('BLOCK');
        });

        it('should not block when the modal has been dismissed', async () => {
            await Onyx.merge(ONYXKEYS.NVP_TRY_NEW_DOT, {
                nudgeMigration: {
                    timestamp: new Date(),
                    cohort: 'test',
                },
            });
            await waitForBatchedUpdates();

            // Trigger redirect first
            MigratedUserWelcomeModalGuard.evaluate(mockState, mockAction, defaultContext);

            // Dismiss the modal
            await Onyx.merge(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {
                migratedUserWelcomeModal: {
                    timestamp: new Date().toISOString(),
                    dismissedMethod: 'click',
                },
            });
            await waitForBatchedUpdates();

            const result = MigratedUserWelcomeModalGuard.evaluate(stateWithModalOnTop, tabSwitchAction, defaultContext);
            expect(result.type).not.toBe('BLOCK');
        });

        it('should not block when the modal navigator is NOT the last route', async () => {
            await Onyx.merge(ONYXKEYS.NVP_TRY_NEW_DOT, {
                nudgeMigration: {
                    timestamp: new Date(),
                    cohort: 'test',
                },
            });
            await waitForBatchedUpdates();

            // Trigger redirect first
            MigratedUserWelcomeModalGuard.evaluate(mockState, mockAction, defaultContext);

            // Modal is below other routes (not on top)
            const stateWithModalBelowHome: NavigationState = {
                key: 'root',
                index: 1,
                routeNames: [NAVIGATORS.MIGRATED_USER_MODAL_NAVIGATOR, SCREENS.HOME],
                routes: [
                    {
                        key: 'migratedUserModal',
                        name: NAVIGATORS.MIGRATED_USER_MODAL_NAVIGATOR,
                    },
                    {key: 'home', name: SCREENS.HOME},
                ],
                stale: false,
                type: 'stack',
            };

            const result = MigratedUserWelcomeModalGuard.evaluate(stateWithModalBelowHome, tabSwitchAction, defaultContext);
            expect(result.type).not.toBe('BLOCK');
        });
    });

    describe('onSessionOrLoadingAppChanged (proactive navigation)', () => {
        it('should navigate when all conditions are met (session, not loading, nudge migration, training loaded, not dismissed)', async () => {
            // Set up nudge migration (session is not set yet, so no navigation here)
            await Onyx.merge(ONYXKEYS.NVP_TRY_NEW_DOT, {
                nudgeMigration: {
                    timestamp: new Date(),
                    cohort: 'test',
                },
            });
            await waitForBatchedUpdates();
            mockNavigate.mockClear();

            // Now signal that session is ready and app is done loading
            onSessionOrLoadingAppChanged({authToken: 'test-token', accountID: 123}, false);

            expect(mockNavigate).toHaveBeenCalledWith(ROUTES.MIGRATED_USER_WELCOME_MODAL.getRoute());
        });

        it('should not navigate when app is still loading', async () => {
            await Onyx.merge(ONYXKEYS.NVP_TRY_NEW_DOT, {
                nudgeMigration: {
                    timestamp: new Date(),
                    cohort: 'test',
                },
            });
            await waitForBatchedUpdates();
            mockNavigate.mockClear();

            onSessionOrLoadingAppChanged({authToken: 'test-token', accountID: 123}, true);

            expect(mockNavigate).not.toHaveBeenCalled();
        });

        it('should not navigate when there is no session', async () => {
            await Onyx.merge(ONYXKEYS.NVP_TRY_NEW_DOT, {
                nudgeMigration: {
                    timestamp: new Date(),
                    cohort: 'test',
                },
            });
            await waitForBatchedUpdates();
            mockNavigate.mockClear();

            onSessionOrLoadingAppChanged(undefined, false);

            expect(mockNavigate).not.toHaveBeenCalled();
        });

        it('should not navigate when user has not been added to nudge migration', async () => {
            await Onyx.merge(ONYXKEYS.NVP_TRY_NEW_DOT, {
                nudgeMigration: null,
            });
            await waitForBatchedUpdates();
            mockNavigate.mockClear();

            onSessionOrLoadingAppChanged({authToken: 'test-token', accountID: 123}, false);

            expect(mockNavigate).not.toHaveBeenCalled();
        });

        it('should not navigate when modal was already dismissed', async () => {
            await Onyx.merge(ONYXKEYS.NVP_TRY_NEW_DOT, {
                nudgeMigration: {
                    timestamp: new Date(),
                    cohort: 'test',
                },
            });
            await Onyx.merge(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {
                migratedUserWelcomeModal: {
                    timestamp: new Date().toISOString(),
                    dismissedMethod: 'click',
                },
            });
            await waitForBatchedUpdates();
            mockNavigate.mockClear();

            onSessionOrLoadingAppChanged({authToken: 'test-token', accountID: 123}, false);

            expect(mockNavigate).not.toHaveBeenCalled();
        });

        it('should only navigate once even if called multiple times', async () => {
            await Onyx.merge(ONYXKEYS.NVP_TRY_NEW_DOT, {
                nudgeMigration: {
                    timestamp: new Date(),
                    cohort: 'test',
                },
            });
            await waitForBatchedUpdates();
            mockNavigate.mockClear();

            onSessionOrLoadingAppChanged({authToken: 'test-token', accountID: 123}, false);
            onSessionOrLoadingAppChanged({authToken: 'test-token', accountID: 123}, false);

            expect(mockNavigate).toHaveBeenCalledTimes(1);
        });

        it('should navigate via Onyx NVP_DISMISSED_PRODUCT_TRAINING callback when session is already set', async () => {
            // Set session first
            onSessionOrLoadingAppChanged({authToken: 'test-token', accountID: 123}, false);
            mockNavigate.mockClear();

            // Set up nudge migration and dismissed product training (modal not dismissed)
            await Onyx.merge(ONYXKEYS.NVP_TRY_NEW_DOT, {
                nudgeMigration: {
                    timestamp: new Date(),
                    cohort: 'test',
                },
            });
            await waitForBatchedUpdates();

            // The NVP_TRY_NEW_DOT callback triggers navigateToMigratedUserWelcomeModalIfReady
            // which should navigate because all conditions are met
            expect(mockNavigate).toHaveBeenCalledWith(ROUTES.MIGRATED_USER_WELCOME_MODAL.getRoute());
        });
    });
});
