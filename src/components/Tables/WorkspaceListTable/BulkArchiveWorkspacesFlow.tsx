import {ModalActions} from '@components/Modal/Global/ModalContext';

import useConfirmModal from '@hooks/useConfirmModal';
import useFeedKeysWithAssignedCards from '@hooks/useFeedKeysWithAssignedCards';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {close} from '@libs/actions/Modal';
import {queueBulkArchivePolicy} from '@libs/actions/Policy/Policy';
import {getCardFeedsForDisplayPerPolicy} from '@libs/CardFeedUtils';
import {filterInactiveCards} from '@libs/CardUtils';
import {getBulkActionSkippedWarning, getBulkArchiveWorkspacesWarnings} from '@libs/WorkspacesSettingsUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import React, {useEffect, useRef} from 'react';

import type {WorkspaceRowData} from '.';

import BulkActionConfirmationPrompt from './BulkActionConfirmationPrompt';

type BulkArchiveWorkspacesFlowProps = {
    /** Every selected workspace, including the ones the user can't archive */
    selectedRows: WorkspaceRowData[];

    /** IDs of the selected workspaces the user can archive */
    policyIDs: string[];

    /** Called after the user confirms archiving */
    onConfirm: () => void;

    /** Called when the flow is finished or abandoned, so the parent can unmount this component */
    onDismiss: () => void;
};

/**
 * Archive flow for several workspaces at once. Like ArchiveWorkspaceFlow, it subscribes to the policies and card data only while it is mounted.
 */
function BulkArchiveWorkspacesFlow({selectedRows, policyIDs, onConfirm, onDismiss}: BulkArchiveWorkspacesFlowProps) {
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [allCardFeeds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER);
    const [allCardsLists] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST);
    const feedKeysWithCards = useFeedKeysWithAssignedCards();

    const hasStartedRef = useRef(false);
    useEffect(() => {
        if (hasStartedRef.current) {
            return;
        }
        hasStartedRef.current = true;

        close(() => {
            const cardFeedsPerPolicy = getCardFeedsForDisplayPerPolicy(allCardFeeds, translate, feedKeysWithCards, policies);
            const rowsToArchive = selectedRows.filter((row) => policyIDs.includes(row.policyID));
            const skippedWorkspaces = selectedRows.filter((row) => !policyIDs.includes(row.policyID)).map((row) => ({policyID: row.policyID, name: row.title}));

            const warnings = getBulkArchiveWorkspacesWarnings(
                rowsToArchive.map((row) => {
                    const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${row.policyID}`];
                    const hasPolicyAccount = !!policy?.policyAccountID;
                    const expensifyCards = filterInactiveCards(allCardsLists?.[`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${policy?.policyAccountID}_${CONST.EXPENSIFY_CARD.BANK}`]);
                    return {
                        policyID: row.policyID,
                        name: row.title,
                        hasExpensifyCards: !!policy?.areExpensifyCardsEnabled && hasPolicyAccount,
                        hasCards:
                            !!cardFeedsPerPolicy[row.policyID]?.length ||
                            !isEmptyObject(expensifyCards) ||
                            (!!(policy?.areExpensifyCardsEnabled || policy?.areCompanyCardsEnabled) && hasPolicyAccount),
                    };
                }),
                translate,
            );
            const skippedWarning = getBulkActionSkippedWarning(policyIDs.length, selectedRows.length, skippedWorkspaces, translate);
            const allWarnings = skippedWarning ? [...warnings, skippedWarning] : warnings;

            showConfirmModal({
                title: translate('workspace.common.archiveWorkspacesTitle', {count: policyIDs.length}),
                prompt: allWarnings.length > 0 ? <BulkActionConfirmationPrompt warnings={allWarnings} /> : undefined,
                confirmText: translate('common.archive'),
                cancelText: translate('common.cancel'),
                buttonVariant: CONST.BUTTON_VARIANT.DANGER,
                shouldEnablePromptScroll: true,
            }).then((result) => {
                if (result.action === ModalActions.CONFIRM) {
                    queueBulkArchivePolicy(policyIDs);
                    onConfirm();
                }
                onDismiss();
            });
        });
    });

    return null;
}

export default BulkArchiveWorkspacesFlow;
