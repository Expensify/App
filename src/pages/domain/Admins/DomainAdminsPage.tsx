import {adminAccountIDsSelector, technicalContactSettingsSelector} from '@selectors/Domain';
import React from 'react';
import Badge from '@components/Badge';
import Button from '@components/Button';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLatestError} from '@libs/ErrorUtils';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {DomainSplitNavigatorParamList} from '@navigation/types';
import BaseDomainMembersPage from '@pages/domain/BaseDomainMembersPage';
import {clearAddAdminError} from '@userActions/Domain';
import {getCurrentUserAccountID} from '@userActions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type DomainAdminsPageProps = PlatformStackScreenProps<DomainSplitNavigatorParamList, typeof SCREENS.DOMAIN.ADMINS>;

function DomainAdminsPage({route}: DomainAdminsPageProps) {
    const {domainAccountID} = route.params;
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const illustrations = useMemoizedLazyIllustrations(['Members']);
    const icons = useMemoizedLazyExpensifyIcons(['Gear', 'Plus']);

    const [adminAccountIDs] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        canBeMissing: true,
        selector: adminAccountIDsSelector,
    });
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: true});
    const [technicalContactSettings] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainAccountID}`, {
        canBeMissing: false,
        selector: technicalContactSettingsSelector,
    });
    const [domainErrors] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`, {canBeMissing: true});
    const [domainPendingActions] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`, {canBeMissing: true});

    const currentUserAccountID = getCurrentUserAccountID();
    const isAdmin = adminAccountIDs?.includes(currentUserAccountID);

    const getCustomRightElement = (accountID: number) => {
        const login = personalDetails?.[accountID]?.login;
        if (technicalContactSettings?.technicalContactEmail !== login) {
            return null;
        }
        return <Badge text={translate('domain.admins.primaryContact')} />;
    };

    const getCustomRowProps = (accountID: number) => ({
        errors: getLatestError(domainErrors?.adminErrors?.[accountID]?.errors),
        pendingAction: domainPendingActions?.admin?.[accountID]?.pendingAction,
    });

    const headerContent = isAdmin ? (
        <>
            <Button
                success
                onPress={() => Navigation.navigate(ROUTES.DOMAIN_ADD_ADMIN.getRoute(domainAccountID))}
                text={translate('domain.admins.addAdmin')}
                icon={icons.Plus}
                innerStyles={[shouldUseNarrowLayout && styles.alignItemsCenter]}
                style={shouldUseNarrowLayout && [styles.flexGrow1, styles.mb3]}
            />
            <Button
                onPress={() => Navigation.navigate(ROUTES.DOMAIN_ADMINS_SETTINGS.getRoute(domainAccountID))}
                text={translate('domain.admins.settings')}
                icon={icons.Gear}
                innerStyles={[shouldUseNarrowLayout && styles.alignItemsCenter]}
                style={shouldUseNarrowLayout ? [styles.flexGrow1, styles.mb3] : undefined}
            />
        </>
    ) : null;

    return (
        <BaseDomainMembersPage
            domainAccountID={domainAccountID}
            accountIDs={adminAccountIDs ?? []}
            headerTitle={translate('domain.admins.title')}
            searchPlaceholder={translate('domain.admins.findAdmin')}
            headerIcon={illustrations.Members}
            headerContent={headerContent}
            getCustomRightElement={getCustomRightElement}
            getCustomRowProps={getCustomRowProps}
            onDismissError={(item) => clearAddAdminError(domainAccountID, item.accountID)}
            onSelectRow={(item) => Navigation.navigate(ROUTES.DOMAIN_ADMIN_DETAILS.getRoute(domainAccountID, item.accountID))}
        />
    );
}

DomainAdminsPage.displayName = 'DomainAdminsPage';
export default DomainAdminsPage;
