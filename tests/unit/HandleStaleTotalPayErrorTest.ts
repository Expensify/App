import {WRITE_COMMANDS} from '@libs/API/types';
import handleStaleTotalPayError from '@libs/Middleware/HandleStaleTotalPayError';
import {translateLocal} from '@libs/Localize';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AnyOnyxUpdate} from '@src/types/onyx/Request';
import type Request from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';

import type {OnyxKey} from 'react-native-onyx';

const IOU_REPORT_ID = '12345';
const REPORT_ACTION_ID = '67890';
const OTHER_REPORT_ACTION_ID = '11111';
const OLD_TOTAL = 100000;
const NEW_TOTAL = 100050;

type PayRequestOverrides = Partial<Omit<Request<OnyxKey>, 'failureData'>> & {
    failureData?: AnyOnyxUpdate[];
};

function buildPayRequest(overrides: PayRequestOverrides = {}): Request<OnyxKey> {
    return {
        command: WRITE_COMMANDS.PAY_MONEY_REQUEST,
        data: {
            iouReportID: IOU_REPORT_ID,
            reportActionID: REPORT_ACTION_ID,
            amount: OLD_TOTAL,
            full: true,
        },
        failureData: [
            {
                onyxMethod: 'merge',
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${IOU_REPORT_ID}`,
                value: {
                    [REPORT_ACTION_ID]: {
                        errors: {error: 'Failed to pay'},
                    },
                    [OTHER_REPORT_ACTION_ID]: {
                        errors: {error: 'Other error'},
                    },
                },
            },
            {
                onyxMethod: 'merge',
                key: `${ONYXKEYS.COLLECTION.REPORT}${IOU_REPORT_ID}`,
                value: {
                    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                },
            },
        ],
        ...overrides,
    } as Request<OnyxKey>;
}

function buildAmountChangedResponse(jsonCode: number | string = CONST.JSON_CODE.EXP_ERROR, pushedTotal = NEW_TOTAL): Response<OnyxKey> {
    return {
        jsonCode,
        onyxData: [
            {
                onyxMethod: 'merge',
                key: `${ONYXKEYS.COLLECTION.REPORT}${IOU_REPORT_ID}`,
                value: {
                    reimbursableTotal: pushedTotal,
                },
            },
        ],
    } as Response<OnyxKey>;
}

function findFailureUpdate(request: Request<OnyxKey>, key: string) {
    return request.failureData?.find((update) => update.key === key);
}

describe('HandleStaleTotalPayError middleware', () => {
    it('replaces the generic PAY action error with the amountChanged error when the pushed report total differs from the sent amount', async () => {
        // Given a failed PayMoneyRequest whose failure response pushes a refreshed report with a total that no longer
        // matches the amount the payer saw, the exact rejection the backend produces when the cached total is stale
        const request = buildPayRequest();
        const response = buildAmountChangedResponse();

        // When the middleware processes the failure response
        const result = await handleStaleTotalPayError(Promise.resolve(response), request, false);

        // Then the optimistic PAY action error is replaced with an actionable "amount changed" message so the payer
        // knows to review the new total instead of silently retrying the stale one
        expect(result).toBe(response);
        const actionsUpdate = findFailureUpdate(request, `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${IOU_REPORT_ID}`);
        expect(actionsUpdate?.value).toEqual({
            [REPORT_ACTION_ID]: {errors: {0: translateLocal('iou.error.amountChanged')}},
            [OTHER_REPORT_ACTION_ID]: {errors: {error: 'Other error'}},
        });
    });

    it('falls back to total - nonReimbursableTotal when the pushed report has no reimbursableTotal', async () => {
        // Given a pushed report that only carries the legacy total fields
        const request = buildPayRequest();
        const response: Response<OnyxKey> = {
            jsonCode: CONST.JSON_CODE.EXP_ERROR,
            onyxData: [
                {
                    onyxMethod: 'merge',
                    key: `${ONYXKEYS.COLLECTION.REPORT}${IOU_REPORT_ID}`,
                    value: {
                        total: NEW_TOTAL + 100,
                        nonReimbursableTotal: 100,
                    },
                },
            ],
        } as Response<OnyxKey>;

        // When the middleware processes the failure response
        await handleStaleTotalPayError(Promise.resolve(response), request, false);

        // Then the reimbursable total is still derived and the error is replaced
        const actionsUpdate = findFailureUpdate(request, `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${IOU_REPORT_ID}`);
        expect(actionsUpdate?.value).toEqual({
            [REPORT_ACTION_ID]: {errors: {0: translateLocal('iou.error.amountChanged')}},
            [OTHER_REPORT_ACTION_ID]: {errors: {error: 'Other error'}},
        });
    });

    it('uses the unheld totals for a partial payment (full: false)', async () => {
        // Given a partial payment that fails with a refreshed unheld reimbursable total
        const request = buildPayRequest({data: {iouReportID: IOU_REPORT_ID, reportActionID: REPORT_ACTION_ID, amount: 50000, full: false}});
        const response: Response<OnyxKey> = {
            jsonCode: CONST.JSON_CODE.EXP_ERROR,
            onyxData: [
                {
                    onyxMethod: 'merge',
                    key: `${ONYXKEYS.COLLECTION.REPORT}${IOU_REPORT_ID}`,
                    value: {
                        unheldReimbursableTotal: 50050,
                    },
                },
            ],
        } as Response<OnyxKey>;

        // When the middleware processes the failure response
        await handleStaleTotalPayError(Promise.resolve(response), request, false);

        // Then the unheld total mismatch is detected and the error is replaced
        const actionsUpdate = findFailureUpdate(request, `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${IOU_REPORT_ID}`);
        expect(actionsUpdate?.value).toEqual({
            [REPORT_ACTION_ID]: {errors: {0: translateLocal('iou.error.amountChanged')}},
            [OTHER_REPORT_ACTION_ID]: {errors: {error: 'Other error'}},
        });
    });

    it('works identically for the wallet payment command', async () => {
        // Given the wallet variant of PayMoneyRequest also sends the cached total
        const request = buildPayRequest({command: WRITE_COMMANDS.PAY_MONEY_REQUEST_WITH_WALLET});
        const response = buildAmountChangedResponse();

        // When the middleware processes the failure response
        await handleStaleTotalPayError(Promise.resolve(response), request, false);

        // Then the error is replaced the same way as for the non-wallet command
        const actionsUpdate = findFailureUpdate(request, `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${IOU_REPORT_ID}`);
        expect(actionsUpdate?.value).toEqual({
            [REPORT_ACTION_ID]: {errors: {0: translateLocal('iou.error.amountChanged')}},
            [OTHER_REPORT_ACTION_ID]: {errors: {error: 'Other error'}},
        });
    });

    it('leaves failureData untouched when the pushed total still matches the sent amount', async () => {
        // Given a failure response that pushes a report whose total equals the amount that was paid
        const request = buildPayRequest();
        const response = buildAmountChangedResponse(CONST.JSON_CODE.EXP_ERROR, OLD_TOTAL);

        // When the middleware processes the failure response
        await handleStaleTotalPayError(Promise.resolve(response), request, false);

        // Then this is NOT an amount-change rejection, so the generic error must stay in place
        const actionsUpdate = findFailureUpdate(request, `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${IOU_REPORT_ID}`);
        expect(actionsUpdate?.value).toEqual({
            [REPORT_ACTION_ID]: {errors: {error: 'Failed to pay'}},
            [OTHER_REPORT_ACTION_ID]: {errors: {error: 'Other error'}},
        });
    });

    it('leaves failureData untouched when the pushed report update carries no total fields', async () => {
        // Given a failure response that pushes an unrelated report update (e.g. just a status change) with no total
        const request = buildPayRequest();
        const response: Response<OnyxKey> = {
            jsonCode: CONST.JSON_CODE.EXP_ERROR,
            onyxData: [
                {
                    onyxMethod: 'merge',
                    key: `${ONYXKEYS.COLLECTION.REPORT}${IOU_REPORT_ID}`,
                    value: {
                        statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                    },
                },
            ],
        } as Response<OnyxKey>;

        // When the middleware processes the failure response
        await handleStaleTotalPayError(Promise.resolve(response), request, false);

        // Then there is no signal the amount changed, so the generic error must stay in place
        const actionsUpdate = findFailureUpdate(request, `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${IOU_REPORT_ID}`);
        expect(actionsUpdate?.value).toEqual({
            [REPORT_ACTION_ID]: {errors: {error: 'Failed to pay'}},
            [OTHER_REPORT_ACTION_ID]: {errors: {error: 'Other error'}},
        });
    });

    it('leaves failureData untouched if the response is successful (jsonCode 200)', async () => {
        // Given an amount-mismatch-looking response that succeeded, which cannot be a stale-total rejection
        const request = buildPayRequest();
        const response = buildAmountChangedResponse(CONST.JSON_CODE.SUCCESS);

        // When the middleware processes the response
        await handleStaleTotalPayError(Promise.resolve(response), request, false);

        // Then nothing is replaced because success responses must not surface pay errors
        const actionsUpdate = findFailureUpdate(request, `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${IOU_REPORT_ID}`);
        expect(actionsUpdate?.value).toEqual({
            [REPORT_ACTION_ID]: {errors: {error: 'Failed to pay'}},
            [OTHER_REPORT_ACTION_ID]: {errors: {error: 'Other error'}},
        });
    });

    it('leaves failureData untouched for non-payment commands', async () => {
        // Given an unrelated command that fails with an amount-mismatch-looking response
        const request = buildPayRequest({command: WRITE_COMMANDS.APPROVE_MONEY_REQUEST});
        const response = buildAmountChangedResponse();

        // When the middleware processes the failure response
        await handleStaleTotalPayError(Promise.resolve(response), request, false);

        // Then the middleware must not touch other commands
        const actionsUpdate = findFailureUpdate(request, `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${IOU_REPORT_ID}`);
        expect(actionsUpdate?.value).toEqual({
            [REPORT_ACTION_ID]: {errors: {error: 'Failed to pay'}},
            [OTHER_REPORT_ACTION_ID]: {errors: {error: 'Other error'}},
        });
    });

    it('leaves failureData untouched when the failure response has no report update for the IOU report', async () => {
        // Given a failure response that does not push the IOU report at all
        const request = buildPayRequest();
        const response: Response<OnyxKey> = {
            jsonCode: CONST.JSON_CODE.EXP_ERROR,
            onyxData: [
                {
                    onyxMethod: 'merge',
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${IOU_REPORT_ID}`,
                    value: {},
                },
            ],
        } as Response<OnyxKey>;

        // When the middleware processes the failure response
        await handleStaleTotalPayError(Promise.resolve(response), request, false);

        // Then there is no refreshed total to compare against, so the generic error stays in place
        const actionsUpdate = findFailureUpdate(request, `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${IOU_REPORT_ID}`);
        expect(actionsUpdate?.value).toEqual({
            [REPORT_ACTION_ID]: {errors: {error: 'Failed to pay'}},
            [OTHER_REPORT_ACTION_ID]: {errors: {error: 'Other error'}},
        });
    });

    it('handles missing or corrupt data fields gracefully', async () => {
        // Given requests that are missing the fields the middleware needs, which some code paths can produce
        const response = buildAmountChangedResponse();

        await expect(handleStaleTotalPayError(Promise.resolve(response), buildPayRequest({data: {reportActionID: REPORT_ACTION_ID, amount: OLD_TOTAL, full: true}}), false)).resolves.toBe(response);
        await expect(handleStaleTotalPayError(Promise.resolve(response), buildPayRequest({data: {iouReportID: IOU_REPORT_ID, amount: OLD_TOTAL, full: true}}), false)).resolves.toBe(response);
        await expect(handleStaleTotalPayError(Promise.resolve(response), buildPayRequest({data: {iouReportID: IOU_REPORT_ID, reportActionID: REPORT_ACTION_ID, full: true}}), false)).resolves.toBe(response);
        await expect(handleStaleTotalPayError(Promise.resolve(response), buildPayRequest({failureData: undefined}), false)).resolves.toBe(response);

        const requestWithCorruptUpdate = buildPayRequest({
            failureData: [
                {
                    onyxMethod: 'merge',
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${IOU_REPORT_ID}`,
                    value: 'invalid',
                },
            ],
        });
        await expect(handleStaleTotalPayError(Promise.resolve(response), requestWithCorruptUpdate, false)).resolves.toBe(response);
    });
});