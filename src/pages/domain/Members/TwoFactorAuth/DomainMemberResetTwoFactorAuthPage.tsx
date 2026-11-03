import {usePersonalDetail} from '@hooks/usePersonalDetails';

import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';

import BaseDomainRequireTwoFactorAuthPage from '@pages/domain/BaseDomainRequireTwoFactorAuthPage';

import {resetDomainMemberTwoFactorAuth} from '@userActions/Domain';

import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

type DomainMemberTwoFactorAuthPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.MEMBER_RESET_TWO_FACTOR_AUTH>;

function DomainMemberResetTwoFactorAuthPage({route}: DomainMemberTwoFactorAuthPageProps) {
    const {domainAccountID, accountID} = route.params;

    const [personalDetails] = usePersonalDetail(accountID);

    return (
        <BaseDomainRequireTwoFactorAuthPage
            domainAccountID={domainAccountID}
            onSubmit={(code: string) => {
                if (!personalDetails?.login) {
                    return;
                }

                resetDomainMemberTwoFactorAuth(domainAccountID, accountID, personalDetails.login, code);
                Navigation.dismissModal();
            }}
            onBackButtonPress={() => {
                Navigation.goBack(ROUTES.DOMAIN_MEMBER_DETAILS.getRoute(domainAccountID, accountID));
            }}
        />
    );
}

export default DomainMemberResetTwoFactorAuthPage;
