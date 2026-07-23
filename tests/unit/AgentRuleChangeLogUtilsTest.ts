import {getAddAgentRuleMessage, getDeleteAgentRuleMessage, getUpdateAgentRuleMessage} from '@libs/AgentRuleChangeLogUtils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import type {ReportAction} from '@src/types/onyx';

import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('AgentRuleChangeLogUtils', () => {
    beforeAll(() => {
        IntlStore.load(CONST.LOCALES.DEFAULT);
        return waitForBatchedUpdates();
    });

    describe('getAddAgentRuleMessage', () => {
        it('returns empty string for wrong action type', () => {
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_EXPENSIFY_CARD_RULE,
                reportActionID: '1',
                created: '',
                originalMessage: {},
            } as ReportAction;
            expect(getAddAgentRuleMessage(translateLocal, action)).toBe('');
        });

        it('includes the rule title and full prompt', () => {
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_AGENT_RULE,
                reportActionID: '1',
                created: '',
                originalMessage: {
                    policyID: '1',
                    ruleID: '2',
                    ruleTitle: 'Receipts required',
                    prompt: 'Flag any expense over $25 that is missing a receipt',
                },
            } as ReportAction;
            expect(getAddAgentRuleMessage(translateLocal, action)).toBe('added the agent rule "Receipts required": Flag any expense over $25 that is missing a receipt');
        });

        it('falls back to prompt-only when the title is empty', () => {
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_AGENT_RULE,
                reportActionID: '1',
                created: '',
                originalMessage: {
                    policyID: '1',
                    ruleID: '2',
                    ruleTitle: '',
                    prompt: 'Reject any expense that includes alcohol',
                },
            } as ReportAction;
            expect(getAddAgentRuleMessage(translateLocal, action)).toBe('added an agent rule: Reject any expense that includes alcohol');
        });
    });

    describe('getUpdateAgentRuleMessage', () => {
        it('returns empty string for wrong action type', () => {
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_AGENT_RULE,
                reportActionID: '1',
                created: '',
                originalMessage: {},
            } as ReportAction;
            expect(getUpdateAgentRuleMessage(translateLocal, action)).toBe('');
        });

        it('includes the preserved title and new prompt', () => {
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AGENT_RULE,
                reportActionID: '1',
                created: '',
                originalMessage: {
                    policyID: '1',
                    ruleID: '2',
                    ruleTitle: 'Receipts required',
                    prompt: 'Reject any expense that includes alcohol',
                },
            } as ReportAction;
            expect(getUpdateAgentRuleMessage(translateLocal, action)).toBe('updated the agent rule "Receipts required" to: Reject any expense that includes alcohol');
        });

        it('falls back to prompt-only when the title is empty', () => {
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AGENT_RULE,
                reportActionID: '1',
                created: '',
                originalMessage: {
                    policyID: '1',
                    ruleID: '2',
                    ruleTitle: '',
                    prompt: 'Reject any expense that includes alcohol',
                },
            } as ReportAction;
            expect(getUpdateAgentRuleMessage(translateLocal, action)).toBe('updated an agent rule to: Reject any expense that includes alcohol');
        });
    });

    describe('getDeleteAgentRuleMessage', () => {
        it('returns empty string for wrong action type', () => {
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_AGENT_RULE,
                reportActionID: '1',
                created: '',
                originalMessage: {},
            } as ReportAction;
            expect(getDeleteAgentRuleMessage(translateLocal, action)).toBe('');
        });

        it('includes only the rule title', () => {
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_AGENT_RULE,
                reportActionID: '1',
                created: '',
                originalMessage: {
                    policyID: '1',
                    ruleID: '2',
                    ruleTitle: 'Receipts required',
                },
            } as ReportAction;
            expect(getDeleteAgentRuleMessage(translateLocal, action)).toBe('removed the agent rule "Receipts required"');
        });

        it('falls back to a generic message when the title is empty', () => {
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_AGENT_RULE,
                reportActionID: '1',
                created: '',
                originalMessage: {
                    policyID: '1',
                    ruleID: '2',
                    ruleTitle: '',
                },
            } as ReportAction;
            expect(getDeleteAgentRuleMessage(translateLocal, action)).toBe('removed an agent rule');
        });
    });
});
