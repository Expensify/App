import {WRITE_COMMANDS} from '@libs/API/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import HttpUtils from '../../src/libs/HttpUtils';

beforeAll(() => {
    Onyx.init({
        keys: ONYXKEYS,
    });
});

afterEach(() => {
    jest.restoreAllMocks();
});

describe('HttpUtils', () => {
    // The mapping is keyed on the server message, so a single entry covers every pay command
    // that can be rejected with "The request has already been paid" after a retry.
    it.each([WRITE_COMMANDS.PAY_MONEY_REQUEST, WRITE_COMMANDS.PAY_MONEY_REQUEST_WITH_WALLET, WRITE_COMMANDS.PAY_INVOICE, WRITE_COMMANDS.MARK_REPORT_PAYMENT_RECEIVED])(
        'maps the already-paid rejection of a retried %s to ALREADY_CREATED',
        async (command) => {
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                status: 200,
                headers: {get: () => null},
                json: () => Promise.resolve({jsonCode: CONST.JSON_CODE.EXP_ERROR, message: 'The request has already been paid'}),
            });

            await expect(HttpUtils.xhr(command, {})).rejects.toMatchObject({
                message: CONST.ERROR.ALREADY_CREATED,
                title: 'The request has already been paid',
            });
        },
    );
});
