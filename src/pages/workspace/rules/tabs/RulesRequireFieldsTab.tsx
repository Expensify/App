import WorkspaceRequireFieldsTable from '@components/Tables/WorkspaceRequireFieldsTable';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import usePolicyData from '@hooks/usePolicyData';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import {getRequireFieldsTableData} from '@libs/RequireFieldsRulesUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import React from 'react';

import RulesTabEmptyState from './RulesTabEmptyState';

type RulesRequireFieldsTabProps = {
    policyID: string;
    canWriteRules: boolean;
    selectedKeys: string[];
    onSelectionChange: (selectedRowKeys: string[]) => void;
    showReadOnlyModal: () => void;
};

function RulesRequireFieldsTab({policyID, canWriteRules, selectedKeys, onSelectionChange, showReadOnlyModal}: RulesRequireFieldsTabProps) {
    const {translate, localeCompare} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['SortingMachine']);
    const policy = usePolicy(policyID);
    const policyData = usePolicyData(policyID);
    const {convertToDisplayString} = useCurrencyListActions();
    const [policyCategoriesOnyx] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const arePolicyCategoriesLoading = !!policy?.areCategoriesEnabled && policyCategoriesOnyx === undefined;

    const requireFieldsTableData = getRequireFieldsTableData({
        policy,
        policyCategories: arePolicyCategoriesLoading ? undefined : policyData.categories,
        translate,
        convertToDisplayString,
        localeCompare,
        onNavigate: Navigation.navigate,
    });

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
            selectedKeys={selectedKeys}
            onRowSelectionChange={onSelectionChange}
            emptyStateContent={arePolicyCategoriesLoading ? undefined : requireFieldsEmptyState}
        />
    );
}

export default RulesRequireFieldsTab;
