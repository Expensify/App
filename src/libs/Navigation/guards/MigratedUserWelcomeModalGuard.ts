import type {NavigationAction, NavigationState} from '@react-navigation/native';
import {findFocusedRoute} from '@react-navigation/native';
import {tryNewDotOnyxSelector} from '@selectors/Onboarding';
import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import Log from '@libs/Log';
import isProductTrainingElementDismissed from '@libs/TooltipUtils';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {DismissedProductTraining} from '@src/types/onyx';
import type {GuardResult, NavigationGuard} from './types';

let hasBeenAddedToNudgeMigration = false;
let dismissedProductTraining: OnyxEntry<DismissedProductTraining>;

let hasRedirectedToMigratedUserModal = false;

function resetSessionFlag() {
    hasRedirectedToMigratedUserModal = false;
}

Onyx.connectWithoutView({
    key: ONYXKEYS.NVP_TRY_NEW_DOT,
    callback: (value) => {
        const result = value ? tryNewDotOnyxSelector(value) : undefined;
        hasBeenAddedToNudgeMigration = result?.hasBeenAddedToNudgeMigration ?? false;
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING,
    callback: (value) => {
        dismissedProductTraining = value;
        if (isProductTrainingElementDismissed('migratedUserWelcomeModal', value)) {
            hasRedirectedToMigratedUserModal = false;
        }
    },
});

/**
 * Block navigation while the migrated user modal is active (on top of the stack).
 * Prevents tab switches from pushing screens before the modal overlay becomes visible,
 * which would cause DISMISS_MODAL to fail.
 */
function shouldBlockWhileModalActive(state: NavigationState, action: NavigationAction): boolean {
    const isAllowedAction = action.type === CONST.NAVIGATION.ACTION_TYPE.DISMISS_MODAL || action.type === CONST.NAVIGATION.ACTION_TYPE.GO_BACK;
    return (
        hasRedirectedToMigratedUserModal &&
        !isProductTrainingElementDismissed('migratedUserWelcomeModal', dismissedProductTraining) &&
        state.routes.at(-1)?.name === NAVIGATORS.MIGRATED_USER_MODAL_NAVIGATOR &&
        !isAllowedAction
    );
}

/** Prevents redirect loops by detecting when we're already on or resetting to the modal. */
function isNavigatingToMigratedUserModal(state: NavigationState, action: NavigationAction): boolean {
    const isOnModal = findFocusedRoute(state)?.name === SCREENS.MIGRATED_USER_WELCOME_MODAL.ROOT;
    const isResettingToModal = action.type === 'RESET' && !!action.payload && findFocusedRoute(action.payload as NavigationState)?.name === SCREENS.MIGRATED_USER_WELCOME_MODAL.ROOT;

    return isOnModal || isResettingToModal;
}

/**
 * MigratedUserWelcomeModalGuard handles the migrated user welcome modal flow.
 * This modal appears for users who have been added to nudge migration and haven't dismissed it yet.
 */
const MigratedUserWelcomeModalGuard: NavigationGuard = {
    name: 'MigratedUserWelcomeModalGuard',

    evaluate: (state: NavigationState, action: NavigationAction, context): GuardResult => {
        if (context.isLoading) {
            return {type: 'ALLOW'};
        }

        if (shouldBlockWhileModalActive(state, action)) {
            return {type: 'BLOCK', reason: '[MigratedUserWelcomeModalGuard] Blocking navigation while migrated user modal is active'};
        }

        if (isNavigatingToMigratedUserModal(state, action) || hasRedirectedToMigratedUserModal) {
            return {type: 'ALLOW'};
        }

        if (hasBeenAddedToNudgeMigration && !isProductTrainingElementDismissed('migratedUserWelcomeModal', dismissedProductTraining)) {
            Log.info('[MigratedUserWelcomeModalGuard] Redirecting to migrated user welcome modal');
            hasRedirectedToMigratedUserModal = true;

            return {
                type: 'REDIRECT',
                route: ROUTES.MIGRATED_USER_WELCOME_MODAL.getRoute(ROUTES.SEARCH_ROOT.route),
            };
        }

        return {type: 'ALLOW'};
    },
};

export default MigratedUserWelcomeModalGuard;
export {resetSessionFlag};
