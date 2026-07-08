import AgentPromotionalBanner from '@components/AgentPromotionalBanner';
import SpendRulesSection from '@components/SpendRules/SpendRulesSection';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
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

import type {OnyxEntry} from 'react-native-onyx';

import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';

import AgentRulesSection from './AgentRulesSection';
import IndividualExpenseRulesSection from './IndividualExpenseRulesSection';
import MerchantRulesSection from './MerchantRulesSection';
import PolicyRulesPageRevamp from './PolicyRulesPageRevamp';

type PolicyRulesPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.RULES>;

const agentsRulesBannerDismissedSelector = (value: OnyxEntry<DismissedProductTraining>): boolean => !!value?.[CONST.AGENTS_RULES_BANNER];

function PolicyRulesPage(props: PolicyRulesPageProps) {
    const {route} = props;
    const {translate} = useLocalize();
    const {policyID} = route.params;
    const policy = usePolicy(policyID);
    useWorkspaceDocumentTitle(policy?.name, 'workspace.common.rules');
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const illustrations = useMemoizedLazyIllustrations(['Rules']);
    const {canWrite: canWriteRules, showReadOnlyModal, withReadOnlyFallback} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.RULES);
    const {isBetaEnabled} = usePermissions();
    const isRulesRevampEnabled = isBetaEnabled(CONST.BETAS.RULES_REVAMP);
    const isCustomAgentBetaEnabled = isBetaEnabled(CONST.BETAS.CUSTOM_AGENT);
    const [isAgentsRulesBannerDismissed = false] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {selector: agentsRulesBannerDismissedSelector});

    const fetchRules = useCallback(() => {
        openPolicyRulesPage(policyID);
    }, [policyID]);

    useEffect(() => {
        // PolicyRulesPageRevamp fetches rules on its own mount — skip here to avoid duplicate OpenPolicyRulesPage calls.
        if (isRulesRevampEnabled) {
            return;
        }
        fetchRules();
    }, [fetchRules, isRulesRevampEnabled]);

    if (isRulesRevampEnabled) {
        return <PolicyRulesPageRevamp {...props} />;
    }

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
                icon={illustrations.Rules}
                policyFeature={CONST.POLICY.POLICY_FEATURE.RULES}
                shouldShowNotFoundPage={false}
                shouldShowLoading={false}
                addBottomSafeAreaPadding
            >
                <View style={[styles.mt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    {isCustomAgentBetaEnabled && !isAgentsRulesBannerDismissed && (
                        <AgentPromotionalBanner
                            title={translate('workspace.rules.agentsPromoBanner.title')}
                            subtitle={translate('workspace.rules.agentsPromoBanner.subtitle')}
                            ctaText={translate('workspace.rules.agentsPromoBanner.cta')}
                            onCtaPress={() => {
                                if (!canWriteRules) {
                                    showReadOnlyModal();
                                    return;
                                }
                                Navigation.navigate(ROUTES.RULES_AGENT_NEW.getRoute(policyID));
                            }}
                            ctaSentryLabel={CONST.SENTRY_LABEL.AGENTS_RULES_BANNER.CTA}
                            onDismiss={() => dismissProductTraining(CONST.AGENTS_RULES_BANNER, true)}
                            dismissSentryLabel={CONST.SENTRY_LABEL.AGENTS_RULES_BANNER.DISMISS}
                            style={[styles.mh5, styles.mb5]}
                        />
                    )}
                    <IndividualExpenseRulesSection
                        policyID={policyID}
                        canWriteRules={canWriteRules}
                        withReadOnlyFallback={withReadOnlyFallback}
                    />
                    <MerchantRulesSection
                        policyID={policyID}
                        canWriteRules={canWriteRules}
                        showReadOnlyModal={showReadOnlyModal}
                    />
                    {!!policy?.areExpensifyCardsEnabled && (
                        <SpendRulesSection
                            policyID={policyID}
                            canWriteRules={canWriteRules}
                            showReadOnlyModal={showReadOnlyModal}
                        />
                    )}
                    {isCustomAgentBetaEnabled && (
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

export default PolicyRulesPage;
