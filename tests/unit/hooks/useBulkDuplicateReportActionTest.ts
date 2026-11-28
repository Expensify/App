/* eslint-disable @typescript-eslint/naming-convention */
import {act, renderHook, waitFor} from '@testing-library/react-native';

import type {SelectedReports} from '@components/Search/types';

import useBulkDuplicateReportAction from '@hooks/useBulkDuplicateReportAction';

import {bulkDuplicateReports} from '@libs/actions/IOU/Duplicate';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';

jest.mock('@libs/actions/IOU/Duplicate', () => ({
    bulkDuplicateReports: jest.fn(() => Promise.resolve()),
}));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({
        translate: jest.fn((key: string) => key),
    }),
}));

jest.mock('@hooks/usePermissions', () => ({
    __esModule: true,
    default: () => ({isBetaEnabled: () => false, isBetaEnabledOrUnknown: () => false}),
}));

const CURRENT_USER_ACCOUNT_ID = 1;

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        login: 'test@example.com',
        accountID: CURRENT_USER_ACCOUNT_ID,
        email: 'test@example.com',
    })),
}));

let mockDefaultExpensePolicy: Policy | undefined;
jest.mock('@hooks/useDefaultExpensePolicy', () => ({
    __esModule: true,
    default: () => mockDefaultExpensePolicy,
}));

const mockClearSelectedTransactions = jest.fn();
jest.mock('@components/Search/SearchContext', () => ({
    useSearchSelectionContext: () => ({
        selectedTransactions: {},
        selectedReports: [],
        areAllMatchingItemsSelected: false,
    }),
    useSearchResultsContext: () => ({
        currentSearchResults: undefined,
    }),
    useSearchSelectionActions: () => ({
        clearSelectedTransactions: mockClearSelectedTransactions,
        selectAllMatchingItems: jest.fn(),
    }),
}));

function makeSelectedReport(overrides: Partial<SelectedReports> = {}): SelectedReports {
    return {
        reportID: 'report1',
        policyID: 'policy1',
        action: CONST.SEARCH.ACTION_TYPES.VIEW,
        canPay: false,
        canApprove: false,
        canSubmit: false,
        canChangeApprover: false,
        total: 100,
        currency: 'USD',
        chatReportID: undefined,
        ownerAccountID: CURRENT_USER_ACCOUNT_ID,
        type: CONST.REPORT.TYPE.EXPENSE,
        ...overrides,
    };
}

const STORED_ONBOARDING = {hasCompletedGuidedSetupFlow: true, selfTourViewed: true};
const STORED_INTRO_SELECTED = {choice: CONST.ONBOARDING_CHOICES.TRACK_PERSONAL};
const STORED_QUICK_ACTION = {action: CONST.QUICK_ACTIONS.REQUEST_MANUAL, chatReportID: 'quickActionChat'};
const STORED_RECENTLY_USED_CURRENCIES = ['EUR', 'GBP'];
const STORED_RECENT_WAYPOINTS = [{name: 'Office', address: '1 Main St', lat: 1, lng: 2}];
const STORED_CONCIERGE_REPORT_ID = 'concierge1';
const STORED_CONCIERGE_CHAT = {reportID: STORED_CONCIERGE_REPORT_ID, reportName: 'Concierge'};

async function seedStoredDuplicateData() {
    await Onyx.multiSet({
        [ONYXKEYS.NVP_ONBOARDING]: STORED_ONBOARDING,
        [ONYXKEYS.NVP_INTRO_SELECTED]: STORED_INTRO_SELECTED,
        [ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE]: STORED_QUICK_ACTION,
        [ONYXKEYS.RECENTLY_USED_CURRENCIES]: STORED_RECENTLY_USED_CURRENCIES,
        [ONYXKEYS.NVP_RECENT_WAYPOINTS]: STORED_RECENT_WAYPOINTS,
        [ONYXKEYS.CONCIERGE_REPORT_ID]: STORED_CONCIERGE_REPORT_ID,
        [`${ONYXKEYS.COLLECTION.REPORT}${STORED_CONCIERGE_REPORT_ID}` as const]: STORED_CONCIERGE_CHAT,
    });
}

