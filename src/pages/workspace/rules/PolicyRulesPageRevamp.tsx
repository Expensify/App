import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import AgentPromotionalBanner from '@components/AgentPromotionalBanner';
import Button from '@components/Button';
import ImageSVG from '@components/ImageSVG';
import type {ExpenseDefaultTableItem} from '@components/Tables/WorkspaceExpenseDefaultsTable';
import WorkspaceExpenseDefaultsTable from '@components/Tables/WorkspaceExpenseDefaultsTable';
import type {SpendRuleTableItem} from '@components/Tables/WorkspaceSpendRulesTable';
import WorkspaceSpendRulesTable from '@components/Tables/WorkspaceSpendRulesTable';
import TabSelectorBase from '@components/TabSelector/TabSelectorBase';
import type {TabSelectorBaseItem} from '@components/TabSelector/types';
import Text from '@components/Text';
import useConfirmModal from '@hooks/useConfirmModal';
import useDefaultFundID from '@hooks/useDefaultFundID';
import useExpensifyCardRules from '@hooks/useExpensifyCardRulesList';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';
import {openPolicyExpensifyCardsPage} from '@libs/actions/Policy/Policy';
import {openPolicyRulesPage} from '@libs/actions/Policy/Rules';
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
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import AgentRulesSection from './AgentRulesSection';
import IndividualExpenseRulesSectionRevamp from './IndividualExpenseRulesSectionRevamp';

const RULES_TAB = CONST.TAB.RULES;

