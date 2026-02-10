import {adminAccountIDsSelector, adminPendingActionSelector, technicalContactSettingsSelector} from '@selectors/Domain';
import React from 'react';
import Badge from '@components/Badge';
import Button from '@components/Button';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {hasDomainAdminsSettingsErrors} from '@libs/DomainUtils';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {DomainSplitNavigatorParamList} from '@navigation/types';
import BaseDomainMembersPage from '@pages/domain/BaseDomainMembersPage';
import {clearAdminError} from '@userActions/Domain';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type DomainAdminsPageProps = PlatformStackScreenProps<DomainSplitNavigatorParamList, typeof SCREENS.DOMAIN.ADMINS>;

function DomainAdminsPage({route}: DomainAdminsPageProps) {
    const {domainAccountID} = route.params;
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const illustrations = useMemoizedLazyIllustrations(['UserShield']);
    const icons = useMemoizedLazyExpensifyIcons(['Gear', 'Plus', 'DotIndicator']);

    const [adminAccountIDs] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        canBeMissing: true,
        selector: adminAccountIDsSelector,
    });

    const [domainErrors] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`, {
        canBeMissing: true,
    });

    const [domainPendingAction] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`, {
        canBeMissing: true,
        selector: adminPendingActionSelector,
    });

    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: true});
    const [technicalContactSettings] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainAccountID}`, {
        canBeMissing: false,
        selector: technicalContactSettingsSelector,
    });

    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const isAdmin = adminAccountIDs?.includes(currentUserAccountID);

    const getCustomRightElement = (accountID: number) => {
        const technicalContactEmail = technicalContactSettings?.technicalContactEmail;
        const login = personalDetails?.[accountID]?.login;
        if (!technicalContactEmail || !login || technicalContactEmail !== login) {
            return null;
        }
        return <Badge text={translate('domain.admins.primaryContact')} />;
    };

    const getCustomRowProps = (accountID: number) => ({
        errors: domainErrors?.adminErrors?.[accountID]?.errors,
        pendingAction: domainPendingAction?.[accountID]?.pendingAction,
    });

    const hasSettingsErrors = hasDomainAdminsSettingsErrors(domainErrors);
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
                icon={hasSettingsErrors ? icons.DotIndicator : icons.Gear}
                iconFill={hasSettingsErrors ? theme.danger : undefined}
                iconHoverFill={hasSettingsErrors ? theme.dangerHover : undefined}
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
            headerIcon={illustrations.UserShield}
            headerContent={headerContent}
            getCustomRightElement={getCustomRightElement}
            getCustomRowProps={getCustomRowProps}
            onDismissError={(item) => clearAdminError(domainAccountID, item.accountID)}
            onSelectRow={(item) => Navigation.navigate(ROUTES.DOMAIN_ADMIN_DETAILS.getRoute(domainAccountID, item.accountID))}
        />
    );
}

DomainAdminsPage.displayName = 'DomainAdminsPage';

export default DomainAdminsPage;
