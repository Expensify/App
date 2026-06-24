import React, {useEffect, useRef, useState} from 'react';
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
import type {SpendRuleTableItem} from '@components/Tables/WorkspaceSpendRulesTable';
import WorkspaceSpendRulesTable from '@components/Tables/WorkspaceSpendRulesTable';
import TabSelectorBase from '@components/TabSelector/TabSelectorBase';
import TabSelectorContextProvider from '@components/TabSelector/TabSelectorContext';
import type {TabSelectorBaseItem} from '@components/TabSelector/types';
import useConfirmModal from '@hooks/useConfirmModal';
import useDefaultFundID from '@hooks/useDefaultFundID';
import useExpensifyCardRules from '@hooks/useExpensifyCardRulesList';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useShouldDisplayButtonsInSeparateLine from '@hooks/useShouldDisplayButtonsInSeparateLine';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';
import {deleteExpensifyCardRule} from '@libs/actions/Card';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {enableExpensifyCard, openPolicyExpensifyCardsPage} from '@libs/actions/Policy/Policy';
import {deletePolicyCodingRule, openPolicyRulesPage} from '@libs/actions/Policy/Rules';
import Tab from '@libs/actions/Tab';
import {dismissProductTraining} from '@libs/actions/Welcome';
import {getDecodedCategoryName} from '@libs/CategoryUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import Parser from '@libs/Parser';
import {getCommaSeparatedTagNameWithSanitizedColons} from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import variables from '@styles/variables';
import {clearPolicyCodingRuleErrors} from '@userActions/Policy/Rules';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type DismissedProductTraining from '@src/types/onyx/DismissedProductTraining';
import type {CodingRule} from '@src/types/onyx/Policy';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import AgentRulesSection from './AgentRulesSection';
import IndividualExpenseRulesSectionRevamp from './IndividualExpenseRulesSectionRevamp';

const RULES_TAB = CONST.TAB.RULES;

const DEFAULT_SPEND_RULE_ID = 'default-rule';

type RulesTab = ValueOf<typeof RULES_TAB>;

const RULES_TAB_VALUES = new Set<string>(Object.values(RULES_TAB));

function isRulesTab(key: string): key is RulesTab {
    return RULES_TAB_VALUES.has(key);
}

type PolicyRulesPageRevampProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.RULES>;

const agentsRulesBannerDismissedSelector = (value: OnyxEntry<DismissedProductTraining>): boolean => !!value?.[CONST.AGENTS_RULES_BANNER];

