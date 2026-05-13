import {defaultSecurityGroupIDSelector, selectGroupByID} from '@selectors/Domain';
import React from 'react';
import MenuItem from '@components/MenuItem';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import Navigation from '@libs/Navigation/Navigation';
import {deleteDomainSecurityGroup} from '@userActions/Domain';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

type DeleteGroupRowProps = {
    /** The account ID of the domain */
    domainAccountID: number;

    /** The ID of the security group */
    groupID: string;
};

function DeleteGroupRow({domainAccountID, groupID}: DeleteGroupRowProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Trashcan'] as const);
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();

    const [group] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        selector: selectGroupByID(groupID),
    });
    const [defaultSecurityGroupID] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        selector: defaultSecurityGroupIDSelector,
    });
    const [defaultSecurityGroup] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        selector: selectGroupByID(defaultSecurityGroupID),
    });

    const onDeleteGroupSelect = async () => {
        if (!groupID || !group || groupID === defaultSecurityGroupID) {
            return null;
        }

        const result = await showConfirmModal({
            title: translate('domain.groups.deleteGroupDangerConfirmationModal'),
            prompt: translate('domain.groups.deleteGroupDangerConfirmationModalDescription', defaultSecurityGroup?.name ?? ''),
            confirmText: translate('domain.groups.deleteGroup'),
            cancelText: translate('domain.groups.neverMind'),
            shouldShowCancelButton: true,
            danger: true,
        });

        if (result.action !== ModalActions.CONFIRM) {
            return;
        }
        Navigation.goBack(ROUTES.DOMAIN_GROUPS.getRoute(domainAccountID), {
            afterTransition: () => deleteDomainSecurityGroup(domainAccountID, groupID),
        });
    };

    return groupID !== defaultSecurityGroupID ? (
        <MenuItem
            icon={icons.Trashcan}
            title={translate('domain.groups.deleteGroup')}
            onPress={() => {
                onDeleteGroupSelect();
            }}
        />
    ) : null;
}

export default DeleteGroupRow;
