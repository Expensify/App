/**
 * Sends the requests set aside on a SAML sign-out once the same account signs back in, and deletes them with the kept
 * comments when a different account signs in.
 */
import {flush} from '@libs/Network/SequentialQueue';

import ONYXKEYS from '@src/ONYXKEYS';
import type {RequestsKeptOnSAMLSignOut} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import {getAllIncludingOngoing as getAllPersistedRequestsIncludingOngoing, getClientRequestIndex, save as savePersistedRequest} from './PersistedRequests';

function sendOrDeleteRequestsKeptOnSAMLSignOut(requestsKeptOnSAMLSignOut: RequestsKeptOnSAMLSignOut, accountID: number) {
    if (requestsKeptOnSAMLSignOut.accountID !== accountID) {
        Onyx.setCollection(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT, {});
        Onyx.set(ONYXKEYS.REQUESTS_KEPT_ON_SAML_SIGN_OUT, null);
        return;
    }

    // Another tab may have put them back already, and sending one twice could create it twice.
    const queuedRequestIndexes = new Set(getAllPersistedRequestsIncludingOngoing().map(getClientRequestIndex));
    for (const request of requestsKeptOnSAMLSignOut.requests) {
        const requestIndex = getClientRequestIndex(request);
        if (requestIndex !== undefined && queuedRequestIndexes.has(requestIndex)) {
            continue;
        }
        savePersistedRequest(request);
    }

    Onyx.set(ONYXKEYS.REQUESTS_KEPT_ON_SAML_SIGN_OUT, null);
    flush();
}

export default sendOrDeleteRequestsKeptOnSAMLSignOut;
