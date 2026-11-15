import type {SearchQueryJSON} from '@components/Search/types';

import {restoreLastSearchParams, saveLastSearchParams} from '@libs/actions/ReportNavigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type LastSearchParams from '@src/types/onyx/ReportNavigation';

import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const FAILED_REQUEST_HASH = 1;
const OTHER_SEARCH_HASH = 2;

const buildParams = (hash: number, offset: number): LastSearchParams => ({
    queryJSON: createMock<SearchQueryJSON>({type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT, hash}),
    offset,
});

describe('actions/ReportNavigation', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => Onyx.clear().then(waitForBatchedUpdates));

    describe('restoreLastSearchParams', () => {
        const paramsBeforeRequest: LastSearchParams = {...buildParams(FAILED_REQUEST_HASH, 0), hasMoreResults: true, previousLengthOfResults: CONST.SEARCH.RESULTS_PAGE_SIZE};
        const failedRequest = {hash: FAILED_REQUEST_HASH, offset: CONST.SEARCH.RESULTS_PAGE_SIZE};

        it('restores the params while they still point at the page that failed', async () => {
            // Given the page 2 request moved the saved offset to page 2
            saveLastSearchParams(buildParams(FAILED_REQUEST_HASH, CONST.SEARCH.RESULTS_PAGE_SIZE));
            await waitForBatchedUpdates();

            // When that request fails
            restoreLastSearchParams(paramsBeforeRequest, failedRequest);
            await waitForBatchedUpdates();

            // Then the params go back to the first page, so Next can request page 2 again
            expect(await getOnyxValue(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY)).toEqual(paramsBeforeRequest);
        });

        it.each([
            ['another search', buildParams(OTHER_SEARCH_HASH, 0)],
            ['another page of the same search', buildParams(FAILED_REQUEST_HASH, CONST.SEARCH.RESULTS_PAGE_SIZE * 2)],
        ])('keeps the params when they moved on to %s before the request failed', async (_label, newerParams) => {
            // Given the user closed the report and the params were saved again while the page 2 request was still pending
            saveLastSearchParams(buildParams(FAILED_REQUEST_HASH, CONST.SEARCH.RESULTS_PAGE_SIZE));
            saveLastSearchParams(newerParams);
            await waitForBatchedUpdates();

            // When the old request fails late
            restoreLastSearchParams(paramsBeforeRequest, failedRequest);
            await waitForBatchedUpdates();

            // Then the newer params stay, because restoring the old ones would make the next report navigation page through the wrong search
            expect(await getOnyxValue(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY)).toEqual(newerParams);
        });
    });
});
