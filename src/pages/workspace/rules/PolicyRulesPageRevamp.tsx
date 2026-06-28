import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import AgentPromotionalBanner from '@components/AgentPromotionalBanner';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import GenericEmptyStateComponent from '@components/EmptyStateComponent/GenericEmptyStateComponent';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import ScrollView from '@components/ScrollView';
import type {ExpenseDefaultTableItem} from '@components/Tables/WorkspaceExpenseDefaultsTable';
import WorkspaceExpenseDefaultsTable from '@components/Tables/WorkspaceExpenseDefaultsTable';
import WorkspaceFlagForReviewTable from '@components/Tables/WorkspaceFlagForReviewTable';
import WorkspaceRequireFieldsTable from '@components/Tables/WorkspaceRequireFieldsTable';
import type {SpendRuleTableItem} from '@components/Tables/WorkspaceSpendRulesTable';
import WorkspaceSpendRulesTable from '@components/Tables/WorkspaceSpendRulesTable';
import TabSelectorBase from '@components/TabSelector/TabSelectorBase';
import TabSelectorContextProvider from '@components/TabSelector/TabSelectorContext';
import type {TabSelectorBaseItem} from '@components/TabSelector/types';
import useCleanupSelectedOptions from '@hooks/useCleanupSelectedOptions';
import useConfirmModal from '@hooks/useConfirmModal';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useDefaultFundID from '@hooks/useDefaultFundID';
import useExpensifyCardRules from '@hooks/useExpensifyCardRulesList';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import usePolicyData from '@hooks/usePolicyData';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useShouldDisplayButtonsInSeparateLine from '@hooks/useShouldDisplayButtonsInSeparateLine';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';
import {deleteExpensifyCardRule} from '@libs/actions/Card';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {openPolicyCategoriesPage} from '@libs/actions/Policy/Category';
import {enableExpensifyCard, openPolicyExpensifyCardsPage} from '@libs/actions/Policy/Policy';
import {deletePolicyCodingRule, openPolicyRulesPage} from '@libs/actions/Policy/Rules';
import Tab from '@libs/actions/Tab';
import {dismissProductTraining} from '@libs/actions/Welcome';
import {deleteFlagForReviewRule, getFlagForReviewTableData} from '@libs/FlagForReviewRulesUtils';
import {getExpenseDefaultsTableData, isMerchantTypeRuleKey} from '@libs/MerchantTypeRulesUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {deleteRequireFieldsRule, getRequireFieldsTableData} from '@libs/RequireFieldsRulesUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type DismissedProductTraining from '@src/types/onyx/DismissedProductTraining';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import IndividualExpenseRulesSectionRevamp from './IndividualExpenseRulesSectionRevamp';

const RULES_TAB = CONST.TAB.RULES;

const DEFAULT_SPEND_RULE_ID = 'default-rule';

type RulesTab = ValueOf<typeof RULES_TAB>;

const RULES_TAB_VALUES = new Set<string>(Object.values(RULES_TAB));

function isRulesTab(key: string): key is RulesTab {
    return RULES_TAB_VALUES.has(key);
}

function isTableSelectionTab(tab: RulesTab): tab is Exclude<RulesTab, typeof RULES_TAB.GENERAL> {
    return tab !== RULES_TAB.GENERAL;
}

function updateSelectionKeysIfChanged(previousKeys: string[], nextKeys: string[]) {
    if (previousKeys.length === nextKeys.length && previousKeys.every((key, index) => key === nextKeys.at(index))) {
        return previousKeys;
    }

    return nextKeys;
}

type PolicyRulesPageRevampProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.RULES>;

const agentsRulesBannerDismissedSelector = (value: OnyxEntry<DismissedProductTraining>): boolean => !!value?.[CONST.AGENTS_RULES_BANNER];

