import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import ApplyAgentRuleContent from '@pages/inbox/report/actionContents/ApplyAgentRuleContent';

import {resolveActionableApplyAgentRule} from '@userActions/Report';
import type * as ReportType from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, ReportAction} from '@src/types/onyx';
import type OriginalMessage from '@src/types/onyx/OriginalMessage';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

jest.mock('@userActions/Report', () => ({
    ...jest.requireActual<typeof ReportType>('@userActions/Report'),
    resolveActionableApplyAgentRule: jest.fn(),
}));

const mockResolveActionableApplyAgentRule = jest.mocked(resolveActionableApplyAgentRule);

const REPORT_ID = 'admins-room-100';
const POLICY_ID = 'ABC123DEF456ABCD';
const CURRENT_USER_ACCOUNT_ID = 1;
const RULE_BOT_ACCOUNT_ID = 2;

const MESSAGE_TEXT = 'offered to apply the agent rule "Receipts required" to 12 open expenses. Want it applied retroactively?';
const APPLY_BUTTON_TEXT = 'Yes, apply it';
const DISMISS_BUTTON_TEXT = 'No thanks';

type ApplyAgentRuleAction = ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_APPLY_AGENT_RULE>;

function createApplyAgentRuleAction(originalMessage: Partial<OriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_APPLY_AGENT_RULE>> = {}): ApplyAgentRuleAction {
    return {
        reportActionID: 'apply-agent-rule-action-1',
        actorAccountID: RULE_BOT_ACCOUNT_ID,
        created: '2026-07-27 09:03:17.653',
        actionName: CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_APPLY_AGENT_RULE,
        person: [{type: 'TEXT', style: 'strong', text: 'RuleBot'}],
        message: [{type: 'COMMENT', html: MESSAGE_TEXT, text: MESSAGE_TEXT}],
        originalMessage: {
            policyID: POLICY_ID,
            ruleID: '4242424242',
            ruleTitle: 'Receipts required',
            estimatedCount: 12,
            ...originalMessage,
        },
    } as ApplyAgentRuleAction;
}

function renderApplyAgentRuleContent(action: ApplyAgentRuleAction) {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <ApplyAgentRuleContent
                action={action}
                reportID={REPORT_ID}
            />
        </ComposeProviders>,
    );
}

async function setPolicyRole(role: Policy['role']) {
    await act(async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
            id: POLICY_ID,
            name: 'Test Workspace',
            role,
        });
    });
}

describe('ApplyAgentRuleContent', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        wrapOnyxWithWaitForBatchedUpdates(Onyx);
        await act(async () => {
            await Onyx.merge(ONYXKEYS.SESSION, {accountID: CURRENT_USER_ACCOUNT_ID, email: 'admin@test.com'});
        });
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    it('renders the offer message with Yes/No buttons for a policy admin and resolves on press', async () => {
        await setPolicyRole(CONST.POLICY.ROLE.ADMIN);
        const action = createApplyAgentRuleAction();

        renderApplyAgentRuleContent(action);
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText(MESSAGE_TEXT)).toBeOnTheScreen();
        expect(screen.getByText(APPLY_BUTTON_TEXT)).toBeOnTheScreen();
        expect(screen.getByText(DISMISS_BUTTON_TEXT)).toBeOnTheScreen();

        fireEvent.press(screen.getByText(APPLY_BUTTON_TEXT));
        expect(mockResolveActionableApplyAgentRule).toHaveBeenCalledWith(REPORT_ID, action, CONST.REPORT.ACTIONABLE_APPLY_AGENT_RULE_RESOLUTION.APPLY);

        fireEvent.press(screen.getByText(DISMISS_BUTTON_TEXT));
        expect(mockResolveActionableApplyAgentRule).toHaveBeenCalledWith(REPORT_ID, action, CONST.REPORT.ACTIONABLE_APPLY_AGENT_RULE_RESOLUTION.NOTHING);
    });

    it('renders the message without buttons once the offer is resolved', async () => {
        await setPolicyRole(CONST.POLICY.ROLE.ADMIN);
        const action = createApplyAgentRuleAction({resolution: CONST.REPORT.ACTIONABLE_APPLY_AGENT_RULE_RESOLUTION.APPLY});

        renderApplyAgentRuleContent(action);
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText(MESSAGE_TEXT)).toBeOnTheScreen();
        expect(screen.queryByText(APPLY_BUTTON_TEXT)).not.toBeOnTheScreen();
        expect(screen.queryByText(DISMISS_BUTTON_TEXT)).not.toBeOnTheScreen();
    });

    it('renders the message without buttons for a non-admin of the policy', async () => {
        await setPolicyRole(CONST.POLICY.ROLE.USER);
        const action = createApplyAgentRuleAction();

        renderApplyAgentRuleContent(action);
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText(MESSAGE_TEXT)).toBeOnTheScreen();
        expect(screen.queryByText(APPLY_BUTTON_TEXT)).not.toBeOnTheScreen();
        expect(screen.queryByText(DISMISS_BUTTON_TEXT)).not.toBeOnTheScreen();
    });
});
