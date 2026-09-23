import {fireEvent, render, screen} from '@testing-library/react-native';

import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {SearchResultsContext} from '@components/Search/SearchContext';

import initOnyxDerivedValues from '@libs/actions/OnyxDerived';
import {setTransactionReport} from '@libs/actions/Transaction';

import DynamicIOURequestEditReportWithWritableReportOrNotFound from '@pages/iou/request/step/DynamicIOURequestEditReport';
import DynamicIOURequestStepReportWithWritableReportOrNotFound from '@pages/iou/request/step/DynamicIOURequestStepReport';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResults} from '@src/types/onyx';
import type Transaction from '@src/types/onyx/Transaction';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../../utils/collections/policies';
import {createPolicyExpenseChat, createRandomReport} from '../../utils/collections/reports';
import {signInWithTestUser} from '../../utils/TestHelper';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@components/ProductTrainingContext', () => ({
    useProductTrainingContext: () => [false],
}));
jest.mock('@src/hooks/useResponsiveLayout');

jest.mock('@libs/Navigation/navigationRef', () => ({
    getCurrentRoute: jest.fn(() => ({
        name: 'Dynamic_Money_Request_Report',
        params: {},
    })),
    getState: jest.fn(() => ({})),
    isReady: jest.fn(() => false),
    addListener: jest.fn(() => jest.fn()),
}));

jest.mock('@libs/Navigation/Navigation', () => {
    const mockRef = {
        getCurrentRoute: jest.fn(() => ({
            name: 'Dynamic_Money_Request_Report',
            params: {},
        })),
        getState: jest.fn(() => ({})),
    };
    return {
        navigate: jest.fn(),
        goBack: jest.fn(),
        navigationRef: mockRef,
        getActiveRoute: () => '',
        getActiveRouteWithoutParams: jest.fn(() => ''),
        isNavigationReady: jest.fn(() => Promise.resolve()),
    };
});

jest.mock('@react-navigation/native', () => {
    const mockRef = {
        getCurrentRoute: jest.fn(() => ({
            name: 'Dynamic_Money_Request_Report',
            params: {},
        })),
        getState: jest.fn(() => ({})),
    };
    return {
        ...jest.requireActual<Record<string, unknown>>('@react-navigation/native'),
        createNavigationContainerRef: jest.fn(() => mockRef),
        useIsFocused: () => true,
        useNavigation: () => ({navigate: jest.fn(), addListener: jest.fn()}),
        useFocusEffect: jest.fn(),
        usePreventRemove: jest.fn(),
    };
});

jest.mock('@libs/actions/Transaction', () => {
    return {
        setTransactionReport: jest.fn(),
    };
});

const ACCOUNT_ID = 1;
const ACCOUNT_LOGIN = 'test@user.com';
const REPORT_ID_1 = '1';
const REPORT_ID_2 = '2';
const PARTICIPANT_ACCOUNT_ID = 2;
const TRANSACTION_ID = '1';
const POLICY_ID_1 = '1';
const POLICY_ID_2 = '2';

const DEFAULT_SPLIT_TRANSACTION: Transaction = {
    amount: 0,
    billable: false,
    comment: {
        attendees: [
            {
                avatarUrl: '',
                displayName: '',
                email: ACCOUNT_LOGIN,
            },
        ],
    },
    created: '2025-08-29',
    currency: 'USD',
    isFromGlobalCreate: false,
    merchant: '(none)',
    participants: [{accountID: PARTICIPANT_ACCOUNT_ID, selected: true}],
    participantsAutoAssigned: true,
    reimbursable: true,
    reportID: REPORT_ID_1,
    transactionID: TRANSACTION_ID,
};

function HTMLProviderWrapper({children}: {children: React.ReactNode}) {
    return <HTMLEngineProvider>{children}</HTMLEngineProvider>;
}

