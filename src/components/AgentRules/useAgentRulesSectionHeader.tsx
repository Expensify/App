import Badge from '@components/Badge';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import Text from '@components/Text';
import UserPill from '@components/UserPill';

import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {isPolicyMemberWithoutPendingDelete} from '@libs/PolicyUtils';

import React from 'react';
import {View} from 'react-native';

type UseAgentRulesSectionHeaderProps = {
    policyID: string;
    subtitle: string;
    isBadgeCondensed?: boolean;
};

function useAgentRulesSectionHeader({policyID, subtitle, isBadgeCondensed = false}: UseAgentRulesSectionHeaderProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const policy = usePolicy(policyID);
    const personalDetailsList = usePersonalDetails();

    const ruleBotAccountID = policy?.ruleBotAccountID;
    const ruleBot = ruleBotAccountID ? personalDetailsList?.[ruleBotAccountID] : undefined;
    const ruleBotDisplayName = ruleBot?.displayName ?? ruleBot?.login ?? translate('workspace.rules.agentRules.ruleBotName');

    // ruleBotAccountID stays set on the policy after RuleBot is removed from the workspace, so also require it to still be an active member before showing the "enforced by" line.
    const isRuleBotActiveMember = isPolicyMemberWithoutPendingDelete(ruleBot?.login, policy);

    const renderTitle = () => (
        <View style={[styles.flexRow, styles.alignItemsCenter, !isBadgeCondensed && styles.gap2]}>
            <Text style={[styles.textHeadline, styles.cardSectionTitle, styles.accountSettingsSectionTitle, {color: theme.text}]}>{translate('workspace.rules.agentRules.title')}</Text>
            <Badge
                text={translate('common.beta')}
                isCondensed={isBadgeCondensed}
                success
            />
        </View>
    );

    const renderSubtitle = () => (
        <View style={[styles.mt2, styles.gap2]}>
            <Text style={[styles.textNormal, styles.colorMuted]}>{subtitle}</Text>
            {!!ruleBotAccountID && isRuleBotActiveMember && (
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1Half, !isBadgeCondensed && styles.flexWrap]}>
                    <Text style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.rules.agentRules.enforcedBy')}</Text>
                    <UserPill
                        accountID={ruleBotAccountID}
                        avatar={ruleBot?.avatar}
                        displayName={ruleBotDisplayName}
                        email={ruleBot?.login}
                        style={styles.flexShrink1}
                    />
                </View>
            )}
        </View>
    );

    return {renderTitle, renderSubtitle};
}

export default useAgentRulesSectionHeader;
