import WorkspaceExpenseDefaultsTable from '@components/Tables/WorkspaceExpenseDefaultsTable';

import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePolicy from '@hooks/usePolicy';

import {getExpenseDefaultsTableData} from '@libs/MerchantTypeRulesUtils';
import Navigation from '@libs/Navigation/Navigation';

import React from 'react';

type RulesExpenseDefaultsTabProps = {
    policyID: string;
    canWriteRules: boolean;
    selectedKeys: string[];
    onSelectionChange: (selectedRowKeys: string[]) => void;
};

function RulesExpenseDefaultsTab({policyID, canWriteRules, selectedKeys, onSelectionChange}: RulesExpenseDefaultsTabProps) {
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

    return (
        <WorkspaceExpenseDefaultsTable
            rulesData={expenseDefaultsTableData}
            selectionEnabled={canWriteRules}
            selectedKeys={selectedKeys}
            onRowSelectionChange={onSelectionChange}
        />
    );
}

export default RulesExpenseDefaultsTab;
