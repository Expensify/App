/**
 * Sends the requests set aside on a SAML sign-out once the same account signs back in, and deletes them with the kept
 * comments when a different account signs in.
 */
import {flush} from '@libs/Network/SequentialQueue';

import ONYXKEYS from '@src/ONYXKEYS';
import type {RequestsKeptOnSAMLSignOut} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import {getAllIncludingOngoing as getAllPersistedRequestsIncludingOngoing, getClientRequestIndex, save as savePersistedRequest} from './PersistedRequests';

function sendOrDeleteRequestsKeptOnSAMLSignOut(requestsKeptOnSAMLSignOut: RequestsKeptOnSAMLSignOut, accountID: number): Promise<void> {
    if (requestsKeptOnSAMLSignOut.accountID !== accountID) {
        Onyx.setCollection(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT, {});
        return Onyx.set(ONYXKEYS.REQUESTS_KEPT_ON_SAML_SIGN_OUT, null);
    }

    // Another tab may have put them back already, and sending one twice could create it twice.
    const queuedRequestIndexes = new Set(getAllPersistedRequestsIncludingOngoing().map(getClientRequestIndex));
    const saves = requestsKeptOnSAMLSignOut.requests
        .filter((request) => {
            const requestIndex = getClientRequestIndex(request);
            return requestIndex === undefined || !queuedRequestIndexes.has(requestIndex);
        })
        .map((request) => savePersistedRequest(request));

    // The set-aside copy is the only one until the queue is saved to storage
    return Promise.all(saves).then(() => {
        Onyx.set(ONYXKEYS.REQUESTS_KEPT_ON_SAML_SIGN_OUT, null);
        flush();
    });
}

export default sendOrDeleteRequestsKeptOnSAMLSignOut;
