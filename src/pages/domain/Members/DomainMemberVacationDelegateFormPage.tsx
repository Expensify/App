import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import VacationDelegateForm from '@components/VacationDelegateForm';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {usePersonalDetail} from '@hooks/usePersonalDetails';

import {clearDraftValues} from '@libs/actions/FormActions';
import Navigation from '@libs/Navigation/Navigation';

import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';

import DomainNotFoundPageWrapper from '@pages/domain/DomainNotFoundPageWrapper';

import {deleteDomainVacationDelegate, setDomainVacationDelegate} from '@userActions/Domain';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import {vacationDelegateSelector} from '@selectors/Domain';
import React from 'react';

type DomainMemberVacationDelegateFormPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.VACATION_DELEGATE>;

function DomainMemberVacationDelegateFormPage({route}: DomainMemberVacationDelegateFormPageProps) {
    const {domainAccountID, accountID} = route.params;
    const {translate} = useLocalize();

    const {login: currentUserLogin} = useCurrentUserPersonalDetails();

    const [vacationDelegate] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        selector: vacationDelegateSelector(accountID),
    });

    const [personalDetails] = usePersonalDetail(accountID);
    const memberLogin = personalDetails?.login;

    const goBackToMemberDetails = () => {
        clearDraftValues(ONYXKEYS.FORMS.VACATION_DELEGATE_FORM);
        Navigation.goBack(ROUTES.DOMAIN_MEMBER_DETAILS.getRoute(domainAccountID, accountID));
    };

    // Pops only this form, so a member picker opened straight from the member details page is shown again.
    const goBack = () => {
        clearDraftValues(ONYXKEYS.FORMS.VACATION_DELEGATE_FORM);
        Navigation.goBack();
    };

    const onSubmit = (delegate: string, clearAfter: string | undefined) => {
        if (!memberLogin) {
            return;
        }

        setDomainVacationDelegate(domainAccountID, accountID, currentUserLogin ?? '', memberLogin, delegate, vacationDelegate, clearAfter);
        goBackToMemberDetails();
    };

    const onRemove = () => {
        if (!memberLogin || !vacationDelegate) {
            return;
        }

        deleteDomainVacationDelegate(domainAccountID, accountID, memberLogin, vacationDelegate);
        goBackToMemberDetails();
    };

    return (
        <DomainNotFoundPageWrapper domainAccountID={domainAccountID}>
            <ScreenWrapper
                includeSafeAreaPaddingBottom
                testID="DomainMemberVacationDelegateFormPage"
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('common.vacationDelegate')}
                    onBackButtonPress={goBack}
                />
                <VacationDelegateForm
                    vacationDelegate={vacationDelegate}
                    onChangeDelegate={() => Navigation.navigate(ROUTES.DOMAIN_VACATION_DELEGATE_SELECT.getRoute(domainAccountID, accountID))}
                    onSubmit={onSubmit}
                    onRemove={onRemove}
                />
            </ScreenWrapper>
        </DomainNotFoundPageWrapper>
    );
}

export default DomainMemberVacationDelegateFormPage;
