import {renderHook} from '@testing-library/react-native';

import useTodoSearchResults from '@hooks/useTodoSearchResults';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResults} from '@src/types/onyx';

import createMock from '../../utils/createMock';

const mockLoadingKeys = new Set<string>();
jest.mock('react-native-onyx', () => ({
    __esModule: true,
    ...jest.requireActual<Record<string, unknown>>('react-native-onyx'),
    useOnyx: (key: string) => [undefined, {status: mockLoadingKeys.has(key) ? 'loading' : 'loaded'}],
}));

jest.mock('@hooks/usePersonalDetails', () => ({
    useAllPersonalDetailsWithoutSnapshots: () => [undefined, {status: mockLoadingKeys.has('personalDetailsList') ? 'loading' : 'loaded'}],
}));

const SERVER_REPORT_COUNT = 120;

// The server counted 120 drafts, two of them on its first page. The device list built from the mocked Onyx is empty.
const serverSearch = createMock<SearchResults['search']>({reportCount: SERVER_REPORT_COUNT, countedReportIDs: {A: true, B: true}});

function renderDrafts() {
    return renderHook(() => useTodoSearchResults(CONST.SEARCH.SEARCH_KEYS.SUBMIT, undefined, serverSearch));
}

describe('useTodoSearchResults', () => {
    beforeEach(() => {
        mockLoadingKeys.clear();
    });

    it('treats counted reports missing from the list as having left once everything has loaded', () => {
        // Given every collection the to-do list reads has loaded, and the two counted reports aren't in the list
        // When the Drafts list is built
        const {result} = renderDrafts();

        // Then both come off the server's count
        expect(result.current?.metadata.reportCount).toBe(SERVER_REPORT_COUNT - 2);
    });

    it.each([
        ONYXKEYS.COLLECTION.REPORT,
        ONYXKEYS.COLLECTION.POLICY,
        ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS,
        ONYXKEYS.COLLECTION.TRANSACTION,
        ONYXKEYS.COLLECTION.REPORT_ACTIONS,
        ONYXKEYS.COLLECTION.REPORT_METADATA,
        ONYXKEYS.BANK_ACCOUNT_LIST,
        ONYXKEYS.SESSION,
        'personalDetailsList',
        ONYXKEYS.COLLECTION.RULE,
    ])("keeps the server's count while %s is still loading", (loadingKey) => {
        // Given one of the collections that decides whether a report is a to-do is still loading from storage
        mockLoadingKeys.add(loadingKey);

        // When the Drafts list is built
        const {result} = renderDrafts();

        // Then nothing comes off, because reports that still match can be missing from the list until it loads
        expect(result.current?.metadata.reportCount).toBe(SERVER_REPORT_COUNT);
    });
});
