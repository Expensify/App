import React from 'react';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {DomainSplitNavigatorParamList} from '@navigation/types';
import selectMemberIDs from '@src/libs/DomainUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import BaseDomainMembersPage from '@pages/domain/BaseDomainMembersPage'

type DomainMembersPageProps = PlatformStackScreenProps<DomainSplitNavigatorParamList, typeof SCREENS.DOMAIN.MEMBERS>;

function DomainMembersPage({route}: DomainMembersPageProps) {
    const domainID = route.params.accountID;
    const {translate} = useLocalize();

    const [domain, fetchStatus] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainID}`, {canBeMissing: false});

    const [memberIDs] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainID}`, {
        canBeMissing: true,
        selector: selectMemberIDs,
    });

    const shouldShowLoading = fetchStatus.status !== 'loading' && !domain;


    return (
        <BaseDomainMembersPage
            domainID={domainID}
            domain={domain}
            accountIDs={memberIDs ?? []}
            headerTitle={translate('domain.members.title')}
            searchPlaceholder={translate('domain.members.findMember')}
            onSelectRow={()=>{}}
            shouldShowLoading={shouldShowLoading}
        />
    );
}

DomainMembersPage.displayName = 'DomainMembersPage';

export default DomainMembersPage;
