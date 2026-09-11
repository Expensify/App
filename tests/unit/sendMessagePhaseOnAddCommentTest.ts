import {startSendMessagePhase} from '@libs/telemetry/sendMessageSpans';

import CONST from '@src/CONST';
import * as Report from '@src/libs/actions/Report';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import {createRandomReport} from '../utils/collections/reports';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/telemetry/sendMessageSpans', () => ({
    startSendMessagePhase: jest.fn(),
    markSendMessageCommitted: jest.fn(),
    endSendMessagePhases: jest.fn(),
    cancelSendMessagePhases: jest.fn(),
}));

const startSendMessagePhaseMock = jest.mocked(startSendMessagePhase);

const REPORT_ID = '1';
const REPORT_ACTION_ID = '7777';
const CURRENT_USER_ACCOUNT_ID = 1;

function addComment(reportActionID?: string) {
    Report.addComment({
        report: {...createRandomReport(1), reportID: REPORT_ID},
        text: 'hello',
        currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
        ancestors: [],
        timezoneParam: CONST.DEFAULT_TIME_ZONE,
        notifyReportID: REPORT_ID,
        delegateAccountID: undefined,
        conciergeReportID: undefined,
        reportActionID,
    });
    return waitForBatchedUpdates();
}

describe('addComment send-message phase span', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        global.fetch = TestHelper.getGlobalFetchMock();
        startSendMessagePhaseMock.mockClear();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it("opens the Propagate phase for the caller's report action id", async () => {
        await addComment(REPORT_ACTION_ID);

        expect(startSendMessagePhaseMock).toHaveBeenCalledWith(REPORT_ACTION_ID, CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.PROPAGATE);
    });

    it('does not open a phase without a report action id', async () => {
        await addComment();

        expect(startSendMessagePhaseMock).toHaveBeenCalledWith(undefined, CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.PROPAGATE);
    });
});
