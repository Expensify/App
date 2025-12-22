import { selectMemberIDs } from '@selectors/Domain';
import React from 'react';
import { useMemoizedLazyIllustrations } from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import Navigation from '@navigation/Navigation';
import type { PlatformStackScreenProps } from '@navigation/PlatformStackNavigation/types';
import type { DomainSplitNavigatorParamList } from '@navigation/types';
import BaseDomainMembersPage from '@pages/domain/BaseDomainMembersPage';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import Button from '@components/Button';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';


type DomainMembersPageProps = PlatformStackScreenProps<DomainSplitNavigatorParamList, typeof SCREENS.DOMAIN.MEMBERS>;

function DomainMembersPage({route}: DomainMembersPageProps) {
    const {domainAccountID} = route.params;
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['Members','Plus'] as const);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();

    const [memberIDs,memberMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        canBeMissing: true,
        selector: selectMemberIDs,
    });

    const renderHeaderButtons = (
        <Button
            success
            onPress={() => {
                Navigation.navigate(ROUTES.DOMAIN_ADD_MEMBER.getRoute(domainAccountID));
            }}
            text={translate('domain.members.addMember')}
            icon={illustrations.Plus}
            innerStyles={[shouldUseNarrowLayout && styles.alignItemsCenter]}
            style={[shouldUseNarrowLayout && styles.flexGrow1, shouldUseNarrowLayout && styles.mb3, styles.alignItemsCenter]}
        />
    );

    return (
        <BaseDomainMembersPage
            domainAccountID={domainAccountID}
            isLoading={isLoadingOnyxValue(memberMetadata)}
            accountIDs={memberIDs ?? []}
            headerTitle={translate('domain.members.title')}
            searchPlaceholder={translate('domain.members.findMember')}
            onSelectRow={()=>{}}
            headerIcon={illustrations.Members}
            headerContent={renderHeaderButtons}
        />
    );
}

DomainMembersPage.displayName = 'DomainMembersPage';

export default DomainMembersPage;
