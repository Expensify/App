import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import usePolicyData from '@hooks/usePolicyData';
import initOnyxDerivedValues from '@libs/actions/OnyxDerived';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyCategories, PolicyTagLists, Report, ReportActions, Transaction} from '@src/types/onyx';
import {actionR14932 as mockIOUAction} from '../../__mocks__/reportData/actions';
import {iouReportR14932 as mockedIOUReport} from '../../__mocks__/reportData/reports';
import {transactionR14932 as mockedTransaction} from '../../__mocks__/reportData/transactions';
import createRandomPolicy from '../utils/collections/policies';
import createRandomPolicyCategories from '../utils/collections/policyCategory';
import createRandomPolicyTags from '../utils/collections/policyTags';
import {createAdminRoom, createAnnounceRoom} from '../utils/collections/reports';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// Mock data id
const mockPolicy: Policy = createRandomPolicy(0);
const mockPolicyTagLists: PolicyTagLists = createRandomPolicyTags('Tags', 8);
const mockPolicyCategories: PolicyCategories = createRandomPolicyCategories(8);

const mockIOUReport = {...mockedIOUReport, policyID: mockPolicy.id};
const mockAdminsRoom: Report = {...createAdminRoom(1234), policyID: mockPolicy.id};
const mockAnnounceRoom: Report = {...createAnnounceRoom(5678), policyID: mockPolicy.id};

const mockTransaction = {
    ...mockedTransaction,
    reportID: mockIOUReport.reportID,
    category: Object.values(mockPolicyCategories).at(0)?.name,
    tag: Object.values(mockPolicyTagLists).at(0)?.name,
};

const expectedTransactionsAndViolations = {
    [mockIOUReport.reportID]: {
        transactions: {
            [`${ONYXKEYS.COLLECTION.TRANSACTION}${mockTransaction.transactionID}`]: mockTransaction,
        },
        violations: {},
    },
};

const reportsCollection: Record<`${typeof ONYXKEYS.COLLECTION.REPORT}${string}`, Report> = {
    [`${ONYXKEYS.COLLECTION.REPORT}${mockIOUReport.reportID}`]: mockIOUReport,
    [`${ONYXKEYS.COLLECTION.REPORT}${mockAdminsRoom.reportID}`]: mockAdminsRoom,
    [`${ONYXKEYS.COLLECTION.REPORT}${mockAnnounceRoom.reportID}`]: mockAnnounceRoom,
};

const reportActionsCollection: Record<`${typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS}${string}`, ReportActions> = {
    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${mockIOUReport.reportID}`]: {
        [mockIOUAction.reportActionID]: mockIOUAction,
    },
};
const policiesCollection: Record<`${typeof ONYXKEYS.COLLECTION.POLICY}${string}`, Policy> = {
    [`${ONYXKEYS.COLLECTION.POLICY}${mockPolicy.id}`]: mockPolicy,
};

const policiesTagListsCollection: Record<`${typeof ONYXKEYS.COLLECTION.POLICY_TAGS}${string}`, PolicyTagLists> = {
    [`${ONYXKEYS.COLLECTION.POLICY_TAGS}${mockPolicy.id}`]: mockPolicyTagLists,
};

const policiesCategoriesCollection: Record<`${typeof ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${string}`, PolicyCategories> = {
    [`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${mockPolicy.id}`]: mockPolicyCategories,
};

const transactionsCollection: Record<`${typeof ONYXKEYS.COLLECTION.TRANSACTION}${string}`, Transaction> = {
    [`${ONYXKEYS.COLLECTION.TRANSACTION}${mockTransaction.transactionID}`]: mockTransaction,
};

describe('usePolicyData', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        initOnyxDerivedValues();
    });

    beforeEach(() => {
        Onyx.clear();
        return waitForBatchedUpdates();
    });

    test('returns data given a policy ID that exists in the onyx', async () => {
        await Onyx.multiSet({
            ...reportsCollection,
            ...reportActionsCollection,
            ...policiesCollection,
            ...policiesTagListsCollection,
            ...policiesCategoriesCollection,
            ...transactionsCollection,
        });

        await waitForBatchedUpdates();

        const {result} = renderHook(() => usePolicyData(mockPolicy.id), {wrapper: OnyxListItemProvider});

        await waitForBatchedUpdates();

        expect(result.current.policy).toEqual(mockPolicy);
        expect(result.current.tags).toEqual(mockPolicyTagLists);
        expect(result.current.categories).toEqual(mockPolicyCategories);

        expect(result.current.reports).toHaveLength(1);
        expect(result.current.reports.at(0)).toEqual(mockIOUReport);

        expect(result.current.transactionsAndViolations).toEqual(expectedTransactionsAndViolations);
    });

    test('returns default empty values when policy ID does not exist in the onyx', () => {
        const {result} = renderHook(() => usePolicyData('non_existent_policy_id'), {wrapper: OnyxListItemProvider});

        expect(result.current.reports).toEqual([]);
        expect(result.current.tags).toEqual({});
        expect(result.current.categories).toEqual({});
        expect(result.current.policy).toBeUndefined();
        expect(result.current.transactionsAndViolations).toEqual({});
    });

    test('returns default empty values when policyID is undefined', () => {
        const {result} = renderHook(() => usePolicyData(undefined), {wrapper: OnyxListItemProvider});

        expect(result.current.reports).toEqual([]);
        expect(result.current.tags).toEqual({});
        expect(result.current.categories).toEqual({});
        expect(result.current.policy).toBeUndefined();
        expect(result.current.transactionsAndViolations).toEqual({});
    });
});
