import {render, screen} from '@testing-library/react-native';

import ChatReportActions from '@pages/inbox/ChatReportActions';

import type {Report} from '@src/types/onyx';

import type ReactNative from 'react-native';

import React from 'react';

let mockIsOffline = false;
let mockIsAppLoadPending = true;
const mockListMount = jest.fn();
const mockListUnmount = jest.fn();

jest.mock('@hooks/useNetwork', () => () => ({isOffline: mockIsOffline}));
jest.mock('@hooks/useInFlightRequests', () => ({useIsAppLoadPending: () => mockIsAppLoadPending}));
jest.mock('@hooks/useOnyx', () => () => [undefined, {status: 'loaded'}]);
jest.mock('@pages/inbox/report/UserTypingEventListener', () => () => null);
jest.mock('@pages/inbox/report/ReportActionsLoadingSkeleton', () => {
    const {View} = jest.requireActual<typeof ReactNative>('react-native');
    return () => <View testID="loading-skeleton" />;
});
jest.mock('@pages/inbox/report/ReportActionsList', () => {
    const reactModule = jest.requireActual<typeof React>('react');
    const {View} = jest.requireActual<typeof ReactNative>('react-native');
    function MockReportActionsList() {
        reactModule.useEffect(() => {
            mockListMount();
            return () => {
                mockListUnmount();
            };
        }, []);
        return <View testID="report-actions" />;
    }
    return MockReportActionsList;
});

const report: Report = {reportID: '1234', reportName: 'Cached chat'};

describe('ChatReportActions', () => {
    beforeEach(() => {
        mockIsOffline = false;
        mockIsAppLoadPending = true;
        mockListMount.mockClear();
        mockListUnmount.mockClear();
    });

    it('keeps the offline list mounted when its queued app load resumes online', () => {
        // Given cached messages are visible while OpenApp is queued offline.
        mockIsOffline = true;
        const view = render(<ChatReportActions report={report} />);
        expect(screen.getByTestId('report-actions')).toBeTruthy();

        // When connectivity returns before the queued app load finishes.
        mockIsOffline = false;
        view.rerender(<ChatReportActions report={report} />);

        // Then the same list keeps its viewport throughout the refresh.
        expect(screen.queryByTestId('loading-skeleton')).toBeNull();
        expect(screen.getByTestId('report-actions')).toBeTruthy();
        expect(mockListMount).toHaveBeenCalledTimes(1);
        expect(mockListUnmount).not.toHaveBeenCalled();
    });

    it('gates the first online mount without hiding it during a later app refresh', () => {
        // Given the first app load is still fetching data online.
        const view = render(<ChatReportActions report={report} />);
        expect(screen.getByTestId('loading-skeleton')).toBeTruthy();
        expect(mockListMount).not.toHaveBeenCalled();

        // When the initial load finishes and a later refresh starts.
        mockIsAppLoadPending = false;
        view.rerender(<ChatReportActions report={report} />);
        expect(screen.getByTestId('report-actions')).toBeTruthy();
        mockIsAppLoadPending = true;
        view.rerender(<ChatReportActions report={report} />);

        // Then initial loading stays protected while the displayed list survives subsequent refreshes.
        expect(screen.queryByTestId('loading-skeleton')).toBeNull();
        expect(screen.getByTestId('report-actions')).toBeTruthy();
        expect(mockListMount).toHaveBeenCalledTimes(1);
        expect(mockListUnmount).not.toHaveBeenCalled();
    });
});
