/** Links an Insights dashboard and its chart snapshots before they are saved to Onyx. */
import {READ_COMMANDS} from '@libs/API/types';
import {isRecord} from '@libs/ObjectUtils';

import ONYXKEYS from '@src/ONYXKEYS';

import {Str} from 'expensify-common';
import Onyx from 'react-native-onyx';

import type Middleware from './types';

const StampInsightsResponse: Middleware = (requestResponse, request) =>
    requestResponse.then((response) => {
        if (request.command !== READ_COMMANDS.GET_INSIGHTS || !response?.onyxData?.length) {
            return response;
        }

        // The server can reuse a logging ID across responses.
        const insightsResponseID = Str.guid();
        const onyxData = response.onyxData.map((update) => {
            const key: unknown = update.key;
            const value: unknown = update.value;
            if (
                update.onyxMethod !== Onyx.METHOD.SET ||
                typeof key !== 'string' ||
                !(key.startsWith(ONYXKEYS.COLLECTION.INSIGHTS) || key.startsWith(ONYXKEYS.COLLECTION.SNAPSHOT)) ||
                !isRecord(value)
            ) {
                return update;
            }

            const stampedUpdate = {...update};
            Object.assign(stampedUpdate, {value: {...value, insightsResponseID}});
            return stampedUpdate;
        });
        return {...response, onyxData};
    });

export default StampInsightsResponse;
