import AgentPromotionalBanner from '@components/AgentPromotionalBanner';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import SpendRulesSection from '@components/SpendRules/SpendRulesSection';
import Text from '@components/Text';
import ThreeDotsMenu from '@components/ThreeDotsMenu';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
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

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type DismissedProductTraining from '@src/types/onyx/DismissedProductTraining';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

import type {OnyxEntry} from 'react-native-onyx';

import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';

import AgentRulesSection from './AgentRulesSection';
import getImportMerchantRulesOption from './getImportMerchantRulesOption';
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
    const icons = useMemoizedLazyExpensifyIcons(['Gear', 'Table']);
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

    const moreOptions: Array<DropdownOption<DeepValueOf<typeof CONST.POLICY.SECONDARY_ACTIONS>>> = [
        getImportMerchantRulesOption({policyID, canWriteRules, showReadOnlyModal, translate, icon: icons.Table}),
    ];

    const headerCog = (
        <ThreeDotsMenu
            icon={icons.Gear}
            iconWidth={variables.iconSizeSmall}
            iconHeight={variables.iconSizeSmall}
            iconStyles={styles.tableHeaderCogButton}
            menuItems={moreOptions}
            shouldSelfPosition
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.IMPORT_MERCHANT_RULES}
        />
    );

    const rulesHeaderTitle = (
        <View style={[styles.flexRow, styles.alignItemsCenter]}>
            <Text
                numberOfLines={1}
                style={[styles.headerText, styles.textLarge, styles.lineHeightXLarge, styles.textHeadlineH2]}
                accessibilityRole={CONST.ROLE.HEADER}
                accessibilityLabel={translate('workspace.common.rules')}
            >
                {translate('workspace.common.rules')}
            </Text>
            {headerCog}
        </View>
    );

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
                headerText={rulesHeaderTitle}
                shouldShowOfflineIndicatorInWideScreen
                route={route}
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
