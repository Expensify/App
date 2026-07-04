import type {ExpenseDefaultTableItem} from '@components/Tables/WorkspaceExpenseDefaultsTable';
import type {SpendRuleTableItem} from '@components/Tables/WorkspaceSpendRulesTable';

import useConfirmModal from '@hooks/useConfirmModal';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useDefaultFundID from '@hooks/useDefaultFundID';
import useExpensifyCardRules from '@hooks/useExpensifyCardRulesList';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import usePolicyData from '@hooks/usePolicyData';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {deleteExpensifyCardRule} from '@libs/actions/Card';
import {openPolicyCategoriesPage} from '@libs/actions/Policy/Category';
import {openPolicyExpensifyCardsPage} from '@libs/actions/Policy/Policy';
import {deletePolicyCodingRule} from '@libs/actions/Policy/Rules';
import {deleteFlagForReviewRule, getFlagForReviewTableData} from '@libs/FlagForReviewRulesUtils';
import {getExpenseDefaultsTableData, isMerchantTypeRuleKey} from '@libs/MerchantTypeRulesUtils';
import Navigation from '@libs/Navigation/Navigation';
import {deleteRequireFieldsRule, getRequireFieldsTableData} from '@libs/RequireFieldsRulesUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import type {ValueOf} from 'type-fest';

import {useCallback, useEffect, useRef} from 'react';

const DEFAULT_SPEND_RULE_ID = 'default-rule';
const RULES_TAB = CONST.TAB.RULES;

type RulesTab = ValueOf<typeof RULES_TAB>;
type TableSelectionTab = Exclude<RulesTab, typeof RULES_TAB.GENERAL>;

type UseRulesTableBulkActionsParams = {
    policyID: string;
    activeTab: RulesTab;
    selectedRuleKeysByTab: Partial<Record<TableSelectionTab, string[]>>;
    canWriteRules: boolean;
    clearTableSelection: () => void;
};

function isTableSelectionTab(tab: RulesTab): tab is TableSelectionTab {
    return tab !== RULES_TAB.GENERAL;
}

