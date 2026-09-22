import {WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithMessage} from '@libs/ErrorUtils';
import {isRecord} from '@libs/ObjectUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AnyOnyxUpdate, PaginatedRequest} from '@src/types/onyx/Request';
import type Request from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';

import type {OnyxKey} from 'react-native-onyx';

import type Middleware from './types';

/**
 * Middleware that lets an EXP_ERROR message written for the user win over the generic copy the action puts in its
 * failureData. Those actions cannot read the response, so without this the specific reason the server gave, such as
 * "Unable to verify bank account ownership", never reaches the screen.
 *
 * A command belongs here only when its backend answers with a message meant to be read by the user, and only the
 * Onyx key listed alongside it is rewritten.
 */
const ERROR_KEY_BY_COMMAND = new Map<string, OnyxKey>([[WRITE_COMMANDS.ADD_PERSONAL_BANK_ACCOUNT, ONYXKEYS.PERSONAL_BANK_ACCOUNT]]);

const PreferServerErrorMessage: Middleware = <TKey extends OnyxKey>(responsePromise: Promise<Response<TKey> | void>, request: Request<TKey> | PaginatedRequest<TKey>) =>
    responsePromise.then((response) => {
        if (!response?.message || response.jsonCode !== CONST.JSON_CODE.EXP_ERROR || !request?.command || !request?.failureData) {
            return response;
        }

        const errorKey = ERROR_KEY_BY_COMMAND.get(request.command);

        if (!errorKey) {
            return response;
        }

        for (const update of request.failureData as AnyOnyxUpdate[]) {
            if (update.key !== errorKey || !isRecord(update.value) || !update.value.errors) {
                continue;
            }

            update.value = {...update.value, errors: getMicroSecondOnyxErrorWithMessage(response.message)};
        }

        return response;
    });

export default PreferServerErrorMessage;
