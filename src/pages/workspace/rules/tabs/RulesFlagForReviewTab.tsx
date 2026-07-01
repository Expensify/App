import React, {useCallback, useEffect} from 'react';
import WorkspaceFlagForReviewTable from '@components/Tables/WorkspaceFlagForReviewTable';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import usePolicyData from '@hooks/usePolicyData';
import useThemeStyles from '@hooks/useThemeStyles';
import {openPolicyCategoriesPage} from '@libs/actions/Policy/Category';
import {deleteFlagForReviewRule, getFlagForReviewTableData} from '@libs/FlagForReviewRulesUtils';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import RulesTabEmptyState from './RulesTabEmptyState';
import type RulesTableTabActions from './types';

type RulesFlagForReviewTabProps = {
    policyID: string;
    canWriteRules: boolean;
    selectedKeys: string[];
    onSelectionChange: (selectedRowKeys: string[]) => void;
    onActionsChange: (actions: RulesTableTabActions | null) => void;
    onClearSelection: () => void;
    showReadOnlyModal: () => void;
};

function RulesFlagForReviewTab({policyID, canWriteRules, selectedKeys, onSelectionChange, onActionsChange, onClearSelection, showReadOnlyModal}: RulesFlagForReviewTabProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['SortingMachine']);
    const policy = usePolicy(policyID);
    const policyData = usePolicyData(policyID);
    const {convertToDisplayString} = useCurrencyListActions();
    const [policyCategoriesOnyx] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const arePolicyCategoriesLoading = !!policy?.areCategoriesEnabled && policyCategoriesOnyx === undefined;

    useEffect(() => {
        if (!policy?.areCategoriesEnabled || policyCategoriesOnyx !== undefined) {
            return;
        }

        openPolicyCategoriesPage(policyID);
    }, [policy?.areCategoriesEnabled, policyCategoriesOnyx, policyID]);

    const flagForReviewTableData = getFlagForReviewTableData({
        policy,
        policyCategories: arePolicyCategoriesLoading ? undefined : policyData.categories,
        translate,
        convertToDisplayString,
        isOffline,
        onNavigate: Navigation.navigate,
    });
    const validKeys = new Set(flagForReviewTableData.filter((rule) => !rule.disabled).map((rule) => rule.keyForList));
    const filteredSelectedKeys = canWriteRules ? selectedKeys.filter((key) => validKeys.has(key)) : [];

    const deleteSelected = useCallback(() => {
        for (const categoryName of filteredSelectedKeys) {
            deleteFlagForReviewRule(policyID, categoryName, policyData.categories);
        }
        onClearSelection();
    }, [filteredSelectedKeys, onClearSelection, policyData.categories, policyID]);

    useEffect(() => {
        onActionsChange({filteredSelectedKeys, deleteSelected});

        return () => onActionsChange(null);
    }, [deleteSelected, filteredSelectedKeys, onActionsChange]);

    const handleNewFlagForReviewRule = () => {
        if (!canWriteRules) {
            showReadOnlyModal();
            return;
        }
        Navigation.navigate(ROUTES.RULES_FLAG_FOR_REVIEW_RULE_NEW.getRoute(policyID));
    };

    const flagForReviewEmptyState = (
        <RulesTabEmptyState
            illustration={illustrations.SortingMachine}
            headerContentStyles={styles.sortingMachineRulesEmptyStateIllustration}
            title={translate('workspace.rules.flagForReviewEmptyState.title')}
            subtitle={translate('workspace.rules.flagForReviewEmptyState.subtitle')}
            buttonText={translate('workspace.rules.flagForReviewEmptyState.cta')}
            onPress={handleNewFlagForReviewRule}
            isDisabled={!canWriteRules}
        />
    );

    return (
        <WorkspaceFlagForReviewTable
            rulesData={flagForReviewTableData}
            selectionEnabled={canWriteRules}
            selectedKeys={filteredSelectedKeys}
            onRowSelectionChange={onSelectionChange}
            emptyStateContent={arePolicyCategoriesLoading ? undefined : flagForReviewEmptyState}
        />
    );
}

export default RulesFlagForReviewTab;
