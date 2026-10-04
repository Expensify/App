/* eslint-disable @typescript-eslint/no-unsafe-type-assertion -- baseProps is a minimal test fixture; casting via `as unknown` keeps the test focused on mount-stability instead of dragging in every field of WithCurrentUserPersonalDetailsProps */
import {act, render, renderHook} from '@testing-library/react-native';

import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';

import Navigation from '@libs/Navigation/Navigation';

import {NavigateGlobalCreateProvider, useNavigateGlobalCreate} from '@pages/iou/request/step/IOURequestStepScan/components/NavigateGlobalCreateContext';

import CONST from '@src/CONST';
import type {IOUType} from '@src/CONST';
import type {Report, Transaction} from '@src/types/onyx';

import React, {useEffect} from 'react';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const SELF_DM_REPORT = {reportID: 'selfDM1', chatType: CONST.REPORT.CHAT_TYPE.SELF_DM} as Report;

let mockSelfDMReport: Report | undefined;

jest.mock('@hooks/useDefaultExpensePolicy', () => ({__esModule: true, default: () => undefined}));
jest.mock('@hooks/usePersonalPolicy', () => ({__esModule: true, default: () => undefined}));
jest.mock('@hooks/useSelfDMReport', () => ({__esModule: true, default: () => mockSelfDMReport}));
jest.mock('@hooks/useOnyx', () => ({__esModule: true, default: () => [undefined]}));

jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn()}));
jest.mock('@libs/telemetry/activeSpans', () => ({endSpan: jest.fn()}));
jest.mock('@pages/iou/request/step/IOURequestStepScan/utils/startScanProcessSpan', () => ({__esModule: true, default: jest.fn()}));
jest.mock('@pages/iou/request/step/IOURequestStepScan/utils/endScanProcessAndStartConfirmationMountSpan', () => ({__esModule: true, default: jest.fn()}));

const mockNavigateToParticipantPage = jest.fn();
jest.mock('@libs/IOUUtils', () => ({
    navigateToParticipantPage: (...args: unknown[]) => {
        mockNavigateToParticipantPage(...args);
    },
    navigateToConfirmationPage: jest.fn(),
}));

const mockSetTransactionReport = jest.fn();
jest.mock('@userActions/Transaction', () => ({
    setTransactionReport: (...args: unknown[]) => {
        mockSetTransactionReport(...args);
    },
}));
jest.mock('@userActions/IOU/MoneyRequest', () => ({
    setMoneyRequestParticipants: jest.fn(() => Promise.resolve()),
    setMoneyRequestParticipantsFromReport: jest.fn(() => Promise.resolve()),
}));

const baseProps = {
    iouType: CONST.IOU.TYPE.CREATE,
    reportID: '1',
    transactionID: 't1',
    transaction: undefined,
    backToReport: undefined,
    currentUserPersonalDetails: {accountID: 1, login: 'a@b.com'},
} as unknown as WithCurrentUserPersonalDetailsProps & {
    iouType: IOUType;
    reportID: string;
    transactionID: string;
    transaction: undefined;
    backToReport: undefined;
};

describe('NavigateGlobalCreateProvider', () => {
    beforeEach(() => {
        mockSelfDMReport = undefined;
        jest.clearAllMocks();
    });

    it('does not remount children across the isReady transition', async () => {
        const onMount = jest.fn();

        function Child() {
            useEffect(() => {
                onMount();
            }, []);
            return null;
        }

        render(
            <NavigateGlobalCreateProvider {...baseProps}>
                <Child />
            </NavigateGlobalCreateProvider>,
        );

        // Wait for the Provider's one-tick useEffect (setIsReady) + the
        // Subscriber to mount and its own useEffect (fnRef publish) to fire.
        await waitForBatchedUpdates();
        await waitForBatchedUpdates();

        // If the Provider's root element type ever changes across the isReady
        // flip, React would tear down and rebuild the children subtree — the
        // Camera would remount, and onMount would fire a second time.
        expect(onMount).toHaveBeenCalledTimes(1);
    });

    async function captureTrackReceipt(transaction: Transaction) {
        function TrackProvider({children}: {children: React.ReactNode}) {
            return (
                <NavigateGlobalCreateProvider
                    {...baseProps}
                    iouType={CONST.IOU.TYPE.TRACK}
                    transaction={transaction}
                >
                    {children}
                </NavigateGlobalCreateProvider>
            );
        }

        const {result} = renderHook(() => useNavigateGlobalCreate(), {wrapper: TrackProvider});

        await waitForBatchedUpdates();
        await waitForBatchedUpdates();

        act(() => result.current(['t1'], false));
        await waitForBatchedUpdates();
        await waitForBatchedUpdates();
    }

    it('routes a track expense to the self DM confirmation instead of the recipient picker', async () => {
        // Given the Manual tab already settled a submissions-disabled global-create expense on the self DM, which flipped the shared route to TRACK
        mockSelfDMReport = SELF_DM_REPORT;

        // When a receipt is captured on the Scan tab, after the Subscriber has published its navigate function
        await captureTrackReceipt({isFromGlobalCreate: true} as Transaction);

        // Then the scan opens the self DM confirmation, because the route type already resolved the destination
        expect(mockNavigateToParticipantPage).not.toHaveBeenCalled();
        expect(mockSetTransactionReport).toHaveBeenCalledWith('t1', {reportID: CONST.REPORT.UNREPORTED_REPORT_ID}, true);
        expect(Navigation.navigate).toHaveBeenCalledWith(expect.stringContaining(`create/${CONST.IOU.TYPE.TRACK}/confirmation/t1/${SELF_DM_REPORT.reportID}`));
    });

    it('keeps the recipient picker for a track scan that did not start from global create', async () => {
        // Given a track scan from a report, which still renders the global-create scan when that report is archived
        mockSelfDMReport = SELF_DM_REPORT;

        // When a receipt is captured
        await captureTrackReceipt({isFromGlobalCreate: false} as Transaction);

        // Then the recipient picker opens, since the route type was never resolved to the self DM by the Manual tab
        expect(mockNavigateToParticipantPage).toHaveBeenCalledWith(CONST.IOU.TYPE.TRACK, 't1', '1');
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });
});
