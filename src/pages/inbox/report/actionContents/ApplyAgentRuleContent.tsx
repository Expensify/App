import type {ActionableItem} from '@components/ReportActionItem/ActionableItemButtons';
import ActionableItemButtons from '@components/ReportActionItem/ActionableItemButtons';

import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';

import {isPolicyAdmin} from '@libs/PolicyUtils';
import {getOriginalMessage} from '@libs/ReportActionsUtils';

import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';

import {resolveActionableApplyAgentRule} from '@userActions/Report';

import CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';

import React from 'react';
import {View} from 'react-native';

type ApplyAgentRuleContentProps = {
    /** The ACTIONABLEAPPLYAGENTRULE report action — RuleBot's offer to retroactively apply an agent rule */
    action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_APPLY_AGENT_RULE>;

    /** ID of the #admins room the offer lives in */
    reportID: string | undefined;
};

function ApplyAgentRuleContent({action, reportID}: ApplyAgentRuleContentProps) {
    const {translate} = useLocalize();
    const originalMessage = getOriginalMessage(action);
    const policy = usePolicy(originalMessage?.policyID);

    // Only admins of the rule's policy can resolve the offer; everyone else sees the message without buttons.
    const shouldShowButtons = !originalMessage?.resolution && isPolicyAdmin(policy);

    const buttons: ActionableItem[] = shouldShowButtons
        ? [
              {
                  text: 'workspace.rules.agentRules.applyOffer.applyButtonText',
                  key: `${action.reportActionID}-applyAgentRule-apply`,
                  onPress: () => {
                      resolveActionableApplyAgentRule(reportID, action, CONST.REPORT.ACTIONABLE_APPLY_AGENT_RULE_RESOLUTION.APPLY);
                  },
                  isPrimary: true,
              },
              {
                  text: 'workspace.rules.agentRules.applyOffer.dismissButtonText',
                  key: `${action.reportActionID}-applyAgentRule-dismiss`,
                  onPress: () => {
                      resolveActionableApplyAgentRule(reportID, action, CONST.REPORT.ACTIONABLE_APPLY_AGENT_RULE_RESOLUTION.NOTHING);
                  },
              },
          ]
        : [];

    const message = translate('workspace.rules.agentRules.applyOffer.message', {
        ruleTitle: originalMessage?.ruleTitle ?? '',
        count: originalMessage?.estimatedCount ?? 0,
    });

    return (
        <View>
            <ReportActionItemBasicMessage message={message} />
            {buttons.length > 0 && (
                <ActionableItemButtons
                    items={buttons}
                    shouldUseLocalization
                    layout="horizontal"
                />
            )}
        </View>
    );
}

export default ApplyAgentRuleContent;
