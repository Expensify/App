/* eslint-disable @typescript-eslint/naming-convention */
import {renderHook, waitFor} from '@testing-library/react-native';

import type {SelectedReports} from '@components/Search/types';

import useBulkDuplicateReportAction from '@hooks/useBulkDuplicateReportAction';

import {bulkDuplicateReports} from '@libs/actions/IOU/Duplicate';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';

jest.mock('@libs/actions/IOU/Duplicate', () => ({
    bulkDuplicateReports: jest.fn(),
}));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({
        translate: jest.fn((key: string) => key),
    }),
}));

jest.mock('@hooks/usePermissions', () => ({
    __esModule: true,
    default: () => ({isBetaEnabled: () => false}),
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

        const {result} = renderHook(() => useBulkDuplicateReportAction({selectedReports, allReports, searchData: undefined}));

        await waitFor(() => {
            expect(result.current).toBeInstanceOf(Function);
        });

        result.current();

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

        const {result} = renderHook(() => useBulkDuplicateReportAction({selectedReports, allReports, searchData: undefined}));

        await waitFor(() => {
            expect(result.current).toBeInstanceOf(Function);
        });

        result.current();

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

        const {result} = renderHook(() => useBulkDuplicateReportAction({selectedReports, allReports, searchData: undefined}));

        await waitFor(() => {
            expect(result.current).toBeInstanceOf(Function);
        });

        result.current();

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

        const {result} = renderHook(() => useBulkDuplicateReportAction({selectedReports, allReports, searchData: undefined}));

        await waitFor(() => {
            expect(result.current).toBeInstanceOf(Function);
        });

        result.current();

        expect(bulkDuplicateReports).toHaveBeenCalledWith(
            expect.objectContaining({
                selectedReports,
            }),
        );
    });

    it('should not forward Onyx policy data, which bulkDuplicateReports now reads for itself', async () => {
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

        const {result} = renderHook(() => useBulkDuplicateReportAction({selectedReports, allReports, searchData: undefined}));

        await waitFor(() => {
            expect(result.current).toBeInstanceOf(Function);
        });

        result.current();

        // The data above is in Onyx and does reach the duplication: `tests/actions/IOUTest/DuplicateTest.ts`
        // asserts the policy, category and tag behaviour against the function, which reads these keys itself.
        // What this case guards is that the hook stopped threading them through, so nobody adds them back.
        const params = jest.mocked(bulkDuplicateReports).mock.calls.at(0)?.at(0);

        expect(params).not.toHaveProperty('allPolicies');
        expect(params).not.toHaveProperty('allPolicyCategories');
        expect(params).not.toHaveProperty('allPolicyTags');
        expect(params).toEqual(expect.objectContaining({selectedReports}));
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

        const {result} = renderHook(() => useBulkDuplicateReportAction({selectedReports, allReports, searchData: undefined}));

        await waitFor(() => {
            expect(result.current).toBeInstanceOf(Function);
        });

        result.current();

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

        const {result} = renderHook(() => useBulkDuplicateReportAction({selectedReports, allReports, searchData: undefined}));

        await waitFor(() => {
            expect(result.current).toBeInstanceOf(Function);
        });

        result.current();

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

        const {result} = renderHook(() => useBulkDuplicateReportAction({selectedReports, allReports: undefined, searchData: undefined}));

        await waitFor(() => {
            expect(result.current).toBeInstanceOf(Function);
        });

        result.current();

        expect(bulkDuplicateReports).toHaveBeenCalledWith(expect.objectContaining({allReports: {}}));
    });
});
