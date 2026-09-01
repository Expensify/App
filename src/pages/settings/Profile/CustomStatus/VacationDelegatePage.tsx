import BaseVacationDelegateSelectionComponent from '@components/BaseVacationDelegateSelectionComponent';
import ScreenWrapper from '@components/ScreenWrapper';

import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {clearVacationDelegateError, deleteVacationDelegate, setVacationDelegate} from '@libs/actions/VacationDelegate';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Participant} from '@src/types/onyx/IOU';

import React, {useCallback, useEffect, useRef} from 'react';

function VacationDelegatePage() {
    const {translate} = useLocalize();
    const {login: currentUserLogin = ''} = useCurrentUserPersonalDetails();
    const {showConfirmModal} = useConfirmModal();

    const [vacationDelegate] = useOnyx(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE);
    const vacationDelegateRef = useRef(vacationDelegate);
    useEffect(() => {
        vacationDelegateRef.current = vacationDelegate;
    }, [vacationDelegate]);

    const isSelectingRef = useRef(false);

    const showErrorModal = async (message?: string) => {
        await showConfirmModal({
            title: translate('statusPage.addVacationDelegate'),
            prompt: message ?? translate('statusPage.vacationDelegateError'),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
        });

        clearVacationDelegateError(vacationDelegateRef.current?.previousDelegate);
    };

    const onSelectRow = useCallback(
        (option: Participant) => {
            if (isSelectingRef.current) {
                return;
            }

            if (option?.login === vacationDelegate?.delegate) {
                isSelectingRef.current = true;
                deleteVacationDelegate(vacationDelegate);
                Navigation.goBack(ROUTES.SETTINGS_STATUS);
                return;
            }

            isSelectingRef.current = true;
            setVacationDelegate({creator: currentUserLogin, delegate: option?.login ?? '', currentDelegate: vacationDelegate?.delegate})
                .then((response) => {
                    if (response?.jsonCode === CONST.JSON_CODE.POLICY_DIFF_WARNING) {
                        Navigation.navigate(ROUTES.SETTINGS_VACATION_DELEGATE_MISSING_WORKSPACES);
                        return;
                    }

                    // The request writes no error of its own, so this modal is the only feedback for a failure. Dismissing it restores the previous delegate.
                    if (response?.jsonCode !== CONST.JSON_CODE.SUCCESS) {
                        showErrorModal(response?.jsonCode === CONST.JSON_CODE.EXP_ERROR ? response.message : undefined);
                        return;
                    }

                    Navigation.goBack(ROUTES.SETTINGS_STATUS);
                })
                .finally(() => {
                    isSelectingRef.current = false;
                });
        },
        [currentUserLogin, vacationDelegate, showErrorModal],
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID="VacationDelegatePage"
            shouldShowOfflineIndicator={false}
        >
            <BaseVacationDelegateSelectionComponent
                vacationDelegate={vacationDelegate}
                onSelectRow={onSelectRow}
                headerTitle={translate('common.vacationDelegate')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_STATUS)}
                cannotSetDelegateMessage={translate('statusPage.cannotSetVacationDelegate')}
                includeCurrentUser={false}
            />
        </ScreenWrapper>
    );
}

export default VacationDelegatePage;
