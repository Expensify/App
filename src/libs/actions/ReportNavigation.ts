import ONYXKEYS from '@src/ONYXKEYS';
import type LastSearchParams from '@src/types/onyx/ReportNavigation';

import type {OnyxEntry} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

type FailedSearchRequest = {
    hash: number;
    offset: number;
};

let currentLastSearchParams: OnyxEntry<LastSearchParams>;

// A failed page request settles after the report navigation that sent it may have unmounted, so `useOnyx` can't tell it what the params hold by then. The value is never rendered.
Onyx.connectWithoutView({
    key: ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY,
    callback: (value) => {
        currentLastSearchParams = value;
    },
});

function saveLastSearchParams(value: LastSearchParams) {
    Onyx.set(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY, value);
}

function restoreLastSearchParams(value: LastSearchParams, failedRequest: FailedSearchRequest) {
    if (currentLastSearchParams?.queryJSON?.hash !== failedRequest.hash || (currentLastSearchParams?.offset ?? 0) !== failedRequest.offset) {
        return;
    }
    saveLastSearchParams(value);
}

function clearLastSearchParams() {
    Onyx.set(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY, {});
}

export {clearLastSearchParams, restoreLastSearchParams, saveLastSearchParams};
