import {technicalContactEmailSelector} from '@selectors/Domain';
import React from 'react';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {getLatestError} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import BaseDomainSettingsPage from '@pages/domain/BaseDomainSettingsPage';
import {clearSetPrimaryContactError} from '@userActions/Domain';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type DomainAdminsSettingsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.ADMINS_SETTINGS>;

function DomainAdminsSettingsPage({route}: DomainAdminsSettingsPageProps) {
    const {domainAccountID} = route.params;

    const {translate} = useLocalize();

    const [domainPendingActions] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`, {
        canBeMissing: true,
    });
    const [domainErrors] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`, {
        canBeMissing: true,
    });
    const [technicalContactEmail] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainAccountID}`, {
        canBeMissing: false,
        selector: technicalContactEmailSelector,
    });

    return (
        <BaseDomainSettingsPage domainAccountID={domainAccountID}>
            <OfflineWithFeedback
                pendingAction={domainPendingActions?.technicalContactEmail}
                errors={getLatestError(domainErrors?.technicalContactEmailErrors)}
                onClose={() => clearSetPrimaryContactError(domainAccountID)}
            >
                <MenuItemWithTopDescription
                    description={translate('domain.admins.primaryContact')}
                    title={technicalContactEmail}
                    shouldShowRightIcon
                    onPress={() => Navigation.navigate(ROUTES.DOMAIN_ADD_PRIMARY_CONTACT.getRoute(domainAccountID))}
                />
            </OfflineWithFeedback>
        </BaseDomainSettingsPage>
    );
}

DomainAdminsSettingsPage.displayName = 'DomainAdminsSettingsPage';

export default DomainAdminsSettingsPage;