function PolicyRulesPageRevamp({route}: PolicyRulesPageRevampProps) {
    const {translate} = useLocalize();
    const {policyID} = route.params;
    const policy = usePolicy(policyID);
    useWorkspaceDocumentTitle(policy?.name, 'workspace.common.rules');
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const illustrations = useMemoizedLazyIllustrations(['Flash', 'ExpensifyCardCoins', 'ExpensifyCardProtectionIllustration']);
    const icons = useMemoizedLazyExpensifyIcons(['Plus', 'Feed', 'CreditCardExclamation', 'DocumentMagicWand', 'Trashcan']);
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
    const [selectedSpendRuleKeys, setSelectedSpendRuleKeys] = useState<string[]>([]);
    const [selectedExpenseDefaultKeys, setSelectedExpenseDefaultKeys] = useState<string[]>([]);

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

    const codingRules = policy?.rules?.codingRules;
    const fieldLabels = {
        category: translate('common.category').toLowerCase(),
        tag: translate('common.tag').toLowerCase(),
        description: translate('common.description').toLowerCase(),
        tax: translate('common.tax').toLowerCase(),
    };
    const expenseDefaultsTableData: ExpenseDefaultTableItem[] = isEmptyObject(codingRules)
        ? []
        : Object.entries(codingRules)
              .filter(([, rule]) => !!rule && (isOffline || rule.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE))
              .map(([ruleID, rule]: [string, CodingRule]) => {
                  const merchantName = rule.filters?.right ?? '';
                  const hasOnlyMerchantRename =
                      !!rule.merchant && !rule.category && !rule.tag && !rule.comment && !rule.tax?.field_id_TAX?.value && rule.reimbursable === undefined && rule.billable === undefined;
                  const typeLabel = hasOnlyMerchantRename ? translate('workspace.rules.expenseDefaultsTable.rename') : translate('workspace.rules.expenseDefaultsTable.update');

                  const actions: string[] = [];
                  if (rule.merchant) {
                      actions.push(translate('workspace.rules.merchantRules.ruleSummarySubtitleMerchant', rule.merchant));
                  }
                  if (rule.category) {
                      actions.push(translate('workspace.rules.merchantRules.ruleSummarySubtitleUpdateField', fieldLabels.category, getDecodedCategoryName(rule.category)));
                  }
                  if (rule.tag) {
                      actions.push(translate('workspace.rules.merchantRules.ruleSummarySubtitleUpdateField', fieldLabels.tag, getCommaSeparatedTagNameWithSanitizedColons(rule.tag)));
                  }
                  if (rule.comment) {
                      const commentMarkdown = Parser.htmlToMarkdown(rule.comment);
                      actions.push(translate('workspace.rules.merchantRules.ruleSummarySubtitleUpdateField', fieldLabels.description, commentMarkdown));
                  }
                  if (rule.tax?.field_id_TAX?.value) {
                      actions.push(
                          translate('workspace.rules.merchantRules.ruleSummarySubtitleUpdateField', fieldLabels.tax, `${rule.tax.field_id_TAX.name} (${rule.tax.field_id_TAX.value})`),
                      );
                  }
                  if (rule.reimbursable !== undefined) {
                      actions.push(translate('workspace.rules.merchantRules.ruleSummarySubtitleReimbursable', rule.reimbursable));
                  }
                  if (rule.billable !== undefined) {
                      actions.push(translate('workspace.rules.merchantRules.ruleSummarySubtitleBillable', rule.billable));
                  }
                  const ruleDescription = actions.map((action, index) => (index === 0 ? action : action.charAt(0).toLowerCase() + action.slice(1))).join(', ');

                  return {
                      keyForList: ruleID,
                      ruleID,
                      isRename: hasOnlyMerchantRename,
                      typeLabel,
                      conditionText: translate('workspace.rules.expenseDefaultsTable.merchantIs', merchantName),
                      ruleDescription,
                      searchTokens: [merchantName, ruleDescription],
                      pendingAction: rule.pendingAction,
                      errors: rule.errors,
                      onCloseError: () => clearPolicyCodingRuleErrors(policyID, ruleID, rule),
                      disabled: rule.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                      action: () => Navigation.navigate(ROUTES.RULES_MERCHANT_EDIT.getRoute(policyID, ruleID)),
                  };
              })
              .sort((a, b) => {
                  const ruleA = codingRules[a.ruleID];
                  const ruleB = codingRules[b.ruleID];
                  if (ruleA?.created && ruleB?.created) {
                      return ruleA.created < ruleB.created ? 1 : -1;
                  }
                  return 0;
              });

    useEffect(() => {
        // Fetch once on mount (and when policyID changes). setPolicyCodingRule already updates Onyx — refetching after saves can overwrite a newly added rule with stale data.
        openPolicyRulesPage(policyID);
    }, [policyID]);

    let selectedRuleKeys: string[];
    if (activeTab === RULES_TAB.CARD_RESTRICTIONS) {
        selectedRuleKeys = selectedSpendRuleKeys;
    } else if (activeTab === RULES_TAB.EXPENSE_DEFAULTS) {
        selectedRuleKeys = selectedExpenseDefaultKeys;
    } else {
        selectedRuleKeys = [];
    }
    const hasSelectedRules = selectedRuleKeys.length > 0;
    const isTableTab = activeTab === RULES_TAB.CARD_RESTRICTIONS || activeTab === RULES_TAB.EXPENSE_DEFAULTS;
    const shouldShowBulkActions = canWriteRules && isTableTab && (shouldUseNarrowLayout ? isMobileSelectionModeEnabled : hasSelectedRules);
    const shouldShowAddRuleButton = activeTab === RULES_TAB.GENERAL || !shouldShowBulkActions;

    const clearTableSelection = () => {
        if (activeTab === RULES_TAB.CARD_RESTRICTIONS) {
            setSelectedSpendRuleKeys([]);
        } else if (activeTab === RULES_TAB.EXPENSE_DEFAULTS) {
            setSelectedExpenseDefaultKeys([]);
        }
        turnOffMobileSelectionMode();
    };

    const handleSpendRuleSelectionChange = (selectedRowKeys: string[]) => {
        const selectableKeys = new Set(spendRulesTableData.filter((rule) => !rule.disabled).map((rule) => rule.keyForList));
        setSelectedSpendRuleKeys(selectedRowKeys.filter((key) => selectableKeys.has(key)));
    };

    const handleExpenseDefaultSelectionChange = (selectedRowKeys: string[]) => {
        const selectableKeys = new Set(expenseDefaultsTableData.filter((rule) => !rule.disabled).map((rule) => rule.keyForList));
        setSelectedExpenseDefaultKeys(selectedRowKeys.filter((key) => selectableKeys.has(key)));
    };

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

        for (const ruleID of selectedSpendRuleKeys) {
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

        for (const ruleID of selectedExpenseDefaultKeys) {
            deletePolicyCodingRule(policy, ruleID);
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
    ];

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

    const cardRulesEmptyState = (
        <ScrollView
            style={[styles.flex1, styles.mnh0]}
            contentContainerStyle={[styles.flexGrow1, styles.flexShrink0]}
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
                containerStyles={[styles.alignItemsCenter, styles.w100, styles.alignSelfCenter, StyleUtils.getMaximumWidth(variables.cardRulesEmptyStateMaxWidth)]}
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
                                        setSelectedSpendRuleKeys([]);
                                        setSelectedExpenseDefaultKeys([]);
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
                                        selectedKeys={selectedSpendRuleKeys}
                                        onRowSelectionChange={handleSpendRuleSelectionChange}
                                        emptyStateContent={areCardsEnabled ? undefined : cardRulesEmptyState}
                                    />
                                )}
                                {activeTab === RULES_TAB.EXPENSE_DEFAULTS && (
                                    <WorkspaceExpenseDefaultsTable
                                        rulesData={expenseDefaultsTableData}
                                        selectionEnabled={canWriteRules}
                                        selectedKeys={selectedExpenseDefaultKeys}
                                        onRowSelectionChange={handleExpenseDefaultSelectionChange}
                                    />
                                )}
                            </View>
                        )}
                        {isCustomAgentBetaEnabled && !isRulesRevampEnabled && (
                            <AgentRulesSection
                                policyID={policyID}
                                canWriteRules={canWriteRules}
                                showReadOnlyModal={showReadOnlyModal}
                            />
                        )}
                    </View>
                </View>
            </WorkspacePageWithSections>
        </AccessOrNotFoundWrapper>
    );
}

export default PolicyRulesPageRevamp;
