import {useCallback, useEffect, useRef} from 'react';
import {close} from '@libs/actions/Modal';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import useOnyx from './useOnyx';

function usePayAndDowngrade(continueAction: () => void) {
    const [isLoadingBill] = useOnyx(ONYXKEYS.IS_LOADING_BILL_WHEN_DOWNGRADE);
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
    // eslint-disable-next-line react-hooks/refs
    continueActionRef.current = continueAction;

    useEffect(() => {
        if (!isDeletingPaidWorkspaceRef.current || isLoadingBill) {
            return;
        }

        if (!shouldBillWhenDowngrading) {
            close(continueActionRef.current);
        } else {
            Navigation.navigate(ROUTES.WORKSPACE_PAY_AND_DOWNGRADE.getRoute(Navigation.getActiveRoute()));
        }

        isDeletingPaidWorkspaceRef.current = false;
    }, [isLoadingBill, shouldBillWhenDowngrading]);

    return {setIsDeletingPaidWorkspace, isLoadingBill};
}

export default usePayAndDowngrade;
