import React, {useCallback, useState} from 'react';
import BaseVacationDelegateSelectionComponent from '@components/BaseVacationDelegateSelectionComponent';
import ConfirmModal from '@components/ConfirmModal';
import ScreenWrapper from '@components/ScreenWrapper';
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
    const [isWarningModalVisible, setIsWarningModalVisible] = useState(false);
    const [newVacationDelegate, setNewVacationDelegate] = useState('');
    const {login: currentUserLogin = ''} = useCurrentUserPersonalDetails();

    const [vacationDelegate] = useOnyx(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE, {canBeMissing: true});

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
                    setIsWarningModalVisible(true);
                    setNewVacationDelegate(option?.login ?? '');
                    return;
                }

                Navigation.goBack(ROUTES.SETTINGS_STATUS);
            });
        },
        [currentUserLogin, vacationDelegate],
    );

    return (
        <>
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
            <ConfirmModal
                isVisible={isWarningModalVisible}
                title={translate('common.headsUp')}
                prompt={translate('statusPage.vacationDelegateWarning', {nameOrEmail: getPersonalDetailByEmail(newVacationDelegate)?.displayName ?? newVacationDelegate})}
                onConfirm={() => {
                    setIsWarningModalVisible(false);
                    setVacationDelegate(currentUserLogin, newVacationDelegate, true, vacationDelegate?.delegate).then(() => Navigation.goBack(ROUTES.SETTINGS_STATUS));
                }}
                onCancel={() => {
                    setIsWarningModalVisible(false);
                    clearVacationDelegateError(vacationDelegate?.previousDelegate);
                }}
                confirmText={translate('common.confirm')}
                cancelText={translate('common.cancel')}
            />
        </>
    );
}

export default VacationDelegatePage;