describe('useBulkDuplicateReportAction', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        mockDefaultExpensePolicy = undefined;

        await Onyx.merge(ONYXKEYS.SESSION, {accountID: CURRENT_USER_ACCOUNT_ID, email: 'test@example.com'});
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('should call bulkDuplicateReports with correct selectedReports', async () => {
        const policyID = 'policy1';
        mockDefaultExpensePolicy = createMock<Policy>({id: policyID, type: CONST.POLICY.TYPE.TEAM, name: 'Test WS'});

        const allReports: Record<string, Report> = {};
        for (const reportID of ['rpt1', 'rpt2']) {
            allReports[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`] = {
                reportID,
                policyID,
                ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                type: CONST.REPORT.TYPE.EXPENSE,
                reportName: `Report ${reportID}`,
            };
        }

        const selectedReports = [makeSelectedReport({reportID: 'rpt1', policyID}), makeSelectedReport({reportID: 'rpt2', policyID})];

        const {result} = renderHook(() => useBulkDuplicateReportAction({selectedReports, allReports, allTransactions: {}, searchData: undefined}));

        await waitFor(() => {
            expect(result.current).toBeInstanceOf(Function);
        });

        await act(async () => {
            await result.current();
        });

        expect(bulkDuplicateReports).toHaveBeenCalledTimes(1);
        expect(bulkDuplicateReports).toHaveBeenCalledWith(
            expect.objectContaining({
                selectedReports,
            }),
        );
    });

    it('should pass defaultExpensePolicy to bulkDuplicateReports', async () => {
        const policyID = 'policy1';
        const teamPolicy = createMock<Policy>({id: policyID, type: CONST.POLICY.TYPE.TEAM, name: 'Test WS'});
        mockDefaultExpensePolicy = teamPolicy;

        const allReports = {
            [`${ONYXKEYS.COLLECTION.REPORT}rpt1`]: {
                reportID: 'rpt1',
                policyID,
                ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                type: CONST.REPORT.TYPE.EXPENSE,
                reportName: 'Report',
            },
        };

        const selectedReports = [makeSelectedReport({reportID: 'rpt1', policyID})];

        const {result} = renderHook(() => useBulkDuplicateReportAction({selectedReports, allReports, allTransactions: {}, searchData: undefined}));

        await waitFor(() => {
            expect(result.current).toBeInstanceOf(Function);
        });

        await act(async () => {
            await result.current();
        });

        expect(bulkDuplicateReports).toHaveBeenCalledWith(
            expect.objectContaining({
                defaultExpensePolicy: teamPolicy,
            }),
        );
    });

    it('should clear selected transactions after invocation', async () => {
        const policyID = 'policy1';
        mockDefaultExpensePolicy = createMock<Policy>({id: policyID, type: CONST.POLICY.TYPE.TEAM, name: 'Test WS'});

        const allReports = {
            [`${ONYXKEYS.COLLECTION.REPORT}rpt1`]: {
                reportID: 'rpt1',
                policyID,
                ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                type: CONST.REPORT.TYPE.EXPENSE,
                reportName: 'Report',
            },
        };

        const selectedReports = [makeSelectedReport({reportID: 'rpt1', policyID})];

        const {result} = renderHook(() => useBulkDuplicateReportAction({selectedReports, allReports, allTransactions: {}, searchData: undefined}));

        await waitFor(() => {
            expect(result.current).toBeInstanceOf(Function);
        });

        await act(async () => {
            await result.current();
        });

        expect(mockClearSelectedTransactions).toHaveBeenCalledWith(undefined, true);
    });

    it('should pass all selectedReports including those with undefined reportID', async () => {
        const policyID = 'policy1';
        mockDefaultExpensePolicy = createMock<Policy>({id: policyID, type: CONST.POLICY.TYPE.TEAM, name: 'Test WS'});

        const allReports = {
            [`${ONYXKEYS.COLLECTION.REPORT}rpt1`]: {
                reportID: 'rpt1',
                policyID,
                ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                type: CONST.REPORT.TYPE.EXPENSE,
                reportName: 'Report',
            },
        };

        const selectedReports = [makeSelectedReport({reportID: 'rpt1', policyID}), makeSelectedReport({reportID: undefined, policyID})];

        const {result} = renderHook(() => useBulkDuplicateReportAction({selectedReports, allReports, allTransactions: {}, searchData: undefined}));

        await waitFor(() => {
            expect(result.current).toBeInstanceOf(Function);
        });

        await act(async () => {
            await result.current();
        });

        expect(bulkDuplicateReports).toHaveBeenCalledWith(
            expect.objectContaining({
                selectedReports,
            }),
        );
    });

    it('should pass the stored onboarding, intent, quick action, recent data and Concierge chat to bulkDuplicateReports', async () => {
        // Given a user who saw the tour, chose a track intent, and has a quick action, recent currencies, recent waypoints and a Concierge chat, which the copies' optimistic data is built from
        mockDefaultExpensePolicy = createMock<Policy>({id: 'policy1', type: CONST.POLICY.TYPE.TEAM, name: 'Test WS'});
        await seedStoredDuplicateData();
        const selectedReports = [makeSelectedReport({reportID: 'rpt1', policyID: 'policy1'})];
        const {result} = renderHook(() => useBulkDuplicateReportAction({selectedReports, allReports: {}, allTransactions: {}, searchData: undefined}));
        await waitFor(() => {
            expect(result.current).toBeInstanceOf(Function);
        });

        // When the user duplicates the selected report
        await act(async () => {
            await result.current();
        });

        // Then the stored onboarding state, intent, quick action, recent currencies, recent waypoints and Concierge chat still reach bulkDuplicateReports
        expect(bulkDuplicateReports).toHaveBeenCalledWith(
            expect.objectContaining({
                isSelfTourViewed: true,
                isTrackIntentUser: true,
                quickAction: STORED_QUICK_ACTION,
                policyRecentlyUsedCurrencies: STORED_RECENTLY_USED_CURRENCIES,
                recentWaypoints: STORED_RECENT_WAYPOINTS,
                conciergeChat: STORED_CONCIERGE_CHAT,
            }),
        );
    });

    it('should pass Onyx policy data (policies, categories, tags)', async () => {
        const policyID = 'policy1';
        mockDefaultExpensePolicy = createMock<Policy>({id: policyID, type: CONST.POLICY.TYPE.TEAM, name: 'Test WS'});

        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {id: policyID, type: CONST.POLICY.TYPE.TEAM, name: 'Test WS'});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`, {
            Food: {name: 'Food', enabled: true, areCommentsRequired: false, externalID: '', origin: ''},
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, {
            Tag: {name: 'Tag', required: false, tags: {ProjectA: {name: 'ProjectA', enabled: true, 'GL Code': '', pendingAction: undefined}}, orderWeight: 1},
        });

        const allReports = {
            [`${ONYXKEYS.COLLECTION.REPORT}rpt1`]: {
                reportID: 'rpt1',
                policyID,
                ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                type: CONST.REPORT.TYPE.EXPENSE,
                reportName: 'Report',
            },
        };

        const selectedReports = [makeSelectedReport({reportID: 'rpt1', policyID})];

        const {result} = renderHook(() => useBulkDuplicateReportAction({selectedReports, allReports, allTransactions: {}, searchData: undefined}));

        await waitFor(() => {
            expect(result.current).toBeInstanceOf(Function);
        });

        await act(async () => {
            await result.current();
        });

        expect(bulkDuplicateReports).toHaveBeenCalledWith(
            expect.objectContaining({
                allPolicies: expect.objectContaining({
                    [`${ONYXKEYS.COLLECTION.POLICY}${policyID}`]: expect.objectContaining({id: policyID}),
                }),
                allPolicyCategories: expect.objectContaining({
                    [`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`]: expect.objectContaining({
                        Food: expect.objectContaining({name: 'Food'}),
                    }),
                }),
                allPolicyTags: expect.objectContaining({
                    [`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`]: expect.objectContaining({
                        Tag: expect.objectContaining({name: 'Tag'}),
                    }),
                }),
            }),
        );
    });

    it('should pass allReports to bulkDuplicateReports', async () => {
        const policyID = 'policy1';
        mockDefaultExpensePolicy = createMock<Policy>({id: policyID, type: CONST.POLICY.TYPE.TEAM, name: 'Test WS'});

        const allReports = {
            [`${ONYXKEYS.COLLECTION.REPORT}rpt1`]: {
                reportID: 'rpt1',
                policyID,
                ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                type: CONST.REPORT.TYPE.EXPENSE,
                reportName: 'Report',
            },
        };

        const selectedReports = [makeSelectedReport({reportID: 'rpt1', policyID})];

        const {result} = renderHook(() => useBulkDuplicateReportAction({selectedReports, allReports, allTransactions: {}, searchData: undefined}));

        await waitFor(() => {
            expect(result.current).toBeInstanceOf(Function);
        });

        await act(async () => {
            await result.current();
        });

        expect(bulkDuplicateReports).toHaveBeenCalledWith(
            expect.objectContaining({
                allReports,
            }),
        );
    });

    it('should pass current user details as ownerPersonalDetails and currentUserLogin', async () => {
        const policyID = 'policy1';
        mockDefaultExpensePolicy = createMock<Policy>({id: policyID, type: CONST.POLICY.TYPE.TEAM, name: 'Test WS'});

        const allReports = {
            [`${ONYXKEYS.COLLECTION.REPORT}rpt1`]: {
                reportID: 'rpt1',
                policyID,
                ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                type: CONST.REPORT.TYPE.EXPENSE,
                reportName: 'Report',
            },
        };

        const selectedReports = [makeSelectedReport({reportID: 'rpt1', policyID})];

        const {result} = renderHook(() => useBulkDuplicateReportAction({selectedReports, allReports, allTransactions: {}, searchData: undefined}));

        await waitFor(() => {
            expect(result.current).toBeInstanceOf(Function);
        });

        await act(async () => {
            await result.current();
        });

        expect(bulkDuplicateReports).toHaveBeenCalledWith(
            expect.objectContaining({
                ownerPersonalDetails: expect.objectContaining({
                    accountID: CURRENT_USER_ACCOUNT_ID,
                    login: 'test@example.com',
                }),
                currentUserLogin: 'test@example.com',
            }),
        );
    });

    it('should pass empty allReports when allReports is undefined', async () => {
        const policyID = 'policy1';
        mockDefaultExpensePolicy = createMock<Policy>({id: policyID, type: CONST.POLICY.TYPE.TEAM, name: 'Test WS'});

        const selectedReports = [makeSelectedReport({reportID: 'rpt1', policyID})];

        const {result} = renderHook(() => useBulkDuplicateReportAction({selectedReports, allReports: undefined, allTransactions: {}, searchData: undefined}));

        await waitFor(() => {
            expect(result.current).toBeInstanceOf(Function);
        });

        await act(async () => {
            await result.current();
        });

        expect(bulkDuplicateReports).toHaveBeenCalledWith(expect.objectContaining({allReports: {}}));
    });
});
