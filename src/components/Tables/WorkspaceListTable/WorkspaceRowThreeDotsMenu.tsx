import type {PopoverMenuItem} from '@components/PopoverMenu';
import ThreeDotsMenu from '@components/ThreeDotsMenu';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePreferredPolicy from '@hooks/usePreferredPolicy';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearCopyPolicySettings} from '@libs/actions/Policy/CopyPolicySettings';
import {callFunctionIfActionIsAllowed} from '@libs/actions/Session';
import Navigation from '@libs/Navigation/Navigation';
import shouldRenderTransferOwnerButton from '@libs/shouldRenderTransferOwnerButton';

import {setNameValuePair} from '@userActions/User';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {canDowngradeSelector} from '@src/selectors/Account';
import {createOwnedPaidPoliciesCountsSelector} from '@src/selectors/Policy';

import type {ValueOf} from 'type-fest';

import {useIsFocused} from '@react-navigation/core';
import React, {useEffect, useRef, useState} from 'react';

import type {WorkspaceRowData} from '.';

import LeaveWorkspaceFlow from './LeaveWorkspaceFlow';
import TransferOwnershipFlow from './TransferOwnershipFlow';

type ActiveAction = ValueOf<typeof CONST.POLICY.THREE_DOT_MENU_ACTION>;

type WorkspaceRowThreeDotsMenuProps = {
    /** The workspace row the menu is rendered for */
    item: WorkspaceRowData;

    /** Called when the user picks Delete, so the page can mount the delete flow */
    onDeleteWorkspace: (policyID: string) => void;

    /** ID of the workspace with a deletion in progress, if any */
    pendingDeletePolicyID?: string;
};

/**
 * Three-dots menu of a workspaces list row. It builds its menu items locally from cheap, mostly
 * primitive-valued subscriptions, and mounts the leave/transfer flows on demand so their heavier
 * subscriptions (the full policy entry) exist only while the corresponding action is in progress.
 */
