import React from 'react';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import BaseDomainMemberDetailsComponent from '@pages/domain/BaseDomainMemberDetailsComponent';
import type {MemberDetailsMenuItem} from '@pages/domain/BaseDomainMemberDetailsComponent';
import type SCREENS from '@src/SCREENS';
import getEmptyArray from '@src/types/utils/getEmptyArray';

type DomainAdminDetailsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.ADMIN_DETAILS>;

function DomainAdminDetailsPage({route}: DomainAdminDetailsPageProps) {
    const {domainAccountID, accountID} = route.params;

    /**
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

    {!domainHasOnlyOneAdmin && (
    <MenuItem
    disabled={isCurrentUserPrimaryContact}
    hintText={isCurrentUserPrimaryContact ? translate('domain.admins.cantRevokeAdminAccess') : undefined}
    style={styles.mb5}
    title={translate('domain.admins.revokeAdminAccess')}
    icon={icons.ClosedSign}
    onPress={handleRevokeAdminAccess}
    />
    )}

     */


    return (
        <BaseDomainMemberDetailsComponent
            domainAccountID={domainAccountID}
            accountID={accountID}
            menuItems={getEmptyArray<MemberDetailsMenuItem>()}
        />
    );
}

DomainAdminDetailsPage.displayName = 'DomainAdminDetailsPage';

export default DomainAdminDetailsPage;
