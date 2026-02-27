import {domainNameSelector, technicalContactSettingsSelector} from '@selectors/Domain';
import React from 'react';
import {View} from 'react-native';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import RenderHTML from '@components/RenderHTML';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLatestError} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import BaseDomainSettingsPage from '@pages/domain/BaseDomainSettingsPage';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {clearSetPrimaryContactError, clearToggleConsolidatedDomainBillingErrors, toggleConsolidatedDomainBilling} from '@userActions/Domain';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type DomainAdminsSettingsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.ADMINS_SETTINGS>;

function DomainAdminsSettingsPage({route}: DomainAdminsSettingsPageProps) {
    const {domainAccountID} = route.params;

    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [domainPendingActions] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`, {
        canBeMissing: true,
    });
    const [domainErrors] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`, {
        canBeMissing: true,
    });
    const [technicalContactSettings] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainAccountID}`, {
        canBeMissing: false,
        selector: technicalContactSettingsSelector,
    });
    const [domainName] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {canBeMissing: true, selector: domainNameSelector});

    return (
        <BaseDomainSettingsPage domainAccountID={domainAccountID}>
            <OfflineWithFeedback
                errorRowStyles={[styles.ph5]}
                pendingAction={domainPendingActions?.technicalContactEmail}
                errors={getLatestError(domainErrors?.technicalContactEmailErrors)}
                onClose={() => clearSetPrimaryContactError(domainAccountID)}
            >
                <MenuItemWithTopDescription
                    description={translate('domain.admins.primaryContact')}
                    title={technicalContactSettings?.technicalContactEmail}
                    shouldShowRightIcon
                    onPress={() => Navigation.navigate(ROUTES.DOMAIN_ADD_PRIMARY_CONTACT.getRoute(domainAccountID))}
                />
            </OfflineWithFeedback>
            <ToggleSettingOptionRow
                wrapperStyle={[styles.mv3, styles.ph5]}
                switchAccessibilityLabel={translate('domain.admins.consolidatedDomainBilling')}
                isActive={!!technicalContactSettings?.technicalContactEmail && !!technicalContactSettings?.useTechnicalContactBillingCard}
                disabled={!technicalContactSettings?.technicalContactEmail}
                onToggle={(value) => {
                    if (!domainName) {
                        return;
                    }
                    toggleConsolidatedDomainBilling(domainAccountID, domainName, value);
                }}
                title={translate('domain.admins.consolidatedDomainBilling')}
                subtitle={
                    <View style={[styles.flexRow, styles.renderHTML, styles.mt1]}>
                        <RenderHTML html={translate('domain.admins.consolidatedDomainBillingDescription', domainName ?? '')} />
                    </View>
                }
                shouldPlaceSubtitleBelowSwitch
                pendingAction={domainPendingActions?.useTechnicalContactBillingCard}
                errors={getLatestError(domainErrors?.useTechnicalContactBillingCardErrors)}
                onCloseError={() => clearToggleConsolidatedDomainBillingErrors(domainAccountID)}
            />
        </BaseDomainSettingsPage>
    );
}

DomainAdminsSettingsPage.displayName = 'DomainAdminsSettingsPage';

export default DomainAdminsSettingsPage;
