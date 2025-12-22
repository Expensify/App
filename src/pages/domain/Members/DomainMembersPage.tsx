import React from 'react';
import BaseDomainMembersPage from '@pages/domain/BaseDomainMembersPage';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {DomainSplitNavigatorParamList} from '@navigation/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import {selectMemberIDs} from '@selectors/Domain';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import Navigation from '@navigation/Navigation';
import ROUTES from '@src/ROUTES';
import useThemeStyles from '@hooks/useThemeStyles';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';

type DomainMembersPageProps = PlatformStackScreenProps<DomainSplitNavigatorParamList, typeof SCREENS.DOMAIN.MEMBERS>;

function DomainMembersPage({route}: DomainMembersPageProps) {
    const {domainAccountID} = route.params;
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['Members']);
    const icons = useMemoizedLazyExpensifyIcons(['Gear']);
    const styles = useThemeStyles();

    const [memberIDs,memberMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        canBeMissing: true,
        selector: selectMemberIDs,
    });

    const headerContent = (
        <ButtonWithDropdownMenu
            success={false}
            onPress={() => {}}
            shouldAlwaysShowDropdownMenu
            customText={translate('common.more')}
            options={[{
                value: 'leave',
                text: translate('domain.admins.settings'),
                icon: icons.Gear,
                onSelected: () => Navigation.navigate(ROUTES.DOMAIN_MEMBERS_SETTINGS.getRoute(domainAccountID)),
            }]}
            isSplitButton={false}
            wrapperStyle={styles.flexGrow1}
        />
    );

    return (
        <BaseDomainMembersPage
            domainAccountID={domainAccountID}
            isLoading={isLoadingOnyxValue(memberMetadata)}
            accountIDs={memberIDs ?? []}
            headerTitle={translate('domain.members.title')}
            headerContent={headerContent}
            searchPlaceholder={translate('domain.members.findMember')}
            onSelectRow={()=>{}}
            headerIcon={illustrations.Members}
        />
    );
}

DomainMembersPage.displayName = 'DomainMembersPage';

export default DomainMembersPage;
