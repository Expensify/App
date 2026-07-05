import WorkspaceFlagForReviewTable from '@components/Tables/WorkspaceFlagForReviewTable';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import usePolicyData from '@hooks/usePolicyData';
import useThemeStyles from '@hooks/useThemeStyles';

import {getFlagForReviewTableData} from '@libs/FlagForReviewRulesUtils';
import Navigation from '@libs/Navigation/Navigation';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import React from 'react';

import RulesTabEmptyState from './RulesTabEmptyState';

type RulesFlagForReviewTabProps = {
    policyID: string;
    canWriteRules: boolean;
    selectedKeys: string[];
    onSelectionChange: (selectedRowKeys: string[]) => void;
    showReadOnlyModal: () => void;
};

function RulesFlagForReviewTab({policyID, canWriteRules, selectedKeys, onSelectionChange, showReadOnlyModal}: RulesFlagForReviewTabProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['SortingMachine']);
    const policy = usePolicy(policyID);
    const policyData = usePolicyData(policyID);
    const {convertToDisplayString} = useCurrencyListActions();
    const [policyCategoriesOnyx] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const arePolicyCategoriesLoading = !!policy?.areCategoriesEnabled && policyCategoriesOnyx === undefined;

    const flagForReviewTableData = getFlagForReviewTableData({
        policy,
        policyCategories: arePolicyCategoriesLoading ? undefined : policyData.categories,
        translate,
        convertToDisplayString,
        isOffline,
        onNavigate: Navigation.navigate,
    });

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
            selectedKeys={selectedKeys}
            onRowSelectionChange={onSelectionChange}
            emptyStateContent={arePolicyCategoriesLoading ? undefined : flagForReviewEmptyState}
        />
    );
}

export default RulesFlagForReviewTab;
