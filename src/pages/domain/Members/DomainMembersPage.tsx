import {memberAccountIDsSelector} from '@selectors/Domain';
import React from 'react';
import Button from '@components/Button';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearAddMemberError} from '@libs/actions/Domain';
import {getLatestError} from '@libs/ErrorUtils';
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
    const icons = useMemoizedLazyExpensifyIcons(['Plus']);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();

    const [domainErrors] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`, {canBeMissing: true});
    const [domainPendingActions] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`, {canBeMissing: true});

    const [memberIDs] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        canBeMissing: true,
        selector: memberAccountIDsSelector,
    });

    const renderHeaderButtons = (
        <Button
            success
            onPress={() => Navigation.navigate(ROUTES.DOMAIN_ADD_MEMBER.getRoute(domainAccountID))}
            text={translate('domain.members.addMember')}
            icon={icons.Plus}
            innerStyles={[shouldUseNarrowLayout && styles.alignItemsCenter]}
            style={shouldUseNarrowLayout ? [styles.flexGrow1, styles.mb3] : undefined}
        />
    );

    const getCustomRowProps = (accountID: number, email?: string) => ({
        errors: getLatestError(domainErrors?.memberErrors?.[email ?? accountID]?.errors),
        pendingAction: domainPendingActions?.member?.[email ?? accountID]?.pendingAction,
    });

    return (
        <BaseDomainMembersPage
            domainAccountID={domainAccountID}
            accountIDs={memberIDs ?? []}
            headerTitle={translate('domain.members.title')}
            searchPlaceholder={translate('domain.members.findMember')}
            onSelectRow={(item) => Navigation.navigate(ROUTES.DOMAIN_MEMBER_DETAILS.getRoute(domainAccountID, item.accountID))}
            headerIcon={illustrations.Profile}
            headerContent={renderHeaderButtons}
            getCustomRowProps={getCustomRowProps}
            onDismissError={(item) => clearAddMemberError(domainAccountID, item.accountID, item.login)}
        />
    );
}

DomainMembersPage.displayName = 'DomainMembersPage';

export default DomainMembersPage;
