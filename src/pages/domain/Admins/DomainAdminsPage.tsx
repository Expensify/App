import {adminAccountIDsSelector} from '@selectors/Domain';
import React from 'react';
import type {MemberOption} from '@pages/domain/BaseDomainMembersPage';
import BaseDomainMembersPage from '@pages/domain/BaseDomainMembersPage';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {DomainSplitNavigatorParamList} from '@navigation/types';
import {getCurrentUserAccountID} from '@userActions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type DomainAdminsPageProps = PlatformStackScreenProps<DomainSplitNavigatorParamList, typeof SCREENS.DOMAIN.ADMINS>;

function DomainAdminsPage({route}: DomainAdminsPageProps) {
    const {domainAccountID} = route.params;
    const {translate} = useLocalize();

    const [adminAccountIDs, domainMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        canBeMissing: true,
        selector: adminAccountIDsSelector,
    });

    if (isLoadingOnyxValue(domainMetadata)) {
        return <FullScreenLoadingIndicator />;
    }

    const currentUserAccountID = getCurrentUserAccountID();
    const isUserAdmin = adminAccountIDs?.includes(currentUserAccountID);

    const handleSelectRow = (item: MemberOption) => {
        Navigation.navigate(ROUTES.DOMAIN_ADMIN_DETAILS.getRoute(domainAccountID, item.accountID));
    };

    return (
        <BaseDomainMembersPage
            accountIDs={adminAccountIDs ?? []}
            headerTitle={translate('domain.admins.title')}
            searchPlaceholder={translate('domain.admins.findAdmin')}
            onSelectRow={handleSelectRow}
            shouldShowNotFoundView={!isUserAdmin}
        />
    );
}

export default DomainAdminsPage;
