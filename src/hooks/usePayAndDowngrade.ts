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

    const continueActionRef = useRef(continueAction);
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
