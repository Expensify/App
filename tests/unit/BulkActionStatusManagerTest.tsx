import {fireEvent, render, screen} from '@testing-library/react-native';

import BulkActionStatusManager from '@components/BulkActionStatusManager';

import Navigation from '@libs/Navigation/Navigation';

import {clearBulkAction, sendBulkActionSummaryFromConcierge} from '@userActions/BulkAction';
import type * as Modal from '@userActions/Modal';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@userActions/BulkAction', () => ({
    sendBulkActionSummaryFromConcierge: jest.fn(),
    clearBulkAction: jest.fn(),
    wasBulkActionInitiatedLocally: jest.fn(() => false),
}));
jest.mock('@userActions/Modal', () => ({
    ...jest.requireActual<typeof Modal>('@userActions/Modal'),
    close: jest.fn((cb?: () => void) => cb?.()),
}));
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    isTopmostRouteModalScreen: jest.fn(() => false),
    getActiveRouteWithoutParams: jest.fn(() => ''),
}));
jest.mock('@hooks/useOpenConciergeAnywhere', () => ({
    __esModule: true,
    default: () => ({
        openConciergeAnywhere: jest.fn(),
        isInSidePanel: false,
    }),
}));
jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({
        translate: (key: string) => key,
    }),
}));

const mockClearBulkAction = jest.mocked(clearBulkAction);
const mockSendFromConcierge = jest.mocked(sendBulkActionSummaryFromConcierge);
const mockNavigate = jest.mocked(Navigation.navigate);

const BULK_ACTION_ID = 'test-bulk-action-123';
const BULK_ACTION_KEY = `${ONYXKEYS.COLLECTION.BULK_ACTION}${BULK_ACTION_ID}` as const;

describe('BulkActionStatusManager', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
    });

    it('shows the running approval with the option to have Concierge message the result', async () => {
        // Given a bulk approval that is still running
        await Onyx.set(BULK_ACTION_KEY, {state: CONST.BULK_ACTION.STATE.RUNNING, action: CONST.SEARCH.BULK_ACTION_TYPES.APPROVE});

        render(<BulkActionStatusManager />);
        await waitForBatchedUpdatesWithAct();

        // When the user asks Concierge to message them
        expect(screen.getByText('bulkAction.approvingTitle')).toBeTruthy();
        fireEvent.press(screen.getByText('bulkAction.sendFromConcierge'));

        // Then Concierge is asked for the summary and the record stays, because the backend still has to finish it
        expect(mockSendFromConcierge).toHaveBeenCalledWith(BULK_ACTION_ID, expect.objectContaining({state: CONST.BULK_ACTION.STATE.RUNNING}));
        expect(mockClearBulkAction).not.toHaveBeenCalled();
    });

    it('does not show a bulk action Concierge will message about', async () => {
        // Given a running bulk action the user already handed to Concierge
        await Onyx.set(BULK_ACTION_KEY, {state: CONST.BULK_ACTION.STATE.RUNNING, action: CONST.SEARCH.BULK_ACTION_TYPES.PAY, shouldSendFromConcierge: true});

        // When the app loads
        render(<BulkActionStatusManager />);
        await waitForBatchedUpdatesWithAct();

        // Then no modal is shown, because Concierge sends the result
        expect(screen.queryByText('bulkAction.payingTitle')).toBeNull();
        expect(screen.queryByText('bulkAction.conciergeTitle')).toBeNull();
    });

    it('opens the reports that could not be approved in Search', async () => {
        // Given a finished bulk approval where two reports could not be approved
        await Onyx.set(BULK_ACTION_KEY, {state: CONST.BULK_ACTION.STATE.DONE, action: CONST.SEARCH.BULK_ACTION_TYPES.APPROVE, total: 5, failedReportIDs: ['111', '222']});

        render(<BulkActionStatusManager />);
        await waitForBatchedUpdatesWithAct();

        // When the user opens those reports
        expect(screen.getByText('bulkAction.approvedTitle')).toBeTruthy();
        fireEvent.press(screen.getByText('bulkAction.viewFailedReports'));

        // Then Search opens on exactly those reports and the record is cleared
        expect(mockNavigate).toHaveBeenCalledWith(expect.stringMatching(/reportID%3A111%2C222/));
        expect(mockClearBulkAction).toHaveBeenCalledWith(BULK_ACTION_ID, expect.objectContaining({state: CONST.BULK_ACTION.STATE.DONE}));
    });

    it('clears a finished bulk submit when it is closed', async () => {
        // Given a finished bulk submit where every report was submitted
        await Onyx.set(BULK_ACTION_KEY, {state: CONST.BULK_ACTION.STATE.DONE, action: CONST.SEARCH.BULK_ACTION_TYPES.SUBMIT, total: 3, failedReportIDs: []});

        render(<BulkActionStatusManager />);
        await waitForBatchedUpdatesWithAct();

        // When the user closes the modal
        expect(screen.getByText('bulkAction.submittedTitle')).toBeTruthy();
        expect(screen.queryByText('bulkAction.viewFailedReports')).toBeNull();
        fireEvent.press(screen.getByText('common.close'));

        // Then the record is cleared so the modal doesn't come back
        expect(mockClearBulkAction).toHaveBeenCalledWith(BULK_ACTION_ID, expect.objectContaining({state: CONST.BULK_ACTION.STATE.DONE}));
    });

    it('shows a bulk hold while it runs and once it is done', async () => {
        // Given a bulk hold that is still running
        await Onyx.set(BULK_ACTION_KEY, {state: CONST.BULK_ACTION.STATE.RUNNING, action: CONST.SEARCH.BULK_ACTION_TYPES.HOLD});

        render(<BulkActionStatusManager />);
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByText('bulkAction.holdingTitle')).toBeTruthy();

        // When the backend finishes it
        await Onyx.set(BULK_ACTION_KEY, {state: CONST.BULK_ACTION.STATE.DONE, action: CONST.SEARCH.BULK_ACTION_TYPES.HOLD, total: 2, failedReportIDs: []});
        await waitForBatchedUpdatesWithAct();

        // Then the modal shows the hold result
        expect(screen.getByText('bulkAction.heldTitle')).toBeTruthy();
    });

    it('says so when no report matched', async () => {
        // Given a bulk pay that found no report to mark as paid
        await Onyx.set(BULK_ACTION_KEY, {state: CONST.BULK_ACTION.STATE.DONE, action: CONST.SEARCH.BULK_ACTION_TYPES.PAY, total: 0});

        // When the app loads
        render(<BulkActionStatusManager />);
        await waitForBatchedUpdatesWithAct();

        // Then the modal says nothing matched instead of "0 of 0"
        expect(screen.getByText('bulkAction.noReportsTitle')).toBeTruthy();
        expect(screen.queryByText('bulkAction.paidTitle')).toBeNull();
    });
});
