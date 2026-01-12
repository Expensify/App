import {memberAccountIDsSelector} from '@selectors/Domain';
import React from 'react';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
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
    const illustrations = useMemoizedLazyIllustrations(['Profile']);
    const icons = useMemoizedLazyExpensifyIcons(['Gear']);
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const [memberIDs] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        canBeMissing: true,
        selector: memberAccountIDsSelector,
    });

    const headerContent = (
        <ButtonWithDropdownMenu
            success={false}
            onPress={() => {}}
            shouldAlwaysShowDropdownMenu
            customText={translate('common.more')}
            options={[
                {
                    value: 'leave',
                    text: translate('domain.admins.settings'),
                    icon: icons.Gear,
                    onSelected: () => Navigation.navigate(ROUTES.DOMAIN_MEMBERS_SETTINGS.getRoute(domainAccountID)),
                },
            ]}
            isSplitButton={false}
            wrapperStyle={shouldUseNarrowLayout && [styles.flexGrow1, styles.mb3]}
        />
    );

    return (
        <BaseDomainMembersPage
            domainAccountID={domainAccountID}
            accountIDs={memberIDs ?? []}
            headerTitle={translate('domain.members.title')}
            headerContent={headerContent}
            searchPlaceholder={translate('domain.members.findMember')}
            onSelectRow={() => {}}
            headerIcon={illustrations.Profile}
        />
    );
}

DomainMembersPage.displayName = 'DomainMembersPage';

export default DomainMembersPage;
