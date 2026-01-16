import React, { useState } from 'react';
import BaseVacationDelegateSelectionComponent from '@components/BaseVacationDelegateSelectionComponent';
import ConfirmModal from '@components/ConfirmModal';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useVacationDelegate from '@hooks/useVacationDelegate';
import Navigation from '@libs/Navigation/Navigation';
import { getLoginByAccountID, getPersonalDetailByEmail } from '@libs/PersonalDetailsUtils';
import type { PlatformStackScreenProps } from '@navigation/PlatformStackNavigation/types';
import type { SettingsNavigatorParamList } from '@navigation/types';
import DomainNotFoundPageWrapper from '@pages/domain/DomainNotFoundPageWrapper';
import {deleteDomainVacationDelegate, setDomainVacationDelegate} from '@userActions/Domain';
import { clearVacationDelegateError } from '@userActions/VacationDelegate';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type { Participant } from '@src/types/onyx/IOU';


type DomainMemberVacationDelegatePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.VACATION_DELEGATE>;

function DomainMemberVacationDelegatePage({route}: DomainMemberVacationDelegatePageProps) {
    const {domainAccountID, accountID} = route.params;
    const {translate} = useLocalize();

    const [isWarningModalVisible, setIsWarningModalVisible] = useState(false);
    const [newVacationDelegateLogin, setNewVacationDelegateLogin] = useState('');

    const vacationDelegate = useVacationDelegate(domainAccountID, accountID);
    const onSelectRow = (option: Participant) => {

        const memberLogin = getLoginByAccountID(accountID);
        const delegateLogin = option?.login;

        if (!memberLogin || !delegateLogin) {
            return;
        }
        if (delegateLogin === vacationDelegate?.delegate) {
            deleteDomainVacationDelegate(vacationDelegate,domainAccountID,accountID);
            return;
        }

        setDomainVacationDelegate(domainAccountID, accountID, memberLogin, option.login ?? '',vacationDelegate?.delegate??'', false).then((response) => {
            if (!response?.jsonCode) {
                Navigation.goBack(ROUTES.DOMAIN_MEMBER_DETAILS.getRoute(domainAccountID, accountID));
                return;
            }

            if (response.jsonCode === CONST.JSON_CODE.POLICY_DIFF_WARNING) {
                setIsWarningModalVisible(true);
                setNewVacationDelegateLogin(delegateLogin);
            }

            Navigation.goBack(ROUTES.DOMAIN_MEMBER_DETAILS.getRoute(domainAccountID, accountID));
        });
    };

    const confirmPolicyDiff = () => {
        const memberLogin = getLoginByAccountID(accountID);
        if (!memberLogin) {
            return;
        }

        setIsWarningModalVisible(false);
        setDomainVacationDelegate(domainAccountID, accountID, memberLogin, newVacationDelegateLogin, vacationDelegate?.delegate??'',true).then(() => {
            Navigation.goBack(ROUTES.DOMAIN_MEMBER_DETAILS.getRoute(domainAccountID, accountID));
        });
    }

    return (
        <DomainNotFoundPageWrapper domainAccountID={domainAccountID}>
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                testID={DomainMemberVacationDelegatePage.displayName}
            >
                <BaseVacationDelegateSelectionComponent
                    currentVacationDelegate={vacationDelegate?.delegate}
                    onSelectRow={onSelectRow}
                    headerTitle={translate('domain.common.vacationDelegate')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.DOMAIN_MEMBER_DETAILS.getRoute(domainAccountID, accountID))
                    }
                />
            </ScreenWrapper>
            <ConfirmModal
                isVisible={isWarningModalVisible}
                title={translate('common.headsUp')}
                prompt={translate('statusPage.vacationDelegateWarning', {
                    nameOrEmail: getPersonalDetailByEmail(newVacationDelegateLogin)?.displayName ?? newVacationDelegateLogin,
                })}
                onConfirm={confirmPolicyDiff}
                onCancel={() => {
                    setIsWarningModalVisible(false);
                    clearVacationDelegateError(vacationDelegate?.delegate);
                }}
                confirmText={translate('common.confirm')}
                cancelText={translate('common.cancel')}
                danger
            />
        </DomainNotFoundPageWrapper>
    );
}

DomainMemberVacationDelegatePage.displayName = 'DomainMemberVacationDelegate';

export default DomainMemberVacationDelegatePage;
