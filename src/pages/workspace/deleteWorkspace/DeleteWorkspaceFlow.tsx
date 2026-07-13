import {ModalActions} from '@components/Modal/Global/ModalContext';
import RenderHTML from '@components/RenderHTML';

import useCardFeeds from '@hooks/useCardFeeds';
import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useOutstandingBalanceGuard from '@hooks/useOutstandingBalanceGuard';
import usePayAndDowngrade from '@hooks/usePayAndDowngrade';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionViolationOfWorkspace from '@hooks/useTransactionViolationOfWorkspace';

import {calculateBillNewDot, deleteWorkspace, dismissWorkspaceError} from '@libs/actions/Policy/Policy';
import {filterInactiveCards} from '@libs/CardUtils';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {isPendingDeletePolicy, shouldBlockWorkspaceDeletionForInvoicifyUser} from '@libs/PolicyUtils';
import {isSubscriptionTypeOfInvoicing} from '@libs/SubscriptionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import {canDowngradeSelector} from '@src/selectors/Account';
import {accountIDToLoginSelector} from '@src/selectors/PersonalDetails';
import {createOwnedPaidPoliciesCountsSelector} from '@src/selectors/Policy';
import {reimbursementAccountErrorSelector} from '@src/selectors/ReimbursementAccount';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import {useIsFocused} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';

const HTML_TAG_PATTERN = /<\/?[a-z][^>]*>/i;

type DeleteWorkspaceFlowProps = {
    /** ID of the workspace being deleted */
    policyID: string;

    /** Called when the flow is finished or abandoned, so the parent can unmount this component */
    onDismiss: () => void;

    /** Called when the workspace has been deleted (optimistically while offline, or after a successful online delete) */
    onDeleteComplete?: () => void;
};

/**
 * Self-contained workspace deletion flow. It is mounted only while a deletion is in progress, so all of the
 * Onyx data needed to delete a workspace (full policy and report collections, card feeds, violations, etc.)
 * is subscribed to only for the lifetime of the flow instead of re-rendering the workspaces list in the background.
 *
 * On mount (once the data is ready) it runs the pre-deletion checks (Invoicify block, outstanding balance,
 * bill calculation for the last paid workspace) and then shows the delete confirmation modal.
 */
