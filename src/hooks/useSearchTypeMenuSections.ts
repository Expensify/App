import {createTypeMenuSections} from '@libs/SearchUIUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import {isTrackIntentUserSelector} from '@src/selectors/Onboarding';
import type {Policy, Session} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {defaultExpensifyCardSelector} from '@selectors/Card';
import {validTransactionDraftIDsSelector} from '@selectors/TransactionDraft';
import {useCallback, useEffect, useMemo, useState} from 'react';

import useCardFeedsForDisplay from './useCardFeedsForDisplay';
import useCreateEmptyReportConfirmation from './useCreateEmptyReportConfirmation';
import useHasReportAwaitingApproval from './useHasReportAwaitingApproval';
import useMappedPolicies from './useMappedPolicies';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';

const policyMapper = (policy: OnyxEntry<Policy>): OnyxEntry<Policy> =>
    policy && {
        id: policy.id,
        name: policy.name,
        type: policy.type,
        role: policy.role,
        owner: policy.owner,
        connections: policy.connections,
        outputCurrency: policy.outputCurrency,
        isPolicyExpenseChatEnabled: policy.isPolicyExpenseChatEnabled,
        isJoinRequestPending: policy.isJoinRequestPending,
        pendingAction: policy.pendingAction,
        errors: policy.errors,
        reimburser: policy.reimburser,
        exporter: policy.exporter,
        approver: policy.approver,
        approvalMode: policy.approvalMode,
        employeeList: policy.employeeList,
        reimbursementChoice: policy.reimbursementChoice,
        areCompanyCardsEnabled: policy.areCompanyCardsEnabled,
        areExpensifyCardsEnabled: policy.areExpensifyCardsEnabled,
        achAccount: policy.achAccount,
        areCategoriesEnabled: policy.areCategoriesEnabled,
        areWorkflowsEnabled: policy.areWorkflowsEnabled,
    };

const currentUserLoginAndAccountIDSelector = (session: OnyxEntry<Session>) => ({
    email: session?.email,
    accountID: session?.accountID,
});

/**
 * Get a list of all search groupings, along with their search items.
 *
 * `isScreenFocused` gates the reports-awaiting-approval watch so an off-screen consumer stops recomputing it. It
 * defaults to `true` (always watch) for consumers rendered outside a navigator or where focus can't be tracked
 * reliably, so this hook never depends on a navigation context itself.
 */
const useSearchTypeMenuSections = (isScreenFocused = true) => {
    const [defaultExpensifyCard] = useOnyx(ONYXKEYS.DERIVED.NON_PERSONAL_AND_WORKSPACE_CARD_LIST, {selector: defaultExpensifyCardSelector});

    const {defaultCardFeed, cardFeedsByPolicy} = useCardFeedsForDisplay();

    const {isOffline} = useNetwork();
    const [allPolicies] = useMappedPolicies(policyMapper);
    const [currentUserLoginAndAccountID] = useOnyx(ONYXKEYS.SESSION, {selector: currentUserLoginAndAccountIDSelector});
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES);
    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});

    // A report awaiting the current user's approval makes the "Needs approval" suggested search relevant even when they
    // are not part of the policy's approval workflow (e.g. an approver chosen manually on a single report).
    const hasReportAwaitingApproval = useHasReportAwaitingApproval(isScreenFocused);
    const [pendingReportCreation, setPendingReportCreation] = useState<{policyID: string; policyName?: string; onConfirm: (shouldDismissEmptyReportsConfirmation: boolean) => void} | null>(
        null,
    );

    const handlePendingConfirm = useCallback(
        (shouldDismissEmptyReportsConfirmation: boolean) => {
            pendingReportCreation?.onConfirm(shouldDismissEmptyReportsConfirmation);
            setPendingReportCreation(null);
        },
        [pendingReportCreation, setPendingReportCreation],
    );

    const handlePendingCancel = useCallback(() => {
        setPendingReportCreation(null);
    }, [setPendingReportCreation]);

    const {openCreateReportConfirmation} = useCreateEmptyReportConfirmation({
        policyID: pendingReportCreation?.policyID,
        policyName: pendingReportCreation?.policyName ?? '',
        onConfirm: handlePendingConfirm,
        onCancel: handlePendingCancel,
    });

    useEffect(() => {
        if (!pendingReportCreation) {
            return;
        }
        openCreateReportConfirmation();
    }, [pendingReportCreation, openCreateReportConfirmation]);

    const typeMenuSections = useMemo(
        () =>
            createTypeMenuSections({
                currentUserEmail: currentUserLoginAndAccountID?.email,
                currentUserAccountID: currentUserLoginAndAccountID?.accountID,
                cardFeedsByPolicy,
                defaultCardFeed: defaultCardFeed ?? defaultExpensifyCard,
                policies: allPolicies,
                savedSearches,
                isOffline,
                defaultExpensifyCard,
                draftTransactionIDs,
                isTrackIntentUser: isTrackIntentUser ?? false,
                hasReportAwaitingApproval,
            }),
        [
            currentUserLoginAndAccountID?.email,
            currentUserLoginAndAccountID?.accountID,
            cardFeedsByPolicy,
            defaultCardFeed,
            defaultExpensifyCard,
            allPolicies,
            savedSearches,
            isOffline,
            draftTransactionIDs,
            isTrackIntentUser,
            hasReportAwaitingApproval,
        ],
    );

    return typeMenuSections;
};

export default useSearchTypeMenuSections;
