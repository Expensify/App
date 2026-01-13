import React, {useMemo} from 'react';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {revokeDomainAdminAccess} from '@libs/actions/Domain';
import {getDisplayNameOrDefault, getPhoneNumber} from '@libs/PersonalDetailsUtils';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import BaseDomainMemberDetailsComponent from '@pages/domain/BaseDomainMemberDetailsComponent';
import type {MemberDetailsMenuItem} from '@pages/domain/BaseDomainMemberDetailsComponent';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {adminAccountIDsSelector, domainSettingsPrimaryContactSelector} from '@src/selectors/Domain';
import type {PersonalDetailsList} from '@src/types/onyx';

type DomainAdminDetailsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.ADMIN_DETAILS>;

function DomainAdminDetailsPage({route}: DomainAdminDetailsPageProps) {
    const {domainAccountID, accountID} = route.params;
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Info', 'ClosedSign'] as const);

    const [primaryContact] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainAccountID}`, {
        selector: domainSettingsPrimaryContactSelector,
        canBeMissing: true,
    });

    const [adminAccountIDs] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        canBeMissing: true,
        selector: adminAccountIDsSelector,
    });

    // eslint-disable-next-line rulesdir/no-inline-useOnyx-selector
    const [adminPersonalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        canBeMissing: true,
        selector: (personalDetailsList: OnyxEntry<PersonalDetailsList>) => personalDetailsList?.[accountID],
    });

    const displayName = formatPhoneNumber(getDisplayNameOrDefault(adminPersonalDetails));
    const memberLogin = adminPersonalDetails?.login ?? '';
    const isCurrentUserPrimaryContact = primaryContact === memberLogin;
    const isSMSLogin = Str.isSMSLogin(memberLogin);
    const phoneNumber = getPhoneNumber(adminPersonalDetails);
    const fallbackIcon = adminPersonalDetails?.fallbackIcon ?? '';

    const domainHasOnlyOneAdmin = adminAccountIDs?.length === 1;
    const {showConfirmModal} = useConfirmModal();

    const handleRevokeAdminAccess = async () => {
        const confirmResult = await showConfirmModal({
            title: translate('domain.admins.revokeAdminAccess'),
            prompt: translate('workspace.people.removeMemberPrompt', {memberName: displayName}),
            confirmText: translate('common.remove'),
            cancelText: translate('common.cancel'),

            shouldShowCancelButton: true,
            danger: true,
        });
        if (confirmResult.action !== ModalActions.CONFIRM) {
            return;
        }

        revokeDomainAdminAccess(route.params.domainAccountID, route.params.accountID);
        Navigation.dismissModal();
    };
    const menuItems = useMemo(
        (): MemberDetailsMenuItem[] => [
            {
                key: 'profile',
                title: translate('common.profile'),
                icon: icons.Info,
                onPress: () => Navigation.navigate(ROUTES.PROFILE.getRoute(accountID, Navigation.getActiveRoute())),
                shouldShowRightIcon: true,
            },
        ],
        [accountID, icons.Info, translate],
    );

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
