import {render} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {getDisplayNameForParticipant} from '@libs/ReportUtils';

import SearchAddApproverPage from '@pages/Search/SearchAddApproverPage';

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
        useSearchSelectionContext: () => ({selectedReports: [{reportID: '737100', policyID: 'search-approver-policy'}]}),
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

const APPROVER_ACCOUNT_ID = 737001;
const APPROVER_EMAIL = 'search-approver@test.com';
const MANAGER_ACCOUNT_ID = 737002;

describe('SearchAddApproverPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdates();
    });

    it('resolves candidate approver names through the translate function from useLocalize', async () => {
        const policy = createMock<Policy>({
            id: POLICY_ID,
            employeeList: {
                [APPROVER_EMAIL]: {email: APPROVER_EMAIL, role: CONST.POLICY.ROLE.USER},
            },
        });
        const report = createMock<Report>({reportID: SELECTED_REPORT_ID, type: CONST.REPORT.TYPE.EXPENSE, policyID: POLICY_ID, managerID: MANAGER_ACCOUNT_ID});
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[APPROVER_ACCOUNT_ID]: buildPersonalDetails(APPROVER_EMAIL, APPROVER_ACCOUNT_ID, 'Approver')});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${SELECTED_REPORT_ID}`, report);
        await waitForBatchedUpdates();

        render(
            <OnyxListItemProvider>
                <SearchAddApproverPage />
            </OnyxListItemProvider>,
        );
        await waitForBatchedUpdates();

        // Each candidate approver's name resolves via getDisplayNameForParticipant, which must receive the translate from useLocalize.
        expect(mockGetDisplayNameForParticipant).toHaveBeenCalledWith(expect.objectContaining({accountID: APPROVER_ACCOUNT_ID, translate: mockTranslate}));
    });
});
