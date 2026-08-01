import {render} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {getDisplayNameForParticipant} from '@libs/ReportUtils';

import ReportAddApproverPage from '@pages/ReportAddApproverPage';

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

jest.mock('@hooks/useLocalize', () => () => ({translate: mockTranslate, formatPhoneNumber: mockFormatPhoneNumber}));

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => new Proxy({}, {get: (_, name) => String(name)}),
}));

jest.mock('@components/ApproverSelectionList', () => jest.fn(() => null));

jest.mock('@hooks/usePressLoading', () => () => ({isLoading: false, startWithLoading: (fn: () => void) => fn}));

jest.mock('@react-navigation/native', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actualNav = jest.requireActual('@react-navigation/native');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actualNav,
        useIsFocused: () => true,
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

const APPROVER_ACCOUNT_ID = 727001;
const APPROVER_EMAIL = 'approver@test.com';

describe('ReportAddApproverPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdates();
    });

    it('resolves candidate approver names through the translate function from useLocalize', async () => {
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[APPROVER_ACCOUNT_ID]: buildPersonalDetails(APPROVER_EMAIL, APPROVER_ACCOUNT_ID, 'Approver')});
        await waitForBatchedUpdates();

        const policy = createMock<Policy>({
            id: 'approver-policy',
            employeeList: {
                [APPROVER_EMAIL]: {email: APPROVER_EMAIL, role: CONST.POLICY.ROLE.USER},
            },
        });
        const report = createMock<Report>({reportID: '727100', type: CONST.REPORT.TYPE.EXPENSE, policyID: policy.id});
        // The withReportOrNotFound HOC resolves the report and policy from Onyx via route.params.reportID.
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
        await waitForBatchedUpdates();
        render(
            <OnyxListItemProvider>
                <ReportAddApproverPage
                    // @ts-expect-error — the withReportOrNotFound HOC prop intersection collapses the route type; only params.reportID is read at runtime
                    route={{params: {reportID: report.reportID}}}
                    report={report}
                    policy={policy}
                    isLoadingReportData={false}
                />
            </OnyxListItemProvider>,
        );
        await waitForBatchedUpdates();

        // Each candidate approver's name resolves via getDisplayNameForParticipant, which must receive the translate from useLocalize.
        expect(mockGetDisplayNameForParticipant).toHaveBeenCalledWith(expect.objectContaining({accountID: APPROVER_ACCOUNT_ID, translate: mockTranslate}));
    });
});
