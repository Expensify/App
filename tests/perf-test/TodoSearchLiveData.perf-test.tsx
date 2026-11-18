import {screen} from '@testing-library/react-native';

import {useSearchResultsContext} from '@components/Search/SearchContext';
import {SearchQueryContext} from '@components/Search/SearchContextDefinitions';
import SearchResultsProvider from '@components/Search/SearchResultsProvider';
import type {SearchQueryContextValue} from '@components/Search/types';
import Text from '@components/Text';

import type {SearchKey} from '@libs/SearchKeyUtils';
import {getSections} from '@libs/SearchUIUtils';
import type {SearchTypeMenuItem} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, Transaction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';
import {measureRenders} from 'reassure';

import createMock from '../utils/createMock';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

jest.mock('@libs/Permissions');
jest.mock('@react-navigation/native');

const USER_ACCOUNT_ID = 1;
const APPROVE_REPORT_COUNT = 500;
const TRANSACTIONS_PER_REPORT = 3;
const UNRELATED_REPORT_COUNT = 2000;
const UNRELATED_POLICY_COUNT = 50;
const WRITES_PER_SCENARIO = 10;
const RECENT_SEARCH_HASH = 12345;

const policyID = 'APPROVE_POLICY';
const policies: Record<string, Policy> = {
    [`${ONYXKEYS.COLLECTION.POLICY}${policyID}`]: createMock<Policy>({
        id: policyID,
        name: 'Approve policy',
        type: CONST.POLICY.TYPE.CORPORATE,
        role: CONST.POLICY.ROLE.ADMIN,
        owner: 'owner@test.com',
        outputCurrency: 'USD',
        approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
    }),
};
for (let i = 0; i < UNRELATED_POLICY_COUNT; i++) {
    policies[`${ONYXKEYS.COLLECTION.POLICY}unrelated${i}`] = {...policies[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`], id: `unrelated${i}`, name: `Unrelated ${i}`};
}

const reports: Record<string, Report> = {};
const transactions: Record<string, Transaction> = {};
for (let i = 1; i <= APPROVE_REPORT_COUNT; i++) {
    const reportID = `${i}`;
    reports[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`] = createMock<Report>({
        reportID,
        type: CONST.REPORT.TYPE.EXPENSE,
        policyID,
        ownerAccountID: 2,
        managerID: USER_ACCOUNT_ID,
        stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
        statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
        currency: 'USD',
        total: -3000,
        reportName: `Report ${i}`,
        created: '2026-10-01 10:00:00',
    });
    for (let t = 0; t < TRANSACTIONS_PER_REPORT; t++) {
        const transactionID = `${i}_${t}`;
        transactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`] = createMock<Transaction>({
            transactionID,
            reportID,
            amount: -1000,
            currency: 'USD',
            merchant: 'Merchant',
            created: '2026-10-01',
        });
    }
}
for (let i = 1; i <= UNRELATED_REPORT_COUNT; i++) {
    const reportID = `${100000 + i}`;
    reports[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`] = createMock<Report>({reportID, type: CONST.REPORT.TYPE.CHAT, lastMessageText: 'hey'});
    transactions[`${ONYXKEYS.COLLECTION.TRANSACTION}u${i}`] = createMock<Transaction>({transactionID: `u${i}`, reportID: '0', amount: -100, currency: 'USD', created: '2026-10-01'});
}

const searchQueryContextValue = createMock<SearchQueryContextValue>({
    currentSearchHash: RECENT_SEARCH_HASH,
    currentSimilarSearchHash: RECENT_SEARCH_HASH,
    currentSearchKey: CONST.SEARCH.SEARCH_KEYS.APPROVE,
    currentSearchQueryJSON: {recentSearchHash: RECENT_SEARCH_HASH, hash: RECENT_SEARCH_HASH},
    currentDefaultSearchQueryJSON: undefined,
    currentDefaultSearchQueryFilterKeys: new Set(),
    suggestedSearches: createMock<Record<SearchKey, SearchTypeMenuItem>>({
        [CONST.SEARCH.SEARCH_KEYS.APPROVE]: createMock<SearchTypeMenuItem>({key: CONST.SEARCH.SEARCH_KEYS.APPROVE, recentSearchHash: RECENT_SEARCH_HASH}),
    }),
    shouldResetSearchQuery: false,
});

let listRenderCount = 0;

function Row({reportID}: {reportID: string | undefined}) {
    const {currentSearchResults} = useSearchResultsContext();
    const report = currentSearchResults?.data?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    return <Text>{report?.reportName}</Text>;
}

function TodoList() {
    listRenderCount++;
    const {currentSearchResults} = useSearchResultsContext();
    const [sections] = getSections({
        type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
        dateFnsLocale: undefined,
        data: currentSearchResults?.data ?? {},
        currentAccountID: USER_ACCOUNT_ID,
        currentUserEmail: 'email1@test.com',
        translate: TestHelper.translateLocal,
        formatPhoneNumber: (phoneNumber: string) => phoneNumber,
        bankAccountList: undefined,
        convertToDisplayString: () => '',
        rules: undefined,
        currentSearch: CONST.SEARCH.SEARCH_KEYS.APPROVE,
        conciergeReportID: undefined,
        reportAttributesDerivedValue: undefined,
    });
    return (
        <>
            {sections.map((item) => (
                <Row
                    key={item.keyForList}
                    reportID={'reportID' in item ? item.reportID : undefined}
                />
            ))}
        </>
    );
}

function Harness() {
    return (
        <SearchQueryContext value={searchQueryContextValue}>
            <SearchResultsProvider>
                <TodoList />
            </SearchResultsProvider>
        </SearchQueryContext>
    );
}

async function writeRepeatedly(write: (index: number) => Promise<void>) {
    // Let the initial classification settle so only the writes below are measured
    await waitForBatchedUpdates();
    expect(screen.getAllByText(/^Report /)).toHaveLength(APPROVE_REPORT_COUNT);
    listRenderCount = 0;
    for (let i = 0; i < WRITES_PER_SCENARIO; i++) {
        // eslint-disable-next-line no-await-in-loop
        await write(i);
        // eslint-disable-next-line no-await-in-loop
        await waitForBatchedUpdates();
    }
    console.debug(`[TodoSearchLiveData] TodoList renders during writes: ${listRenderCount}`);
}

describe('To-do search live data on unrelated writes', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        global.fetch = TestHelper.getGlobalFetchMock();
        wrapOnyxWithWaitForBatchedUpdates(Onyx);
        await TestHelper.signInWithTestUser(USER_ACCOUNT_ID, 'email1@test.com', undefined, undefined, 'One');
        await Onyx.multiSet({
            ...(reports as Record<`${typeof ONYXKEYS.COLLECTION.REPORT}${string}`, Report>),
            ...(transactions as Record<`${typeof ONYXKEYS.COLLECTION.TRANSACTION}${string}`, Transaction>),
            ...(policies as Record<`${typeof ONYXKEYS.COLLECTION.POLICY}${string}`, Policy>),
        });
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    test('[TodoSearchLiveData] unrelated report write', async () => {
        // Given an Approve to-do with 500 reports and 2000 chats outside it
        // When a chat outside the to-do changes
        // Then the to-do rows should not rebuild
        const scenario = () => writeRepeatedly((i) => Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}100001`, {lastMessageText: `msg ${i}`}));
        await measureRenders(<Harness />, {scenario});
    });

    test('[TodoSearchLiveData] unrelated transaction write', async () => {
        // Given an Approve to-do with 500 reports
        // When a transaction on a report outside the to-do changes
        // Then the to-do rows should not rebuild
        const scenario = () => writeRepeatedly((i) => Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}u1`, {merchant: `m ${i}`}));
        await measureRenders(<Harness />, {scenario});
    });

    test('[TodoSearchLiveData] to-do report write', async () => {
        // Given an Approve to-do with 500 reports
        // When a report inside the to-do changes
        // Then its row should show the new value
        const scenario = async () => {
            await writeRepeatedly((i) => Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}1`, {reportName: `Report renamed ${i}`}));
            expect(screen.getByText(`Report renamed ${WRITES_PER_SCENARIO - 1}`)).toBeTruthy();
        };
        await measureRenders(<Harness />, {scenario});
    });

    test('[TodoSearchLiveData] unrelated policy write', async () => {
        // Given an Approve to-do whose reports all belong to one policy
        // When another policy changes
        // Then the to-do rows should not rebuild
        const scenario = () => writeRepeatedly((i) => Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}unrelated1`, {name: `Unrelated ${i}`}));
        await measureRenders(<Harness />, {scenario});
    });
});
