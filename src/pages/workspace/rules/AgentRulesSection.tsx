import AgentRulesList from '@components/AgentRules/AgentRulesList';
import useAgentRulesSectionHeader from '@components/AgentRules/useAgentRulesSectionHeader';
import MenuItem from '@components/MenuItem';
import MenuItemSectionRoot from '@components/MenuItem/presets/MenuItemSectionRoot';
import Section from '@components/Section';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';

import {getVisibleAgentRules} from '@libs/AgentRulesUtils';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';
import {View} from 'react-native';

type AgentRulesSectionProps = {
    policyID: string;
    canWriteRules: boolean;
    showReadOnlyModal: () => void;
};

function AgentRulesSection({policyID, canWriteRules, showReadOnlyModal}: AgentRulesSectionProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const policy = usePolicy(policyID);
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Plus']);

    const visibleRules = getVisibleAgentRules(policy?.rules?.agentRules, isOffline);
    const hasRules = visibleRules.length > 0;
    const {renderTitle, renderSubtitle} = useAgentRulesSectionHeader({
        policyID,
        subtitle: translate('workspace.rules.agentRules.subtitle'),
        isBadgeCondensed: true,
    });

    return (
        <Section
            isCentralPane
            renderTitle={renderTitle}
            renderSubtitle={renderSubtitle}
            childrenStyles={[styles.gap3]}
        >
            {hasRules && (
                <AgentRulesList
                    policyID={policyID}
                    rules={visibleRules}
                    canWriteRules={canWriteRules}
                    showReadOnlyModal={showReadOnlyModal}
                    listContainerStyle={[styles.mt3, styles.gap2]}
                    menuItemWrapperStyle={styles.pv2}
                />
            )}
            {/* The row stays pressable when the user cannot write rules. Pressing it explains why, so it only looks disabled. */}
            <View style={[!hasRules && styles.mt6, styles.mbn3, !canWriteRules && styles.buttonOpacityDisabled]}>
                <MenuItemSectionRoot
                    onPress={() => {
                        if (!canWriteRules) {
                            showReadOnlyModal();
                            return;
                        }
                        Navigation.navigate(ROUTES.RULES_AGENT_NEW.getRoute(policyID));
                    }}
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.ADD_AGENT_RULE}
                >
                    <MenuItem.Row>
                        <MenuItem.Leading>
                            <MenuItem.Icon src={expensifyIcons.Plus} />
                        </MenuItem.Leading>
                        <MenuItem.Content>
                            <MenuItem.Title>{translate('workspace.rules.agentRules.addRule')}</MenuItem.Title>
                        </MenuItem.Content>
                    </MenuItem.Row>
                </MenuItemSectionRoot>
            </View>
        </Section>
    );
}

export default AgentRulesSection;
