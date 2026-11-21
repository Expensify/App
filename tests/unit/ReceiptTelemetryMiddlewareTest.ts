import {WRITE_COMMANDS} from '@libs/API/types';
import HttpsError from '@libs/Errors/HttpsError';
import Log from '@libs/Log';
import ReceiptTelemetry from '@libs/Middleware/ReceiptTelemetry';

import CONST from '@src/CONST';
import type Request from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';

import type {OnyxKey} from 'react-native-onyx';

type CapturedLogLine = {level: 'info' | 'alert'; message: string; params: Record<string, unknown>};

const TRACE_ID = 'trace-1';
const TRANSACTION_ID = '123';

function buildReceiptRequest(command: string = WRITE_COMMANDS.REQUEST_MONEY): Request<OnyxKey> {
    return {command, data: {transactionID: TRANSACTION_ID, receipt: {source: 'file://receipt.png', receiptTraceId: TRACE_ID, receiptEnqueuedAt: Date.now() - 5000}}};
}

function getLines(lines: CapturedLogLine[], event: string) {
    return lines.filter((line) => line.params.event === event);
}

describe('ReceiptTelemetry middleware', () => {
    let lines: CapturedLogLine[];

    beforeEach(() => {
        lines = [];
        jest.spyOn(Log, 'info').mockImplementation((message, _sendNow, params) => {
            if (!params || typeof params !== 'object' || Array.isArray(params) || params instanceof Error) {
                return;
            }
            lines.push({level: 'info', message, params});
        });
        jest.spyOn(Log, 'alert').mockImplementation((message, params) => {
            if (!params || typeof params !== 'object' || Array.isArray(params) || params instanceof Error) {
                return;
            }
            lines.push({level: 'alert', message, params});
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('logs sent and a success server result for a receipt that the server accepts', async () => {
        // Given a RequestMoney request carrying a receipt that the server accepts
        const response: Response<OnyxKey> = {jsonCode: CONST.JSON_CODE.SUCCESS, requestID: 'req-1'};

        // When the request goes through the middleware
        await ReceiptTelemetry(Promise.resolve(response), buildReceiptRequest(), true);

        // Then the trail gets a sent line and a success line, both joined by the trace and transaction ids
        const [sent] = getLines(lines, 'sent');
        expect(sent?.params).toMatchObject({receiptTraceId: TRACE_ID, transactionID: TRANSACTION_ID, command: WRITE_COMMANDS.REQUEST_MONEY});
        expect(sent?.params.msSinceEnqueued).toBeGreaterThanOrEqual(5000);
        const [result] = getLines(lines, 'serverResult');
        expect(result).toMatchObject({level: 'info', params: {resultClass: 'success', jsonCode: 200, requestID: 'req-1', receiptTraceId: TRACE_ID}});
    });

    it('logs a permanent failure at alert level and keeps the server message out of the whitelisted keys', async () => {
        // Given the server rejects the receipt with a 666 whose message could name a person
        const response: Response<OnyxKey> = {jsonCode: CONST.JSON_CODE.EXP_ERROR, message: 'Jane Doe cannot submit this'};

        // When the request goes through the middleware
        await ReceiptTelemetry(Promise.resolve(response), buildReceiptRequest(), true);

        // Then the failure is raised to alert level, and the server text goes only under serverMessage, which Sentry drops
        const [result] = getLines(lines, 'serverResult');
        expect(result).toMatchObject({level: 'alert', params: {resultClass: 'permanent', jsonCode: 666, serverMessage: 'Jane Doe cannot submit this'}});
        expect(result?.params.errorMessage).toBeUndefined();
    });

    it('counts an already created error as a success class, not a failure', async () => {
        // Given a retry that finds the transaction already created by an earlier attempt
        const error = new HttpsError({message: CONST.ERROR.ALREADY_CREATED, status: String(CONST.JSON_CODE.EXP_ERROR), title: CONST.ERROR_TITLE.ALREADY_CREATED_TRANSACTION});

        // When the rejected request goes through the middleware
        await expect(ReceiptTelemetry(Promise.reject(error), buildReceiptRequest(), true)).rejects.toBe(error);

        // Then the result is alreadyCreated at info level, so it stays out of failure counts
        const [result] = getLines(lines, 'serverResult');
        expect(result).toMatchObject({level: 'info', params: {resultClass: 'alreadyCreated', jsonCode: 666}});
    });

    it('marks a network failure as transient and still rethrows it for the queue to retry', async () => {
        // Given the request fails to reach the server at all
        const error = new HttpsError({message: CONST.ERROR.FAILED_TO_FETCH});

        // When the rejected request goes through the middleware
        await expect(ReceiptTelemetry(Promise.reject(error), buildReceiptRequest(), true)).rejects.toBe(error);

        // Then the result is transient with no response code, because the queue will retry it
        const [result] = getLines(lines, 'serverResult');
        expect(result?.params).toMatchObject({resultClass: 'transient', jsonCode: CONST.JSON_CODE.NO_RESPONSE, errorMessage: CONST.ERROR.FAILED_TO_FETCH});
    });

    it('marks a 407 as transient, because Reauthentication replays the request', async () => {
        // Given the auth token expired and the server answers 407
        const response: Response<OnyxKey> = {jsonCode: CONST.JSON_CODE.NOT_AUTHENTICATED};

        // When the response goes through the middleware
        await ReceiptTelemetry(Promise.resolve(response), buildReceiptRequest(), true);

        // Then it is not counted as a permanent loss
        const [result] = getLines(lines, 'serverResult');
        expect(result).toMatchObject({level: 'info', params: {resultClass: 'transient', jsonCode: 407}});
    });

    it('keeps a rejected edit with no receipt at info level so routine rejections do not raise server alerts', async () => {
        // Given an edit sent after the report was approved, which the server rejects with a 666
        const request: Request<OnyxKey> = {command: WRITE_COMMANDS.UPDATE_MONEY_REQUEST_MERCHANT, data: {transactionID: TRANSACTION_ID}};

        // When the request goes through the middleware
        await ReceiptTelemetry(Promise.resolve({jsonCode: CONST.JSON_CODE.EXP_ERROR}), request, true);

        // Then the failure is still classed as permanent for dashboards, but logged at info instead of alert
        const [result] = getLines(lines, 'serverResult');
        expect(result).toMatchObject({level: 'info', params: {resultClass: 'permanent', hasReceipt: 'false'}});
    });

    it('records the server result for a split, which joins the trail without being an edit', async () => {
        // Given a split of an existing expense that the server accepts
        const request: Request<OnyxKey> = {command: WRITE_COMMANDS.SPLIT_TRANSACTION, data: {transactionID: TRANSACTION_ID}};

        // When the request goes through the middleware
        await ReceiptTelemetry(Promise.resolve({jsonCode: CONST.JSON_CODE.SUCCESS}), request, true);

        // Then the split shows up on the trail, so a dashboard can see split failures too
        expect(getLines(lines, 'serverResult').at(0)?.params).toMatchObject({command: WRITE_COMMANDS.SPLIT_TRANSACTION, transactionID: TRANSACTION_ID, resultClass: 'success'});
    });

    it('logs only the server result for an expense edit that carries no receipt', async () => {
        // Given an edit of an expense's merchant, which has a transaction id but no receipt
        const request: Request<OnyxKey> = {command: WRITE_COMMANDS.UPDATE_MONEY_REQUEST_MERCHANT, data: {transactionID: TRANSACTION_ID}};

        // When the request goes through the middleware
        await ReceiptTelemetry(Promise.resolve({jsonCode: CONST.JSON_CODE.SUCCESS}), request, true);

        // Then there is no sent line, since nothing was waiting to upload, but the result is still recorded
        expect(getLines(lines, 'sent')).toHaveLength(0);
        expect(getLines(lines, 'serverResult').at(0)?.params).toMatchObject({hasReceipt: 'false', transactionID: TRANSACTION_ID, resultClass: 'success'});
    });

    it('joins a single-expense move by its transaction id', async () => {
        // Given a move of one expense, which sends a transaction list instead of a transaction id
        const request: Request<OnyxKey> = {command: WRITE_COMMANDS.CHANGE_TRANSACTIONS_REPORT, data: {transactionList: TRANSACTION_ID, reportID: '7'}};

        // When the server rejects the move
        await ReceiptTelemetry(Promise.resolve({jsonCode: 404}), request, true);

        // Then the result still carries the transaction id, so it joins the receipt trail like any other command
        const result = getLines(lines, 'serverResult').at(0);
        expect(result).toMatchObject({level: 'info', params: {transactionID: TRANSACTION_ID, transactionCount: 1, resultClass: 'permanent'}});
        expect(result?.params.transactionIDs).toBeUndefined();
    });

    it('lists the moved ids for a multi-expense move and caps the list', async () => {
        // Given a bulk move of 25 expenses
        const ids = Array.from({length: 25}, (_, index) => String(index + 1));
        const request: Request<OnyxKey> = {command: WRITE_COMMANDS.CHANGE_TRANSACTIONS_REPORT, data: {transactionList: ids.join(','), reportID: '7'}};

        // When the move succeeds
        await ReceiptTelemetry(Promise.resolve({jsonCode: CONST.JSON_CODE.SUCCESS}), request, true);

        // Then all 25 are counted but only the first 20 ids are logged, which keeps the line small
        const result = getLines(lines, 'serverResult').at(0);
        expect(result?.params.transactionCount).toBe(25);
        expect(result?.params.transactionIDs).toBe(ids.slice(0, 20).join(','));
        expect(result?.params.transactionID).toBeUndefined();
    });

    it('counts zero for a move of every expense matching a search', async () => {
        // Given a move driven by a search query, which sends an empty transaction list
        const request: Request<OnyxKey> = {command: WRITE_COMMANDS.CHANGE_TRANSACTIONS_REPORT, data: {transactionList: '', reportID: '7'}};

        // When the move succeeds
        await ReceiptTelemetry(Promise.resolve({jsonCode: CONST.JSON_CODE.SUCCESS}), request, true);

        // Then the line says no list was sent, instead of looking like a command without transactions
        expect(getLines(lines, 'serverResult').at(0)?.params).toMatchObject({transactionCount: 0});
    });

    it('stays silent for commands outside the receipt trail', async () => {
        // Given a command unrelated to expenses
        const request: Request<OnyxKey> = {command: WRITE_COMMANDS.OPEN_REPORT, data: {reportID: '1'}};

        // When it goes through the middleware
        await ReceiptTelemetry(Promise.resolve({jsonCode: CONST.JSON_CODE.SUCCESS}), request, false);

        // Then no receipt line is logged, so the trail does not pick up noise
        expect(lines).toHaveLength(0);
    });
});
