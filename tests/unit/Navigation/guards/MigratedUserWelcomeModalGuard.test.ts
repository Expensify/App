import type {NavigationAction, NavigationState} from '@react-navigation/native';
import Onyx from 'react-native-onyx';
import MigratedUserWelcomeModalGuard, {resetSessionFlag} from '@libs/Navigation/guards/MigratedUserWelcomeModalGuard';
import type {GuardContext} from '@libs/Navigation/guards/types';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import waitForBatchedUpdates from '../../../utils/waitForBatchedUpdates';

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
        await Onyx.clear();
        resetSessionFlag();
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
            expect(result.route).toBe(ROUTES.MIGRATED_USER_WELCOME_MODAL.getRoute(ROUTES.SEARCH_ROOT.route));
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
});
