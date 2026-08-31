import {WRITE_COMMANDS} from '@libs/API/types';
import SurfaceCommandError from '@libs/Middleware/SurfaceCommandError';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CommandError} from '@src/types/onyx';
import type OnyxRequest from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';

import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

Onyx.init({keys: ONYXKEYS});

const PER_DIEM_REJECTION = "Heads up! You can't transfer Per Diem International expenses between workspaces, as the Per Diem International rates may differ on each workspace.";

/** Runs the middleware against a canned response and returns whatever it stored for the modal to pick up. */
async function runMiddleware(command: string, response: Response<never>): Promise<CommandError | null | undefined> {
    const request: OnyxRequest<never> = {command, data: {}};
    await SurfaceCommandError(Promise.resolve(response), request, true);
    await waitForBatchedUpdates();

    let commandError: CommandError | null | undefined;
    await TestHelper.getOnyxData({
        key: ONYXKEYS.RAM_ONLY_COMMAND_ERROR,
        callback: (value) => {
            commandError = value;
        },
    });
    return commandError;
}

describe('SurfaceCommandError middleware', () => {
    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('surfaces the backend message when an opted-in command is rejected', async () => {
        const commandError = await runMiddleware(WRITE_COMMANDS.CHANGE_TRANSACTIONS_REPORT, {
            jsonCode: CONST.JSON_CODE.EXP_ERROR,
            message: PER_DIEM_REJECTION,
        });

        expect(commandError).toEqual({
            command: WRITE_COMMANDS.CHANGE_TRANSACTIONS_REPORT,
            message: PER_DIEM_REJECTION,
            jsonCode: CONST.JSON_CODE.EXP_ERROR,
        });
    });

    it('surfaces a rejection with no message so the modal can fall back to generic copy', async () => {
        const commandError = await runMiddleware(WRITE_COMMANDS.CHANGE_TRANSACTIONS_REPORT, {jsonCode: CONST.JSON_CODE.EXP_ERROR});

        expect(commandError?.command).toBe(WRITE_COMMANDS.CHANGE_TRANSACTIONS_REPORT);
        expect(commandError?.message).toBeUndefined();
    });

    it('does not surface anything for a successful response', async () => {
        const commandError = await runMiddleware(WRITE_COMMANDS.CHANGE_TRANSACTIONS_REPORT, {
            jsonCode: CONST.JSON_CODE.SUCCESS,
            message: 'all good',
        });

        expect(commandError).toBeFalsy();
    });

    it('does not surface anything for a command that did not opt in', async () => {
        const commandError = await runMiddleware(WRITE_COMMANDS.OPEN_REPORT, {
            jsonCode: CONST.JSON_CODE.EXP_ERROR,
            message: PER_DIEM_REJECTION,
        });

        expect(commandError).toBeFalsy();
    });

    it.each([
        ['an expired authToken that gets retried', CONST.JSON_CODE.NOT_AUTHENTICATED],
        ['a deleted account handled globally', 408],
        ['a supportal denial handled globally', 411],
        ['a required app update handled globally', CONST.JSON_CODE.UPDATE_REQUIRED],
        ['a request that never got a verdict from the server', CONST.JSON_CODE.UNABLE_TO_RETRY],
    ])('does not surface %s', async (_label, jsonCode) => {
        const commandError = await runMiddleware(WRITE_COMMANDS.CHANGE_TRANSACTIONS_REPORT, {jsonCode, message: 'handled elsewhere'});

        expect(commandError).toBeFalsy();
    });

    it('does not surface anything when the request never reached the server', async () => {
        // A network failure rejects the promise chain instead of resolving with a jsonCode, and the queue retries it.
        const commandError = await runMiddleware(WRITE_COMMANDS.CHANGE_TRANSACTIONS_REPORT, {});

        expect(commandError).toBeFalsy();
    });
});
