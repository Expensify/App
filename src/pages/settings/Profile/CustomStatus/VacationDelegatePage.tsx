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

import React, {useRef} from 'react';

function VacationDelegatePage() {
    const {translate} = useLocalize();
    const {login: currentUserLogin = ''} = useCurrentUserPersonalDetails();
    const {showConfirmModal} = useConfirmModal();

    const [vacationDelegate] = useOnyx(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE);

    const isSelectingRef = useRef(false);

    const showErrorModal = async (delegateToRestore?: string, message?: string) => {
        await showConfirmModal({
            title: translate('statusPage.addVacationDelegate'),
            prompt: message ?? translate('statusPage.vacationDelegateError'),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
        });

        clearVacationDelegateError(delegateToRestore);
    };

    const onSelectRow = (option: Participant) => {
        if (isSelectingRef.current) {
            return;
        }

        if (option?.login === vacationDelegate?.delegate) {
            isSelectingRef.current = true;
            deleteVacationDelegate(vacationDelegate);
            Navigation.goBack(ROUTES.SETTINGS_STATUS);
            isSelectingRef.current = false;
            return;
        }

        isSelectingRef.current = true;
        const currentDelegate = vacationDelegate?.delegate;
        setVacationDelegate({creator: currentUserLogin, delegate: option?.login ?? '', currentDelegate})
            .then((response) => {
                if (response?.data?.policyDiff) {
                    Navigation.navigate(ROUTES.SETTINGS_VACATION_DELEGATE_MISSING_WORKSPACES);
                    return;
                }

                // The request writes no error of its own, so this modal is the only feedback for a failure. Dismissing it restores the previous delegate.
                if (response?.jsonCode !== CONST.JSON_CODE.SUCCESS) {
                    showErrorModal(currentDelegate, response?.jsonCode === CONST.JSON_CODE.EXP_ERROR ? response.message : undefined);
                    return;
                }

                Navigation.goBack(ROUTES.SETTINGS_STATUS);
            })
            .catch(() => showErrorModal(currentDelegate))
            .finally(() => {
                isSelectingRef.current = false;
            });
    };

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
