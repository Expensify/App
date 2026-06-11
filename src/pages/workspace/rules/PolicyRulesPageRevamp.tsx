import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import AgentPromotionalBanner from '@components/AgentPromotionalBanner';
import Button from '@components/Button';
import SpendRulesSection from '@components/SpendRules/SpendRulesSection';
import TabSelectorBase from '@components/TabSelector/TabSelectorBase';
import type {TabSelectorBaseItem} from '@components/TabSelector/types';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';
import {openPolicyRulesPage} from '@libs/actions/Policy/Rules';
import {dismissProductTraining} from '@libs/actions/Welcome';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
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
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const illustrations = useMemoizedLazyIllustrations(['Flash']);
    const icons = useMemoizedLazyExpensifyIcons(['Plus', 'Feed', 'CreditCardExclamation', 'DocumentMerge']);
    const {canWrite: canWriteRules, showReadOnlyModal} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.RULES);
    const {isBetaEnabled} = usePermissions();
    const isCustomAgentBetaEnabled = isBetaEnabled(CONST.BETAS.CUSTOM_AGENT);
    const [isAgentsRulesBannerDismissed = false] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {selector: agentsRulesBannerDismissedSelector});

    const [activeTab, setActiveTab] = useState<RulesTab>(RULES_TAB.GENERAL);

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
            icon: icons.DocumentMerge,
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
            case RULES_TAB.CARD_RESTRICTIONS:
                if (!policy?.areExpensifyCardsEnabled) {
                    // TODO: Show Expensify Card upsell empty state
                    return null;
                }
                return (
                    <SpendRulesSection
                        policyID={policyID}
                        canWriteRules={canWriteRules}
                        showReadOnlyModal={showReadOnlyModal}
                    />
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
                shouldUseScrollView
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
                <View style={[shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    <View style={[styles.flexRow, styles.mb1]}>
                        <TabSelectorBase
                            tabs={tabs}
                            activeTabKey={activeTab}
                            onTabPress={(key) => {
                                if (!isRulesTab(key)) {
                                    return;
                                }
                                setActiveTab(key);
                            }}
                        />
                    </View>
                    {renderTabContent()}
                    {isCustomAgentBetaEnabled && (
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
