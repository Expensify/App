import {getPersonalDetail} from '@libs/PersonalDetailsStore';

import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';

import BaseDomainRequireTwoFactorAuthPage from '@pages/domain/BaseDomainRequireTwoFactorAuthPage';

import {resetDomainMemberTwoFactorAuth} from '@userActions/Domain';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

type DomainMemberTwoFactorAuthPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.MEMBER_RESET_TWO_FACTOR_AUTH>;

function DomainMemberResetTwoFactorAuthPage({route}: DomainMemberTwoFactorAuthPageProps) {
    const {domainAccountID, accountID} = route.params;

    return (
        <BaseDomainRequireTwoFactorAuthPage
            sentryLabel={CONST.SENTRY_LABEL.DOMAIN.MEMBERS.RESET_TWO_FACTOR_AUTH_SUBMIT}
            domainAccountID={domainAccountID}
            onSubmit={(code: string) => {
                const login = getPersonalDetail(accountID)?.login;
                if (!login) {
                    return;
                }

                resetDomainMemberTwoFactorAuth(domainAccountID, accountID, login, code);
                Navigation.dismissModal();
            }}
            onBackButtonPress={() => {
                Navigation.goBack(ROUTES.DOMAIN_MEMBER_DETAILS.getRoute(domainAccountID, accountID));
            }}
        />
    );
}

export default DomainMemberResetTwoFactorAuthPage;
