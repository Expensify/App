import {Str} from 'expensify-common';
import React from 'react';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {selectAdminIDs} from '@libs/DomainUtils';
import {getLatestError} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import DomainNotFoundPageWrapper from '@pages/domain/DomainNotFoundPageWrapper';
import {clearChoosePrimaryContactError} from '@userActions/Domain';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {clearChoosePrimaryContactError, clearToggleConsolidatedDomainBillingErrors, toggleConsolidatedDomainBilling} from '@userActions/Domain';
import {getCurrentUserAccountID} from '@userActions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type DomainAdminsSettingsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.ADMINS_SETTINGS>;

function DomainAdminsSettingsPage({route}: DomainAdminsSettingsPageProps) {
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
    });
    const [domain, domainMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {canBeMissing: true});
    const currentlySelectedUser = domainSettings?.settings?.technicalContactEmail;

    const [adminIDs] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        canBeMissing: true,
        selector: selectAdminIDs,
    });
    const currentUserAccountID = getCurrentUserAccountID();
    const isAdmin = adminIDs?.includes(currentUserAccountID) ?? false;

    return (
        <DomainNotFoundPageWrapper domainAccountID={domainAccountID}>
            <ScreenWrapper
                shouldEnableMaxHeight
                shouldUseCachedViewportHeight
                testID={DomainAdminsSettingsPage.displayName}
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <HeaderWithBackButton
                    title={translate('domain.admins.settings')}
                    onBackButtonPress={() => {
                        Navigation.dismissModal();
                    }}
                />
                <OfflineWithFeedback
                    pendingAction={domainPendingActions?.technicalContactEmail}
                    errors={getLatestError(domainErrors?.technicalContactEmailErrors)}
                    onClose={() => clearChoosePrimaryContactError(domainAccountID)}
                >
                    <MenuItemWithTopDescription
                        description={translate('domain.admins.primaryContact')}
                        title={currentlySelectedUser}
                        shouldShowRightIcon
                        onPress={() => Navigation.navigate(ROUTES.DOMAIN_ADD_PRIMARY_CONTACT.getRoute(domainAccountID))}
                    />
                </OfflineWithFeedback>
                <ToggleSettingOptionRow
                    wrapperStyle={[styles.mv3, styles.ph5]}
                    switchAccessibilityLabel={translate('domain.admins.consolidatedDomainBilling')}
                    isActive={!!domainSettings?.settings?.technicalContactEmail && !!domainSettings?.settings?.useTechnicalContactBillingCard}
                    disabled={!domainSettings?.settings?.technicalContactEmail}
                    showLockIcon={!domainSettings?.settings?.technicalContactEmail}
                    onToggle={(value) => toggleConsolidatedDomainBilling(domainAccountID, Str.extractEmailDomain(domain?.email ?? ''), value)}
                    subtitle={translate('domain.admins.consolidatedDomainBillingDescription')}
                    title={translate('domain.admins.consolidatedDomainBilling')}
                    shouldPlaceSubtitleBelowSwitch
                    pendingAction={domainPendingActions?.useTechnicalContactBillingCard}
                    errors={getLatestError(domainErrors?.useTechnicalContactBillingCardErrors)}
                    onCloseError={() => clearToggleConsolidatedDomainBillingErrors(route.params.accountID)}
                />
            </ScreenWrapper>
        </DomainNotFoundPageWrapper>
    );
}

DomainAdminsSettingsPage.displayName = 'DomainAdminsSettingsPage';

export default DomainAdminsSettingsPage;
