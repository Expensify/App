/**
 * Resolves Enable Global Reimbursements routes for the static settings/wallet flow and the dynamic report/search flow.
 */
import useRootNavigationState from '@hooks/useRootNavigationState';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import isDynamicRouteScreen from '@libs/Navigation/helpers/dynamicRoutesUtils/isDynamicRouteScreen';
import {getDynamicBasePathFromNavigationPath} from '@libs/Navigation/helpers/enableGlobalReimbursementsNavigationUtils';
import getPathFromState from '@libs/Navigation/helpers/getPathFromState';
import type {State} from '@libs/Navigation/types';

import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {Screen} from '@src/SCREENS';

import {useRoute} from '@react-navigation/native';
import {useEffect, useMemo, useState} from 'react';

type EnableGlobalReimbursementsRouteParams = {
    bankCountry?: string;
    bankCurrency?: string;
};

function useEnableGlobalReimbursementsNavigation() {
    const route = useRoute();
    const isDynamic = isDynamicRouteScreen(route.name as Screen);
    const navigationPath = useRootNavigationState((state) => (state ? getPathFromState(state as State) : undefined));
    const resolvedBasePath = useMemo(() => getDynamicBasePathFromNavigationPath(navigationPath), [navigationPath]);
    const [stableBasePath, setStableBasePath] = useState<Route | null>(null);

    useEffect(() => {
        if (isDynamic && resolvedBasePath && !resolvedBasePath.includes('enable-global-reimbursements')) {
            setStableBasePath((current) => current ?? resolvedBasePath);
        }
    }, [isDynamic, resolvedBasePath]);

    const dynamicBasePath = stableBasePath ?? resolvedBasePath;

    return useMemo(() => {
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

        const getSignRoute = (bankAccountID: number | string): Route => {
            if (isDynamic) {
                return createDynamicRoute(DYNAMIC_ROUTES.ENABLE_GLOBAL_REIMBURSEMENTS_SIGN.getRoute(String(bankAccountID)), dynamicBasePath);
            }
            return ROUTES.SETTINGS_WALLET_ENABLE_GLOBAL_REIMBURSEMENTS_SIGN.getRoute(Number(bankAccountID));
        };

        const getRootBackPath = (): Route => {
            if (isDynamic) {
                return dynamicBasePath;
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
    }, [dynamicBasePath, isDynamic]);
}

export default useEnableGlobalReimbursementsNavigation;
