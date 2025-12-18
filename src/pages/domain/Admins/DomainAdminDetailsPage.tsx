import React, {useMemo} from 'react';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import BaseDomainMemberDetailsComponent from '@pages/domain/BaseDomainMemberDetailsComponent';
import type {MemberDetailsMenuItem} from '@pages/domain/BaseDomainMemberDetailsComponent';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type DomainAdminDetailsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.ADMIN_DETAILS>;

function DomainAdminDetailsPage({route}: DomainAdminDetailsPageProps) {
    const {domainAccountID, accountID} = route.params;
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Info'] as const);

    const menuItems = useMemo((): MemberDetailsMenuItem[] => [
        {
            key: 'profile',
            title: translate('common.profile'),
            icon: icons.Info,
            onPress: () => Navigation.navigate(ROUTES.PROFILE.getRoute(accountID, Navigation.getActiveRoute())),
            shouldShowRightIcon: true,
        },
    ], [accountID, icons.Info, translate]);

    return (
        <BaseDomainMemberDetailsComponent
            domainAccountID={domainAccountID}
            accountID={accountID}
            menuItems={menuItems}
        />
    );
}

DomainAdminDetailsPage.displayName = 'DomainAdminDetailsPage';

export default DomainAdminDetailsPage;
