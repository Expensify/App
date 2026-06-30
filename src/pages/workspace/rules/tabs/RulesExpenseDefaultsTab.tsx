import React, {useCallback, useEffect} from 'react';
import WorkspaceExpenseDefaultsTable from '@components/Tables/WorkspaceExpenseDefaultsTable';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePolicy from '@hooks/usePolicy';
import {deletePolicyCodingRule} from '@libs/actions/Policy/Rules';
import {getExpenseDefaultsTableData, isMerchantTypeRuleKey} from '@libs/MerchantTypeRulesUtils';
import Navigation from '@libs/Navigation/Navigation';
import type RulesTableTabActions from './types';

type RulesExpenseDefaultsTabProps = {
    policyID: string;
    canWriteRules: boolean;
    selectedKeys: string[];
    onSelectionChange: (selectedRowKeys: string[]) => void;
    onActionsChange: (actions: RulesTableTabActions | null) => void;
    onClearSelection: () => void;
};

function RulesExpenseDefaultsTab({policyID, canWriteRules, selectedKeys, onSelectionChange, onActionsChange, onClearSelection}: RulesExpenseDefaultsTabProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const policy = usePolicy(policyID);

    const expenseDefaultsTableData = getExpenseDefaultsTableData({
        policy,
        policyID,
        translate,
        isOffline,
        onNavigate: Navigation.navigate,
    });
    const validKeys = new Set(expenseDefaultsTableData.filter((rule) => !rule.disabled && !rule.isSelectionDisabled).map((rule) => rule.keyForList));
    const filteredSelectedKeys = canWriteRules ? selectedKeys.filter((key) => validKeys.has(key)) : [];

    const deleteSelected = useCallback(() => {
        if (!policy) {
            return;
        }

        for (const ruleID of filteredSelectedKeys) {
            if (isMerchantTypeRuleKey(ruleID)) {
                continue;
            }

            deletePolicyCodingRule(policy, ruleID);
        }
        onClearSelection();
    }, [filteredSelectedKeys, onClearSelection, policy]);

    useEffect(() => {
        onActionsChange({filteredSelectedKeys, deleteSelected});

        return () => onActionsChange(null);
    }, [deleteSelected, filteredSelectedKeys, onActionsChange]);

    return (
        <WorkspaceExpenseDefaultsTable
            rulesData={expenseDefaultsTableData}
            selectionEnabled={canWriteRules}
            selectedKeys={filteredSelectedKeys}
            onRowSelectionChange={onSelectionChange}
        />
    );
}

export default RulesExpenseDefaultsTab;
