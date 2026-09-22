import {render} from '@testing-library/react-native';

import ApproverSelectionList from '@components/ApproverSelectionList';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {getDisplayNameForParticipant} from '@libs/ReportUtils';

import SearchAddApproverPage from '@pages/Search/SearchAddApproverPage';
import SearchReassignApproverPage from '@pages/Search/SearchReassignApproverPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import {buildPersonalDetails} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const mockTranslate = jest.fn((path: string) => path);
const mockFormatPhoneNumber = jest.fn((value: string) => value);

const SELECTED_REPORT_ID = '737100';
const POLICY_ID = 'search-approver-policy';
const SECOND_REPORT_ID = '737101';
const SECOND_POLICY_ID = 'search-approver-policy-2';
let mockSelectedReports = [{reportID: SELECTED_REPORT_ID, policyID: POLICY_ID}];

jest.mock('@hooks/useLocalize', () => () => ({translate: mockTranslate, formatPhoneNumber: mockFormatPhoneNumber}));

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => new Proxy({}, {get: (_, name) => String(name)}),
}));

jest.mock('@components/ApproverSelectionList', () => jest.fn(() => null));

jest.mock('@hooks/usePressLoading', () => () => ({isLoading: false, startWithLoading: (fn: () => void) => fn}));

jest.mock('@components/Search/SearchContext', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@components/Search/SearchContext');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        __esModule: true,
        useSearchSelectionActions: () => ({clearSelectedTransactions: jest.fn()}),
        useSearchSelectionContext: () => ({selectedReports: mockSelectedReports}),
    };
});

jest.mock('@libs/ReportUtils', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@libs/ReportUtils');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        __esModule: true,
        getDisplayNameForParticipant: jest.fn(() => 'SPY_NAME'),
        isAllowedToApproveExpenseReport: jest.fn(() => true),
    };
});

const mockGetDisplayNameForParticipant = jest.mocked(getDisplayNameForParticipant);
const mockApproverSelectionList = jest.mocked(ApproverSelectionList);

const APPROVER_ACCOUNT_ID = 737001;
const APPROVER_EMAIL = 'search-approver@test.com';
const MANAGER_ACCOUNT_ID = 737002;

describe('SearchApproverPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdates();
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockSelectedReports = [{reportID: SELECTED_REPORT_ID, policyID: POLICY_ID}];
        const policy = createMock<Policy>({
            id: POLICY_ID,
            role: CONST.POLICY.ROLE.ADMIN,
            employeeList: {
                [APPROVER_EMAIL]: {email: APPROVER_EMAIL, role: CONST.POLICY.ROLE.USER},
            },
        });
        const secondPolicy = createMock<Policy>({
            id: SECOND_POLICY_ID,
            role: CONST.POLICY.ROLE.ADMIN,
            employeeList: {
                [APPROVER_EMAIL]: {email: APPROVER_EMAIL, role: CONST.POLICY.ROLE.USER},
            },
        });
        const report = createMock<Report>({reportID: SELECTED_REPORT_ID, type: CONST.REPORT.TYPE.EXPENSE, policyID: POLICY_ID, managerID: MANAGER_ACCOUNT_ID});
        const secondReport = createMock<Report>({reportID: SECOND_REPORT_ID, type: CONST.REPORT.TYPE.EXPENSE, policyID: SECOND_POLICY_ID, managerID: MANAGER_ACCOUNT_ID});
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[APPROVER_ACCOUNT_ID]: buildPersonalDetails(APPROVER_EMAIL, APPROVER_ACCOUNT_ID, 'Approver')});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${SECOND_POLICY_ID}`, secondPolicy);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${SELECTED_REPORT_ID}`, report);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${SECOND_REPORT_ID}`, secondReport);
        await waitForBatchedUpdates();
    });

    it('resolves candidate approver names through the translate function from useLocalize', async () => {
        render(
            <OnyxListItemProvider>
                <SearchAddApproverPage />
            </OnyxListItemProvider>,
        );
        await waitForBatchedUpdates();

        // Each candidate approver's name resolves via getDisplayNameForParticipant, which must receive the translate from useLocalize.
        expect(mockGetDisplayNameForParticipant).toHaveBeenCalledWith(expect.objectContaining({accountID: APPROVER_ACCOUNT_ID, hiddenTranslation: 'common.hidden'}));
    });

    it('renders the bulk reassignment picker with eligible workspace members', async () => {
        render(
            <OnyxListItemProvider>
                <SearchReassignApproverPage />
            </OnyxListItemProvider>,
        );
        await waitForBatchedUpdates();

        expect(mockApproverSelectionList).toHaveBeenLastCalledWith(
            expect.objectContaining({
                testID: 'SearchReassignApproverPage',
                headerTitle: 'iou.changeApprover.actions.reassignApprover',
                allApprovers: [expect.objectContaining({login: APPROVER_EMAIL, value: APPROVER_ACCOUNT_ID})],
                shouldShowNotFoundView: false,
            }),
            undefined,
        );
    });

    it('allows reassignment to a member who already manages only some selected reports', async () => {
        mockSelectedReports = [
            {reportID: SELECTED_REPORT_ID, policyID: POLICY_ID},
            {reportID: SECOND_REPORT_ID, policyID: SECOND_POLICY_ID},
        ];
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${SELECTED_REPORT_ID}`, {managerID: APPROVER_ACCOUNT_ID});
        await waitForBatchedUpdates();

        render(
            <OnyxListItemProvider>
                <SearchReassignApproverPage />
            </OnyxListItemProvider>,
        );
        await waitForBatchedUpdates();

        expect(mockApproverSelectionList).toHaveBeenLastCalledWith(
            expect.objectContaining({allApprovers: [expect.objectContaining({login: APPROVER_EMAIL, value: APPROVER_ACCOUNT_ID})]}),
            undefined,
        );
    });

    it('excludes a member who is pending deletion in any selected workspace', async () => {
        mockSelectedReports = [
            {reportID: SELECTED_REPORT_ID, policyID: POLICY_ID},
            {reportID: SECOND_REPORT_ID, policyID: SECOND_POLICY_ID},
        ];
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${SECOND_POLICY_ID}`, {
            employeeList: {
                [APPROVER_EMAIL]: {email: APPROVER_EMAIL, role: CONST.POLICY.ROLE.USER, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE},
            },
        });
        await waitForBatchedUpdates();

        render(
            <OnyxListItemProvider>
                <SearchReassignApproverPage />
            </OnyxListItemProvider>,
        );
        await waitForBatchedUpdates();

        expect(mockApproverSelectionList).toHaveBeenLastCalledWith(expect.objectContaining({allApprovers: []}), undefined);
    });

    it('shows a loading placeholder when a selected report is missing from Onyx', async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${SELECTED_REPORT_ID}`, null);
        await waitForBatchedUpdates();

        render(
            <OnyxListItemProvider>
                <SearchReassignApproverPage />
            </OnyxListItemProvider>,
        );
        await waitForBatchedUpdates();

        expect(mockApproverSelectionList).toHaveBeenLastCalledWith(expect.objectContaining({isLoadingReportData: true, shouldShowLoadingPlaceholder: true}), undefined);
    });
});
