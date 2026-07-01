import React, {useCallback, useEffect} from 'react';
import WorkspaceRequireFieldsTable from '@components/Tables/WorkspaceRequireFieldsTable';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import usePolicyData from '@hooks/usePolicyData';
import useThemeStyles from '@hooks/useThemeStyles';
import {openPolicyCategoriesPage} from '@libs/actions/Policy/Category';
import Navigation from '@libs/Navigation/Navigation';
import {deleteRequireFieldsRule, getRequireFieldsTableData} from '@libs/RequireFieldsRulesUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import RulesTabEmptyState from './RulesTabEmptyState';
import type RulesTableTabActions from './types';

type RulesRequireFieldsTabProps = {
    policyID: string;
    canWriteRules: boolean;
    selectedKeys: string[];
    onSelectionChange: (selectedRowKeys: string[]) => void;
    onActionsChange: (actions: RulesTableTabActions | null) => void;
    onClearSelection: () => void;
    showReadOnlyModal: () => void;
};

function RulesRequireFieldsTab({policyID, canWriteRules, selectedKeys, onSelectionChange, onActionsChange, onClearSelection, showReadOnlyModal}: RulesRequireFieldsTabProps) {
    const {translate, localeCompare} = useLocalize();
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

    const requireFieldsTableData = getRequireFieldsTableData({
        policy,
        policyCategories: arePolicyCategoriesLoading ? undefined : policyData.categories,
        translate,
        convertToDisplayString,
        localeCompare,
        isOffline,
        onNavigate: Navigation.navigate,
    });
    const validKeys = new Set(requireFieldsTableData.filter((rule) => !rule.disabled).map((rule) => rule.keyForList));
    const filteredSelectedKeys = canWriteRules ? selectedKeys.filter((key) => validKeys.has(key)) : [];

    const deleteSelected = useCallback(() => {
        for (const ruleKey of filteredSelectedKeys) {
            deleteRequireFieldsRule(policyData, ruleKey);
        }
        onClearSelection();
    }, [filteredSelectedKeys, onClearSelection, policyData]);

    useEffect(() => {
        onActionsChange({filteredSelectedKeys, deleteSelected});

        return () => onActionsChange(null);
    }, [deleteSelected, filteredSelectedKeys, onActionsChange]);

    const handleNewRequireFieldsRule = () => {
        if (!canWriteRules) {
            showReadOnlyModal();
            return;
        }
        Navigation.navigate(ROUTES.RULES_REQUIRE_FIELDS_RULE_NEW.getRoute(policyID));
    };

    const requireFieldsEmptyState = (
        <RulesTabEmptyState
            illustration={illustrations.SortingMachine}
            headerContentStyles={styles.sortingMachineRulesEmptyStateIllustration}
            title={translate('workspace.rules.requireFieldsEmptyState.title')}
            subtitle={translate('workspace.rules.requireFieldsEmptyState.subtitle')}
            buttonText={translate('workspace.rules.requireFieldsEmptyState.cta')}
            onPress={handleNewRequireFieldsRule}
            isDisabled={!canWriteRules}
        />
    );

    return (
        <WorkspaceRequireFieldsTable
            rulesData={requireFieldsTableData}
            selectionEnabled={canWriteRules}
            selectedKeys={filteredSelectedKeys}
            onRowSelectionChange={onSelectionChange}
            emptyStateContent={arePolicyCategoriesLoading ? undefined : requireFieldsEmptyState}
        />
    );
}

export default RulesRequireFieldsTab;
