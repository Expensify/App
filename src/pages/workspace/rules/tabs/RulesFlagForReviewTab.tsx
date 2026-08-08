import type {TableEmptyStateProps} from '@components/Table/TableEmptyStates/TableEmptyState';
import WorkspaceFlagForReviewTable from '@components/Tables/WorkspaceFlagForReviewTable';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import usePolicyData from '@hooks/usePolicyData';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {getFlagForReviewTableData} from '@libs/FlagForReviewRulesUtils';
import Navigation from '@libs/Navigation/Navigation';

import variables from '@styles/variables';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import React from 'react';

type RulesFlagForReviewTabProps = {
    policyID: string;
    canWriteRules: boolean;
    selectedKeys: string[];
    onSelectionChange: (selectedRowKeys: string[]) => void;
    showReadOnlyModal: () => void;
    headerComponent?: React.ReactElement;
};

function RulesFlagForReviewTab({policyID, canWriteRules, selectedKeys, onSelectionChange, showReadOnlyModal, headerComponent}: RulesFlagForReviewTabProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['SortingMachine']);
    const policy = usePolicy(policyID);
    const policyData = usePolicyData(policyID);
    const StyleUtils = useStyleUtils();
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

    const flagForReviewEmptyState: TableEmptyStateProps = {
        minModalHeight: 0,
        cardContentStyles: styles.ph0,
        headerMedia: illustrations.SortingMachine,
        headerContentStyles: styles.sortingMachineRulesEmptyStateIllustration,
        title: translate('workspace.rules.flagForReviewEmptyState.title'),
        subtitle: translate('workspace.rules.flagForReviewEmptyState.subtitle'),
        subtitleStyles: [styles.textLabel, styles.textSupporting],
        containerStyles: [styles.alignItemsCenter, styles.w100, styles.alignSelfCenter, StyleUtils.getMaximumWidth(variables.cardRulesEmptyStateMaxWidth)],
        buttons: [
            {
                success: true,
                isDisabled: !canWriteRules,
                buttonText: translate('workspace.rules.flagForReviewEmptyState.cta'),
                buttonAction: handleNewFlagForReviewRule,
            },
        ],
    };

    return (
        <WorkspaceFlagForReviewTable
            rulesData={flagForReviewTableData}
            selectionEnabled={canWriteRules}
            selectedKeys={selectedKeys}
            onRowSelectionChange={onSelectionChange}
            headerComponent={headerComponent}
            emptyState={flagForReviewEmptyState}
        />
    );
}

export default RulesFlagForReviewTab;
