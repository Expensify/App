import type {TableEmptyStateProps} from '@components/Table/TableEmptyStates/TableEmptyState';
import WorkspaceRequireFieldsTable from '@components/Tables/WorkspaceRequireFieldsTable';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import usePolicyData from '@hooks/usePolicyData';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import {getRequireFieldsTableData} from '@libs/RequireFieldsRulesUtils';

import variables from '@styles/variables';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import React from 'react';

type RulesRequireFieldsTabProps = {
    policyID: string;
    canWriteRules: boolean;
    selectedKeys: string[];
    onSelectionChange: (selectedRowKeys: string[]) => void;
    showReadOnlyModal: () => void;
    headerComponent?: React.ReactElement;
};

function RulesRequireFieldsTab({policyID, canWriteRules, selectedKeys, onSelectionChange, showReadOnlyModal, headerComponent}: RulesRequireFieldsTabProps) {
    const {translate, localeCompare} = useLocalize();
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['SortingMachine']);
    const policy = usePolicy(policyID);
    const StyleUtils = useStyleUtils();
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
        isOffline,
        onNavigate: Navigation.navigate,
    });

    const handleNewRequireFieldsRule = () => {
        if (!canWriteRules) {
            showReadOnlyModal();
            return;
        }
        Navigation.navigate(ROUTES.RULES_REQUIRE_FIELDS_RULE_NEW.getRoute(policyID));
    };

    const requireFieldsEmptyState: TableEmptyStateProps = {
        minModalHeight: 0,
        cardContentStyles: styles.ph0,
        headerMedia: illustrations.SortingMachine,
        headerContentStyles: styles.sortingMachineRulesEmptyStateIllustration,
        title: translate('workspace.rules.requireFieldsEmptyState.title'),
        subtitle: translate('workspace.rules.requireFieldsEmptyState.subtitle'),
        subtitleStyles: [styles.textLabel, styles.textSupporting],

        containerStyles: [styles.alignItemsCenter, styles.w100, styles.alignSelfCenter, StyleUtils.getMaximumWidth(variables.cardRulesEmptyStateMaxWidth)],
        buttons: [
            {
                success: true,
                isDisabled: !canWriteRules,
                buttonText: translate('workspace.rules.requireFieldsEmptyState.cta'),
                buttonAction: handleNewRequireFieldsRule,
            },
        ],
    };

    return (
        <WorkspaceRequireFieldsTable
            rulesData={requireFieldsTableData}
            selectionEnabled={canWriteRules}
            selectedKeys={selectedKeys}
            onRowSelectionChange={onSelectionChange}
            headerComponent={headerComponent}
            emptyState={requireFieldsEmptyState}
        />
    );
}

export default RulesRequireFieldsTab;
