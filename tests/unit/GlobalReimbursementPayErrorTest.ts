import {WRITE_COMMANDS} from '@libs/API/types';
import globalReimbursementPayError from '@libs/Middleware/GlobalReimbursementPayError';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AnyOnyxUpdate} from '@src/types/onyx/Request';
import type Request from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';

import type {OnyxKey} from 'react-native-onyx';

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

function buildCorpayPayModalResponse(jsonCode: number | string = CONST.JSON_CODE.EXP_ERROR): Response<OnyxKey> {
    return {
        jsonCode,
        onyxData: [
            {
                onyxMethod: 'set',
                key: ONYXKEYS.RAM_ONLY_CORPAY_PAY_MODAL,
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
    it('replaces optimistic PAY action error with null in failureData when payment fails with corpayPayModal', async () => {
        const request = buildPayRequest();
        const response = buildCorpayPayModalResponse();

        const result = await globalReimbursementPayError(Promise.resolve(response), request, false);

        expect(result).toBe(response);
        const actionsUpdate = findFailureUpdate(request, `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${IOU_REPORT_ID}`);
        expect(actionsUpdate?.value).toEqual({
            [REPORT_ACTION_ID]: null,
            [OTHER_REPORT_ACTION_ID]: {errors: {error: 'Other error'}},
        });
    });

    it('works identically for PAY_MONEY_REQUEST_WITH_WALLET command', async () => {
        const request = buildPayRequest({command: WRITE_COMMANDS.PAY_MONEY_REQUEST_WITH_WALLET});
        const response = buildCorpayPayModalResponse();

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
        const response = buildCorpayPayModalResponse(CONST.JSON_CODE.SUCCESS);

        await globalReimbursementPayError(Promise.resolve(response), request, false);

        const actionsUpdate = findFailureUpdate(request, `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${IOU_REPORT_ID}`);
        expect(actionsUpdate?.value).toEqual({
            [REPORT_ACTION_ID]: {errors: {error: 'Failed to pay'}},
            [OTHER_REPORT_ACTION_ID]: {errors: {error: 'Other error'}},
        });
    });

    it('leaves failureData untouched for non-payment commands', async () => {
        const request = buildPayRequest({command: WRITE_COMMANDS.APPROVE_MONEY_REQUEST});
        const response = buildCorpayPayModalResponse();

        await globalReimbursementPayError(Promise.resolve(response), request, false);

        const actionsUpdate = findFailureUpdate(request, `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${IOU_REPORT_ID}`);
        expect(actionsUpdate?.value).toEqual({
            [REPORT_ACTION_ID]: {errors: {error: 'Failed to pay'}},
            [OTHER_REPORT_ACTION_ID]: {errors: {error: 'Other error'}},
        });
    });

    it('leaves failureData untouched if response does not contain RAM_ONLY_CORPAY_PAY_MODAL', async () => {
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
        const response = buildCorpayPayModalResponse();

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
