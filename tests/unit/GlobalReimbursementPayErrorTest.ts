import {followGlobalReimbursementsBulkPay} from '@libs/actions/GlobalReimbursementsBulkPay';
import {WRITE_COMMANDS} from '@libs/API/types';
import globalReimbursementPayError from '@libs/Middleware/GlobalReimbursementPayError';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AnyOnyxUpdate} from '@src/types/onyx/Request';
import type Request from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';

import type {OnyxKey} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

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
                nothingOwedReportNames: [],
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
            expect(await getOnyxValue(ONYXKEYS.RAM_ONLY_ENABLE_GLOBAL_REIMBURSEMENTS_MODAL)).toEqual({...BANK_ACCOUNT, unpaidReportNames: ['Rejected report'], nothingOwedReportNames: []});
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
