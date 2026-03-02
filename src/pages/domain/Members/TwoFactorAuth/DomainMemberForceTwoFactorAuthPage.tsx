import {domainMemberSettingsSelector} from '@selectors/Domain';
import personalDetailsSelector from '@selectors/PersonalDetails';
import React, {useEffect} from 'react';
import useOnyx from '@hooks/useOnyx';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import BaseDomainRequireTwoFactorAuthPage from '@pages/domain/BaseDomainRequireTwoFactorAuthPage';
import {setTwoFactorAuthExemptEmailForDomain} from '@userActions/Domain';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type DomainMemberForceTwoFactorAuthPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.MEMBER_FORCE_TWO_FACTOR_AUTH>;

function DomainMemberForceTwoFactorAuthPage({route}: DomainMemberForceTwoFactorAuthPageProps) {
    const {domainAccountID, accountID} = route.params;

    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        selector: personalDetailsSelector(accountID),
    });
    const memberLogin = personalDetails?.login ?? '';
    const [domainSettings] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainAccountID}`, {
        selector: domainMemberSettingsSelector,
    });
    const [domainPendingActions] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`);

    useEffect(() => {
        if (!domainSettings?.twoFactorAuthExemptEmails?.includes(memberLogin)) {
            return;
        }
        Navigation.goBack(ROUTES.DOMAIN_MEMBER_DETAILS.getRoute(domainAccountID, accountID));
    }, [accountID, domainAccountID, domainSettings?.twoFactorAuthExemptEmails, memberLogin]);

    return (
        <BaseDomainRequireTwoFactorAuthPage
            domainAccountID={domainAccountID}
            onSubmit={(code: string) => {
                if (!personalDetails?.login) {
                    return;
                }

                setTwoFactorAuthExemptEmailForDomain(domainAccountID, accountID, domainSettings?.twoFactorAuthExemptEmails ?? [], personalDetails.login, false, code);
            }}
            onBackButtonPress={() => {
                Navigation.goBack(ROUTES.DOMAIN_MEMBER_DETAILS.getRoute(domainAccountID, accountID));
            }}
            pendingAction={domainPendingActions?.member?.[accountID]?.twoFactorAuthExemptEmails}
        />
    );
}

export default DomainMemberForceTwoFactorAuthPage;
