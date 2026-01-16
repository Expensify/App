import {memberAccountIDsSelector} from '@selectors/Domain';
import React from 'react';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {DomainSplitNavigatorParamList} from '@navigation/types';
import BaseDomainMembersPage from '@pages/domain/BaseDomainMembersPage';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type DomainMembersPageProps = PlatformStackScreenProps<DomainSplitNavigatorParamList, typeof SCREENS.DOMAIN.MEMBERS>;

function DomainMembersPage({route}: DomainMembersPageProps) {
    const {domainAccountID} = route.params;
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Profile']);

    const [memberIDs] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        canBeMissing: true,
        selector: memberAccountIDsSelector,
    });

    return (
        <BaseDomainMembersPage
            domainAccountID={domainAccountID}
            accountIDs={memberIDs ?? []}
            headerIcon={icons.Profile}
            headerTitle={translate('domain.members.title')}
            searchPlaceholder={translate('domain.members.findMember')}
            onSelectRow={(item) => Navigation.navigate(ROUTES.DOMAIN_MEMBER_DETAILS.getRoute(domainAccountID, item.accountID))}
        />
    );
}

DomainMembersPage.displayName = 'DomainMembersPage';

export default DomainMembersPage;
