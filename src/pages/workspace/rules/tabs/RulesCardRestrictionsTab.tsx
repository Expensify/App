import React, {useCallback, useEffect, useRef} from 'react';
import type {SpendRuleTableItem} from '@components/Tables/WorkspaceSpendRulesTable';
import WorkspaceSpendRulesTable from '@components/Tables/WorkspaceSpendRulesTable';
import useConfirmModal from '@hooks/useConfirmModal';
import useDefaultFundID from '@hooks/useDefaultFundID';
import useExpensifyCardRules from '@hooks/useExpensifyCardRulesList';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {deleteExpensifyCardRule} from '@libs/actions/Card';
import {enableExpensifyCard, openPolicyExpensifyCardsPage} from '@libs/actions/Policy/Policy';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import RulesTabEmptyState from './RulesTabEmptyState';
import type RulesTableTabActions from './types';

const DEFAULT_SPEND_RULE_ID = 'default-rule';

type RulesCardRestrictionsTabProps = {
    policyID: string;
    canWriteRules: boolean;
    selectedKeys: string[];
    onSelectionChange: (selectedRowKeys: string[]) => void;
    onActionsChange: (actions: RulesTableTabActions | null) => void;
    onClearSelection: () => void;
};

function RulesCardRestrictionsTab({policyID, canWriteRules, selectedKeys, onSelectionChange, onActionsChange, onClearSelection}: RulesCardRestrictionsTabProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const illustrations = useMemoizedLazyIllustrations(['ExpensifyCardCoins', 'ExpensifyCardProtectionIllustration']);
    const {showConfirmModal} = useConfirmModal();
    const policy = usePolicy(policyID);
    const {canWrite: canWriteMoreFeatures, showReadOnlyModal: showMoreFeaturesReadOnlyModal} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.MORE_FEATURES);
    const defaultFundID = useDefaultFundID(policyID);
    const [expensifyCardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${defaultFundID}`);
    const {cardRules} = useExpensifyCardRules(policyID);
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
    const validKeys = new Set(spendRulesTableData.filter((rule) => !rule.disabled).map((rule) => rule.keyForList));
    const filteredSelectedKeys = canWriteRules ? selectedKeys.filter((key) => validKeys.has(key)) : [];

    const deleteSelected = useCallback(() => {
        if (!defaultFundID || defaultFundID === CONST.DEFAULT_NUMBER_ID) {
            return;
        }

        for (const ruleID of filteredSelectedKeys) {
            if (ruleID === DEFAULT_SPEND_RULE_ID) {
                continue;
            }

            const existingRule = expensifyCardSettings?.cardRules?.[ruleID];
            if (!existingRule) {
                continue;
            }

            deleteExpensifyCardRule(defaultFundID, ruleID, existingRule);
        }
        onClearSelection();
    }, [defaultFundID, expensifyCardSettings?.cardRules, filteredSelectedKeys, onClearSelection]);

    useEffect(() => {
        onActionsChange({filteredSelectedKeys, deleteSelected});

        return () => onActionsChange(null);
    }, [deleteSelected, filteredSelectedKeys, onActionsChange]);

    const handleGetExpensifyCardPress = () => {
        if (!canWriteMoreFeatures) {
            showMoreFeaturesReadOnlyModal();
            return;
        }

        enableExpensifyCard(policyID, true, true);
    };

    const cardRulesEmptyState = (
        <RulesTabEmptyState
            illustration={illustrations.ExpensifyCardCoins}
            headerContentStyles={shouldUseNarrowLayout ? styles.expensifyCardEmptyIllustration : styles.cardRulesEmptyStateIllustration}
            title={translate('workspace.rules.spendRules.cardRulesUpsell.title')}
            subtitle={translate('workspace.rules.spendRules.cardRulesUpsell.subtitle')}
            buttonText={translate('workspace.rules.spendRules.cardRulesUpsell.cta')}
            onPress={handleGetExpensifyCardPress}
            isDisabled={!canWriteMoreFeatures}
        />
    );

    return (
        <WorkspaceSpendRulesTable
            rulesData={areCardsEnabled ? spendRulesTableData : []}
            selectionEnabled={canWriteRules}
            selectedKeys={filteredSelectedKeys}
            onRowSelectionChange={onSelectionChange}
            emptyStateContent={areCardsEnabled ? undefined : cardRulesEmptyState}
        />
    );
}

export default RulesCardRestrictionsTab;
