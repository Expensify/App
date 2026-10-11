import {act, render} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';

import Navigation from '@libs/Navigation/Navigation';

import ReportDetailsActions from '@pages/DynamicReportDetailsPage/ReportDetailsActions';
import ReportDetailsMenuItems from '@pages/DynamicReportDetailsPage/ReportDetailsMenuItems';
import useReportDetailsRequestData from '@pages/DynamicReportDetailsPage/useReportDetailsRequestData';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import {createRandomReport} from '../../../utils/collections/reports';
import waitForBatchedUpdatesWithAct from '../../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@hooks/useOnyx', () => {
    const actual = jest.requireActual<{default: typeof useOnyx}>('@hooks/useOnyx');
    return {__esModule: true, default: jest.fn(actual.default)};
});
jest.mock('@hooks/usePaginatedReportActions', () => {
    const actual = jest.requireActual<{default: typeof usePaginatedReportActions}>('@hooks/usePaginatedReportActions');
    return {__esModule: true, default: jest.fn(actual.default)};
});
jest.mock('@pages/DynamicReportDetailsPage/ReportDetailsMenuItems', () => ({__esModule: true, default: jest.fn(() => null)}));
jest.mock('@pages/DynamicReportDetailsPage/useReportDetailsRequestData', () => {
    const actual = jest.requireActual<{default: typeof useReportDetailsRequestData}>('@pages/DynamicReportDetailsPage/useReportDetailsRequestData');
    return {__esModule: true, default: jest.fn(actual.default)};
});

const mockUseOnyx = jest.mocked(useOnyx);
const mockUsePaginatedReportActions = jest.mocked(usePaginatedReportActions);
const mockUseReportDetailsRequestData = jest.mocked(useReportDetailsRequestData);
const mockReportDetailsMenuItems = jest.mocked(ReportDetailsMenuItems);

function renderActions(reportID: string) {
    return render(
        <OnyxListItemProvider>
            <LocaleContextProvider>
                <ReportDetailsActions reportID={reportID} />
            </LocaleContextProvider>
        </OnyxListItemProvider>,
    );
}

function getSubscribedKeys(): string[] {
    return mockUseOnyx.mock.calls.map(([key]) => String(key));
}

describe('ReportDetailsActions', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        mockUseOnyx.mockClear();
        mockUsePaginatedReportActions.mockClear();
        mockUseReportDetailsRequestData.mockClear();
        mockReportDetailsMenuItems.mockClear();
        jest.spyOn(Navigation, 'getTopmostSearchReportRouteParams').mockReturnValue(undefined);
    });

    afterEach(async () => {
        jest.restoreAllMocks();
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('should not mount the request data subscriptions for a chat room', async () => {
        // Given a chat room, which resolves to the default case
        const reportID = '1';
        const room: Report = {
            ...createRandomReport(Number(reportID), CONST.REPORT.CHAT_TYPE.POLICY_ROOM),
            type: CONST.REPORT.TYPE.CHAT,
            parentReportID: undefined,
            parentReportActionID: undefined,
        };
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, room);
        });

        // When the actions render for it
        renderActions(reportID);
        await waitForBatchedUpdatesWithAct();

        // Then the menu gets no request data, and none of the money subscriptions are opened, because a room has no
        // expense to delete or track
        expect(mockReportDetailsMenuItems).toHaveBeenCalled();
        expect(mockReportDetailsMenuItems.mock.calls.every(([props]) => props.requestData === undefined)).toBe(true);
        expect(mockUseReportDetailsRequestData).not.toHaveBeenCalled();
        expect(mockUsePaginatedReportActions).not.toHaveBeenCalled();
        expect(getSubscribedKeys().some((key) => key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION))).toBe(false);
    });

    it('should mount the request data subscriptions for an expense report', async () => {
        // Given an expense report, which resolves to a money case
        const reportID = '2';
        const expenseReport: Report = {
            ...createRandomReport(Number(reportID), undefined),
            type: CONST.REPORT.TYPE.EXPENSE,
            parentReportID: undefined,
            parentReportActionID: undefined,
        };
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, expenseReport);
        });

        // When the actions render for it
        renderActions(reportID);
        await waitForBatchedUpdatesWithAct();

        // Then the request data is read for that report and handed to the menu, so the money rows can be built
        expect(mockUseReportDetailsRequestData).toHaveBeenCalledWith(reportID);
        expect(mockUsePaginatedReportActions).toHaveBeenCalled();
        expect(mockReportDetailsMenuItems.mock.lastCall?.[0].requestData).toEqual(expect.objectContaining({isSingleTransactionView: false}));
    });
});
