/**
 * Resolves Enable Global Reimbursements routes for the static settings/wallet flow and the dynamic report/search flow.
 */

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import isDynamicRouteScreen from '@libs/Navigation/helpers/dynamicRoutesUtils/isDynamicRouteScreen';
import type {EnableGlobalReimbursementsRouteParams} from '@libs/Navigation/helpers/enableGlobalReimbursementsNavigationUtils';
import {
    getDynamicBasePathFromNavigationPath,
    getEnableGlobalReimbursementsRootBackPath,
    shouldUseDynamicEnableGlobalReimbursementsBase,
} from '@libs/Navigation/helpers/enableGlobalReimbursementsNavigationUtils';
import getPathFromState from '@libs/Navigation/helpers/getPathFromState';
import type {State} from '@libs/Navigation/types';

import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {Screen} from '@src/SCREENS';

import {useRoute} from '@react-navigation/native';

import useRootNavigationState from './useRootNavigationState';

function useEnableGlobalReimbursementsNavigation() {
    const route = useRoute();
    const isDynamic = isDynamicRouteScreen(route.name as Screen); // eslint-disable-line @typescript-eslint/no-unsafe-type-assertion -- route.name is string at runtime
    const navigationPath = useRootNavigationState((state) => (isDynamic && state ? getPathFromState(state as State) : undefined));
    const dynamicBasePath = isDynamic ? getDynamicBasePathFromNavigationPath(navigationPath) : '';

    const getBusinessRoute = (bankAccountID: number | string, subPage: string, action?: 'edit', params?: EnableGlobalReimbursementsRouteParams): Route => {
        if (isDynamic) {
            return createDynamicRoute(DYNAMIC_ROUTES.ENABLE_GLOBAL_REIMBURSEMENTS_BUSINESS.getRoute(String(bankAccountID), subPage, action, params), dynamicBasePath);
        }
        return ROUTES.SETTINGS_WALLET_ENABLE_GLOBAL_REIMBURSEMENTS_BUSINESS.getRoute(Number(bankAccountID), subPage, action, params);
    };

    const getAgreementsRoute = (bankAccountID: number | string, params?: EnableGlobalReimbursementsRouteParams): Route => {
        if (isDynamic) {
            return createDynamicRoute(DYNAMIC_ROUTES.ENABLE_GLOBAL_REIMBURSEMENTS_AGREEMENTS.getRoute(String(bankAccountID), params), dynamicBasePath);
        }
        return ROUTES.SETTINGS_WALLET_ENABLE_GLOBAL_REIMBURSEMENTS_AGREEMENTS.getRoute(Number(bankAccountID), params);
    };

    const getSignRoute = (bankAccountID: number | string, params?: EnableGlobalReimbursementsRouteParams): Route => {
        if (isDynamic) {
            return createDynamicRoute(DYNAMIC_ROUTES.ENABLE_GLOBAL_REIMBURSEMENTS_SIGN.getRoute(String(bankAccountID), params), dynamicBasePath);
        }
        return ROUTES.SETTINGS_WALLET_ENABLE_GLOBAL_REIMBURSEMENTS_SIGN.getRoute(Number(bankAccountID), params);
    };

    const getRootBackPath = (): Route => {
        if (isDynamic && shouldUseDynamicEnableGlobalReimbursementsBase(dynamicBasePath)) {
            return getEnableGlobalReimbursementsRootBackPath(dynamicBasePath);
        }
        return ROUTES.SETTINGS_WALLET;
    };

    return {
        isDynamic,
        getBusinessRoute,
        getAgreementsRoute,
        getSignRoute,
        getRootBackPath,
    };
}

export default useEnableGlobalReimbursementsNavigation;
