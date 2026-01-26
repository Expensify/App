import React from 'react';
import BaseVacationDelegateSelectionComponent from '@components/BaseVacationDelegateSelectionComponent';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import ScreenWrapper from '@components/ScreenWrapper';
import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useVacationDelegate from '@hooks/useVacationDelegate';
import Navigation from '@libs/Navigation/Navigation';
import {getLoginByAccountID, getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import DomainNotFoundPageWrapper from '@pages/domain/DomainNotFoundPageWrapper';
import {deleteDomainVacationDelegate, setDomainVacationDelegate} from '@userActions/Domain';
import {clearVacationDelegateError} from '@userActions/VacationDelegate';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Participant} from '@src/types/onyx/IOU';

type DomainMemberVacationDelegatePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.VACATION_DELEGATE>;

function DomainMemberVacationDelegatePage({route}: DomainMemberVacationDelegatePageProps) {
    const {domainAccountID, accountID} = route.params;
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();

    const vacationDelegate = useVacationDelegate(domainAccountID, accountID);
    const onSelectRow = (option: Participant) => {
        const memberLogin = getLoginByAccountID(accountID);
        const delegateLogin = option?.login;

        if (!memberLogin || !delegateLogin) {
            return;
        }
        if (delegateLogin === vacationDelegate?.delegate) {
            deleteDomainVacationDelegate(vacationDelegate, domainAccountID, accountID);
            return;
        }

        setDomainVacationDelegate(domainAccountID, accountID, memberLogin, option.login ?? '', vacationDelegate?.delegate ?? '', false).then(async (response) => {
            if (!response?.jsonCode) {
                Navigation.goBack(ROUTES.DOMAIN_MEMBER_DETAILS.getRoute(domainAccountID, accountID));
                return;
            }

            if (response.jsonCode === CONST.JSON_CODE.POLICY_DIFF_WARNING) {
                const {action} = await showConfirmModal({
                    title: translate('common.headsUp'),
                    prompt: translate('statusPage.vacationDelegateWarning', {
                        nameOrEmail: getPersonalDetailByEmail(delegateLogin)?.displayName ?? delegateLogin,
                    }),
                    confirmText: translate('common.confirm'),
                    cancelText: translate('common.cancel'),
                    danger: true,
                });

                if (action === ModalActions.CONFIRM) {
                    setDomainVacationDelegate(domainAccountID, accountID, memberLogin, delegateLogin, vacationDelegate?.delegate ?? '', true).then(() => {
                        Navigation.goBack(ROUTES.DOMAIN_MEMBER_DETAILS.getRoute(domainAccountID, accountID));
                    });
                } else {
                    clearVacationDelegateError(vacationDelegate?.delegate);
                }
                return;
            }

            Navigation.goBack(ROUTES.DOMAIN_MEMBER_DETAILS.getRoute(domainAccountID, accountID));
        });
    };

    return (
        <DomainNotFoundPageWrapper domainAccountID={domainAccountID}>
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                testID={DomainMemberVacationDelegatePage.displayName}
            >
                <BaseVacationDelegateSelectionComponent
                    currentVacationDelegate={vacationDelegate?.delegate}
                    onSelectRow={onSelectRow}
                    headerTitle={translate('domain.members.vacationDelegate')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.DOMAIN_MEMBER_DETAILS.getRoute(domainAccountID, accountID))}
                />
            </ScreenWrapper>
        </DomainNotFoundPageWrapper>
    );
}

DomainMemberVacationDelegatePage.displayName = 'DomainMemberVacationDelegate';

export default DomainMemberVacationDelegatePage;
