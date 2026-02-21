import {vacationDelegateSelector} from '@selectors/Domain';
import {personalDetailsSelector} from '@selectors/PersonalDetails';
import React from 'react';
import BaseVacationDelegateSelectionComponent from '@components/BaseVacationDelegateSelectionComponent';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import DomainNotFoundPageWrapper from '@pages/domain/DomainNotFoundPageWrapper';
import {deleteDomainVacationDelegate, setDomainVacationDelegate} from '@userActions/Domain';
import {getCurrentUserEmail} from '@userActions/IOU';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Participant} from '@src/types/onyx/IOU';

type DomainMemberVacationDelegatePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.VACATION_DELEGATE>;

function DomainMemberVacationDelegatePage({route}: DomainMemberVacationDelegatePageProps) {
    const {domainAccountID, accountID} = route.params;
    const {translate} = useLocalize();

    const currentUserEmail = getCurrentUserEmail();

    const [vacationDelegate] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        canBeMissing: true,
        selector: vacationDelegateSelector(accountID),
    });

    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        canBeMissing: true,
        selector: personalDetailsSelector(accountID),
    });
    const memberLogin = personalDetails?.login;

    const onSelectRow = (option: Participant) => {
        const delegateLogin = option?.login;

        if (!memberLogin || !delegateLogin) {
            return;
        }

        if (delegateLogin === vacationDelegate?.delegate) {
            deleteDomainVacationDelegate(domainAccountID, accountID, memberLogin, vacationDelegate);
            Navigation.goBack(ROUTES.DOMAIN_MEMBER_DETAILS.getRoute(domainAccountID, accountID));
            return;
        }

        setDomainVacationDelegate(domainAccountID, accountID, currentUserEmail, memberLogin, delegateLogin, vacationDelegate);
        Navigation.goBack(ROUTES.DOMAIN_MEMBER_DETAILS.getRoute(domainAccountID, accountID));
    };

    return (
        <DomainNotFoundPageWrapper domainAccountID={domainAccountID}>
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                testID="DomainMemberVacationDelegate"
            >
                <BaseVacationDelegateSelectionComponent
                    vacationDelegate={vacationDelegate}
                    headerTitle={translate('common.vacationDelegate')}
                    onSelectRow={onSelectRow}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.DOMAIN_MEMBER_DETAILS.getRoute(domainAccountID, accountID))}
                    cannotSetDelegateMessage={translate('domain.members.cannotSetVacationDelegateForMember', memberLogin ?? '')}
                    additionalExcludeLogins={memberLogin ? {[memberLogin]: true} : undefined}
                />
            </ScreenWrapper>
        </DomainNotFoundPageWrapper>
    );
}

export default DomainMemberVacationDelegatePage;
