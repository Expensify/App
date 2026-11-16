import {render, screen} from '@testing-library/react-native';

import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';

import ReportActionsWithInboxTabDeferredMount from '@pages/inbox/ReportActionsWithInboxTabDeferredMount';

import type {ComponentType} from 'react';

import React from 'react';

type ReactActual = {
    createElement: typeof React.createElement;
};

type ReactNativeActual = {
    View: ComponentType<{testID: string}>;
};

jest.mock(
    '@components/NavigationDeferredMount',
    () =>
        function NavigationDeferredMountMock() {
            const {createElement} = jest.requireActual<ReactActual>('react');
            const {View} = jest.requireActual<ReactNativeActual>('react-native');
            return createElement(View, {testID: 'navigation-deferred-mount'});
        },
);

jest.mock('@hooks/useMarkOpenReportEndOnSkeleton', () => () => undefined);
jest.mock('@hooks/useNetwork', () => () => ({isOffline: false}));
jest.mock('@hooks/useOnyx', () => () => [undefined]);
jest.mock('@hooks/usePaginatedReportActions', () => jest.fn(() => ({reportActions: []})));
jest.mock('@hooks/useReportTransactionsCollection', () => jest.fn(() => ({})));

jest.mock('@react-navigation/native', () => {
    const navigation = jest.requireActual<Record<string, unknown>>('@react-navigation/native');
    return {
        ...navigation,
        useRoute: () => ({params: {reportID: '123'}}),
    };
});

jest.mock(
    '@pages/inbox/report/ReportActionsLoadingSkeleton',
    () =>
        function ReportActionsLoadingSkeletonMock() {
            const {createElement} = jest.requireActual<ReactActual>('react');
            const {View} = jest.requireActual<ReactNativeActual>('react-native');
            return createElement(View, {testID: 'report-actions'});
        },
);

describe('ReportActionsWithInboxTabDeferredMount', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders report actions immediately without an explicit defer request', () => {
        // Given Inbox has not requested navigation deferral.
        // When the report surface mounts before its report data arrives.
        render(
            <ReportActionsWithInboxTabDeferredMount
                reportID="123"
                shouldDefer={false}
            />,
        );

        // Then missing data uses the report loader without introducing a navigation delay.
        expect(screen.getByTestId('report-actions')).toBeOnTheScreen();
        expect(screen.queryByTestId('navigation-deferred-mount')).not.toBeOnTheScreen();
    });

    it('defers report actions when the Inbox navigation requests it', () => {
        // Given Inbox needs its transition to complete before mounting report work.
        // When navigation explicitly requests deferral.
        render(
            <ReportActionsWithInboxTabDeferredMount
                reportID="123"
                shouldDefer
            />,
        );

        // Then the report boundary, including its money subscriptions, has not mounted yet.
        expect(screen.getByTestId('navigation-deferred-mount')).toBeOnTheScreen();
        expect(screen.queryByTestId('report-actions')).not.toBeOnTheScreen();
        expect(usePaginatedReportActions).not.toHaveBeenCalled();
        expect(useReportTransactionsCollection).not.toHaveBeenCalled();
    });

    it('mounts report actions when Inbox releases the same deferred route', () => {
        // Given a report is waiting for an Inbox navigation transition.
        const {rerender} = render(
            <ReportActionsWithInboxTabDeferredMount
                reportID="123"
                shouldDefer
            />,
        );

        // When Inbox releases deferral without changing the report route.
        rerender(
            <ReportActionsWithInboxTabDeferredMount
                reportID="123"
                shouldDefer={false}
            />,
        );

        // Then the report data loader replaces navigation deferral immediately.
        expect(screen.getByTestId('report-actions')).toBeOnTheScreen();
        expect(screen.queryByTestId('navigation-deferred-mount')).not.toBeOnTheScreen();
    });
});
