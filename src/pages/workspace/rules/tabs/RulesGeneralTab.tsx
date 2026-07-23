import AgentPromotionalBanner from '@components/AgentPromotionalBanner';

import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';

import Tab from '@libs/actions/Tab';
import {dismissProductTraining} from '@libs/actions/Welcome';

import IndividualExpenseRulesSectionRevamp from '@pages/workspace/rules/IndividualExpenseRulesSectionRevamp';

import CONST from '@src/CONST';

import React from 'react';

type RulesGeneralTabProps = {
    policyID: string;
    canWriteRules: boolean;
    isAgentsRulesBannerDismissed: boolean;
};

function RulesGeneralTab({policyID, canWriteRules, isAgentsRulesBannerDismissed}: RulesGeneralTabProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isBetaEnabled} = usePermissions();
    const isCustomAgentBetaEnabled = isBetaEnabled(CONST.BETAS.CUSTOM_AGENT);

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
                    onCtaPress={() => Tab.setSelectedTab(CONST.TAB.RULES_TAB_TYPE, CONST.TAB.RULES.AGENTS)}
                    ctaSentryLabel={CONST.SENTRY_LABEL.AGENTS_RULES_BANNER.CTA}
                    onDismiss={() => dismissProductTraining(CONST.AGENTS_RULES_BANNER, true)}
                    dismissSentryLabel={CONST.SENTRY_LABEL.AGENTS_RULES_BANNER.DISMISS}
                    style={[styles.mh5, styles.mb5]}
                />
            )}
        </>
    );
}

export default RulesGeneralTab;
