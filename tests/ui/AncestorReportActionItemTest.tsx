import {render} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import AncestorReportActionItem from '@pages/inbox/report/AncestorReportActionItem';
import type ReportActionItem from '@pages/inbox/report/ReportActionItem';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, ReportNameValuePairs} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@pages/inbox/report/ReportActionItem', () => jest.fn(() => null));
jest.mock('@pages/inbox/report/ThreadDivider', () => jest.fn(() => null));

const mockReportActionItem = jest.requireMock<jest.Mock<null, [React.ComponentProps<typeof ReportActionItem>]>>('@pages/inbox/report/ReportActionItem');

const PARENT_REPORT_ID = '200001';
const AGENT_ACCOUNT_ID = 99001;
const CURRENT_USER_ACCOUNT_ID = 12345;

const parentReport: Report = {
    reportID: PARENT_REPORT_ID,
    type: CONST.REPORT.TYPE.CHAT,
};

function createComment(reportActionID: string, actorAccountID: number, created: string): ReportAction {
    return {
        reportActionID,
        reportID: PARENT_REPORT_ID,
        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
        actorAccountID,
        created,
        message: [{type: 'COMMENT', html: 'hi', text: 'hi'}],
        originalMessage: {html: 'hi', whisperedTo: []},
        shouldShow: true,
    };
}

const conciergeComment = createComment('100', CONST.ACCOUNT_ID.CONCIERGE, '2026-09-01 00:00:00.000');
const olderAgentComment = createComment('200', AGENT_ACCOUNT_ID, '2026-09-02 00:00:00.000');
const newerAgentComment = createComment('300', AGENT_ACCOUNT_ID, '2026-09-03 00:00:00.000');

async function renderParentAction(reportAction: ReportAction, currentUserAccountID = CURRENT_USER_ACCOUNT_ID, reportNameValuePairs?: OnyxCollection<ReportNameValuePairs>) {
    render(
        <ComposeProviders components={[OnyxListItemProvider, CurrentUserPersonalDetailsProvider, LocaleContextProvider]}>
            <AncestorReportActionItem
                report={parentReport}
                reportAction={reportAction}
                shouldDisplayNewMarker={false}
                reportNameValuePairs={reportNameValuePairs}
                conciergePersonalDetail={undefined}
                conciergeReportID={undefined}
                currentUserAccountID={currentUserAccountID}
                introSelected={undefined}
                isFirstVisibleReportAction={false}
                isReportArchived={false}
                isSelfTourViewed={false}
                hasCompletedGuidedSetupFlow={undefined}
                linkedTransactionRouteError={undefined}
                parentReportAction={undefined}
                shouldUseThreadDividerLine={false}
                transactionThreadReport={undefined}
                reportsParentHierarchy={undefined}
            />
        </ComposeProviders>,
    );
    await waitForBatchedUpdatesWithAct();

    return mockReportActionItem.mock.calls.at(-1)?.at(0)?.isLatestConciergeFeedbackAction;
}

describe('AncestorReportActionItem feedback prompt', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockReportActionItem.mockClear();
        await Onyx.clear();
        await Onyx.multiSet({
            [ONYXKEYS.PERSONAL_DETAILS_LIST]: {[AGENT_ACCOUNT_ID]: {accountID: AGENT_ACCOUNT_ID, isCustomAgent: true}},
            [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${PARENT_REPORT_ID}` as const]: {
                [conciergeComment.reportActionID]: conciergeComment,
                [olderAgentComment.reportActionID]: olderAgentComment,
                [newerAgentComment.reportActionID]: newerAgentComment,
            },
        });
        await waitForBatchedUpdatesWithAct();
    });

    it("shows the prompt on a thread whose parent is the agent's newest comment", async () => {
        // Given a parent report where a custom agent wrote twice after Concierge
        // When a thread on the agent's newest comment opens
        // Then the parent message shows the prompt, as it does under the same comment in the parent report
        expect(await renderParentAction(newerAgentComment)).toBe(true);
    });

    it("keeps Concierge's prompt when an agent wrote after Concierge", async () => {
        // Given the same parent report
        // When a thread on Concierge's comment opens
        // Then the newer agent comments do not take the prompt away from Concierge
        expect(await renderParentAction(conciergeComment)).toBe(true);
    });

    it('shows no prompt on a thread whose parent is an older comment of the agent', async () => {
        // Given the same parent report
        // When a thread on the agent's older comment opens
        // Then only the agent's newest comment can be rated
        expect(await renderParentAction(olderAgentComment)).toBe(false);
    });

    it('shows no prompt on a Concierge message inside a feedback thread', async () => {
        // Given the parent message belongs to a feedback thread, where Concierge should not ask for feedback again
        const reportNameValuePairs = {
            [`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${PARENT_REPORT_ID}`]: {conciergeFeedbackForReportActionID: 'originalAnswer'},
        };

        // When a nested thread opens on the latest Concierge message in that feedback thread
        const shouldShowPrompt = await renderParentAction(conciergeComment, CURRENT_USER_ACCOUNT_ID, reportNameValuePairs);

        // Then the parent message does not offer another feedback prompt
        expect(shouldShowPrompt).toBe(false);
    });

    it('keeps the original answer prompt when only its child thread is marked for feedback', async () => {
        // Given a feedback marker on the child thread, not the report containing the original answer
        const reportNameValuePairs = {
            [`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}200002`]: {conciergeFeedbackForReportActionID: conciergeComment.reportActionID},
        };

        // When the original answer is shown above that thread after its reaction was removed
        const shouldShowPrompt = await renderParentAction(conciergeComment, CURRENT_USER_ACCOUNT_ID, reportNameValuePairs);

        // Then the child's persistent feedback marker does not hide the original answer's prompt
        expect(shouldShowPrompt).toBe(true);
    });

    it('shows no prompt to the agent itself when the agent account is open through Copilot', async () => {
        // Given the same parent report, opened while signed in as the agent
        // When a thread on the agent's newest comment opens
        // Then the agent is not asked to rate its own reply
        expect(await renderParentAction(newerAgentComment, AGENT_ACCOUNT_ID)).toBe(false);
    });
});
