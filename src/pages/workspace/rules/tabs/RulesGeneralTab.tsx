import AgentPromotionalBanner from '@components/AgentPromotionalBanner';
import ScrollView from '@components/ScrollView';

import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import {dismissProductTraining} from '@libs/actions/Welcome';

import IndividualExpenseRulesSectionRevamp from '@pages/workspace/rules/IndividualExpenseRulesSectionRevamp';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

type RulesGeneralTabProps = {
    policyID: string;
    canWriteRules: boolean;
    isAgentsRulesBannerDismissed: boolean;
    /** Opens the Agents tab through the page's tab handler, so Collect gets the Control upgrade page instead. */
    onOpenAgentsTab: () => void;
    /** The tab selector, rendered inside this tab's scroll like the table tabs render it inside their list. */
    headerComponent: React.ReactElement;
};

function RulesGeneralTab({policyID, canWriteRules, isAgentsRulesBannerDismissed, onOpenAgentsTab, headerComponent}: RulesGeneralTabProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isBetaEnabled} = usePermissions();
    const isCustomAgentBetaEnabled = isBetaEnabled(CONST.BETAS.CUSTOM_AGENT);

    // The tab owns the scroll so the selector scrolls with the content, matching the table tabs where it is the list's
    // header. The page's buttons sit above this and stay pinned.
    return (
        <ScrollView
            style={[styles.flex1]}
            addBottomSafeAreaPadding
        >
            {headerComponent}
            {/* The settings read as a column, so they keep the workspace section width the page used to impose. The
                selector above stays full width, since capping it would cut off the last tab. */}
            <View style={[styles.w100, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                <IndividualExpenseRulesSectionRevamp
                    policyID={policyID}
                    canWriteRules={canWriteRules}
                />
                {isCustomAgentBetaEnabled && !isAgentsRulesBannerDismissed && (
                    <AgentPromotionalBanner
                        title={translate('workspace.rules.agentsPromoBanner.title')}
                        subtitle={translate('workspace.rules.agentsPromoBanner.subtitle')}
                        ctaText={translate('workspace.rules.agentsPromoBanner.cta')}
                        onCtaPress={onOpenAgentsTab}
                        ctaSentryLabel={CONST.SENTRY_LABEL.AGENTS_RULES_BANNER.CTA}
                        onDismiss={() => dismissProductTraining(CONST.AGENTS_RULES_BANNER, true)}
                        dismissSentryLabel={CONST.SENTRY_LABEL.AGENTS_RULES_BANNER.DISMISS}
                        style={[styles.mh5, styles.mb5]}
                    />
                )}
            </View>
        </ScrollView>
    );
}

export default RulesGeneralTab;