function DeleteWorkspaceFlow({policyID, onDismiss, onDeleteComplete}: DeleteWorkspaceFlowProps) {
    const {translate, localeCompare} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const isFocused = useIsFocused();
    const {showConfirmModal, closeModal} = useConfirmModal();

    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [policies, policiesResult] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [lastPaymentMethod] = useOnyx(ONYXKEYS.NVP_LAST_PAYMENT_METHOD);
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID);
    const [lastAccessedWorkspacePolicyID] = useOnyx(ONYXKEYS.LAST_ACCESSED_WORKSPACE_POLICY_ID);
    const [reimbursementAccountError] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {selector: reimbursementAccountErrorSelector});
    const [privateSubscription, privateSubscriptionResult] = useOnyx(ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION);
    const [canDowngrade, accountResult] = useOnyx(ONYXKEYS.ACCOUNT, {selector: canDowngradeSelector});
    const [, amountOwedResult] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const ownedPaidPoliciesCountsSelector = createOwnedPaidPoliciesCountsSelector(session?.accountID);
    const ownedPaidPoliciesCounts = ownedPaidPoliciesCountsSelector(policies);

    const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];

    // We need this to update translation for deleting a workspace when it has third party card feeds or expensify card assigned.
    const workspaceAccountID = policy?.policyAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const [cardFeeds, cardFeedsResult, defaultCardFeeds] = useCardFeeds(policyID);
    const [lastSelectedFeed] = useOnyx(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${policyID}`);
    const [lastSelectedExpensifyCardFeed] = useOnyx(`${ONYXKEYS.COLLECTION.LAST_SELECTED_EXPENSIFY_CARD_FEED}${policyID}`);
    const [cardsList, cardsListResult] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${CONST.EXPENSIFY_CARD.BANK}`, {
        selector: filterInactiveCards,
    });
    const {reportsToArchive, transactionViolations, reportsResult, transactionsResult, transactionViolationsResult} = useTransactionViolationOfWorkspace(policyID);
    const [accountIDToLogin] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: accountIDToLoginSelector(reportsToArchive)});

    const isLoadingData = isLoadingOnyxValue(
        policiesResult,
        accountResult,
        amountOwedResult,
        privateSubscriptionResult,
        cardFeedsResult,
        cardsListResult,
        reportsResult,
        transactionsResult,
        transactionViolationsResult,
    );

    const hasCardFeedOrExpensifyCard =
        !isEmptyObject(cardFeeds) ||
        !isEmptyObject(cardsList) ||
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        ((policy?.areExpensifyCardsEnabled || policy?.areCompanyCardsEnabled) && policy?.policyAccountID);
    // While offline we can't get the real rejection reason from the backend, so if we already know locally that the workspace has active Expensify Cards, block the delete up front instead of queuing one that will fail on reconnect.
    const hasDeleteWorkspaceExpensifyCardsError = !!policy?.areExpensifyCardsEnabled && !!policy?.policyAccountID && !isEmptyObject(cardsList) && !!isOffline;

    const policyLatestErrorMessage = getLatestErrorMessage(policy);
    const isPendingDelete = isPendingDeletePolicy(policy);
    const prevIsPendingDelete = usePrevious(isPendingDelete);

    const shouldCalculateBillNewDot = !!canDowngrade && ownedPaidPoliciesCounts?.total === 1;
    const {shouldBlockDeletion, outstandingBalanceModal} = useOutstandingBalanceGuard(ownedPaidPoliciesCounts?.active ?? 0, onDismiss);

    const hideDeleteWorkspaceErrorModal = useCallback(() => {
        dismissWorkspaceError(policyID, policy?.pendingAction);
    }, [policyID, policy?.pendingAction]);

    const dismissDeleteWorkspaceFlow = useCallback(() => {
        hideDeleteWorkspaceErrorModal();
        onDismiss();
    }, [hideDeleteWorkspaceErrorModal, onDismiss]);

    const showDeleteWorkspaceErrorModal = useCallback(
        (errorMessage: string) => {
            if (!isFocused) {
                dismissDeleteWorkspaceFlow();
                return;
            }

            const prompt = HTML_TAG_PATTERN.test(errorMessage) ? (
                <View style={[styles.renderHTML, styles.flexRow]}>
                    <RenderHTML
                        html={errorMessage}
                        onConciergeLinkPress={() => {
                            closeModal();
                            dismissDeleteWorkspaceFlow();
                        }}
                    />
                </View>
            ) : (
                errorMessage
            );

            showConfirmModal({
                title: translate('workspace.common.delete'),
                prompt,
                confirmText: translate('common.buttonConfirm'),
                shouldShowCancelButton: false,
                success: false,
                shouldHandleNavigationBack: false,
            }).then(() => {
                dismissDeleteWorkspaceFlow();
            });
        },
        [closeModal, dismissDeleteWorkspaceFlow, isFocused, showConfirmModal, styles.flexRow, styles.renderHTML, translate],
    );

    // Always invoked after a re-render (from the start effect below for normal deletes, or from usePayAndDowngrade for billed deletes),
    // so the workspace being deleted and its derived data are read from the latest state.
    const continueDeleteWorkspace = () => {
        const policyName = policy?.name;

        showConfirmModal({
            title: translate('workspace.common.delete'),
            prompt: hasCardFeedOrExpensifyCard ? translate('workspace.common.deleteWithCardsConfirmation') : translate('workspace.common.deleteConfirmation'),
            confirmText: translate('common.delete'),
            cancelText: translate('common.cancel'),
            danger: true,
            ...(hasDeleteWorkspaceExpensifyCardsError ? {} : {isConfirmLoading: isPendingDelete}),
        }).then((result) => {
            if (!policyName || result.action !== ModalActions.CONFIRM) {
                onDismiss();
                return;
            }

            deleteWorkspace({
                policies,
                policyID,
                activePolicyID,
                policyName,
                lastAccessedWorkspacePolicyID,
                policyCardFeeds: defaultCardFeeds,
                lastSelectedFeed,
                lastSelectedExpensifyCardFeed,
                reportsToArchive,
                transactionViolations,
                reimbursementAccountError,
                lastUsedPaymentMethods: lastPaymentMethod,
                localeCompare,
                personalPolicyID,
                hasDeleteWorkspaceExpensifyCardsError,
                currentUserAccountID: session?.accountID ?? CONST.DEFAULT_NUMBER_ID,
                accountIDToLogin: accountIDToLogin ?? {},
            });

            if (hasDeleteWorkspaceExpensifyCardsError) {
                showDeleteWorkspaceErrorModal(translate('workspace.common.deleteOpenExpensifyCardsError'));
            } else if (isOffline) {
                closeModal();
                onDeleteComplete?.();
                onDismiss();
            }
        });
    };

    const {setIsDeletingPaidWorkspace} = usePayAndDowngrade(continueDeleteWorkspace);

    // Runs the pre-deletion checks and opens the confirmation modal once all the Onyx data the flow depends on has loaded.
    const hasStartedRef = useRef(false);
    useEffect(() => {
        if (hasStartedRef.current || isLoadingData) {
            return;
        }
        hasStartedRef.current = true;

        if (shouldBlockWorkspaceDeletionForInvoicifyUser(isSubscriptionTypeOfInvoicing(privateSubscription?.type), policies, policyID, session?.accountID)) {
            Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.SUBSCRIPTION_DOWNGRADE_BLOCKED.path));
            onDismiss();
            return;
        }

        if (shouldBlockDeletion()) {
            // The outstanding balance modal is now visible and will call onDismiss when it is closed.
            return;
        }

        if (shouldCalculateBillNewDot) {
            setIsDeletingPaidWorkspace(true);
            calculateBillNewDot();
            return;
        }

        continueDeleteWorkspace();
    });

    useEffect(() => {
        if (isOffline) {
            return;
        }

        if (!prevIsPendingDelete || isPendingDelete) {
            return;
        }

        closeModal();

        if (policyLatestErrorMessage) {
            showDeleteWorkspaceErrorModal(policyLatestErrorMessage);
            return;
        }

        onDeleteComplete?.();
        onDismiss();
    }, [isOffline, isPendingDelete, prevIsPendingDelete, policyLatestErrorMessage, closeModal, onDeleteComplete, onDismiss, showDeleteWorkspaceErrorModal]);

    return outstandingBalanceModal;
}

export default DeleteWorkspaceFlow;
