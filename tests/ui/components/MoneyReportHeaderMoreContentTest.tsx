import MoneyReportHeaderMoreContent from '@components/MoneyReportHeaderMoreContent';
import MoneyReportHeaderNextStep from '@components/MoneyReportHeaderNextStep';

import useMoneyReportHeaderStatusBar from '@hooks/useMoneyReportHeaderStatusBar';
import useOnyx from '@hooks/useOnyx';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report} from '@src/types/onyx';

import type {UseOnyxResult} from 'react-native-onyx';

import {render} from '@testing-library/react-native';
import React from 'react';

import createRandomPolicy from '../../utils/collections/policies';

const TEST_REPORT_ID = '1001';
const TEST_POLICY_ID = 'policy1';

const report = {
    reportID: TEST_REPORT_ID,
    policyID: TEST_POLICY_ID,
    type: CONST.REPORT.TYPE.EXPENSE,
} as Report;

function createOnyxResult<T>(value: NonNullable<T> | undefined): UseOnyxResult<T> {
    return [value, {status: 'loaded'}];
}

// `useRoute` is only used to detect Search routes; default to a regular report route so `isReportInSearch` is false.
// Spread the real module so navigation internals (e.g. createNavigationContainerRef) pulled in by the real
// PolicyUtils import chain keep working.
jest.mock('@react-navigation/native', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actualNavigation = jest.requireActual('@react-navigation/native');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actualNavigation,
        __esModule: true,
        useRoute: jest.fn(() => ({name: 'report'})),
    };
});

// The next-step bar is the element under test; render nothing but track whether it was mounted via the visibility gate.
jest.mock('@components/MoneyReportHeaderNextStep', () => ({__esModule: true, default: jest.fn(() => null)}));
jest.mock('@components/MoneyReportHeaderStatusBarSection', () => ({__esModule: true, default: () => null}));
jest.mock('@components/MoneyRequestReportView/MoneyRequestReportNavigation', () => ({__esModule: true, default: () => null}));
jest.mock('@components/MoneyReportTransactionThreadContext', () => ({__esModule: true, useMoneyReportTransactionThread: jest.fn(() => ({iouTransactionID: undefined}))}));

// Spread the real module: the live PolicyUtils import chain relies on many other ReportUtils exports.
jest.mock('@libs/ReportUtils', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actualReportUtils = jest.requireActual('@libs/ReportUtils');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actualReportUtils,
        __esModule: true,
        isInvoiceReport: jest.fn(() => false),
    };
});

jest.mock('@hooks/useThemeStyles', () => ({__esModule: true, default: jest.fn(() => ({}))}));
jest.mock('@hooks/useResponsiveLayout', () => ({__esModule: true, default: jest.fn(() => ({shouldUseNarrowLayout: false, isMediumScreenWidth: false}))}));
jest.mock('@hooks/useResponsiveLayoutOnWideRHP', () => ({__esModule: true, default: jest.fn(() => ({isWideRHPDisplayedOnWideLayout: false, isSuperWideRHPDisplayedOnWideLayout: false}))}));
jest.mock('@hooks/useMoneyReportHeaderStatusBar', () => ({__esModule: true, default: jest.fn(() => ({shouldShowStatusBar: false, statusBarType: undefined}))}));
jest.mock('@hooks/useOnyx', () => jest.fn());

const mockedUseOnyx = jest.mocked(useOnyx);
const mockedStatusBar = jest.mocked(useMoneyReportHeaderStatusBar);
const mockedNextStepBar = jest.mocked(MoneyReportHeaderNextStep);

let policyValue: Policy | undefined;

function mockPolicyType(type: Policy['type']) {
    policyValue = {...createRandomPolicy(1, type), id: TEST_POLICY_ID};
}

describe('MoneyReportHeaderMoreContent', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        policyValue = undefined;
        mockedStatusBar.mockReturnValue({shouldShowStatusBar: false, statusBarType: undefined});
        mockedUseOnyx.mockImplementation((key) => {
            if (key === `${ONYXKEYS.COLLECTION.REPORT}${TEST_REPORT_ID}`) {
                return createOnyxResult<Report>(report);
            }
            if (key === `${ONYXKEYS.COLLECTION.POLICY}${TEST_POLICY_ID}`) {
                return createOnyxResult<Policy>(policyValue);
            }
            return createOnyxResult(undefined);
        });
    });

    it('renders the next step bar for a Submit workspace', () => {
        mockPolicyType(CONST.POLICY.TYPE.SUBMIT);
        render(<MoneyReportHeaderMoreContent reportID={TEST_REPORT_ID} />);
        expect(mockedNextStepBar).toHaveBeenCalled();
    });

    it('renders the next step bar for a paid (team) workspace', () => {
        mockPolicyType(CONST.POLICY.TYPE.TEAM);
        render(<MoneyReportHeaderMoreContent reportID={TEST_REPORT_ID} />);
        expect(mockedNextStepBar).toHaveBeenCalled();
    });

    it('does not render the next step bar for a personal workspace', () => {
        mockPolicyType(CONST.POLICY.TYPE.PERSONAL);
        render(<MoneyReportHeaderMoreContent reportID={TEST_REPORT_ID} />);
        expect(mockedNextStepBar).not.toHaveBeenCalled();
    });

    it('does not render the next step bar when a status bar is shown', () => {
        mockPolicyType(CONST.POLICY.TYPE.SUBMIT);
        mockedStatusBar.mockReturnValue({shouldShowStatusBar: true, statusBarType: CONST.REPORT.STATUS_BAR_TYPE.ON_HOLD});
        render(<MoneyReportHeaderMoreContent reportID={TEST_REPORT_ID} />);
        expect(mockedNextStepBar).not.toHaveBeenCalled();
    });
});
