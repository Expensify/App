import WorkspaceExpenseDefaultsTable from '@components/Tables/WorkspaceExpenseDefaultsTable';

import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';

import {getExpenseDefaultsTableData} from '@libs/MerchantTypeRulesUtils';
import Navigation from '@libs/Navigation/Navigation';

import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

type RulesExpenseDefaultsTabProps = {
    policyID: string;
    canWriteRules: boolean;
    selectedKeys: string[];
    onSelectionChange: (selectedRowKeys: string[]) => void;
    headerComponent?: React.ReactElement;
};

function RulesExpenseDefaultsTab({policyID, canWriteRules, selectedKeys, onSelectionChange, headerComponent}: RulesExpenseDefaultsTabProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const policy = usePolicy(policyID);
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);

    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);

    const expenseDefaultsTableData = getExpenseDefaultsTableData({
        policy,
        policyID,
        rules,
        policyCategories,
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
            headerComponent={headerComponent}
        />
    );
}

export default RulesExpenseDefaultsTab;
