import AgentPromotionalBanner from '@components/AgentPromotionalBanner';
import Button from '@components/ButtonComposed';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import {dismissProductTraining} from '@libs/actions/Welcome';

import IndividualExpenseRulesSectionRevamp from '@pages/workspace/rules/IndividualExpenseRulesSectionRevamp';

import CONST from '@src/CONST';

import React, {useState} from 'react';

import RulesTabSearchBar from './RulesTabSearchBar';

type RulesGeneralTabProps = {
    policyID: string;
    canWriteRules: boolean;
    isAgentsRulesBannerDismissed: boolean;
    /** Opens the Agents tab through the page's tab handler, so Collect gets the Control upgrade page instead. */
    onOpenAgentsTab: () => void;
    /** Starts the new rule flow */
    onAddRule: () => void;
};

function RulesGeneralTab({policyID, canWriteRules, isAgentsRulesBannerDismissed, onOpenAgentsTab, onAddRule}: RulesGeneralTabProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isBetaEnabled} = usePermissions();
    const icons = useMemoizedLazyExpensifyIcons(['Plus']);
    const isCustomAgentBetaEnabled = isBetaEnabled(CONST.BETAS.CUSTOM_AGENT);
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <>
            <RulesTabSearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
            >
                <Button
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                    size={shouldUseNarrowLayout ? CONST.BUTTON_SIZE.MEDIUM : CONST.BUTTON_SIZE.SMALL}
                    onPress={onAddRule}
                >
                    <Button.Icon src={icons.Plus} />
                    <Button.Text>{translate('common.rule')}</Button.Text>
                </Button>
            </RulesTabSearchBar>
            <IndividualExpenseRulesSectionRevamp
                policyID={policyID}
                canWriteRules={canWriteRules}
                searchQuery={searchQuery}
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
        </>
    );
}

export default RulesGeneralTab;
