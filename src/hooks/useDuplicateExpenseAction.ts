import {useCallback} from 'react';
import {duplicateExpenseTransaction as duplicateTransactionAction} from '@libs/actions/IOU/Duplicate';
import {generateReportID, getPolicyExpenseChat} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';
import useDefaultExpensePolicy from './useDefaultExpensePolicy';
import useOnyx from './useOnyx';
import usePermissions from './usePermissions';
import useThrottledButtonState from './useThrottledButtonState';

const useDuplicateExpenseAction = (accountID: number) => {
    const defaultExpensePolicy = useDefaultExpensePolicy();
    const activePolicyExpenseChat = getPolicyExpenseChat(accountID, defaultExpensePolicy?.id);
    const [allPolicyCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES, {canBeMissing: false});
    const [policyRecentlyUsedCurrencies] = useOnyx(ONYXKEYS.RECENTLY_USED_CURRENCIES, {canBeMissing: true});
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE, {canBeMissing: true});
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);

    const [isDuplicateActive, temporarilyDisableDuplicateAction] = useThrottledButtonState();

    const duplicateTransaction = useCallback(
        (transactions: Transaction[]) => {
            if (!transactions.length) {
                return;
            }

            const optimisticChatReportID = generateReportID();
            const optimisticIOUReportID = generateReportID();

            const activePolicyCategories = allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${defaultExpensePolicy?.id}`] ?? {};

            for (const item of transactions) {
                duplicateTransactionAction({
                    transaction: item,
                    optimisticChatReportID,
                    optimisticIOUReportID,
                    isASAPSubmitBetaEnabled,
                    introSelected,
                    activePolicyID,
                    quickAction,
                    policyRecentlyUsedCurrencies: policyRecentlyUsedCurrencies ?? [],
                    targetPolicy: defaultExpensePolicy ?? undefined,
                    targetPolicyCategories: activePolicyCategories,
                    targetReport: activePolicyExpenseChat,
                });
            }
        },
        [activePolicyExpenseChat, allPolicyCategories, defaultExpensePolicy, isASAPSubmitBetaEnabled, introSelected, activePolicyID, quickAction, policyRecentlyUsedCurrencies],
    );

    return {
        isDuplicateActive,
        temporarilyDisableDuplicateAction,
        duplicateTransaction,
    };
};

export default useDuplicateExpenseAction;
