import {domainMemberSettingsSelector, domainNameSelector} from '@selectors/Domain';
import React from 'react';
import {View} from 'react-native';
import RenderHTML from '@components/RenderHTML';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLatestError} from '@libs/ErrorUtils';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import BaseDomainSettingsPage from '@pages/domain/BaseDomainSettingsPage';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {clearToggleTwoFactorAuthRequiredForDomainError, toggleTwoFactorAuthRequiredForDomain} from '@userActions/Domain';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type DomainMembersSettingsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.MEMBERS_SETTINGS>;

function DomainMembersSettingsPage({route}: DomainMembersSettingsPageProps) {
    const {domainAccountID} = route.params;

    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [domainPendingActions] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`, {
        canBeMissing: true,
    });
    const [domainErrors] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`, {
        canBeMissing: true,
    });
    const [domainSettings] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainAccountID}`, {
        canBeMissing: false,
        selector: domainMemberSettingsSelector,
    });
    const [domainName] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {canBeMissing: true, selector: domainNameSelector});
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: false});
    const is2FAEnabled = account?.requiresTwoFactorAuth;

    return (
        <BaseDomainSettingsPage domainAccountID={domainAccountID}>
            <ToggleSettingOptionRow
                wrapperStyle={[styles.ph5]}
                switchAccessibilityLabel={translate('domain.members.forceTwoFactorAuth')}
                isActive={!!domainSettings?.twoFactorAuthRequired}
                disabled={!!domainSettings?.samlEnabled}
                onToggle={(value) => {
                    if (!domainName) {
                        return;
                    }

                    if (!value && is2FAEnabled) {
                        Navigation.navigate(ROUTES.DOMAIN_MEMBERS_SETTINGS_TWO_FACTOR_AUTH.getRoute(domainAccountID));
                    } else {
                        toggleTwoFactorAuthRequiredForDomain(domainAccountID, domainName, value);
                    }
                }}
                title={translate('domain.members.forceTwoFactorAuth')}
                subtitle={
                    <View style={[styles.flexRow, styles.renderHTML, styles.mt1]}>
                        <RenderHTML
                            html={translate(domainSettings?.samlEnabled ? 'domain.members.forceTwoFactorAuthSAMLEnabledDescription' : 'domain.members.forceTwoFactorAuthDescription')}
                        />
                    </View>
                }
                shouldPlaceSubtitleBelowSwitch
                pendingAction={domainPendingActions?.twoFactorAuthRequired}
                errors={getLatestError(domainErrors?.twoFactorAuthRequiredErrors)}
                onCloseError={() => clearToggleTwoFactorAuthRequiredForDomainError(domainAccountID)}
            />
        </BaseDomainSettingsPage>
    );
}

DomainMembersSettingsPage.displayName = 'DomainMembersSettingsPage';

export default DomainMembersSettingsPage;
