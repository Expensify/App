import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import AgentPromotionalBanner from '@components/AgentPromotionalBanner';
import Button from '@components/Button';
import ImageSVG from '@components/ImageSVG';
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
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type DismissedProductTraining from '@src/types/onyx/DismissedProductTraining';
import AIRulesSection from './AIRulesSection';
import IndividualExpenseRulesSectionRevamp from './IndividualExpenseRulesSectionRevamp';
import MerchantRulesSection from './MerchantRulesSection';

const RULES_TAB = {
    GENERAL: 'general',
    CARD_RESTRICTIONS: 'cardRestrictions',
    EXPENSE_DEFAULTS: 'expenseDefaults',
} as const;

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
    const icons = useMemoizedLazyExpensifyIcons(['Plus', 'Feed', 'CreditCardExclamation', 'Document']);
    const {canWrite: canWriteRules, showReadOnlyModal} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.RULES);
    const {isBetaEnabled} = usePermissions();
    const isCustomAgentBetaEnabled = isBetaEnabled(CONST.BETAS.CUSTOM_AGENT);
    const isRulesRevampEnabled = isBetaEnabled(CONST.BETAS.RULES_REVAMP);
    const [isAgentsRulesBannerDismissed = false] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {selector: agentsRulesBannerDismissedSelector});

    const [lastSelectedTab] = useOnyx(`${ONYXKEYS.COLLECTION.SELECTED_TAB}${CONST.TAB.RULES_TAB_TYPE}`);
    const lastSelectedTabStr = lastSelectedTab as string | undefined;
    const activeTab: RulesTab = lastSelectedTabStr && isRulesTab(lastSelectedTabStr) ? lastSelectedTabStr : RULES_TAB.GENERAL;
    const [selectedSpendRuleKeys, setSelectedSpendRuleKeys] = useState<string[]>([]);

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
            icon: icons.Document,
        },
    ];

    const handleNewRule = () => {
        if (!canWriteRules) {
            showReadOnlyModal();
            return;
        }
        switch (activeTab) {
            case RULES_TAB.CARD_RESTRICTIONS:
                Navigation.navigate(ROUTES.RULES_SPEND_NEW.getRoute(policyID));
                break;
            case RULES_TAB.EXPENSE_DEFAULTS:
                Navigation.navigate(ROUTES.RULES_MERCHANT_NEW.getRoute(policyID));
                break;
            default:
                break;
        }
    };

    const shouldShowAddButton = activeTab === RULES_TAB.CARD_RESTRICTIONS || activeTab === RULES_TAB.EXPENSE_DEFAULTS;

    const getHeaderContent = () => {
        if (!shouldShowAddButton) {
            return null;
        }

        return (
            <Button
                success
                onPress={handleNewRule}
                text={translate('workspace.rules.merchantRules.addRuleTitle')}
                icon={icons.Plus}
                style={shouldUseNarrowLayout && styles.flex1}
            />
        );
    };

    const areCardsEnabled = !!policy?.areExpensifyCardsEnabled;

    const cardRulesEmptyState = useMemo(
        () => (
            <View style={[styles.flex1, styles.mh5, styles.mb5, styles.highlightBG, styles.tableBottomRadius, styles.alignItemsCenter, styles.justifyContentCenter, styles.pv8, styles.ph5]}>
                <View style={[styles.alignItemsCenter, {maxWidth: variables.cardRulesEmptyStateMaxWidth}, styles.overflowHidden]}>
                    <ImageSVG
                        src={illustrations.ExpensifyCardCoins}
                        contentFit="contain"
                        style={{
                            width: '100%',
                            maxWidth: variables.cardRulesEmptyStateIllustrationWidth,
                            aspectRatio: variables.cardRulesEmptyStateIllustrationWidth / variables.cardRulesEmptyStateIllustrationHeight,
                        }}
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
        [illustrations.ExpensifyCardCoins, styles, translate, policyID],
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
            case RULES_TAB.EXPENSE_DEFAULTS:
                return (
                    <MerchantRulesSection
                        policyID={policyID}
                        canWriteRules={canWriteRules}
                        showReadOnlyModal={showReadOnlyModal}
                    />
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
                shouldUseScrollView={activeTab !== RULES_TAB.CARD_RESTRICTIONS}
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
                <View
                    style={[shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection, activeTab === RULES_TAB.CARD_RESTRICTIONS && [styles.flex1, {maxWidth: '100%'}]]}
                >
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
                    {activeTab !== RULES_TAB.CARD_RESTRICTIONS && renderTabContent()}
                    {activeTab === RULES_TAB.CARD_RESTRICTIONS && renderCardRestrictionsContent()}
                    {isCustomAgentBetaEnabled && !isRulesRevampEnabled && (
                        <AIRulesSection
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
