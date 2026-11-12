import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import WorkspaceExpenseDefaultsTable from '@components/Tables/WorkspaceExpenseDefaultsTable';

import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';

import {getExpenseDefaultsTableData} from '@libs/MerchantTypeRulesUtils';
import Navigation from '@libs/Navigation/Navigation';

import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

import React from 'react';

type RulesExpenseDefaultsTabProps = {
    policyID: string;
    canWriteRules: boolean;
    selectedKeys: string[];
    onSelectionChange: (selectedRowKeys: string[]) => void;
    headerComponent?: React.ReactElement;

    /** The actions the selected rules support, offered in the floating bar the wide layout shows while rows are selected. */
    bulkActionOptions?: Array<DropdownOption<DeepValueOf<typeof CONST.POLICY.BULK_ACTION_TYPES>>>;
};

function RulesExpenseDefaultsTab({policyID, canWriteRules, selectedKeys, onSelectionChange, headerComponent, bulkActionOptions}: RulesExpenseDefaultsTabProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const policy = usePolicy(policyID);
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);

    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`);

    const expenseDefaultsTableData = getExpenseDefaultsTableData({
        policy,
        policyID,
        rules,
        policyCategories,
        policyTags,
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
            bulkActionOptions={bulkActionOptions}
        />
    );
}

export default RulesExpenseDefaultsTab;
