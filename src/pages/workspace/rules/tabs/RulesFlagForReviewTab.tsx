import ActivityIndicator from '@components/ActivityIndicator';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import CategoryFlagLimitsLoadError from '@components/Rule/CategoryFlagLimitsLoadError';
import type {TableEmptyStateProps} from '@components/Table/TableEmptyStates/TableEmptyState';
import WorkspaceFlagForReviewTable from '@components/Tables/WorkspaceFlagForReviewTable';
import TextLink from '@components/TextLink';

import useCategoryFlagLimits from '@hooks/useCategoryFlagLimits';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLoadPolicyCategories from '@hooks/useLoadPolicyCategories';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {getPolicyCategories} from '@libs/actions/Policy/Category';
import {getFlagForReviewTableData} from '@libs/FlagForReviewRulesUtils';
import Navigation from '@libs/Navigation/Navigation';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

import React from 'react';
import {View} from 'react-native';

type RulesFlagForReviewTabProps = {
    policyID: string;
    canWriteRules: boolean;
    selectedKeys: string[];
    onSelectionChange: (selectedRowKeys: string[]) => void;
    showReadOnlyModal: () => void;
    headerComponent?: React.ReactElement;

    /** The actions the selected rules support, offered in the floating bar the wide layout shows while rows are selected. */
    bulkActionOptions?: Array<DropdownOption<DeepValueOf<typeof CONST.POLICY.BULK_ACTION_TYPES>>>;
};

function RulesFlagForReviewTab({policyID, canWriteRules, selectedKeys, onSelectionChange, showReadOnlyModal, headerComponent, bulkActionOptions}: RulesFlagForReviewTabProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    // Its own illustration, so Flag for review doesn't repeat the sorting machine that Field requirements uses.
    const icons = useMemoizedLazyExpensifyIcons(['EmptyStateSpyPigeon']);
    const policy = usePolicy(policyID);
    const StyleUtils = useStyleUtils();
    const {convertToDisplayString} = useCurrencyListActions();
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const {categoryFlagLimits, areCategoryFlagLimitsLoading, haveCategoryFlagLimitsLoaded} = useCategoryFlagLimits(policyID);

    const flagForReviewTableData = getFlagForReviewTableData({
        policy,
        policyCategories,
        categoryFlagLimits,
        translate,
        convertToDisplayString,
        isOffline,
        onNavigate: Navigation.navigate,
    });

    const needsCategories = !!policy?.areCategoriesEnabled && Object.keys(categoryFlagLimits ?? {}).some((categoryName) => !policyCategories?.[categoryName]);
    useLoadPolicyCategories(needsCategories && policyCategories ? policyID : undefined);
    if (!flagForReviewTableData.length && (areCategoryFlagLimitsLoading || !haveCategoryFlagLimitsLoaded || needsCategories)) {
        return (
            <>
                {headerComponent}
                {areCategoryFlagLimitsLoading ? (
                    <View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter]}>
                        <ActivityIndicator size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE} />
                    </View>
                ) : (
                    <CategoryFlagLimitsLoadError missingCategoriesPolicyID={needsCategories ? policyID : undefined} />
                )}
            </>
        );
    }

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
        headerMedia: icons.EmptyStateSpyPigeon,
        headerContentStyles: styles.spyPigeonRulesEmptyStateIllustration,
        title: translate('workspace.rules.flagForReviewEmptyState.title'),
        subtitle: translate('workspace.rules.flagForReviewEmptyState.subtitle'),
        subtitleStyles: [styles.textSupporting],
        containerStyles: [styles.alignItemsCenter, styles.w100, styles.alignSelfCenter, StyleUtils.getMaximumWidth(variables.cardRulesEmptyStateMaxWidth)],
        buttons: [
            {
                buttonVariant: CONST.BUTTON_VARIANT.SUCCESS,
                isDisabled: !canWriteRules,
                buttonText: translate('workspace.rules.flagForReviewEmptyState.cta'),
                buttonAction: handleNewFlagForReviewRule,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.RULES.FLAG_FOR_REVIEW_EMPTY_STATE_ADD_RULE,
            },
        ],
    };

    return (
        <WorkspaceFlagForReviewTable
            rulesData={flagForReviewTableData}
            selectionEnabled={canWriteRules}
            selectedKeys={selectedKeys}
            onRowSelectionChange={onSelectionChange}
            headerComponent={
                needsCategories && !isOffline ? (
                    <>
                        {headerComponent}
                        <View style={styles.mh5}>
                            <TextLink
                                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.FLAG_FOR_REVIEW_RETRY_CATEGORIES}
                                onPress={() => getPolicyCategories(policyID)}
                            >
                                {translate('common.tryAgain')}
                            </TextLink>
                        </View>
                    </>
                ) : (
                    headerComponent
                )
            }
            bulkActionOptions={bulkActionOptions}
            emptyState={flagForReviewEmptyState}
        />
    );
}

export default RulesFlagForReviewTab;
