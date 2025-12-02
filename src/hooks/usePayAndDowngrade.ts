import {useEffect, useRef} from 'react';
import {close} from '@libs/actions/Modal';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import useOnyx from './useOnyx';

function usePayAndDowngrade(continueAction: () => void) {
    const [isLoadingBill] = useOnyx(ONYXKEYS.IS_LOADING_BILL_WHEN_DOWNGRADE, {canBeMissing: true});
    const [shouldBillWhenDowngrading] = useOnyx(ONYXKEYS.SHOULD_BILL_WHEN_DOWNGRADING, {canBeMissing: true});
    const isDeletingPaidWorkspaceRef = useRef(false);

    const setIsDeletingPaidWorkspace = (value: boolean) => {
        isDeletingPaidWorkspaceRef.current = value;
    };

    useEffect(() => {
        if (!isDeletingPaidWorkspaceRef.current || isLoadingBill) {
            return;
        }

        if (!shouldBillWhenDowngrading) {
            close(continueAction);
        } else {
            Navigation.navigate(ROUTES.WORKSPACE_PAY_AND_DOWNGRADE.getRoute(Navigation.getActiveRoute()));
        }

        isDeletingPaidWorkspaceRef.current = false;
    }, [isLoadingBill, shouldBillWhenDowngrading, continueAction]);

    return {setIsDeletingPaidWorkspace, isLoadingBill};
}

export default usePayAndDowngrade;
