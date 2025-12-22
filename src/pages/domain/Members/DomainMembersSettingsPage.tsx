import React from 'react';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';
import {domainMemberSettingsSelector, twoFactorAuthRequiredSelector} from '@selectors/Domain';
import BaseDomainSettingsPage from '@pages/domain/BaseDomainSettingsPage';
import {getLatestError} from '@libs/ErrorUtils';

import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import type SCREENS from '@src/SCREENS';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import useThemeStyles from '@hooks/useThemeStyles';
import domain from '@src/types/onyx/Domain';
import RenderHTML from '@components/RenderHTML';
import {View} from 'react-native';

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

    return (
        <BaseDomainSettingsPage domainAccountID={domainAccountID}>
            <ToggleSettingOptionRow
                wrapperStyle={[styles.mv3, styles.ph5]}
                switchAccessibilityLabel={translate('domain.members.forceTwoFactorAuth')}
                isActive={!!domainSettings?.twoFactorAuthRequired}
                disabled={!!domainSettings?.samlEnabled}
                onToggle={(value) => {
                    // if (!domain?.email) {
                    //     return;
                    // }
                    // toggleConsolidatedDomainBilling(domainAccountID, Str.extractEmailDomain(domain.email), value);
                }}
                title={translate('domain.members.forceTwoFactorAuth')}
                subtitle={
                    <View style={[styles.flexRow, styles.renderHTML, styles.mt1]}>
                        <RenderHTML html={translate('domain.members.forceTwoFactorAuthDescription')} />
                    </View>
                }
                shouldPlaceSubtitleBelowSwitch
                // pendingAction={domainPendingActions?.useTechnicalContactBillingCard}
                // errors={getLatestError(domainErrors?.useTechnicalContactBillingCardErrors)}
                // onCloseError={() => clearToggleConsolidatedDomainBillingErrors(domainAccountID)}
            />
        </BaseDomainSettingsPage>
    );
}

DomainMembersSettingsPage.displayName = 'DomainMembersSettingsPage';

export default DomainMembersSettingsPage;