function PolicyRulesPageRevamp({route}: PolicyRulesPageRevampProps) {
    const {translate, localeCompare} = useLocalize();
    const {policyID} = route.params;
    const policy = usePolicy(policyID);
    const policyData = usePolicyData(policyID);
    const [policyCategoriesOnyx] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const arePolicyCategoriesLoading = !!policy?.areCategoriesEnabled && policyCategoriesOnyx === undefined;
    const {convertToDisplayString} = useCurrencyListActions();
    useWorkspaceDocumentTitle(policy?.name, 'workspace.common.rules');
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const illustrations = useMemoizedLazyIllustrations(['Flash', 'ExpensifyCardCoins', 'ExpensifyCardProtectionIllustration', 'SortingMachine']);
    const icons = useMemoizedLazyExpensifyIcons(['Plus', 'Feed', 'CreditCardExclamation', 'DocumentMagicWand', 'Task', 'Flag', 'Trashcan']);
    const {canWrite: canWriteRules, showReadOnlyModal} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.RULES);
    const {canWrite: canWriteMoreFeatures, showReadOnlyModal: showMoreFeaturesReadOnlyModal} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.MORE_FEATURES);
    const {isBetaEnabled} = usePermissions();
    const isCustomAgentBetaEnabled = isBetaEnabled(CONST.BETAS.CUSTOM_AGENT);
    const isRulesRevampEnabled = isBetaEnabled(CONST.BETAS.RULES_REVAMP);
    const isMobileSelectionModeEnabled = useMobileSelectionMode();
    const shouldDisplayButtonsInSeparateLine = useShouldDisplayButtonsInSeparateLine();
    const {isOffline} = useNetwork();
    const [isAgentsRulesBannerDismissed = false] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {selector: agentsRulesBannerDismissedSelector});

    const [lastSelectedTab] = useOnyx(`${ONYXKEYS.COLLECTION.SELECTED_TAB}${CONST.TAB.RULES_TAB_TYPE}`);
    const lastSelectedTabStr = lastSelectedTab as string | undefined;
    const activeTab: RulesTab = lastSelectedTabStr && isRulesTab(lastSelectedTabStr) ? lastSelectedTabStr : RULES_TAB.GENERAL;
    const [selectedRuleKeysByTab, setSelectedRuleKeysByTab] = useState<Partial<Record<Exclude<RulesTab, typeof RULES_TAB.GENERAL>, string[]>>>({});

    const {showConfirmModal} = useConfirmModal();
    const defaultFundID = useDefaultFundID(policyID);
    const [expensifyCardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${defaultFundID}`);
    const {cardRules} = useExpensifyCardRules(policyID);
    const areCardsEnabled = !!policy?.areExpensifyCardsEnabled;
    const attemptedCardSettingsFetchRef = useRef<Set<number>>(new Set());

    useEffect(() => {
        attemptedCardSettingsFetchRef.current.clear();
    }, [policyID]);

    useEffect(() => {
        if (!areCardsEnabled || !defaultFundID || defaultFundID === CONST.DEFAULT_NUMBER_ID) {
            return;
        }
        if (expensifyCardSettings?.isLoading) {
            return;
        }
        if (expensifyCardSettings?.hasOnceLoaded) {
            return;
        }
        if (attemptedCardSettingsFetchRef.current.has(defaultFundID)) {
            return;
        }

        attemptedCardSettingsFetchRef.current.add(defaultFundID);
        openPolicyExpensifyCardsPage(policyID, defaultFundID);
    }, [areCardsEnabled, defaultFundID, expensifyCardSettings?.hasOnceLoaded, expensifyCardSettings?.isLoading, policyID]);

    const showBuiltInProtectionModal = () => {
        showConfirmModal({
            image: illustrations.ExpensifyCardProtectionIllustration,
            imageStyles: [styles.w100],
            shouldFitImageToContainer: true,
            title: translate('workspace.rules.spendRules.builtInProtectionModal.title'),
            titleStyles: [styles.textHeadlineH1],
            titleContainerStyles: [styles.mb3],
            prompt: translate('workspace.rules.spendRules.builtInProtectionModal.description'),
            promptStyles: [styles.mb1],
            shouldShowCancelButton: false,
            success: false,
            confirmText: translate('common.buttonConfirm'),
            innerContainerStyle: shouldUseNarrowLayout ? undefined : StyleUtils.getWidthStyle(variables.wideConfirmModalWidth),
        });
    };

    const blockLabel = translate('workspace.rules.spendRules.block');
    const defaultSpendRule: SpendRuleTableItem = {
        keyForList: DEFAULT_SPEND_RULE_ID,
        ruleID: DEFAULT_SPEND_RULE_ID,
        isDefault: true,
        isBlock: true,
        disabled: true,
        actionLabel: blockLabel,
        cardSummary: translate('workspace.rules.spendRules.defaultRuleDescription'),
        ruleSummary: translate('workspace.rules.spendRules.defaultRuleSummary'),
        searchTokens: [],
        action: showBuiltInProtectionModal,
    };
    const customSpendRules: SpendRuleTableItem[] = cardRules.map((rule) => {
        const ruleSummary = rule.summaryParts.map((part) => part.text).join(', ');
        return {
            keyForList: rule.ruleID,
            ruleID: rule.ruleID,
            isDefault: false,
            isBlock: rule.isBlock,
            actionLabel: rule.isBlock ? blockLabel : translate('workspace.rules.spendRules.allow'),
            cardSummary: rule.cardSummary,
            ruleSummary,
            searchTokens: rule.searchTokens,
            pendingAction: rule.pendingAction,
            disabled: rule.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            action: () => Navigation.navigate(ROUTES.RULES_SPEND_EDIT.getRoute(policyID, rule.ruleID)),
        };
    });
    const spendRulesTableData: SpendRuleTableItem[] = [defaultSpendRule, ...customSpendRules];

    const expenseDefaultsTableData: ExpenseDefaultTableItem[] = getExpenseDefaultsTableData({
        policy,
        policyID,
        translate,
        isOffline,
        onNavigate: Navigation.navigate,
    });

    const requireFieldsTableData = getRequireFieldsTableData({
        policy,
        policyCategories: arePolicyCategoriesLoading ? undefined : policyData.categories,
        translate,
        convertToDisplayString,
        localeCompare,
        onNavigate: Navigation.navigate,
    });

    const flagForReviewTableData = getFlagForReviewTableData({
        policy,
        policyCategories: arePolicyCategoriesLoading ? undefined : policyData.categories,
        translate,
        convertToDisplayString,
        onNavigate: Navigation.navigate,
    });

    useEffect(() => {
        // Fetch once on mount (and when policyID changes). setPolicyCodingRule already updates Onyx — refetching after saves can overwrite a newly added rule with stale data.
        openPolicyRulesPage(policyID);
    }, [policyID]);

    useEffect(() => {
        if (!policy?.areCategoriesEnabled || policyCategoriesOnyx !== undefined) {
            return;
        }

        openPolicyCategoriesPage(policyID);
    }, [policy?.areCategoriesEnabled, policyCategoriesOnyx, policyID]);

    const clearAllTableSelection = () => {
        setSelectedRuleKeysByTab((prev) => (Object.keys(prev).length > 0 ? {} : prev));
        turnOffMobileSelectionMode();
    };

    useCleanupSelectedOptions(clearAllTableSelection);

    const validKeysByTab = {
        [RULES_TAB.CARD_RESTRICTIONS]: new Set(spendRulesTableData.filter((rule) => !rule.disabled).map((rule) => rule.keyForList)),
        [RULES_TAB.EXPENSE_DEFAULTS]: new Set(expenseDefaultsTableData.filter((rule) => !rule.disabled && !rule.isSelectionDisabled).map((rule) => rule.keyForList)),
        [RULES_TAB.REQUIRE_FIELDS]: new Set(requireFieldsTableData.filter((rule) => !rule.disabled).map((rule) => rule.keyForList)),
        [RULES_TAB.FLAG_FOR_REVIEW]: new Set(flagForReviewTableData.filter((rule) => !rule.disabled).map((rule) => rule.keyForList)),
    };

    const getFilteredSelectedKeys = (tab: Exclude<RulesTab, typeof RULES_TAB.GENERAL>) => {
        if (!canWriteRules) {
            return [];
        }

        const validKeys = validKeysByTab[tab];
        return (selectedRuleKeysByTab[tab] ?? []).filter((key) => validKeys.has(key));
    };

    const filteredSelectedSpendRuleKeys = getFilteredSelectedKeys(RULES_TAB.CARD_RESTRICTIONS);
    const filteredSelectedExpenseDefaultKeys = getFilteredSelectedKeys(RULES_TAB.EXPENSE_DEFAULTS);
    const filteredSelectedRequireFieldsRuleKeys = getFilteredSelectedKeys(RULES_TAB.REQUIRE_FIELDS);
    const filteredSelectedFlagForReviewRuleKeys = getFilteredSelectedKeys(RULES_TAB.FLAG_FOR_REVIEW);

    const selectedRuleKeys = isTableSelectionTab(activeTab) ? getFilteredSelectedKeys(activeTab) : [];
    const hasSelectedRules = selectedRuleKeys.length > 0;
    const isTableTab =
        activeTab === RULES_TAB.CARD_RESTRICTIONS || activeTab === RULES_TAB.EXPENSE_DEFAULTS || activeTab === RULES_TAB.REQUIRE_FIELDS || activeTab === RULES_TAB.FLAG_FOR_REVIEW;
    const shouldShowBulkActions = canWriteRules && isTableTab && (shouldUseNarrowLayout ? isMobileSelectionModeEnabled : hasSelectedRules);
    const shouldShowAddRuleButton = activeTab === RULES_TAB.GENERAL || !shouldShowBulkActions;

    const clearTableSelection = () => {
        if (!isTableSelectionTab(activeTab)) {
            return;
        }

        setSelectedRuleKeysByTab((prev) => {
            if (!prev[activeTab]?.length) {
                return prev;
            }

            return {...prev, [activeTab]: []};
        });
        turnOffMobileSelectionMode();
    };

    const updateTabSelectionKeys = useCallback((tab: Exclude<RulesTab, typeof RULES_TAB.GENERAL>, selectedRowKeys: string[]) => {
        setSelectedRuleKeysByTab((prev) => {
            const nextKeys = updateSelectionKeysIfChanged(prev[tab] ?? [], selectedRowKeys);
            if (prev[tab] === nextKeys) {
                return prev;
            }

            return {...prev, [tab]: nextKeys};
        });
    }, []);

    const handleSpendRuleSelectionChange = useCallback((selectedRowKeys: string[]) => updateTabSelectionKeys(RULES_TAB.CARD_RESTRICTIONS, selectedRowKeys), [updateTabSelectionKeys]);
    const handleExpenseDefaultSelectionChange = useCallback((selectedRowKeys: string[]) => updateTabSelectionKeys(RULES_TAB.EXPENSE_DEFAULTS, selectedRowKeys), [updateTabSelectionKeys]);
    const handleRequireFieldsRuleSelectionChange = useCallback((selectedRowKeys: string[]) => updateTabSelectionKeys(RULES_TAB.REQUIRE_FIELDS, selectedRowKeys), [updateTabSelectionKeys]);
    const handleFlagForReviewRuleSelectionChange = useCallback((selectedRowKeys: string[]) => updateTabSelectionKeys(RULES_TAB.FLAG_FOR_REVIEW, selectedRowKeys), [updateTabSelectionKeys]);

    const selectionModeHeader = isMobileSelectionModeEnabled && shouldUseNarrowLayout;

    const handleBackButtonPress = () => {
        if (isMobileSelectionModeEnabled) {
            clearTableSelection();
            return;
        }

        Navigation.goBack();
    };

    const deleteSelectedSpendRules = () => {
        if (!defaultFundID || defaultFundID === CONST.DEFAULT_NUMBER_ID) {
            return;
        }

        for (const ruleID of filteredSelectedSpendRuleKeys) {
            if (ruleID === DEFAULT_SPEND_RULE_ID) {
                continue;
            }

            const existingRule = expensifyCardSettings?.cardRules?.[ruleID];
            if (!existingRule) {
                continue;
            }

            deleteExpensifyCardRule(defaultFundID, ruleID, existingRule);
        }
        clearTableSelection();
    };

    const deleteSelectedExpenseDefaults = () => {
        if (!policy) {
            return;
        }

        for (const ruleID of filteredSelectedExpenseDefaultKeys) {
            if (isMerchantTypeRuleKey(ruleID)) {
                continue;
            }

            deletePolicyCodingRule(policy, ruleID);
        }
        clearTableSelection();
    };

    const deleteSelectedRequireFieldsRules = () => {
        for (const ruleKey of filteredSelectedRequireFieldsRuleKeys) {
            deleteRequireFieldsRule(policyData, ruleKey);
        }
        clearTableSelection();
    };

    const deleteSelectedFlagForReviewRules = () => {
        for (const categoryName of filteredSelectedFlagForReviewRuleKeys) {
            deleteFlagForReviewRule(policyID, categoryName, policyData.categories);
        }
        clearTableSelection();
    };

    const getBulkActionsButtonOptions = (): Array<DropdownOption<DeepValueOf<typeof CONST.POLICY.BULK_ACTION_TYPES>>> => {
        return [
            {
                icon: icons.Trashcan,
                text: translate('workspace.rules.bulkActions.deleteMultiple', {count: selectedRuleKeys.length}),
                value: CONST.POLICY.BULK_ACTION_TYPES.DELETE,
                onSelected: async () => {
                    const {action} = await showConfirmModal({
                        title: translate('workspace.rules.merchantRules.deleteRule'),
                        prompt: translate('workspace.rules.bulkActions.deleteMultipleConfirmation', {count: selectedRuleKeys.length}),
                        confirmText: translate('common.delete'),
                        cancelText: translate('common.cancel'),
                        danger: true,
                    });

                    if (action !== ModalActions.CONFIRM) {
                        return;
                    }

                    if (activeTab === RULES_TAB.CARD_RESTRICTIONS) {
                        deleteSelectedSpendRules();
                        return;
                    }

                    if (activeTab === RULES_TAB.REQUIRE_FIELDS) {
                        deleteSelectedRequireFieldsRules();
                        return;
                    }

                    if (activeTab === RULES_TAB.FLAG_FOR_REVIEW) {
                        deleteSelectedFlagForReviewRules();
                        return;
                    }

                    deleteSelectedExpenseDefaults();
                },
            },
        ];
    };

    const tabs: TabSelectorBaseItem[] = [
        {
            key: RULES_TAB.GENERAL,
            title: translate('workspace.rules.tabs.general'),
            icon: icons.Feed,
        },
        {
            key: RULES_TAB.CARD_RESTRICTIONS,
            title: translate('workspace.rules.tabs.cardRestrictions'),
            icon: icons.CreditCardExclamation,
        },
        {
            key: RULES_TAB.EXPENSE_DEFAULTS,
            title: translate('workspace.rules.tabs.expenseDefaults'),
            icon: icons.DocumentMagicWand,
        },
        {
            key: RULES_TAB.REQUIRE_FIELDS,
            title: translate('workspace.rules.tabs.requireFields'),
            icon: icons.Task,
        },
        {
            key: RULES_TAB.FLAG_FOR_REVIEW,
            title: translate('workspace.rules.tabs.flagForReview'),
            icon: icons.Flag,
        },
    ];

    const handleNewFlagForReviewRule = () => {
        if (!canWriteRules) {
            showReadOnlyModal();
            return;
        }
        Navigation.navigate(ROUTES.RULES_FLAG_FOR_REVIEW_RULE_NEW.getRoute(policyID));
    };

    const handleNewRequireFieldsRule = () => {
        if (!canWriteRules) {
            showReadOnlyModal();
            return;
        }
        Navigation.navigate(ROUTES.RULES_REQUIRE_FIELDS_RULE_NEW.getRoute(policyID));
    };

    const handleNewRule = () => {
        if (!canWriteRules) {
            showReadOnlyModal();
            return;
        }
        Navigation.navigate(ROUTES.RULES_NEW.getRoute(policyID));
    };

    const getHeaderContent = () => {
        if (shouldShowBulkActions) {
            return (
                <ButtonWithDropdownMenu
                    onPress={() => null}
                    shouldAlwaysShowDropdownMenu
                    buttonSize={CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
                    customText={translate('workspace.common.selected', {count: selectedRuleKeys.length})}
                    options={getBulkActionsButtonOptions()}
                    isSplitButton={false}
                    style={[shouldDisplayButtonsInSeparateLine && styles.w100, shouldDisplayButtonsInSeparateLine && styles.mb3]}
                    isDisabled={!selectedRuleKeys.length}
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.BULK_ACTIONS_DROPDOWN}
                />
            );
        }

        if (!shouldShowAddRuleButton) {
            return null;
        }

        return (
            <Button
                success
                onPress={handleNewRule}
                text={translate('workspace.rules.merchantRules.addRuleTitle')}
                icon={icons.Plus}
                style={[shouldDisplayButtonsInSeparateLine && styles.w100]}
            />
        );
    };

    const headerButtons = getHeaderContent();

    const handleGetExpensifyCardPress = () => {
        if (!canWriteMoreFeatures) {
            showMoreFeaturesReadOnlyModal();
            return;
        }

        enableExpensifyCard(policyID, true, true);
    };

    const rulesEmptyStateScrollContentContainerStyle = [styles.flexGrow1, styles.flexShrink0, styles.justifyContentCenter, styles.mb5];
    const rulesEmptyStateContainerStyles = [styles.cardRulesEmptyStateWrapper];

    const cardRulesEmptyState = (
        <ScrollView
            style={[styles.flex1, styles.mnh0]}
            contentContainerStyle={rulesEmptyStateScrollContentContainerStyle}
            addBottomSafeAreaPadding
        >
            <GenericEmptyStateComponent
                headerMedia={illustrations.ExpensifyCardCoins}
                headerStyles={styles.emptyStateCardIllustrationContainer}
                headerContentStyles={shouldUseNarrowLayout ? styles.expensifyCardEmptyIllustration : styles.cardRulesEmptyStateIllustration}
                title={translate('workspace.rules.spendRules.cardRulesUpsell.title')}
                subtitle={translate('workspace.rules.spendRules.cardRulesUpsell.subtitle')}
                subtitleStyles={[styles.textLabel, styles.textSupporting]}
                minModalHeight={0}
                cardStyles={styles.cardRulesEmptyStateContainer}
                containerStyles={rulesEmptyStateContainerStyles}
                buttons={[
                    {
                        buttonText: translate('workspace.rules.spendRules.cardRulesUpsell.cta'),
                        buttonAction: handleGetExpensifyCardPress,
                        success: true,
                        isDisabled: !canWriteMoreFeatures,
                    },
                ]}
            />
        </ScrollView>
    );

    const requireFieldsEmptyState = (
        <ScrollView
            style={[styles.flex1, styles.mnh0]}
            contentContainerStyle={rulesEmptyStateScrollContentContainerStyle}
            addBottomSafeAreaPadding
        >
            <GenericEmptyStateComponent
                headerMedia={illustrations.SortingMachine}
                headerStyles={styles.emptyStateCardIllustrationContainer}
                headerContentStyles={styles.sortingMachineRulesEmptyStateIllustration}
                title={translate('workspace.rules.requireFieldsEmptyState.title')}
                subtitle={translate('workspace.rules.requireFieldsEmptyState.subtitle')}
                subtitleStyles={[styles.textLabel, styles.textSupporting]}
                minModalHeight={0}
                cardStyles={styles.cardRulesEmptyStateContainer}
                containerStyles={rulesEmptyStateContainerStyles}
                buttons={[
                    {
                        buttonText: translate('workspace.rules.requireFieldsEmptyState.cta'),
                        buttonAction: handleNewRequireFieldsRule,
                        success: true,
                        isDisabled: !canWriteRules,
                    },
                ]}
            />
        </ScrollView>
    );

    const flagForReviewEmptyState = (
        <ScrollView
            style={[styles.flex1, styles.mnh0]}
            contentContainerStyle={rulesEmptyStateScrollContentContainerStyle}
            addBottomSafeAreaPadding
        >
            <GenericEmptyStateComponent
                headerMedia={illustrations.SortingMachine}
                headerStyles={styles.emptyStateCardIllustrationContainer}
                headerContentStyles={styles.sortingMachineRulesEmptyStateIllustration}
                title={translate('workspace.rules.flagForReviewEmptyState.title')}
                subtitle={translate('workspace.rules.flagForReviewEmptyState.subtitle')}
                subtitleStyles={[styles.textLabel, styles.textSupporting]}
                minModalHeight={0}
                cardStyles={styles.cardRulesEmptyStateContainer}
                containerStyles={rulesEmptyStateContainerStyles}
                buttons={[
                    {
                        buttonText: translate('workspace.rules.flagForReviewEmptyState.cta'),
                        buttonAction: handleNewFlagForReviewRule,
                        success: true,
                        isDisabled: !canWriteRules,
                    },
                ]}
            />
        </ScrollView>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case RULES_TAB.GENERAL:
                return (
                    <>
                        <IndividualExpenseRulesSectionRevamp
                            policyID={policyID}
                            canWriteRules={canWriteRules}
                        />
                        {isCustomAgentBetaEnabled && !isAgentsRulesBannerDismissed && (
                            <AgentPromotionalBanner
                                title={translate('workspace.rules.agentsPromoBanner.title')}
                                subtitle={translate('workspace.rules.agentsPromoBanner.subtitle')}
                                ctaText={translate('workspace.rules.agentsPromoBanner.cta')}
                                onCtaPress={() => Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS.getRoute(policyID))}
                                ctaSentryLabel={CONST.SENTRY_LABEL.AGENTS_RULES_BANNER.CTA}
                                onDismiss={() => dismissProductTraining(CONST.AGENTS_RULES_BANNER, true)}
                                dismissSentryLabel={CONST.SENTRY_LABEL.AGENTS_RULES_BANNER.DISMISS}
                                style={[styles.mh5, styles.mb5]}
                            />
                        )}
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyFeature={CONST.POLICY.POLICY_FEATURE.RULES}
            shouldBeBlocked={!isRulesRevampEnabled}
        >
            <WorkspacePageWithSections
                testID="PolicyRulesPage"
                shouldUseScrollView={activeTab === RULES_TAB.GENERAL}
                headerText={translate(selectionModeHeader ? 'common.selectMultiple' : 'workspace.common.rules')}
                shouldShowOfflineIndicatorInWideScreen
                route={route}
                icon={selectionModeHeader ? undefined : illustrations.Flash}
                shouldUseHeadlineHeader={!selectionModeHeader}
                onBackButtonPress={handleBackButtonPress}
                policyFeature={CONST.POLICY.POLICY_FEATURE.RULES}
                shouldShowNotFoundPage={false}
                shouldShowLoading={false}
                addBottomSafeAreaPadding
                headerContent={!shouldDisplayButtonsInSeparateLine && headerButtons}
            >
                <View style={[styles.flex1, styles.w100, styles.mnh0]}>
                    <View style={[styles.flexShrink0, styles.w100]}>
                        <View style={[styles.flexRow, styles.mb1, styles.w100]}>
                            <TabSelectorContextProvider activeTabKey={activeTab}>
                                <TabSelectorBase
                                    tabs={tabs}
                                    activeTabKey={activeTab}
                                    onTabPress={(key) => {
                                        if (!isRulesTab(key)) {
                                            return;
                                        }
                                        setSelectedRuleKeysByTab({});
                                        turnOffMobileSelectionMode();
                                        Tab.setSelectedTab(CONST.TAB.RULES_TAB_TYPE, key);
                                    }}
                                />
                            </TabSelectorContextProvider>
                        </View>
                    </View>
                    {shouldDisplayButtonsInSeparateLine && !!headerButtons && <View style={[styles.flexShrink0, styles.pl5, styles.pr5, styles.pb5, styles.w100]}>{headerButtons}</View>}
                    <View style={[styles.flex1, styles.mnh0, styles.w100, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection, isTableTab && styles.mw100]}>
                        {activeTab === RULES_TAB.GENERAL && renderTabContent()}
                        {isTableTab && (
                            <View style={[styles.flex1, styles.mnh0]}>
                                {activeTab === RULES_TAB.CARD_RESTRICTIONS && (
                                    <WorkspaceSpendRulesTable
                                        rulesData={areCardsEnabled ? spendRulesTableData : []}
                                        selectionEnabled={canWriteRules}
                                        selectedKeys={filteredSelectedSpendRuleKeys}
                                        onRowSelectionChange={handleSpendRuleSelectionChange}
                                        emptyStateContent={areCardsEnabled ? undefined : cardRulesEmptyState}
                                    />
                                )}
                                {activeTab === RULES_TAB.EXPENSE_DEFAULTS && (
                                    <WorkspaceExpenseDefaultsTable
                                        rulesData={expenseDefaultsTableData}
                                        selectionEnabled={canWriteRules}
                                        selectedKeys={filteredSelectedExpenseDefaultKeys}
                                        onRowSelectionChange={handleExpenseDefaultSelectionChange}
                                    />
                                )}
                                {activeTab === RULES_TAB.REQUIRE_FIELDS && (
                                    <WorkspaceRequireFieldsTable
                                        rulesData={requireFieldsTableData}
                                        selectionEnabled={canWriteRules}
                                        selectedKeys={filteredSelectedRequireFieldsRuleKeys}
                                        onRowSelectionChange={handleRequireFieldsRuleSelectionChange}
                                        emptyStateContent={arePolicyCategoriesLoading ? undefined : requireFieldsEmptyState}
                                    />
                                )}
                                {activeTab === RULES_TAB.FLAG_FOR_REVIEW && (
                                    <WorkspaceFlagForReviewTable
                                        rulesData={flagForReviewTableData}
                                        selectionEnabled={canWriteRules}
                                        selectedKeys={filteredSelectedFlagForReviewRuleKeys}
                                        onRowSelectionChange={handleFlagForReviewRuleSelectionChange}
                                        emptyStateContent={arePolicyCategoriesLoading ? undefined : flagForReviewEmptyState}
                                    />
                                )}
                            </View>
                        )}
                    </View>
                </View>
            </WorkspacePageWithSections>
        </AccessOrNotFoundWrapper>
    );
}

export default PolicyRulesPageRevamp;
