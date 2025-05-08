import {useEffect, useRef} from 'react';
import {useOnyx} from 'react-native-onyx';
import {close} from '@libs/actions/Modal';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function usePayAndDowngrade(setIsDeleteModalOpen: (value: boolean) => void) {
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
            close(() => setIsDeleteModalOpen(true));
        } else {
            Navigation.navigate(ROUTES.WORKSPACE_PAY_AND_DOWNGRADE.getRoute(Navigation.getActiveRoute()));
        }

        isDeletingPaidWorkspaceRef.current = false;
    }, [isLoadingBill, shouldBillWhenDowngrading, setIsDeleteModalOpen]);

    return {setIsDeletingPaidWorkspace, isLoadingBill};
}

export default usePayAndDowngrade;
