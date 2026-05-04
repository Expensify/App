import {defaultExpensifyCardSelector} from '@selectors/Card';
import {validTransactionDraftIDsSelector} from '@selectors/TransactionDraft';
import {useCallback, useEffect, useMemo, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {areAllGroupPoliciesExpenseChatDisabled} from '@libs/PolicyUtils';
import {createTypeMenuSections, doesSearchItemMatchSort} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {IntroSelected, Policy, Session} from '@src/types/onyx';
import useCardFeedsForDisplay from './useCardFeedsForDisplay';
import useCreateEmptyReportConfirmation from './useCreateEmptyReportConfirmation';
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
    };

const currentUserLoginAndAccountIDSelector = (session: OnyxEntry<Session>) => ({
    email: session?.email,
    accountID: session?.accountID,
});

const isTrackIntentUserSelector = (introSelected: OnyxEntry<IntroSelected>) =>
    introSelected?.choice === CONST.ONBOARDING_CHOICES.PERSONAL_SPEND || introSelected?.choice === CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE;

type UseSearchTypeMenuSectionsParams = {
    hash?: number;
    similarSearchHash?: number;
    sortBy?: string;
    sortOrder?: string;
    type?: string;
};

/**
 * Get a list of all search groupings, along with their search items. Also returns the
 * currently focused search, based on the hash
 */
const useSearchTypeMenuSections = (queryParams?: UseSearchTypeMenuSectionsParams) => {
    const {hash, similarSearchHash, sortBy, sortOrder, type} = queryParams ?? {};
    const [defaultExpensifyCard] = useOnyx(ONYXKEYS.DERIVED.NON_PERSONAL_AND_WORKSPACE_CARD_LIST, {selector: defaultExpensifyCardSelector});

    const {defaultCardFeed, cardFeedsByPolicy} = useCardFeedsForDisplay();

    const {isOffline} = useNetwork();
    const [allPolicies] = useMappedPolicies(policyMapper);
    const [currentUserLoginAndAccountID] = useOnyx(ONYXKEYS.SESSION, {selector: currentUserLoginAndAccountIDSelector});
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES);
    const shouldRedirectToExpensifyClassic = useMemo(() => areAllGroupPoliciesExpenseChatDisabled(allPolicies ?? {}), [allPolicies]);
    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
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
                shouldRedirectToExpensifyClassic,
                draftTransactionIDs,
                isTrackIntentUser: isTrackIntentUser ?? false,
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
            shouldRedirectToExpensifyClassic,
            draftTransactionIDs,
            isTrackIntentUser,
        ],
    );

    const activeItemIndex = useMemo(() => {
        const isSavedSearchActive = hash !== undefined && !!savedSearches && Object.keys(savedSearches).some((key) => Number(key) === hash);

        if (isSavedSearchActive) {
            return -1;
        }

        let index = 0;
        for (const section of typeMenuSections) {
            const found = section.menuItems.findIndex((item) => {
                if (item.similarSearchHash !== similarSearchHash) {
                    return false;
                }
                return doesSearchItemMatchSort(item.key, item.searchQueryJSON?.sortBy, item.searchQueryJSON?.sortOrder, sortBy, sortOrder);
            });
            if (found !== -1) {
                return index + found;
            }
            index += section.menuItems.length;
        }

        // Fallback: if no exact match found, select the generic search key matching the type
        const typeToGenericKey: Record<string, string> = {
            [CONST.SEARCH.DATA_TYPES.EXPENSE]: CONST.SEARCH.SEARCH_KEYS.EXPENSES,
            [CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT]: CONST.SEARCH.SEARCH_KEYS.REPORTS,
        };
        const fallbackKey = type ? typeToGenericKey[type] : undefined;
        if (fallbackKey) {
            let fallbackIndex = 0;
            for (const section of typeMenuSections) {
                const found = section.menuItems.findIndex((item) => item.key === fallbackKey);
                if (found !== -1) {
                    return fallbackIndex + found;
                }
                fallbackIndex += section.menuItems.length;
            }
        }

        return -1;
    }, [typeMenuSections, savedSearches, hash, similarSearchHash, sortBy, sortOrder, type]);

    return {
        typeMenuSections,
        activeItemIndex,
    };
};

export default useSearchTypeMenuSections;
