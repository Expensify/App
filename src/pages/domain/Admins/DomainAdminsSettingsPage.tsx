import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {getLatestError} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import {clearChoosePrimaryContactError} from '@userActions/Domain';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type DomainAdminsSettingsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.ADMINS_SETTINGS>;

function DomainAdminsSettingsPage({route}: DomainAdminsSettingsPageProps) {
    const {translate} = useLocalize();

    const [domainPendingActions] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${route.params.accountID}`, {
        canBeMissing: true,
    });
    const [domainErrors] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${route.params.accountID}`, {
        canBeMissing: true,
    });
    const [domainSettings] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${route.params.accountID}`, {
        canBeMissing: false,
    });
    const currentlySelectedUser = domainSettings?.settings?.technicalContactEmail;

    return (
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
                onClose={() => clearChoosePrimaryContactError(route.params.accountID)}
            >
                <MenuItemWithTopDescription
                    description={translate('domain.admins.primaryContact')}
                    title={currentlySelectedUser}
                    shouldShowRightIcon
                    onPress={() => Navigation.navigate(ROUTES.DOMAIN_ADD_PRIMARY_CONTACT.getRoute(route.params.accountID))}
                />
            </OfflineWithFeedback>
        </ScreenWrapper>
    );
}

DomainAdminsSettingsPage.displayName = 'DomainAdminsSettingsPage';

export default DomainAdminsSettingsPage;
