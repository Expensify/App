import {followGlobalReimbursementsBulkPay} from '@libs/actions/GlobalReimbursementsBulkPay';
import type {PayMoneyRequestFunctionParams} from '@libs/actions/IOU/PayMoneyRequest';
import {followPaymentWithoutWiseQuote, takePaymentWithoutWiseQuote} from '@libs/actions/PaymentsWithoutWiseQuote';
import {WRITE_COMMANDS} from '@libs/API/types';
import globalReimbursementPayError from '@libs/Middleware/GlobalReimbursementPayError';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import type {AnyOnyxUpdate} from '@src/types/onyx/Request';
import type Request from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';

import type {OnyxKey} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const IOU_REPORT_ID = '12345';
const REPORT_ACTION_ID = '67890';
const OTHER_REPORT_ACTION_ID = '11111';

type PayRequestOverrides = Partial<Omit<Request<OnyxKey>, 'failureData'>> & {
    failureData?: AnyOnyxUpdate[];
};

function buildPayRequest(overrides: PayRequestOverrides = {}): Request<OnyxKey> {
    return {
        command: WRITE_COMMANDS.PAY_MONEY_REQUEST,
        data: {
            iouReportID: IOU_REPORT_ID,
            reportActionID: REPORT_ACTION_ID,
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

function buildEnableGlobalReimbursementsModalResponse(jsonCode: number | string = CONST.JSON_CODE.EXP_ERROR): Response<OnyxKey> {
    return {
        jsonCode,
        onyxData: [
            {
                onyxMethod: 'set',
                key: ONYXKEYS.RAM_ONLY_ENABLE_GLOBAL_REIMBURSEMENTS_MODAL,
                value: {
                    bankAccountID: 100,
                    bankCountry: CONST.COUNTRY.CA,
                    bankCurrency: CONST.CURRENCY.CAD,
                },
            },
        ],
    } as Response<OnyxKey>;
}

function buildWiseQuoteRequiredResponse(): Response<OnyxKey> {
    return {
        jsonCode: CONST.JSON_CODE.EXP_ERROR,
        onyxData: [{onyxMethod: 'set', key: ONYXKEYS.RAM_ONLY_WISE_QUOTE_REQUIRED, value: {reportID: IOU_REPORT_ID}}],
    };
}

function hasWiseQuoteRequiredSignal(response: Response<OnyxKey>): boolean {
    return !!response.onyxData?.some((update) => update.key === ONYXKEYS.RAM_ONLY_WISE_QUOTE_REQUIRED);
}

function findFailureUpdate(request: Request<OnyxKey>, key: string) {
    return request.failureData?.find((update) => update.key === key);
}

describe('GlobalReimbursementPayError middleware', () => {
    it('replaces optimistic PAY action error with null in failureData when payment fails with enableGlobalReimbursementsModal', async () => {
        const request = buildPayRequest();
        const response = buildEnableGlobalReimbursementsModalResponse();

        const result = await globalReimbursementPayError(Promise.resolve(response), request, false);

        expect(result).toBe(response);
        const actionsUpdate = findFailureUpdate(request, `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${IOU_REPORT_ID}`);
        expect(actionsUpdate?.value).toEqual({
            [REPORT_ACTION_ID]: null,
            [OTHER_REPORT_ACTION_ID]: {errors: {error: 'Other error'}},
        });
    });

    describe('Search bulk pay', () => {
        const BANK_ACCOUNT = {bankAccountID: 100, bankCountry: CONST.COUNTRY.US, bankCurrency: CONST.CURRENCY.USD};
        const OTHER_IOU_REPORT_ID = '54321';

        beforeAll(() => {
            Onyx.init({keys: ONYXKEYS});
        });

        afterEach(async () => {
            await Onyx.clear();
        });

        it('holds back the backend signal and lists the rejected report once every payment of the click has a response', async () => {
            // Given a bulk pay click that pays two reports
            followGlobalReimbursementsBulkPay({
                bankAccount: BANK_ACCOUNT,
                pendingReportNames: new Map([
                    [IOU_REPORT_ID, 'Rejected report'],
                    [OTHER_IOU_REPORT_ID, 'Paid report'],
                ]),
                skippedReportNames: [],
                hasPaidReports: false,
            });
            const request = buildPayRequest();
            const response = buildEnableGlobalReimbursementsModalResponse();

            // When the backend rejects the first payment because the account needs global reimbursements
            const result = await globalReimbursementPayError(Promise.resolve(response), request, false);
            await waitForBatchedUpdates();

            // Then the signal doesn't open the global reimbursements intro for this single rejection, and nothing shows while the other payment is in flight
            expect(result).toBe(response);
            expect(response.onyxData?.some((update) => update.key === ONYXKEYS.RAM_ONLY_ENABLE_GLOBAL_REIMBURSEMENTS_MODAL)).toBe(false);
            expect(await getOnyxValue(ONYXKEYS.RAM_ONLY_ENABLE_GLOBAL_REIMBURSEMENTS_MODAL)).toBeUndefined();
            // And the failed PAY action is still dropped, the same as for a single payment
            expect(findFailureUpdate(request, `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${IOU_REPORT_ID}`)?.value).toEqual({
                [REPORT_ACTION_ID]: null,
                [OTHER_REPORT_ACTION_ID]: {errors: {error: 'Other error'}},
            });

            // When the other payment goes through
            const otherRequest = buildPayRequest({data: {iouReportID: OTHER_IOU_REPORT_ID, reportActionID: REPORT_ACTION_ID}});
            await globalReimbursementPayError(Promise.resolve({jsonCode: CONST.JSON_CODE.SUCCESS, onyxData: []}), otherRequest, false);
            await waitForBatchedUpdates();

            // Then the rejected report is listed next to the paid one
            expect(await getOnyxValue(ONYXKEYS.RAM_ONLY_ENABLE_GLOBAL_REIMBURSEMENTS_MODAL)).toEqual({...BANK_ACCOUNT, unpaidReportNames: ['Rejected report']});
        });
    });

    describe('Wise quote required', () => {
        const payment = createMock<PayMoneyRequestFunctionParams>({iouReport: createMock<Report>({reportID: IOU_REPORT_ID})});

        afterEach(() => {
            takePaymentWithoutWiseQuote(IOU_REPORT_ID);
        });

        it('keeps the signal and the payment, and drops the PAY action and the report error, when this tab sent the payment without a quote', async () => {
            // Given a payment this tab sent from a Wise account without a quote, from Search, whose failureData puts a generic error on the report
            followPaymentWithoutWiseQuote(IOU_REPORT_ID, payment);
            const request = buildPayRequest();
            const reportUpdate = findFailureUpdate(request, `${ONYXKEYS.COLLECTION.REPORT}${IOU_REPORT_ID}`);
            if (reportUpdate) {
                reportUpdate.value = {statusNum: CONST.REPORT.STATUS_NUM.OPEN, errors: {error: 'Generic error'}};
            }
            const response = buildWiseQuoteRequiredResponse();

            // When the backend rejects it because the payment converts currency
            await globalReimbursementPayError(Promise.resolve(response), request, false);

            // Then the quote opens instead of an error, and the payment waits to be paid again with the confirmed quote
            expect(hasWiseQuoteRequiredSignal(response)).toBe(true);
            expect(findFailureUpdate(request, `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${IOU_REPORT_ID}`)?.value).toEqual({
                [REPORT_ACTION_ID]: null,
                [OTHER_REPORT_ACTION_ID]: {errors: {error: 'Other error'}},
            });
            expect(findFailureUpdate(request, `${ONYXKEYS.COLLECTION.REPORT}${IOU_REPORT_ID}`)?.value).toEqual({statusNum: CONST.REPORT.STATUS_NUM.OPEN});
            expect(takePaymentWithoutWiseQuote(IOU_REPORT_ID)).toBe(payment);
        });

        it('drops the signal and keeps the error when this tab did not send the payment', async () => {
            // Given a payment this tab has nothing to pay again with, such as one sent from another tab
            const request = buildPayRequest();
            const response = buildWiseQuoteRequiredResponse();

            // When the backend asks for a quote
            await globalReimbursementPayError(Promise.resolve(response), request, false);

            // Then the admin sees the failed payment instead of nothing
            expect(hasWiseQuoteRequiredSignal(response)).toBe(false);
            expect(findFailureUpdate(request, `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${IOU_REPORT_ID}`)?.value).toEqual({
                [REPORT_ACTION_ID]: {errors: {error: 'Failed to pay'}},
                [OTHER_REPORT_ACTION_ID]: {errors: {error: 'Other error'}},
            });
        });

        it('drops the signal and keeps the error for a bulk payment, so bulk pay does not open one quote per report', async () => {
            // Given a bulk pay click that pays the report from a Wise account without a quote
            followGlobalReimbursementsBulkPay({
                bankAccount: {bankAccountID: 100, bankCountry: CONST.COUNTRY.US, bankCurrency: CONST.CURRENCY.USD},
                pendingReportNames: new Map([[IOU_REPORT_ID, 'Report']]),
                skippedReportNames: [],
                hasPaidReports: false,
            });
            followPaymentWithoutWiseQuote(IOU_REPORT_ID, payment);
            const request = buildPayRequest();
            const response = buildWiseQuoteRequiredResponse();

            // When the backend asks for a quote
            await globalReimbursementPayError(Promise.resolve(response), request, false);

            // Then the report keeps its failed payment and the payment is forgotten
            expect(hasWiseQuoteRequiredSignal(response)).toBe(false);
            expect(findFailureUpdate(request, `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${IOU_REPORT_ID}`)?.value).toEqual({
                [REPORT_ACTION_ID]: {errors: {error: 'Failed to pay'}},
                [OTHER_REPORT_ACTION_ID]: {errors: {error: 'Other error'}},
            });
            expect(takePaymentWithoutWiseQuote(IOU_REPORT_ID)).toBeUndefined();
        });

        it('forgets the payment once it goes through', async () => {
            // Given a payment this tab sent from a Wise account without a quote
            followPaymentWithoutWiseQuote(IOU_REPORT_ID, payment);

            // When the backend pays it
            await globalReimbursementPayError(Promise.resolve({jsonCode: CONST.JSON_CODE.SUCCESS, onyxData: []}), buildPayRequest(), false);

            // Then nothing is kept to pay it again
            expect(takePaymentWithoutWiseQuote(IOU_REPORT_ID)).toBeUndefined();
        });
    });

    it('keeps the backend signal for a payment outside of bulk pay', async () => {
        // Given a pay request that isn't part of a bulk pay run
        const request = buildPayRequest();
        const response = buildEnableGlobalReimbursementsModalResponse();

        // When the backend rejects the payment because the account needs global reimbursements
        await globalReimbursementPayError(Promise.resolve(response), request, false);

        // Then the signal stays, so the global reimbursements intro opens right away as before
        expect(response.onyxData?.some((update) => update.key === ONYXKEYS.RAM_ONLY_ENABLE_GLOBAL_REIMBURSEMENTS_MODAL)).toBe(true);
    });

    it('drops the generic report error that Search pay adds to failureData when payment fails with enableGlobalReimbursementsModal', async () => {
        // Given a pay request from Search, whose failureData puts a generic error on the report
        const request = buildPayRequest();
        const reportUpdate = findFailureUpdate(request, `${ONYXKEYS.COLLECTION.REPORT}${IOU_REPORT_ID}`);
        expect(reportUpdate).toBeDefined();
        if (reportUpdate) {
            reportUpdate.value = {statusNum: CONST.REPORT.STATUS_NUM.OPEN, errors: {error: 'Generic error'}};
        }
        const response = buildEnableGlobalReimbursementsModalResponse();

        // When the backend rejects the payment because the account needs global reimbursements
        await globalReimbursementPayError(Promise.resolve(response), request, false);

        // Then the report keeps its other failure updates but not the error, because the global reimbursements setup explains the rejection
        expect(findFailureUpdate(request, `${ONYXKEYS.COLLECTION.REPORT}${IOU_REPORT_ID}`)?.value).toEqual({statusNum: CONST.REPORT.STATUS_NUM.OPEN});
    });

    it('keeps the generic report error when the payment fails for another reason', async () => {
        // Given a pay request from Search, whose failureData puts a generic error on the report
        const request = buildPayRequest();
        const reportUpdate = findFailureUpdate(request, `${ONYXKEYS.COLLECTION.REPORT}${IOU_REPORT_ID}`);
        expect(reportUpdate).toBeDefined();
        if (reportUpdate) {
            reportUpdate.value = {statusNum: CONST.REPORT.STATUS_NUM.OPEN, errors: {error: 'Generic error'}};
        }
        const response: Response<OnyxKey> = {jsonCode: CONST.JSON_CODE.EXP_ERROR, onyxData: []};

        // When the payment fails without the global reimbursements signal
        await globalReimbursementPayError(Promise.resolve(response), request, false);

        // Then the error stays, because nothing else tells the admin the payment failed
        expect(findFailureUpdate(request, `${ONYXKEYS.COLLECTION.REPORT}${IOU_REPORT_ID}`)?.value).toEqual({statusNum: CONST.REPORT.STATUS_NUM.OPEN, errors: {error: 'Generic error'}});
    });

    it('works identically for PAY_MONEY_REQUEST_WITH_WALLET command', async () => {
        const request = buildPayRequest({command: WRITE_COMMANDS.PAY_MONEY_REQUEST_WITH_WALLET});
        const response = buildEnableGlobalReimbursementsModalResponse();

        const result = await globalReimbursementPayError(Promise.resolve(response), request, false);

        expect(result).toBe(response);
        const actionsUpdate = findFailureUpdate(request, `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${IOU_REPORT_ID}`);
        expect(actionsUpdate?.value).toEqual({
            [REPORT_ACTION_ID]: null,
            [OTHER_REPORT_ACTION_ID]: {errors: {error: 'Other error'}},
        });
    });

    it('leaves failureData untouched if response is successful (jsonCode 200)', async () => {
        const request = buildPayRequest();
        const response = buildEnableGlobalReimbursementsModalResponse(CONST.JSON_CODE.SUCCESS);

        await globalReimbursementPayError(Promise.resolve(response), request, false);

        const actionsUpdate = findFailureUpdate(request, `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${IOU_REPORT_ID}`);
        expect(actionsUpdate?.value).toEqual({
            [REPORT_ACTION_ID]: {errors: {error: 'Failed to pay'}},
            [OTHER_REPORT_ACTION_ID]: {errors: {error: 'Other error'}},
        });
    });

    it('leaves failureData untouched for non-payment commands', async () => {
        const request = buildPayRequest({command: WRITE_COMMANDS.APPROVE_MONEY_REQUEST});
        const response = buildEnableGlobalReimbursementsModalResponse();

        await globalReimbursementPayError(Promise.resolve(response), request, false);

        const actionsUpdate = findFailureUpdate(request, `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${IOU_REPORT_ID}`);
        expect(actionsUpdate?.value).toEqual({
            [REPORT_ACTION_ID]: {errors: {error: 'Failed to pay'}},
            [OTHER_REPORT_ACTION_ID]: {errors: {error: 'Other error'}},
        });
    });

    it('leaves failureData untouched if response does not contain RAM_ONLY_ENABLE_GLOBAL_REIMBURSEMENTS_MODAL', async () => {
        const request = buildPayRequest();
        const response: Response<OnyxKey> = {
            jsonCode: CONST.JSON_CODE.EXP_ERROR,
            onyxData: [
                {
                    onyxMethod: 'merge',
                    key: `${ONYXKEYS.COLLECTION.REPORT}${IOU_REPORT_ID}`,
                    value: {statusNum: CONST.REPORT.STATUS_NUM.OPEN},
                },
            ],
        } as Response<OnyxKey>;

        await globalReimbursementPayError(Promise.resolve(response), request, false);

        const actionsUpdate = findFailureUpdate(request, `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${IOU_REPORT_ID}`);
        expect(actionsUpdate?.value).toEqual({
            [REPORT_ACTION_ID]: {errors: {error: 'Failed to pay'}},
            [OTHER_REPORT_ACTION_ID]: {errors: {error: 'Other error'}},
        });
    });

    it('handles missing or corrupt data fields gracefully', async () => {
        const response = buildEnableGlobalReimbursementsModalResponse();

        // Missing iouReportID
        const requestWithoutIou = buildPayRequest({data: {reportActionID: REPORT_ACTION_ID}});
        await expect(globalReimbursementPayError(Promise.resolve(response), requestWithoutIou, false)).resolves.toBe(response);

        // Missing reportActionID
        const requestWithoutAction = buildPayRequest({data: {iouReportID: IOU_REPORT_ID}});
        await expect(globalReimbursementPayError(Promise.resolve(response), requestWithoutAction, false)).resolves.toBe(response);

        // Missing failureData
        const requestWithoutFailureData = buildPayRequest({failureData: undefined});
        await expect(globalReimbursementPayError(Promise.resolve(response), requestWithoutFailureData, false)).resolves.toBe(response);

        // Non-object update value in failureData
        const requestWithCorruptUpdate = buildPayRequest({
            failureData: [
                {
                    onyxMethod: 'merge',
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${IOU_REPORT_ID}`,
                    value: 'invalid',
                },
            ],
        });
        await expect(globalReimbursementPayError(Promise.resolve(response), requestWithCorruptUpdate, false)).resolves.toBe(response);
    });
});
