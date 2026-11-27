import {render} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useLinkedActionTransactionThread from '@hooks/useLinkedActionTransactionThread';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';

import WideRHPReceiptPanel from '@pages/inbox/WideRHPReceiptPanel';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Report} from '@src/types/onyx';

import type * as ReactNavigationNative from '@react-navigation/native';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const PARENT_REPORT_ID = '1';
const THREAD_REPORT_ID = '2';
const LINKED_ACTION_ID = '3';

// A Search link to a message in a one-transaction thread, after it has been redirected to the parent expense report.
const mockRoute = {key: 'search-report', name: SCREENS.RIGHT_MODAL.SEARCH_REPORT, params: {reportID: PARENT_REPORT_ID, reportActionID: LINKED_ACTION_ID}};
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native'),
    useRoute: () => mockRoute,
}));

jest.mock('@hooks/useResponsiveLayout');

jest.mock('@components/WideRHPContextProvider/useRHPWidth', () => ({
    __esModule: true,
    default: () => {},
}));

let mockReceiptReport: Report | undefined;
jest.mock('@components/ReportActionItem/MoneyRequestReceiptView', () => ({
    __esModule: true,
    default: ({report}: {report: Report | undefined}) => {
        mockReceiptReport = report;
        return null;
    },
}));

jest.mock('@hooks/usePaginatedReportActions', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@hooks/useLinkedActionTransactionThread', () => ({
    __esModule: true,
    default: jest.fn(),
}));

function renderPanel() {
    return render(
        <OnyxListItemProvider>
            <WideRHPReceiptPanel />
        </OnyxListItemProvider>,
    );
}

describe('WideRHPReceiptPanel', () => {
    beforeEach(async () => {
        mockReceiptReport = undefined;
        await Onyx.clear();
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${PARENT_REPORT_ID}`, {reportID: PARENT_REPORT_ID, type: CONST.REPORT.TYPE.EXPENSE});
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${THREAD_REPORT_ID}`, {reportID: THREAD_REPORT_ID, parentReportID: PARENT_REPORT_ID});

        // The paginated window holds none of the parent's IOU actions, as when the IOU action sits on an older, disconnected page
        jest.mocked(usePaginatedReportActions).mockReturnValue({
            reportActions: [],
            linkedAction: undefined,
            oldestUnreadReportAction: undefined,
            sortedAllReportActions: [],
            hasOlderActions: false,
            hasNewerActions: false,
            report: undefined,
        });
        await waitForBatchedUpdates();
    });

    it('shows the transaction thread receipt when the linked thread only resolves from all cached actions', async () => {
        // Given a link to a message in the merged one-transaction thread, which only the parent's full action collection resolves
        jest.mocked(useLinkedActionTransactionThread).mockReturnValue({linkedActionTransactionThreadReportID: THREAD_REPORT_ID, isLinkedActionInMergedTransactionThread: true});

        // When the receipt panel renders for the redirected parent route
        renderPanel();
        await waitForBatchedUpdates();

        // Then the receipt view gets the transaction thread instead of the parent, so the expense's receipt is still shown
        expect(mockReceiptReport?.reportID).toBe(THREAD_REPORT_ID);
    });

    it('keeps the parent report when the linked action is not in the merged thread', async () => {
        // Given a linked action that belongs to the parent report itself
        jest.mocked(useLinkedActionTransactionThread).mockReturnValue({linkedActionTransactionThreadReportID: THREAD_REPORT_ID, isLinkedActionInMergedTransactionThread: false});

        // When the receipt panel renders
        renderPanel();
        await waitForBatchedUpdates();

        // Then the existing behaviour is unchanged and the parent report is used
        expect(mockReceiptReport?.reportID).toBe(PARENT_REPORT_ID);
    });
});
