import {adminAccountIDsSelector, domainSettingsPrimaryContactSelector} from '@selectors/Domain';
import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import MenuItem from '@components/MenuItem';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import BaseDomainMemberDetailsComponent from '@pages/domain/BaseDomainMemberDetailsComponent';
import {revokeDomainAdminAccess} from '@userActions/Domain';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetailsList} from '@src/types/onyx';

type DomainAdminDetailsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.ADMIN_DETAILS>;

function DomainAdminDetailsPage({route}: DomainAdminDetailsPageProps) {
    const {domainAccountID, accountID} = route.params;

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

    const domainHasOnlyOneAdmin = adminAccountIDs?.length === 1;
    const displayName = formatPhoneNumber(getDisplayNameOrDefault(adminPersonalDetails));
    const memberLogin = adminPersonalDetails?.login ?? '';
    const isCurrentUserPrimaryContact = primaryContact === memberLogin;

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

    return (
        <BaseDomainMemberDetailsComponent
            domainAccountID={domainAccountID}
            accountID={accountID}
        >
            {domainHasOnlyOneAdmin && (
                <MenuItem
                    title={translate('domain.admins.resetDomain')}
                    icon={icons.ClosedSign}
                    onPress={() => Navigation.navigate(ROUTES.DOMAIN_RESET_DOMAIN.getRoute(domainAccountID, accountID))}
                />
            )}
            {!domainHasOnlyOneAdmin && (
                <MenuItem
                    disabled={isCurrentUserPrimaryContact}
                    hintText={isCurrentUserPrimaryContact ? translate('domain.admins.cantRevokeAdminAccess') : undefined}
                    title={translate('domain.admins.revokeAdminAccess')}
                    icon={icons.ClosedSign}
                    onPress={handleRevokeAdminAccess}
                />
            )}
        </BaseDomainMemberDetailsComponent>
    );
}

export default DomainAdminDetailsPage;
