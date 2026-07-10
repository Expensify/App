import ActivityIndicator from '@components/ActivityIndicator';
import type {TableEmptyStateProps} from '@components/Table/TableEmptyStates/TableEmptyState';
import WorkspaceRequireFieldsTable from '@components/Tables/WorkspaceRequireFieldsTable';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import usePolicyData from '@hooks/usePolicyData';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import {getRequireFieldsTableData} from '@libs/RequireFieldsRulesUtils';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import React from 'react';
import {View} from 'react-native';

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
    const theme = useTheme();
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

    if (arePolicyCategoriesLoading) {
        const reasonAttributes: SkeletonSpanReasonAttributes = {context: 'RulesRequireFieldsTab'};

        return (
            <View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter]}>
                <ActivityIndicator
                    color={theme.spinner}
                    size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                    reasonAttributes={reasonAttributes}
                />
            </View>
        );
    }

    return (
        <WorkspaceRequireFieldsTable
            rulesData={requireFieldsTableData}
            selectionEnabled={canWriteRules}
            selectedKeys={selectedKeys}
            onRowSelectionChange={onSelectionChange}
            emptyState={requireFieldsEmptyState}
        />
    );
}

export default RulesRequireFieldsTab;
