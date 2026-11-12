import {WRITE_COMMANDS} from '@libs/API/types';
import handleRejectedExpenseReport from '@libs/Middleware/HandleRejectedExpenseReport';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type Request from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';

import type {OnyxKey} from 'react-native-onyx';

const IOU_REPORT_ID = '9FC073E800000001';
const CHAT_REPORT_ID = '1000000000000001';
const CLOSED_REPORT_UUID = '9FC073E8-D25E-4D06-A8DD-50829801ED9A';
const PERMISSION_DENIED_UUID = '20621D04-93E4-4CA6-B7ED-729CA171B7C2';

type AnyRequest = Request<OnyxKey>;

function rejectionKey(reportID: string) {
    return `${ONYXKEYS.COLLECTION.RAM_ONLY_REJECTED_EXPENSE_REPORT}${reportID}`;
}

function findValue(updates: AnyRequest['failureData'], key: string) {
    return updates?.find((update) => update.key === key)?.value;
}

function buildExpenseRequest(command: string = WRITE_COMMANDS.REQUEST_MONEY): AnyRequest {
    return {
        command,
        data: {
            iouReportID: IOU_REPORT_ID,
            chatReportID: CHAT_REPORT_ID,
            transactionID: '7000000000000001',
        },
    };
}

function buildReopenRequest(command: string): AnyRequest {
    return {
        command,
        data: {reportID: IOU_REPORT_ID, reportActionID: '6000000000000001'},
    };
}

function buildRefusalResponse(uuid: string = CLOSED_REPORT_UUID): Response<OnyxKey> {
    return {jsonCode: CONST.JSON_CODE.EXP_ERROR, UUID: uuid, message: 'New expenses cannot be added to this report.'};
}

describe('HandleRejectedExpenseReport middleware', () => {
    it('notes the refused report in failureData so the rollback leaves the client off that report', async () => {
        // Given a RequestMoney that the server refused because the expense report it was aimed at no longer takes expenses
        const request = buildExpenseRequest();

        // When the response passes through the middleware
        await handleRejectedExpenseReport(Promise.resolve(buildRefusalResponse()), request, false);

        // Then the rollback carries the note about that report
        expect(findValue(request.failureData, rejectionKey(IOU_REPORT_ID))).toBe(true);
    });

    it('covers TrackExpense, which aims an expense at a report the same way', async () => {
        // Given a TrackExpense refused for the same reason
        const request = buildExpenseRequest(WRITE_COMMANDS.TRACK_EXPENSE);

        // When the response passes through the middleware
        await handleRejectedExpenseReport(Promise.resolve(buildRefusalResponse()), request, false);

        // Then the note is carried the same way
        expect(findValue(request.failureData, rejectionKey(IOU_REPORT_ID))).toBe(true);
    });

    it('ignores a 666 whose reason is something else, such as a permissions refusal', async () => {
        // Given a refusal thrown for a different reason, which reads the same to the user but says nothing about the report's state
        const request = buildExpenseRequest();

        // When the response passes through the middleware
        await handleRejectedExpenseReport(Promise.resolve(buildRefusalResponse(PERMISSION_DENIED_UUID)), request, false);

        // Then no report is noted, because a permissions refusal is not evidence the report left the writable states
        expect(findValue(request.failureData, rejectionKey(IOU_REPORT_ID))).toBeUndefined();
    });

    it('leaves a successful expense write alone', async () => {
        // Given an expense the server accepted
        const request = buildExpenseRequest();

        // When the response passes through the middleware
        await handleRejectedExpenseReport(Promise.resolve({jsonCode: CONST.JSON_CODE.SUCCESS}), request, false);

        // Then nothing is noted
        expect(request.failureData).toBeUndefined();
    });

    it.each([WRITE_COMMANDS.REOPEN_REPORT, WRITE_COMMANDS.RETRACT_REPORT, WRITE_COMMANDS.UNAPPROVE_EXPENSE_REPORT])(
        'retires the note when %s succeeds, since the report takes expenses again',
        async (command) => {
            // Given a report the client had noted as refusing expenses, now moved back to a state that accepts them
            const request = buildReopenRequest(command);

            // When the response passes through the middleware
            await handleRejectedExpenseReport(Promise.resolve({jsonCode: CONST.JSON_CODE.SUCCESS}), request, false);

            // Then the success data clears the note, so the report is a destination again
            expect(findValue(request.successData, rejectionKey(IOU_REPORT_ID))).toBeNull();
        },
    );

    it('keeps the note when a reopen fails', async () => {
        // Given a reopen attempt the server rejected, so the report is still not writable
        const request = buildReopenRequest(WRITE_COMMANDS.RETRACT_REPORT);

        // When the response passes through the middleware
        await handleRejectedExpenseReport(Promise.resolve({jsonCode: CONST.JSON_CODE.EXP_ERROR}), request, false);

        // Then no update retires the note
        expect(request.successData).toBeUndefined();
    });
});
