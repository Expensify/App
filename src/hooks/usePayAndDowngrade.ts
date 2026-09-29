import {close} from '@libs/actions/Modal';
import Navigation from '@libs/Navigation/Navigation';

import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import {useCallback, useEffect, useLayoutEffect, useRef} from 'react';

import useOnyx from './useOnyx';
import useScreenBoundDynamicRoute from './useScreenBoundDynamicRoute';

function usePayAndDowngrade(continueAction: () => void) {
    const [isLoadingBill] = useOnyx(ONYXKEYS.IS_LOADING_BILL_WHEN_DOWNGRADE);
    const buildDynamicRoute = useScreenBoundDynamicRoute();
    const [shouldBillWhenDowngrading] = useOnyx(ONYXKEYS.SHOULD_BILL_WHEN_DOWNGRADING);
    const isDeletingPaidWorkspaceRef = useRef(false);

    const setIsDeletingPaidWorkspace = useCallback((value: boolean) => {
        isDeletingPaidWorkspaceRef.current = value;
    }, []);

    // Store continueAction in a ref to avoid stale closures in the useEffect below.
    // This ensures we always call the latest version of continueAction when the effect runs,
    // without needing to include it in the dependency array (which would cause unnecessary re-runs
    // or require callers to memoize their callback).
    const continueActionRef = useRef(continueAction);
    useLayoutEffect(() => {
        continueActionRef.current = continueAction;
    });

    useEffect(() => {
        if (!isDeletingPaidWorkspaceRef.current || isLoadingBill) {
            return;
        }

        if (!shouldBillWhenDowngrading) {
            close(continueActionRef.current);
        } else {
            Navigation.navigate(buildDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_PAY_AND_DOWNGRADE.path));
        }

        isDeletingPaidWorkspaceRef.current = false;
    }, [isLoadingBill, shouldBillWhenDowngrading, buildDynamicRoute]);

    return {setIsDeletingPaidWorkspace, isLoadingBill};
}

export default usePayAndDowngrade;
