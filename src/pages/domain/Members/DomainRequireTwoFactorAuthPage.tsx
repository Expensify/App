import {domainMemberSettingsSelector, domainNameSelector} from '@selectors/Domain';
import React, {useEffect} from 'react';
import useOnyx from '@hooks/useOnyx';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import BaseDomainRequireTwoFactorAuthPage from '@pages/domain/BaseDomainRequireTwoFactorAuthPage';
import {toggleTwoFactorAuthRequiredForDomain} from '@userActions/Domain';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type DomainRequireTwoFactorAuthPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.MEMBERS_SETTINGS_TWO_FACTOR_AUTH>;

function DomainRequireTwoFactorAuthPage({route}: DomainRequireTwoFactorAuthPageProps) {
    const {domainAccountID} = route.params;

    const [domainName] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {selector: domainNameSelector});
    const [domainSettings] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainAccountID}`, {
        selector: domainMemberSettingsSelector,
    });
    const [domainPendingActions] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`);

    useEffect(() => {
        if (domainSettings?.twoFactorAuthRequired) {
            return;
        }
        Navigation.goBack(ROUTES.DOMAIN_MEMBERS_SETTINGS.getRoute(domainAccountID));
    }, [domainAccountID, domainSettings?.twoFactorAuthRequired]);

    return (
        <BaseDomainRequireTwoFactorAuthPage
            domainAccountID={domainAccountID}
            onSubmit={(code: string) => {
                if (!domainName) {
                    return;
                }

                toggleTwoFactorAuthRequiredForDomain(domainAccountID, domainName, false, code);
            }}
            onBackButtonPress={() => {
                Navigation.goBack(ROUTES.DOMAIN_MEMBERS_SETTINGS.getRoute(domainAccountID));
            }}
            pendingAction={domainPendingActions?.twoFactorAuthRequired}
        />
    );
}

DomainRequireTwoFactorAuthPage.displayName = 'DomainRequireTwoFactorAuthPage';

export default DomainRequireTwoFactorAuthPage;
