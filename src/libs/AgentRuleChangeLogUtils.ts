import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import CONST from '@src/CONST';
import type ReportAction from '@src/types/onyx/ReportAction';

import type {OnyxEntry} from 'react-native-onyx';

import {getOriginalMessage, isActionOfType} from './ReportActionsUtils';

/**
 * Builds the #admins system message shown when an agent rule is added. Includes the rule's title and
 * full prompt; the title is server-generated and best-effort, so it may be empty.
 */
function getAddAgentRuleMessage(translate: LocalizedTranslate, reportAction: OnyxEntry<ReportAction>): string {
    if (!isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_AGENT_RULE)) {
        return '';
    }
    const message = getOriginalMessage(reportAction) ?? {};
    return translate('workspaceActions.agentRule.added', {title: message.ruleTitle ?? '', prompt: message.prompt ?? ''});
}

/**
 * Builds the #admins system message shown when an agent rule's prompt is updated. The title is set
 * once at creation and is not changed here.
 */
function getUpdateAgentRuleMessage(translate: LocalizedTranslate, reportAction: OnyxEntry<ReportAction>): string {
    if (!isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AGENT_RULE)) {
        return '';
    }
    const message = getOriginalMessage(reportAction) ?? {};
    return translate('workspaceActions.agentRule.updated', {title: message.ruleTitle ?? '', prompt: message.prompt ?? ''});
}

/**
 * Builds the #admins system message shown when an agent rule is deleted. Only the title is recorded.
 */
function getDeleteAgentRuleMessage(translate: LocalizedTranslate, reportAction: OnyxEntry<ReportAction>): string {
    if (!isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_AGENT_RULE)) {
        return '';
    }
    const message = getOriginalMessage(reportAction) ?? {};
    return translate('workspaceActions.agentRule.deleted', {title: message.ruleTitle ?? ''});
}

export {getAddAgentRuleMessage, getUpdateAgentRuleMessage, getDeleteAgentRuleMessage};
