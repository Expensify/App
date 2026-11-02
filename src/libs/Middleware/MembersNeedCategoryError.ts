import {WRITE_COMMANDS} from '@libs/API/types';
import Log from '@libs/Log';

import {setMembersNeedCategoryModal} from '@userActions/Policy/Category';

import CONST from '@src/CONST';
import type {PaginatedRequest} from '@src/types/onyx/Request';
import type Request from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';

import type {OnyxKey} from 'react-native-onyx';

import type Middleware from './types';

/**
 * Middleware that catches the backend rejecting SetWorkspaceCategoriesEnabled because disabling the categories would
 * leave members without one they can use. Write requests don't hand their response back to the caller, so it signals
 * the "Cannot disable category" modal through Onyx with the members the backend sent. The request's failureData already
 * puts the categories back.
 */
const MembersNeedCategoryError: Middleware = <TKey extends OnyxKey>(responsePromise: Promise<Response<TKey> | void>, request: Request<TKey> | PaginatedRequest<TKey>) =>
    responsePromise.then((response) => {
        if (request?.command !== WRITE_COMMANDS.SET_WORKSPACE_CATEGORIES_ENABLED || !response || response.jsonCode === CONST.JSON_CODE.SUCCESS) {
            return response;
        }

        const accountIDs = response.additionalData?.accountIDs;
        const policyID = request.data?.policyID;
        const categories = request.data?.categories;
        if (!accountIDs?.length || typeof policyID !== 'string' || typeof categories !== 'string') {
            return response;
        }

        let categoryCount = 1;
        try {
            const parsedCategories: unknown = JSON.parse(categories);
            categoryCount = Array.isArray(parsedCategories) ? parsedCategories.length : 1;
        } catch (error) {
            Log.warn('MembersNeedCategoryError: could not parse the request categories', {error});
        }

        setMembersNeedCategoryModal(policyID, accountIDs, categoryCount);
        return response;
    });

export default MembersNeedCategoryError;
