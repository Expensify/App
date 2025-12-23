import React, {useMemo} from 'react';
import Button from '@components/Button';
import * as Expensicons from '@components/Icon/Expensicons';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import Button from '@components/Button';
import * as Expensicons from '@components/Icon/Expensicons';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {DomainSplitNavigatorParamList} from '@navigation/types';
import BaseDomainMemberDetailsComponent from '@pages/domain/BaseDomainMemberDetailsComponent';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type DomainMemberDetailsPageProps = PlatformStackScreenProps<DomainSplitNavigatorParamList, typeof SCREENS.DOMAIN.MEMBER_DETAILS>;

function DomainMemberDetailsPage({route}: DomainMemberDetailsPageProps) {
    const {domainAccountID, accountID} = route.params;
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['Flag'] as const);

    const menuItems = useMemo(
        () => [
            {
                key: 'report',
                title: translate('lockAccountPage.reportSuspiciousActivity'),
                icon: icons.Flag,
                onPress: () => Navigation.navigate(ROUTES.DOMAIN_MEMBER_REPORT_SUSPICIOUS_ACTIVITY.getRoute(domainAccountID, accountID)),
                shouldShowRightIcon: true,
            },
        ],
        [accountID, domainAccountID, icons.Flag, translate],
    );

    return (
        <BaseDomainMemberDetailsComponent
            domainAccountID={domainAccountID}
            accountID={accountID}
            menuItems={menuItems}
            actionButton={
                <Button
                    text={translate('domain.members.closeAccount')}
                    onPress={() => {}}
                    isDisabled
                    icon={Expensicons.ClosedSign}
                    style={styles.mb5}
                />
            }
        />
    );
}

DomainMemberDetailsPage.displayName = 'DomainMemberDetailsPage';

export default DomainMemberDetailsPage;
