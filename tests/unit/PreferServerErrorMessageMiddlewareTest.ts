import {WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import PreferServerErrorMessage from '@libs/Middleware/PreferServerErrorMessage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import type Request from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';

import type {OnyxKey} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

const SERVER_MESSAGE = 'Unable to verify bank account ownership. Please chat with Concierge for further assistance.';

/** The failure update `addPersonalBankAccount` writes, kept separately so a test can read it back after the middleware runs. */
type FailureUpdate = {
    onyxMethod: typeof Onyx.METHOD.MERGE;
    key: typeof ONYXKEYS.PERSONAL_BANK_ACCOUNT;
    value: {isLoading: boolean; errors: Errors};
};

let requestIndex = 0;

function buildRequest(command: string = WRITE_COMMANDS.ADD_PERSONAL_BANK_ACCOUNT): {request: Request<OnyxKey>; failureUpdate: FailureUpdate} {
    requestIndex += 1;

    const failureUpdate: FailureUpdate = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: ONYXKEYS.PERSONAL_BANK_ACCOUNT,
        value: {
            isLoading: false,
            errors: getMicroSecondOnyxErrorWithTranslationKey('walletPage.addBankAccountFailure'),
        },
    };

    return {request: {command, data: {}, requestIndex, failureData: [failureUpdate]}, failureUpdate};
}

function getErrorMessages(failureUpdate: FailureUpdate): Array<string | null> {
    return Object.values(failureUpdate.value.errors);
}

describe('PreferServerErrorMessage middleware', () => {
    it('replaces the generic failure copy with the message the server wrote for the user', async () => {
        const {request, failureUpdate} = buildRequest();
        const response: Response<OnyxKey> = {jsonCode: CONST.JSON_CODE.EXP_ERROR, message: SERVER_MESSAGE};

        await PreferServerErrorMessage(Promise.resolve(response), request, false);

        expect(getErrorMessages(failureUpdate)).toEqual([SERVER_MESSAGE]);
    });

    it('keeps the generic copy when the server sends no message', async () => {
        const {request, failureUpdate} = buildRequest();
        const before = getErrorMessages(failureUpdate);

        await PreferServerErrorMessage(Promise.resolve({jsonCode: CONST.JSON_CODE.EXP_ERROR}), request, false);

        expect(getErrorMessages(failureUpdate)).toEqual(before);
    });

    it('keeps the generic copy for a failure that is not an EXP_ERROR', async () => {
        const {request, failureUpdate} = buildRequest();
        const before = getErrorMessages(failureUpdate);

        await PreferServerErrorMessage(Promise.resolve({jsonCode: CONST.JSON_CODE.BAD_REQUEST, message: SERVER_MESSAGE}), request, false);

        expect(getErrorMessages(failureUpdate)).toEqual(before);
    });

    it('leaves a command that is not listed untouched', async () => {
        const {request, failureUpdate} = buildRequest(WRITE_COMMANDS.UPDATE_PERSONAL_BANK_ACCOUNT_INFO);
        const before = getErrorMessages(failureUpdate);

        await PreferServerErrorMessage(Promise.resolve({jsonCode: CONST.JSON_CODE.EXP_ERROR, message: SERVER_MESSAGE}), request, false);

        expect(getErrorMessages(failureUpdate)).toEqual(before);
    });

    it('passes the response through unchanged', async () => {
        const response: Response<OnyxKey> = {jsonCode: CONST.JSON_CODE.EXP_ERROR, message: SERVER_MESSAGE};

        const result = await PreferServerErrorMessage(Promise.resolve(response), buildRequest().request, false);

        expect(result).toBe(response);
    });
});
