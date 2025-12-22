import {domainMemberSettingsSelector} from '@selectors/Domain';
import {Str} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';
import RenderHTML from '@components/RenderHTML';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLatestError} from '@libs/ErrorUtils';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import BaseDomainSettingsPage from '@pages/domain/BaseDomainSettingsPage';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {clearToggleTwoFactorAuthRequiredForDomainError, toggleTwoFactorAuthRequiredForDomain} from '@userActions/Domain';
import ONYXKEYS from '@src/ONYXKEYS';
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
    const [domain] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {canBeMissing: true});

    return (
        <BaseDomainSettingsPage domainAccountID={domainAccountID}>
            <ToggleSettingOptionRow
                wrapperStyle={[styles.mv3, styles.ph5]}
                switchAccessibilityLabel={translate('domain.members.forceTwoFactorAuth')}
                isActive={!!domainSettings?.twoFactorAuthRequired}
                disabled={!!domainSettings?.samlEnabled}
                onToggle={(value) => {
                    if (!domain?.email) {
                        return;
                    }
                    toggleTwoFactorAuthRequiredForDomain(domainAccountID, Str.extractEmailDomain(domain.email), value);
                }}
                title={translate('domain.members.forceTwoFactorAuth')}
                subtitle={
                    <View style={[styles.flexRow, styles.renderHTML, styles.mt1]}>
                        <RenderHTML html={translate('domain.members.forceTwoFactorAuthDescription')} />
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
