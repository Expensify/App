import React from 'react';
import MenuItem from '@components/MenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import BaseDomainMemberDetailsComponent from '@pages/domain/BaseDomainMemberDetailsComponent';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type DomainMemberDetailsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.MEMBER_DETAILS>;

function DomainMemberDetailsPage({route}: DomainMemberDetailsPageProps) {
    const {domainAccountID, accountID} = route.params;
    const {translate} = useLocalize();

    const icons = useMemoizedLazyExpensifyIcons(['Flag'] as const);

    return (
        <BaseDomainMemberDetailsComponent
            domainAccountID={domainAccountID}
            accountID={accountID}
        >
            <MenuItem
                key="ReportSuspiciousActivity"
                title={translate('lockAccountPage.reportSuspiciousActivity')}
                icon={icons.Flag}
                onPress={() => Navigation.navigate(ROUTES.DOMAIN_LOCK_ACCOUNT.getRoute(domainAccountID, accountID))}
                shouldShowRightIcon
            />
        </BaseDomainMemberDetailsComponent>
    );
}

DomainMemberDetailsPage.displayName = 'DomainMemberDetailsPage';

export default DomainMemberDetailsPage;
