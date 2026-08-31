import {WRITE_COMMANDS} from '@libs/API/types';
import Log from '@libs/Log';

import {showCommandError} from '@userActions/CommandError';

import CONST from '@src/CONST';
import type Request from '@src/types/onyx/Request';
import type {PaginatedRequest} from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';

import type {OnyxKey} from 'react-native-onyx';

import type Middleware from './types';

/**
 * Commands that opted into having their backend rejection shown to the user.
 *
 * A command belongs here when the client cannot predict the rejection itself (so it has no pre-check to run) and
 * the request is fire-and-forget, meaning the screen that started it is gone by the time the response lands and
 * nothing else would tell the user the action silently rolled back.
 */
const COMMANDS_WITH_USER_FACING_ERRORS = new Set<string>([WRITE_COMMANDS.CHANGE_TRANSACTIONS_REPORT]);

/**
 * jsonCodes another middleware or a global handler already reacts to: reauthentication retries 407, deleted
 * copilot accounts sign the user out on 408, `SupportalPermission` owns 411, and 426 raises the update-required
 * modal. Surfacing those here would double up on UI or nag about a request that is about to be retried.
 * `unableToRetry` is not a backend rejection at all — it means the request never got a verdict from the server.
 */
const GLOBALLY_HANDLED_JSON_CODES = new Set<number | string>([CONST.JSON_CODE.NOT_AUTHENTICATED, CONST.JSON_CODE.UPDATE_REQUIRED, CONST.JSON_CODE.UNABLE_TO_RETRY, 408, 411]);

/**
 * Middleware that surfaces a backend rejection to the user for the commands listed above.
 *
 * The `failureData` of a request can only revert optimistic Onyx data — it is built before the request is sent, so
 * it cannot carry the reason the backend gave. That leaves a rejection invisible whenever the initiating screen has
 * already closed. This stores the response message under a single Onyx key that a globally mounted modal reads,
 * keyed by command so each command opts in explicitly instead of every failure in the app raising a modal.
 */
const SurfaceCommandError: Middleware = <TKey extends OnyxKey>(responsePromise: Promise<Response<TKey> | void>, request: Request<TKey> | PaginatedRequest<TKey>) =>
    responsePromise.then((response) => {
        const command = request?.command;
        if (!command || !COMMANDS_WITH_USER_FACING_ERRORS.has(command)) {
            return response;
        }

        const jsonCode = response?.jsonCode;

        // A network failure rejects the promise instead of resolving it, and the queue retries the request, so an
        // absent jsonCode here is not a rejection we should report.
        if (jsonCode === undefined || jsonCode === CONST.JSON_CODE.SUCCESS || GLOBALLY_HANDLED_JSON_CODES.has(jsonCode)) {
            return response;
        }

        const message = typeof response?.message === 'string' && response.message.length > 0 ? response.message : undefined;
        Log.info('[SurfaceCommandError] Surfacing a backend rejection to the user', false, {command, jsonCode});
        showCommandError({command, message, jsonCode});

        return response;
    });

export default SurfaceCommandError;