type RulesTab = (typeof RULES_TAB)[keyof typeof RULES_TAB];

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
    const icons = useMemoizedLazyExpensifyIcons(['Plus', 'Feed', 'CreditCardExclamation', 'DocumentMagicWand']);
    const {canWrite: canWriteRules, showReadOnlyModal} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.RULES);
    const {isBetaEnabled} = usePermissions();
    const isCustomAgentBetaEnabled = isBetaEnabled(CONST.BETAS.CUSTOM_AGENT);
    const isRulesRevampEnabled = isBetaEnabled(CONST.BETAS.RULES_REVAMP);
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

    useEffect(() => {
        if (!defaultFundID || defaultFundID === CONST.DEFAULT_NUMBER_ID) {
            return;
        }
        if (expensifyCardSettings?.isLoading || expensifyCardSettings?.hasOnceLoaded) {
            return;
        }
        openPolicyExpensifyCardsPage(policyID, defaultFundID);
    }, [defaultFundID, expensifyCardSettings?.hasOnceLoaded, expensifyCardSettings?.isLoading, policyID]);

    const showBuiltInProtectionModal = useCallback(() => {
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
    }, [showConfirmModal, illustrations.ExpensifyCardProtectionIllustration, styles, translate, shouldUseNarrowLayout, StyleUtils]);

    const spendRulesTableData: SpendRuleTableItem[] = useMemo(() => {
        const blockLabel = translate('workspace.rules.spendRules.block');

        const defaultRule: SpendRuleTableItem = {
            keyForList: 'default-rule',
            ruleID: 'default-rule',
            isDefault: true,
            isBlock: true,
            disabled: true,
            actionLabel: blockLabel,
            cardSummary: translate('workspace.rules.spendRules.defaultRuleDescription'),
            ruleSummary: translate('workspace.rules.spendRules.defaultRuleSummary'),
            searchTokens: [],
            action: showBuiltInProtectionModal,
        };

        const customRules: SpendRuleTableItem[] = cardRules.map((rule) => {
            const ruleSummary = rule.summaryParts.map((part) => part.text).join(', ');
            return {
                keyForList: rule.ruleID,
                ruleID: rule.ruleID,
                isDefault: false,
                isBlock: rule.isBlock,
                actionLabel: rule.actionLabel,
                cardSummary: rule.cardSummary,
                ruleSummary,
                searchTokens: rule.searchTokens,
                pendingAction: rule.pendingAction,
                disabled: rule.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                action: () => Navigation.navigate(ROUTES.RULES_SPEND_EDIT.getRoute(policyID, rule.ruleID)),
            };
        });

        return [defaultRule, ...customRules];
    }, [cardRules, policyID, translate, showBuiltInProtectionModal]);

    const expenseDefaultsTableData: ExpenseDefaultTableItem[] = useMemo(() => {
        const codingRules = policy?.rules?.codingRules;
        if (isEmptyObject(codingRules)) {
            return [];
        }

        const fieldLabels = {
            category: translate('common.category').toLowerCase(),
            tag: translate('common.tag').toLowerCase(),
            description: translate('common.description').toLowerCase(),
            tax: translate('common.tax').toLowerCase(),
        };

        return Object.entries(codingRules)
            .filter(([, rule]) => !!rule)
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
    }, [policy?.rules?.codingRules, policyID, translate]);

    const fetchRules = useCallback(() => {
        openPolicyRulesPage(policyID);
    }, [policyID]);

    useEffect(() => {
        fetchRules();
    }, [fetchRules]);

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

    const getHeaderContent = () => (
        <Button
            success
            onPress={handleNewRule}
            text={translate('workspace.rules.merchantRules.addRuleTitle')}
            icon={icons.Plus}
            style={shouldUseNarrowLayout && styles.flex1}
        />
    );

    const areCardsEnabled = !!policy?.areExpensifyCardsEnabled;

    const emptyStateContainerStyle = [styles.alignItemsCenter, StyleUtils.getMaximumWidth(variables.cardRulesEmptyStateMaxWidth), styles.overflowHidden];

    const cardRulesEmptyState = useMemo(
        () => (
            <View style={[styles.flex1, styles.mh5, styles.mb5, styles.highlightBG, styles.tableBottomRadius, styles.alignItemsCenter, styles.justifyContentCenter, styles.pv8, styles.ph5]}>
                <View style={emptyStateContainerStyle}>
                    <ImageSVG
                        src={illustrations.ExpensifyCardCoins}
                        contentFit="contain"
                        style={styles.cardRulesEmptyStateIllustration}
                    />
                    <Text style={[styles.textHeadlineH1, styles.mt5, styles.textAlignCenter]}>{translate('workspace.rules.spendRules.cardRulesUpsell.title')}</Text>
                    <Text style={[styles.textLabel, styles.textSupporting, styles.mt2, styles.textAlignCenter]}>{translate('workspace.rules.spendRules.cardRulesUpsell.subtitle')}</Text>
                    <Button
                        success
                        text={translate('workspace.rules.spendRules.cardRulesUpsell.cta')}
                        onPress={() => Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(policyID))}
                        style={styles.mt5}
                    />
                </View>
            </View>
        ),
        [illustrations.ExpensifyCardCoins, styles, translate, policyID, emptyStateContainerStyle],
    );

    const renderExpenseDefaultsContent = () => (
        <WorkspaceExpenseDefaultsTable
            rulesData={expenseDefaultsTableData}
            selectionEnabled={canWriteRules}
            selectedKeys={selectedExpenseDefaultKeys}
            onRowSelectionChange={setSelectedExpenseDefaultKeys}
        />
    );

    const renderCardRestrictionsContent = () => (
        <WorkspaceSpendRulesTable
            rulesData={areCardsEnabled ? spendRulesTableData : []}
            selectionEnabled={canWriteRules}
            selectedKeys={selectedSpendRuleKeys}
            onRowSelectionChange={setSelectedSpendRuleKeys}
            emptyStateContent={areCardsEnabled ? undefined : cardRulesEmptyState}
        />
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case RULES_TAB.GENERAL:
                return (
                    <>
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
                        <IndividualExpenseRulesSectionRevamp
                            policyID={policyID}
                            canWriteRules={canWriteRules}
                        />
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
                headerText={translate('workspace.common.rules')}
                shouldShowOfflineIndicatorInWideScreen
                route={route}
                icon={illustrations.Flash}
                policyFeature={CONST.POLICY.POLICY_FEATURE.RULES}
                shouldShowNotFoundPage={false}
                shouldShowLoading={false}
                addBottomSafeAreaPadding
                headerContent={getHeaderContent()}
            >
                <View style={[shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection, activeTab !== RULES_TAB.GENERAL && [styles.flex1, styles.mw100]]}>
                    <View style={[styles.flexRow, styles.mb1]}>
                        <TabSelectorBase
                            tabs={tabs}
                            activeTabKey={activeTab}
                            onTabPress={(key) => {
                                if (!isRulesTab(key)) {
                                    return;
                                }
                                Tab.setSelectedTab(CONST.TAB.RULES_TAB_TYPE, key);
                            }}
                        />
                    </View>
                    {activeTab === RULES_TAB.GENERAL && renderTabContent()}
                    {activeTab === RULES_TAB.CARD_RESTRICTIONS && renderCardRestrictionsContent()}
                    {activeTab === RULES_TAB.EXPENSE_DEFAULTS && renderExpenseDefaultsContent()}
                    {isCustomAgentBetaEnabled && !isRulesRevampEnabled && (
                        <AgentRulesSection
                            policyID={policyID}
                            canWriteRules={canWriteRules}
                            showReadOnlyModal={showReadOnlyModal}
                        />
                    )}
                </View>
            </WorkspacePageWithSections>
        </AccessOrNotFoundWrapper>
    );
}

export default PolicyRulesPageRevamp;
