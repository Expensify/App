import {render} from '@testing-library/react-native';

import MoneyReportHeader from '@components/MoneyReportHeader';

import useOnyx from '@hooks/useOnyx';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';

import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import type {UseOnyxResult} from 'react-native-onyx';

import {useIsFocused} from '@react-navigation/native';
import React from 'react';

import createRandomTransaction from '../../utils/collections/transaction';

const TEST_REPORT_ID = '1001';

const report = {
    reportID: TEST_REPORT_ID,
    type: CONST.REPORT.TYPE.EXPENSE,
} as Report;

const singleTransaction = {...createRandomTransaction(1), reportID: TEST_REPORT_ID, pendingAction: undefined};

function createOnyxResult<T>(value: NonNullable<T> | undefined): UseOnyxResult<T> {
    return [value, {status: 'loaded'}];
}

jest.mock('@react-navigation/native', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actualNavigation = jest.requireActual('@react-navigation/native');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actualNavigation,
        __esModule: true,
        useRoute: jest.fn(() => ({name: 'report', params: {}})),
        useIsFocused: jest.fn(() => true),
    };
});

jest.mock('@libs/actions/MobileSelectionMode', () => ({
    __esModule: true,
    turnOnMobileSelectionMode: jest.fn(),
    turnOffMobileSelectionMode: jest.fn(),
}));

jest.mock('@components/MoneyReportHeaderModals', () => ({__esModule: true, default: jest.fn(({children}: {children: React.ReactNode}) => children)}));
jest.mock('@components/HeaderWithBackButton', () => ({__esModule: true, default: jest.fn(() => null)}));
jest.mock('@components/MoneyReportHeaderActions', () => ({__esModule: true, default: jest.fn(() => null)}));
jest.mock('@components/MoneyReportHeaderMoreContent', () => ({__esModule: true, default: jest.fn(() => null)}));
jest.mock('@components/HeaderLoadingBar', () => ({__esModule: true, default: jest.fn(() => null)}));
jest.mock('@components/MoneyRequestReportView/MoneyRequestReportNavigation', () => ({__esModule: true, default: jest.fn(() => null)}));
jest.mock('@components/MoneyRequestReportView/MoneyRequestReportTransactionsNavigation', () => ({__esModule: true, default: jest.fn(() => null)}));
jest.mock('@components/Search/SearchContext', () => ({
    __esModule: true,
    useSearchSelectionActions: jest.fn(() => ({clearSelectedTransactions: jest.fn()})),
}));

jest.mock('@hooks/useMobileSelectionMode', () => ({__esModule: true, default: jest.fn(() => true)}));
jest.mock('@hooks/useReportPrimaryAction', () => ({__esModule: true, default: jest.fn(() => undefined)}));
jest.mock('@hooks/useThemeStyles', () => ({__esModule: true, default: jest.fn(() => ({}))}));
jest.mock('@hooks/useResponsiveLayout', () => ({
    __esModule: true,
    default: jest.fn(() => ({shouldUseNarrowLayout: true, isSmallScreenWidth: true, isMediumScreenWidth: false, isInLandscapeMode: false})),
}));
jest.mock('@hooks/useResponsiveLayoutOnWideRHP', () => ({
    __esModule: true,
    default: jest.fn(() => ({isWideRHPDisplayedOnWideLayout: false, isSuperWideRHPDisplayedOnWideLayout: false})),
}));
jest.mock('@hooks/useTransactionsAndViolationsForReport', () => ({__esModule: true, default: jest.fn()}));
jest.mock('@hooks/useOnyx', () => jest.fn());

const mockedUseOnyx = jest.mocked(useOnyx);
const mockedUseIsFocused = jest.mocked(useIsFocused);
const mockedUseTransactionsAndViolations = jest.mocked(useTransactionsAndViolationsForReport);
const mockedTurnOffMobileSelectionMode = jest.mocked(turnOffMobileSelectionMode);

describe('MoneyReportHeader mobile selection mode', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedUseTransactionsAndViolations.mockReturnValue({transactions: {t1: singleTransaction}, violations: {}, isLoaded: true});
        mockedUseOnyx.mockImplementation((key) => {
            if (key === `${ONYXKEYS.COLLECTION.REPORT}${TEST_REPORT_ID}`) {
                return createOnyxResult<Report>(report);
            }
            return createOnyxResult(undefined);
        });
    });

    it('does not turn off selection mode while the report screen is not focused', () => {
        mockedUseIsFocused.mockReturnValue(false);

        render(
            <MoneyReportHeader
                reportID={TEST_REPORT_ID}
                onBackButtonPress={jest.fn()}
            />,
        );

        expect(mockedTurnOffMobileSelectionMode).not.toHaveBeenCalled();
    });

    it('turns off selection mode when focused with one or no visible transactions', () => {
        mockedUseIsFocused.mockReturnValue(true);

        render(
            <MoneyReportHeader
                reportID={TEST_REPORT_ID}
                onBackButtonPress={jest.fn()}
            />,
        );

        expect(mockedTurnOffMobileSelectionMode).toHaveBeenCalled();
    });
});