function useRulesTableBulkActions({policyID, activeTab, selectedRuleKeysByTab, canWriteRules, clearTableSelection}: UseRulesTableBulkActionsParams) {
    const {translate, localeCompare} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {showConfirmModal} = useConfirmModal();
    const illustrations = useMemoizedLazyIllustrations(['ExpensifyCardProtectionIllustration']);
    const {isOffline} = useNetwork();
    const policy = usePolicy(policyID);
    const policyData = usePolicyData(policyID);
    const {convertToDisplayString} = useCurrencyListActions();
    const defaultFundID = useDefaultFundID(policyID);
    const [expensifyCardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${defaultFundID}`);
    const {cardRules} = useExpensifyCardRules(policyID);
    const [policyCategoriesOnyx] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const arePolicyCategoriesLoading = !!policy?.areCategoriesEnabled && policyCategoriesOnyx === undefined;
    const areCardsEnabled = !!policy?.areExpensifyCardsEnabled;
    const attemptedCardSettingsFetchRef = useRef<Set<number>>(new Set());

    useEffect(() => {
        attemptedCardSettingsFetchRef.current.clear();
    }, [policyID]);

    useEffect(() => {
        if (!areCardsEnabled || !defaultFundID || defaultFundID === CONST.DEFAULT_NUMBER_ID) {
            return;
        }
        if (expensifyCardSettings?.isLoading) {
            return;
        }
        if (expensifyCardSettings?.hasOnceLoaded) {
            return;
        }
        if (attemptedCardSettingsFetchRef.current.has(defaultFundID)) {
            return;
        }

        attemptedCardSettingsFetchRef.current.add(defaultFundID);
        openPolicyExpensifyCardsPage(policyID, defaultFundID);
    }, [areCardsEnabled, defaultFundID, expensifyCardSettings?.hasOnceLoaded, expensifyCardSettings?.isLoading, policyID]);

    useEffect(() => {
        if (!policy?.areCategoriesEnabled || policyCategoriesOnyx !== undefined) {
            return;
        }

        openPolicyCategoriesPage(policyID);
    }, [policy?.areCategoriesEnabled, policyCategoriesOnyx, policyID]);

    const showBuiltInProtectionModal = () => {
        showConfirmModal({
            image: illustrations.ExpensifyCardProtectionIllustration,
            imageStyles: [styles.w100],
            shouldFitImageToContainer: true,
            title: translate('workspace.rules.spendRules.builtInProtectionModal.title'),
            titleStyles: [styles.textHeadlineH1],
            titleContainerStyles: [styles.mb3],
            prompt: translate('workspace.rules.spendRules.builtInProtectionModal.description'),
            promptStyles: [styles.mb1],
            shouldShowCancelButton: false,
            success: false,
            confirmText: translate('common.buttonConfirm'),
            innerContainerStyle: shouldUseNarrowLayout ? undefined : StyleUtils.getWidthStyle(variables.wideConfirmModalWidth),
        });
    };

    const blockLabel = translate('workspace.rules.spendRules.block');
    const defaultSpendRule: SpendRuleTableItem = {
        keyForList: DEFAULT_SPEND_RULE_ID,
        ruleID: DEFAULT_SPEND_RULE_ID,
        isDefault: true,
        isBlock: true,
        disabled: true,
        actionLabel: blockLabel,
        cardSummary: translate('workspace.rules.spendRules.defaultRuleDescription'),
        ruleSummary: translate('workspace.rules.spendRules.defaultRuleSummary'),
        searchTokens: [],
        action: showBuiltInProtectionModal,
    };
    const customSpendRules: SpendRuleTableItem[] = cardRules.map((rule) => {
        const ruleSummary = rule.summaryParts.map((part) => part.text).join(', ');
        return {
            keyForList: rule.ruleID,
            ruleID: rule.ruleID,
            isDefault: false,
            isBlock: rule.isBlock,
            actionLabel: rule.isBlock ? blockLabel : translate('workspace.rules.spendRules.allow'),
            cardSummary: rule.cardSummary,
            ruleSummary,
            searchTokens: rule.searchTokens,
            pendingAction: rule.pendingAction,
            disabled: rule.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            action: () => Navigation.navigate(ROUTES.RULES_SPEND_EDIT.getRoute(policyID, rule.ruleID)),
        };
    });
    const spendRulesTableData: SpendRuleTableItem[] = [defaultSpendRule, ...customSpendRules];

    const expenseDefaultsTableData: ExpenseDefaultTableItem[] = getExpenseDefaultsTableData({
        policy,
        policyID,
        translate,
        isOffline,
        onNavigate: Navigation.navigate,
    });

    const requireFieldsTableData = getRequireFieldsTableData({
        policy,
        policyCategories: arePolicyCategoriesLoading ? undefined : policyData.categories,
        translate,
        convertToDisplayString,
        localeCompare,
        onNavigate: Navigation.navigate,
    });

    const flagForReviewTableData = getFlagForReviewTableData({
        policy,
        policyCategories: arePolicyCategoriesLoading ? undefined : policyData.categories,
        translate,
        convertToDisplayString,
        isOffline,
        onNavigate: Navigation.navigate,
    });

    const validKeysByTab = {
        [RULES_TAB.CARD_RESTRICTIONS]: new Set(spendRulesTableData.filter((rule) => !rule.disabled).map((rule) => rule.keyForList)),
        [RULES_TAB.EXPENSE_DEFAULTS]: new Set(expenseDefaultsTableData.filter((rule) => !rule.disabled && !rule.isSelectionDisabled).map((rule) => rule.keyForList)),
        [RULES_TAB.REQUIRE_FIELDS]: new Set(requireFieldsTableData.filter((rule) => !rule.disabled).map((rule) => rule.keyForList)),
        [RULES_TAB.FLAG_FOR_REVIEW]: new Set(flagForReviewTableData.filter((rule) => !rule.disabled).map((rule) => rule.keyForList)),
    };

    const getFilteredSelectedKeys = (tab: TableSelectionTab) => {
        if (!canWriteRules) {
            return [];
        }

        const validKeys = validKeysByTab[tab];
        return (selectedRuleKeysByTab[tab] ?? []).filter((key) => validKeys.has(key));
    };

    const filteredSelectedSpendRuleKeys = getFilteredSelectedKeys(RULES_TAB.CARD_RESTRICTIONS);
    const filteredSelectedExpenseDefaultKeys = getFilteredSelectedKeys(RULES_TAB.EXPENSE_DEFAULTS);
    const filteredSelectedRequireFieldsRuleKeys = getFilteredSelectedKeys(RULES_TAB.REQUIRE_FIELDS);
    const filteredSelectedFlagForReviewRuleKeys = getFilteredSelectedKeys(RULES_TAB.FLAG_FOR_REVIEW);

    const selectedRuleKeys = isTableSelectionTab(activeTab) ? getFilteredSelectedKeys(activeTab) : [];

    const deleteSelectedForActiveTab = useCallback(() => {
        if (!isTableSelectionTab(activeTab)) {
            return;
        }

        if (activeTab === RULES_TAB.CARD_RESTRICTIONS) {
            if (!defaultFundID || defaultFundID === CONST.DEFAULT_NUMBER_ID) {
                return;
            }

            for (const ruleID of filteredSelectedSpendRuleKeys) {
                if (ruleID === DEFAULT_SPEND_RULE_ID) {
                    continue;
                }

                const existingRule = expensifyCardSettings?.cardRules?.[ruleID];
                if (!existingRule) {
                    continue;
                }

                deleteExpensifyCardRule(defaultFundID, ruleID, existingRule);
            }
            clearTableSelection();
            return;
        }

        if (activeTab === RULES_TAB.REQUIRE_FIELDS) {
            for (const ruleKey of filteredSelectedRequireFieldsRuleKeys) {
                deleteRequireFieldsRule(policyData, ruleKey);
            }
            clearTableSelection();
            return;
        }

        if (activeTab === RULES_TAB.FLAG_FOR_REVIEW) {
            for (const categoryName of filteredSelectedFlagForReviewRuleKeys) {
                deleteFlagForReviewRule(policyID, categoryName, policyData.categories);
            }
            clearTableSelection();
            return;
        }

        if (!policy) {
            return;
        }

        for (const ruleID of filteredSelectedExpenseDefaultKeys) {
            if (isMerchantTypeRuleKey(ruleID)) {
                continue;
            }

            deletePolicyCodingRule(policy, ruleID);
        }
        clearTableSelection();
    }, [
        activeTab,
        clearTableSelection,
        defaultFundID,
        expensifyCardSettings?.cardRules,
        filteredSelectedExpenseDefaultKeys,
        filteredSelectedFlagForReviewRuleKeys,
        filteredSelectedRequireFieldsRuleKeys,
        filteredSelectedSpendRuleKeys,
        policy,
        policyData,
        policyID,
    ]);

    return {
        selectedRuleKeys,
        getFilteredSelectedKeys,
        deleteSelectedForActiveTab,
    };
}

export default useRulesTableBulkActions;