function WorkspaceRowThreeDotsMenu({item, onDeleteWorkspace, pendingDeletePolicyID}: WorkspaceRowThreeDotsMenuProps) {
    const threeDotsMenuRef = useRef<{hidePopoverMenu: () => void; isPopupMenuVisible: boolean}>(null);
    const styles = useThemeStyles();
    const isFocused = useIsFocused();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Building', 'Exit', 'Plus', 'Copy', 'Star', 'Trashcan', 'Transfer']);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const {isBetaEnabled} = usePermissions();
    const {isRestrictedToPreferredPolicy, preferredPolicyID} = usePreferredPolicy();
    const [canRenderTransferOwnerButton] = useOnyx(ONYXKEYS.FUND_LIST, {selector: shouldRenderTransferOwnerButton});

    // Primitive-valued subscriptions configuring the Delete menu item (popover behavior and the loading spinner)
    // before a deletion starts. The deletion itself is handled by DeleteWorkspaceFlow, mounted by the page.
    const [canDowngrade] = useOnyx(ONYXKEYS.ACCOUNT, {selector: canDowngradeSelector});
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [isLoadingBill] = useOnyx(ONYXKEYS.IS_LOADING_BILL_WHEN_DOWNGRADE);
    const [ownedPaidPoliciesCounts] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: createOwnedPaidPoliciesCountsSelector(currentUserPersonalDetails.accountID)}, [
        currentUserPersonalDetails.accountID,
    ]);
    const shouldCalculateBillNewDot = !!canDowngrade && ownedPaidPoliciesCounts?.total === 1;
    const wouldBlockDeletion = (amountOwed ?? 0) > 0 && ownedPaidPoliciesCounts?.active === 1;

    const [activeAction, setActiveAction] = useState<ActiveAction>();

    useEffect(() => {
        if (isLoadingBill) {
            return;
        }

        if (!threeDotsMenuRef.current?.isPopupMenuVisible) {
            return;
        }
        threeDotsMenuRef?.current?.hidePopoverMenu();
    }, [isLoadingBill]);

    const isDefault = activePolicyID === item.policyID;
    const isOwner = item.ownerAccountID === currentUserPersonalDetails.accountID;
    const isAdmin = item.role === CONST.POLICY.ROLE.ADMIN;

    const menuItems: PopoverMenuItem[] = [
        {
            icon: icons.Building,
            text: translate('workspace.common.goToWorkspace'),
            onSelected: item.action,
        },
    ];

    if (!isOwner && (item.policyID !== preferredPolicyID || !isRestrictedToPreferredPolicy)) {
        menuItems.push({
            icon: icons.Exit,
            text: translate('common.leave'),
            onSelected: callFunctionIfActionIsAllowed(() => setActiveAction(CONST.POLICY.THREE_DOT_MENU_ACTION.LEAVE)),
            shouldCallAfterModalHide: true,
        });
    }

    if (isAdmin) {
        menuItems.push({
            icon: icons.Plus,
            text: translate('workspace.common.duplicateWorkspace'),
            onSelected: () => (item.policyID ? Navigation.navigate(ROUTES.WORKSPACE_DUPLICATE.getRoute(item.policyID)) : undefined),
        });
        if (item.isEligibleToCopy && isBetaEnabled(CONST.BETAS.BULK_EDIT_WORKSPACES)) {
            menuItems.push({
                icon: icons.Copy,
                text: translate('workspace.copyPolicySettings.title'),
                onSelected: () => {
                    if (!item.policyID) {
                        return;
                    }
                    clearCopyPolicySettings();
                    Navigation.navigate(ROUTES.POLICY_COPY_SETTINGS.getRoute(item.policyID));
                },
            });
        }
    }

    if (!isDefault && !item?.isJoinRequestPending && !isRestrictedToPreferredPolicy) {
        menuItems.push({
            icon: icons.Star,
            text: translate('workspace.common.setAsDefault'),
            onSelected: () => {
                if (!item.policyID || !activePolicyID) {
                    return;
                }
                setNameValuePair(ONYXKEYS.NVP_ACTIVE_POLICY_ID, item.policyID, activePolicyID);
            },
        });
    }

    if (isOwner) {
        menuItems.push({
            icon: icons.Trashcan,
            text: translate('workspace.common.delete'),
            shouldShowLoadingSpinnerIcon: !!isLoadingBill && pendingDeletePolicyID === item.policyID,
            onSelected: () => {
                if (isLoadingBill) {
                    return;
                }

                // All the pre-deletion checks and the confirmation modal are handled by DeleteWorkspaceFlow, mounted by the page.
                onDeleteWorkspace(item.policyID);
            },
            shouldKeepModalOpen: shouldCalculateBillNewDot && !wouldBlockDeletion,
            shouldCallAfterModalHide: !shouldCalculateBillNewDot || wouldBlockDeletion,
        });
    }

    if (isAdmin && !isOwner && canRenderTransferOwnerButton) {
        menuItems.push({
            icon: icons.Transfer,
            text: translate('workspace.people.transferOwner'),
            onSelected: () => setActiveAction(CONST.POLICY.THREE_DOT_MENU_ACTION.TRANSFER_OWNERSHIP),
            shouldCallAfterModalHide: true,
        });
    }

    return (
        <>
            <ThreeDotsMenu
                isNested
                shouldOverlay
                shouldSelfPosition
                disabled={item.disabled}
                isContainerFocused={isFocused}
                threeDotsMenuRef={threeDotsMenuRef}
                menuItems={menuItems}
                iconStyles={styles.h7}
                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.LIST.THREE_DOT_MENU}
                anchorAlignment={{horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT, vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP}}
            />
            {activeAction === CONST.POLICY.THREE_DOT_MENU_ACTION.LEAVE && (
                <LeaveWorkspaceFlow
                    policyID={item.policyID}
                    onDismiss={() => setActiveAction(undefined)}
                />
            )}
            {activeAction === CONST.POLICY.THREE_DOT_MENU_ACTION.TRANSFER_OWNERSHIP && (
                <TransferOwnershipFlow
                    policyID={item.policyID}
                    onDismiss={() => setActiveAction(undefined)}
                />
            )}
        </>
    );
}

export default WorkspaceRowThreeDotsMenu;
