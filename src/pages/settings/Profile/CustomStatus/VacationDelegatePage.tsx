import React, {useCallback} from 'react';
import BaseVacationDelegateSelectionComponent from '@components/BaseVacationDelegateSelectionComponent';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import ScreenWrapper from '@components/ScreenWrapper';
import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {clearVacationDelegateError, deleteVacationDelegate, setVacationDelegate} from '@libs/actions/VacationDelegate';
import Navigation from '@libs/Navigation/Navigation';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Participant} from '@src/types/onyx/IOU';

function VacationDelegatePage() {
    const {translate} = useLocalize();
    const {login: currentUserLogin = ''} = useCurrentUserPersonalDetails();
    const {showConfirmModal} = useConfirmModal();

    const [vacationDelegate] = useOnyx(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE);

    const showWarningModal = useCallback(
        async (delegateLogin: string) => {
            const result = await showConfirmModal({
                title: translate('common.headsUp'),
                prompt: translate('statusPage.vacationDelegateWarning', {nameOrEmail: getPersonalDetailByEmail(delegateLogin)?.displayName ?? delegateLogin}),
                confirmText: translate('common.confirm'),
                cancelText: translate('common.cancel'),
                shouldShowCancelButton: true,
            });

            if (result.action === ModalActions.CONFIRM) {
                await setVacationDelegate(currentUserLogin, delegateLogin, true, vacationDelegate?.delegate);
                Navigation.goBack(ROUTES.SETTINGS_STATUS);
                return;
            }

            clearVacationDelegateError(vacationDelegate?.previousDelegate);
        },
        [showConfirmModal, translate, currentUserLogin, vacationDelegate?.previousDelegate, vacationDelegate?.delegate],
    );

    const onSelectRow = useCallback(
        (option: Participant) => {
            if (option?.login === vacationDelegate?.delegate) {
                deleteVacationDelegate(vacationDelegate);
                Navigation.goBack(ROUTES.SETTINGS_STATUS);
                return;
            }

            setVacationDelegate(currentUserLogin, option?.login ?? '', false, vacationDelegate?.delegate).then((response) => {
                if (!response?.jsonCode) {
                    Navigation.goBack(ROUTES.SETTINGS_STATUS);
                    return;
                }

                if (response.jsonCode === CONST.JSON_CODE.POLICY_DIFF_WARNING) {
                    showWarningModal(option?.login ?? '');
                    return;
                }

                Navigation.goBack(ROUTES.SETTINGS_STATUS);
            });
        },
        [currentUserLogin, vacationDelegate, showWarningModal],
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID="VacationDelegatePage"
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
