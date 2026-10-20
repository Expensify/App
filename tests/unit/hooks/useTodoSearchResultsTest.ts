import {renderHook} from '@testing-library/react-native';

import useTodoSearchResults from '@hooks/useTodoSearchResults';

import type {SearchKey} from '@libs/SearchKeyUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResults} from '@src/types/onyx';

import createMock from '../../utils/createMock';

const mockLoadingKeys = new Set<string>();
const mockReportCollectionKey = ONYXKEYS.COLLECTION.REPORT;
let mockReports: Record<string, {reportID: string}> = {};
jest.mock('react-native-onyx', () => ({
    __esModule: true,
    ...jest.requireActual<Record<string, unknown>>('react-native-onyx'),
    useOnyx: (key: string) => [key === mockReportCollectionKey ? mockReports : undefined, {status: mockLoadingKeys.has(key) ? 'loading' : 'loaded'}],
}));

jest.mock('@hooks/usePersonalDetails', () => ({
    useAllPersonalDetailsWithoutSnapshots: () => [undefined, {status: mockLoadingKeys.has('personalDetailsList') ? 'loading' : 'loaded'}],
}));

// Every report in the collection counts as a to-do, standing in for the device's classification rules
jest.mock('@libs/TodosUtils', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/TodosUtils'),
    getTodoReportsForSearchKey: (_searchKey: string, {allReports}: {allReports?: Record<string, {reportID: string}>}) => ({
        reports: Object.values(allReports ?? {}),
        transactionsByReportID: {},
    }),
}));

/** Puts the given reports in the device's to-do list */
function listReports(reportIDs: string[]) {
    mockReports = Object.fromEntries(reportIDs.map((reportID) => [`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {reportID}]));
}

const SERVER_REPORT_COUNT = 120;

// The server counted 120 drafts. Its responses held A, B and C.
const serverSearch = createMock<SearchResults['search']>({reportCount: SERVER_REPORT_COUNT, countedReportIDs: {A: true, B: true, C: true}});

type RenderProps = {searchKey: SearchKey; search: SearchResults['search']};
const DRAFTS: RenderProps = {searchKey: CONST.SEARCH.SEARCH_KEYS.SUBMIT, search: serverSearch};

function renderDrafts() {
    return renderHook(({searchKey, search}: RenderProps) => useTodoSearchResults(searchKey, undefined, search), {initialProps: DRAFTS});
}

describe('useTodoSearchResults', () => {
    beforeEach(() => {
        mockLoadingKeys.clear();
        listReports([]);
    });

    it('takes a counted report off once this device has listed it and it leaves', () => {
        // Given Drafts listing all three counted reports
        listReports(['A', 'B', 'C']);
        const {result, rerender} = renderDrafts();
        expect(result.current?.metadata.reportCount).toBe(SERVER_REPORT_COUNT);

        // When report A leaves the list
        listReports(['B', 'C']);
        rerender(DRAFTS);

        // Then it comes off the server's count
        expect(result.current?.metadata.reportCount).toBe(SERVER_REPORT_COUNT - 1);
    });

    it('keeps a counted report this device never listed on the count, since its own rules hide it', () => {
        // Given Drafts listing only A and B, as when the device's rules hide C while the server still counts it
        listReports(['A', 'B']);
        const {result, rerender} = renderDrafts();

        // When report A then leaves the list
        listReports(['B']);
        rerender(DRAFTS);

        // Then only A comes off. C was never listed here, so it never counts as having left
        expect(result.current?.metadata.reportCount).toBe(SERVER_REPORT_COUNT - 1);
    });

    it('only remembers reports listed once everything has loaded', () => {
        // Given Drafts listing A while report actions are still loading, before the rules that could hide it are known
        mockLoadingKeys.add(ONYXKEYS.COLLECTION.REPORT_ACTIONS);
        listReports(['A', 'B', 'C']);
        const {result, rerender} = renderDrafts();

        // When everything loads and A turns out not to be a to-do here
        mockLoadingKeys.clear();
        listReports(['B', 'C']);
        rerender(DRAFTS);

        // Then A doesn't come off, since it was only listed before the device could tell
        expect(result.current?.metadata.reportCount).toBe(SERVER_REPORT_COUNT);
    });

    it('remembers the listed reports per to-do list', () => {
        // Given Drafts listing A, B and C
        listReports(['A', 'B', 'C']);
        const {result, rerender} = renderDrafts();

        // When Needs approval opens with the same counted reports, without A in its list
        listReports(['B', 'C']);
        rerender({searchKey: CONST.SEARCH.SEARCH_KEYS.APPROVE, search: serverSearch});

        // Then A doesn't come off there, since this device never listed it for that list
        expect(result.current?.metadata.reportCount).toBe(SERVER_REPORT_COUNT);

        // When Drafts opens again, still without A
        rerender(DRAFTS);

        // Then A comes off, since Drafts listed it before the switch
        expect(result.current?.metadata.reportCount).toBe(SERVER_REPORT_COUNT - 1);
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
        // Given Drafts that listed all three counted reports
        listReports(['A', 'B', 'C']);
        const {result, rerender} = renderDrafts();

        // When one of the collections that decides whether a report is a to-do is loading, and A is missing from the list meanwhile
        mockLoadingKeys.add(loadingKey);
        listReports(['B', 'C']);
        rerender(DRAFTS);

        // Then nothing comes off, because reports that still match can be missing from the list until it loads
        expect(result.current?.metadata.reportCount).toBe(SERVER_REPORT_COUNT);
    });
});
