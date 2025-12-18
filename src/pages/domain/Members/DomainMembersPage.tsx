import { selectMemberIDs } from '@selectors/Domain';
import React from 'react';
import { useMemoizedLazyIllustrations } from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import Navigation from '@navigation/Navigation';
import type { PlatformStackScreenProps } from '@navigation/PlatformStackNavigation/types';
import type { DomainSplitNavigatorParamList } from '@navigation/types';
import type { MemberOption } from '@pages/domain/BaseDomainMembersPage';
import BaseDomainMembersPage from '@pages/domain/BaseDomainMembersPage';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';


type DomainMembersPageProps = PlatformStackScreenProps<DomainSplitNavigatorParamList, typeof SCREENS.DOMAIN.MEMBERS>;

function DomainMembersPage({route}: DomainMembersPageProps) {
    const {domainAccountID} = route.params;
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['Members']);

    const [memberIDs,memberMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        canBeMissing: true,
        selector: selectMemberIDs,
    });

    const openMemberDetails = (item: MemberOption) => {
            Navigation.setNavigationActionToMicrotaskQueue(() => {
                Navigation.navigate(ROUTES.DOMAIN_MEMBER_DETAILS.getRoute(domainAccountID, item.accountID));
            });
        }

    return (
        <BaseDomainMembersPage
            domainAccountID={domainAccountID}
            isLoading={isLoadingOnyxValue(memberMetadata)}
            accountIDs={memberIDs ?? []}
            headerTitle={translate('domain.members.title')}
            searchPlaceholder={translate('domain.members.findMember')}
            onSelectRow={openMemberDetails}
            headerIcon={illustrations.Members}
        />
    );
}

DomainMembersPage.displayName = 'DomainMembersPage';

export default DomainMembersPage;
