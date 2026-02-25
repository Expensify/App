import {domainMemberSettingsSelector, domainNameSelector} from '@selectors/Domain';
import React from 'react';
import {View} from 'react-native';
import RenderHTML from '@components/RenderHTML';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLatestError} from '@libs/ErrorUtils';
import {addLeadingForwardSlash} from '@libs/Url';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import BaseDomainSettingsPage from '@pages/domain/BaseDomainSettingsPage';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {clearToggleTwoFactorAuthRequiredForDomainError, clearValidateDomainTwoFactorCodeError, toggleTwoFactorAuthRequiredForDomain} from '@userActions/Domain';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type DomainMembersSettingsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.MEMBERS_SETTINGS>;

function DomainMembersSettingsPage({route}: DomainMembersSettingsPageProps) {
    const {domainAccountID} = route.params;

    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();

    const [domainPendingActions] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`);
    const [domainErrors] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`);
    const [domainSettings] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainAccountID}`, {
        selector: domainMemberSettingsSelector,
    });
    const [domainName] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {selector: domainNameSelector});
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);

    const {environmentURL} = useEnvironment();
    const samlPageUrl = `${environmentURL}${addLeadingForwardSlash(ROUTES.DOMAIN_SAML.getRoute(domainAccountID))}`;

    return (
        <BaseDomainSettingsPage domainAccountID={domainAccountID}>
            <ToggleSettingOptionRow
                wrapperStyle={[styles.ph5]}
                switchAccessibilityLabel={translate('domain.members.forceTwoFactorAuth')}
                isActive={!!domainSettings?.twoFactorAuthRequired}
                disabled={!!domainSettings?.samlEnabled || isOffline}
                onToggle={(value) => {
                    if (!domainName) {
                        return;
                    }

                    if (!value && account?.requiresTwoFactorAuth) {
                        clearToggleTwoFactorAuthRequiredForDomainError(domainAccountID);
                        clearValidateDomainTwoFactorCodeError();
                        Navigation.navigate(ROUTES.DOMAIN_MEMBERS_SETTINGS_TWO_FACTOR_AUTH.getRoute(domainAccountID));
                    } else {
                        toggleTwoFactorAuthRequiredForDomain(domainAccountID, domainName, value);
                    }
                }}
                title={translate('domain.members.forceTwoFactorAuth')}
                subtitle={
                    <View style={[styles.flexRow, styles.renderHTML, styles.mt1]}>
                        <RenderHTML
                            html={
                                domainSettings?.samlEnabled
                                    ? translate('domain.members.forceTwoFactorAuthSAMLEnabledDescription', samlPageUrl)
                                    : translate('domain.members.forceTwoFactorAuthDescription')
                            }
                        />
                    </View>
                }
                shouldPlaceSubtitleBelowSwitch
                pendingAction={domainPendingActions?.twoFactorAuthRequired}
                errors={!account?.requiresTwoFactorAuth || !domainSettings?.twoFactorAuthRequired ? getLatestError(domainErrors?.setTwoFactorAuthRequiredError) : undefined}
                onCloseError={() => clearToggleTwoFactorAuthRequiredForDomainError(domainAccountID)}
            />
        </BaseDomainSettingsPage>
    );
}

DomainMembersSettingsPage.displayName = 'DomainMembersSettingsPage';

export default DomainMembersSettingsPage;