describe('IOURequestStepReport', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
        initOnyxDerivedValues();
        return waitForBatchedUpdates();
    });

    beforeEach(() => {
        jest.clearAllTimers();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should set the reportID for all transactions when changing the report by the report field.', async () => {
        await signInWithTestUser(ACCOUNT_ID, ACCOUNT_LOGIN);
        const fakePolicy1 = {...createRandomPolicy(Number(POLICY_ID_1)), role: CONST.POLICY.ROLE.ADMIN, type: CONST.POLICY.TYPE.TEAM};
        const fakePolicy2 = {...createRandomPolicy(Number(POLICY_ID_2)), role: CONST.POLICY.ROLE.ADMIN, type: CONST.POLICY.TYPE.TEAM};
        const fakePolicyExpenseChat1 = {...createPolicyExpenseChat(3, true), policyName: fakePolicy1.name, policyID: fakePolicy1.id};
        const fakePolicyExpenseChat2 = {...createPolicyExpenseChat(4, true), policyName: fakePolicy1.name, policyID: fakePolicy1.id};
        const fakeReport1 = {
            ...createRandomReport(Number(REPORT_ID_1), undefined),
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            type: CONST.REPORT.TYPE.EXPENSE,
            policyName: fakePolicy1.name,
            policyID: fakePolicy1.id,
            chatReportID: fakePolicyExpenseChat1.reportID,
            ownerAccountID: ACCOUNT_ID,
        };
        const fakeReport2 = {
            ...createRandomReport(Number(REPORT_ID_2), undefined),
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            type: CONST.REPORT.TYPE.EXPENSE,
            policyName: fakePolicy2.name,
            policyID: fakePolicy2.id,
            chatReportID: fakePolicyExpenseChat2.reportID,
            ownerAccountID: ACCOUNT_ID,
        };

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}1`, {
            ...DEFAULT_SPLIT_TRANSACTION,
            iouRequestType: 'scan',
            receipt: {filename: 'receipt1.jpg', source: 'path/to/receipt1.jpg', type: ''},
            transactionID: '1',
            isFromGlobalCreate: true,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}2`, {
            ...DEFAULT_SPLIT_TRANSACTION,
            iouRequestType: 'scan',
            receipt: {filename: 'receipt2.jpg', source: 'path/to/receipt2.jpg', type: ''},
            transactionID: '2',
            isFromGlobalCreate: true,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy1.id}`, fakePolicy1);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy2.id}`, fakePolicy2);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${fakeReport1.reportID}`, fakeReport1);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${fakeReport2.reportID}`, fakeReport2);

        render(
            <OnyxListItemProvider>
                <HTMLProviderWrapper>
                    <CurrentUserPersonalDetailsProvider>
                        <LocaleContextProvider>
                            <DynamicIOURequestStepReportWithWritableReportOrNotFound
                                route={{
                                    key: 'Dynamic_Money_Request_Report--30aPPAdjWan56sE5OpcG',
                                    name: 'Dynamic_Money_Request_Report',
                                    params: {
                                        action: 'create',
                                        iouType: 'submit',
                                        transactionID: TRANSACTION_ID,
                                        reportID: REPORT_ID_1,
                                    },
                                }}
                                // @ts-expect-error we don't need navigation param here.
                                navigation={undefined}
                            />
                        </LocaleContextProvider>
                    </CurrentUserPersonalDetailsProvider>
                </HTMLProviderWrapper>
            </OnyxListItemProvider>,
        );

        const testID = `${CONST.BASE_LIST_ITEM_TEST_ID}${REPORT_ID_2}`;
        const item = await screen.findByTestId(testID);
        expect(item).toBeTruthy();

        fireEvent.press(item);

        expect(setTransactionReport).toHaveBeenCalledTimes(2);
        const [[, {reportID: reportID1}], [, {reportID: reportID2}]] = jest.mocked(setTransactionReport).mock.calls;
        expect(reportID1).toEqual(REPORT_ID_2);
        expect(reportID2).toEqual(REPORT_ID_2);
    });

    it('should list a report that is only in the search results when changing the report by the report field', async () => {
        await signInWithTestUser(ACCOUNT_ID, ACCOUNT_LOGIN);
        const fakePolicy = {...createRandomPolicy(Number(POLICY_ID_1)), role: CONST.POLICY.ROLE.ADMIN, type: CONST.POLICY.TYPE.TEAM};
        const buildReport = (reportID: string) => ({
            ...createRandomReport(Number(reportID), undefined),
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            type: CONST.REPORT.TYPE.EXPENSE,
            policyName: fakePolicy.name,
            policyID: fakePolicy.id,
            ownerAccountID: ACCOUNT_ID,
        });

        // Given a report the user has opened, and another one that is only in the search results
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {...DEFAULT_SPLIT_TRANSACTION, isFromGlobalCreate: true});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID_1}`, buildReport(REPORT_ID_1));
        const searchResults: SearchResults = {
            search: {
                offset: 0,
                hash: 1,
                type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
                sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
                sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
                hasMoreResults: false,
                hasResults: true,
                isLoading: false,
            },
            data: {[`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID_2}`]: buildReport(REPORT_ID_2)},
        };

        // When the report field list is opened
        render(
            <OnyxListItemProvider>
                <HTMLProviderWrapper>
                    <CurrentUserPersonalDetailsProvider>
                        <LocaleContextProvider>
                            <SearchResultsContext
                                value={{
                                    currentSearchResults: searchResults,
                                    currentSearchTransactionsByReportID: new Map(),
                                    currentSearchViolations: {},
                                    shouldUseLiveData: false,
                                    sortedReportIDs: [],
                                    shouldShowFiltersBarLoading: false,
                                    lastSearchType: undefined,
                                }}
                            >
                                <DynamicIOURequestStepReportWithWritableReportOrNotFound
                                    route={{
                                        key: 'Dynamic_Money_Request_Report--30aPPAdjWan56sE5OpcG',
                                        name: 'Dynamic_Money_Request_Report',
                                        params: {
                                            action: 'create',
                                            iouType: 'submit',
                                            transactionID: TRANSACTION_ID,
                                            reportID: REPORT_ID_1,
                                        },
                                    }}
                                    // @ts-expect-error we don't need navigation param here.
                                    navigation={undefined}
                                />
                            </SearchResultsContext>
                        </LocaleContextProvider>
                    </CurrentUserPersonalDetailsProvider>
                </HTMLProviderWrapper>
            </OnyxListItemProvider>,
        );

        // Then the report from the search results is listed
        expect(await screen.findByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}${REPORT_ID_2}`)).toBeTruthy();
    });

    it("should list a member's report that is only in the search results when an admin moves the member's expense", async () => {
        await signInWithTestUser(ACCOUNT_ID, ACCOUNT_LOGIN);
        const fakePolicy = {...createRandomPolicy(Number(POLICY_ID_1)), role: CONST.POLICY.ROLE.ADMIN, type: CONST.POLICY.TYPE.TEAM};
        const buildMemberReport = (reportID: string) => ({
            ...createRandomReport(Number(reportID), undefined),
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            type: CONST.REPORT.TYPE.EXPENSE,
            policyName: fakePolicy.name,
            policyID: fakePolicy.id,
            ownerAccountID: PARTICIPANT_ACCOUNT_ID,
        });

        // Given the admin opened one of a member's reports, and the member's other report is only in the search results
        await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID_1}`, buildMemberReport(REPORT_ID_1));
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, {...DEFAULT_SPLIT_TRANSACTION, reportID: REPORT_ID_1});
        const searchResults: SearchResults = {
            search: {
                offset: 0,
                hash: 1,
                type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
                sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
                sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
                hasMoreResults: false,
                hasResults: true,
                isLoading: false,
            },
            data: {[`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID_2}`]: buildMemberReport(REPORT_ID_2)},
        };

        // When the admin opens Move to report for the expense
        render(
            <OnyxListItemProvider>
                <HTMLProviderWrapper>
                    <CurrentUserPersonalDetailsProvider>
                        <LocaleContextProvider>
                            <SearchResultsContext
                                value={{
                                    currentSearchResults: searchResults,
                                    currentSearchTransactionsByReportID: new Map(),
                                    currentSearchViolations: {},
                                    shouldUseLiveData: false,
                                    sortedReportIDs: [],
                                    shouldShowFiltersBarLoading: false,
                                    lastSearchType: undefined,
                                }}
                            >
                                <DynamicIOURequestEditReportWithWritableReportOrNotFound
                                    route={{
                                        key: 'Dynamic_Money_Request_Edit_Report--30aPPAdjWan56sE5OpcG',
                                        name: 'Dynamic_Money_Request_Edit_Report',
                                        params: {
                                            action: 'edit',
                                            iouType: 'submit',
                                            reportID: REPORT_ID_1,
                                            transactionID: TRANSACTION_ID,
                                        },
                                    }}
                                    // @ts-expect-error we don't need navigation param here.
                                    navigation={undefined}
                                />
                            </SearchResultsContext>
                        </LocaleContextProvider>
                    </CurrentUserPersonalDetailsProvider>
                </HTMLProviderWrapper>
            </OnyxListItemProvider>,
        );

        // Then the member's report from the search results is listed
        expect(await screen.findByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}${REPORT_ID_2}`)).toBeTruthy();
    });
});
