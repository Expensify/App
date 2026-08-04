import {render, screen} from '@testing-library/react-native';

import {ReportActionsWithInboxTabDeferredMount} from '@pages/inbox/ReportActions';

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
jest.mock('@hooks/usePaginatedReportActions', () => () => ({reportActions: {}}));
jest.mock('@hooks/useReportTransactionsCollection', () => () => ({}));

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
    it('renders report actions immediately without an explicit defer request', () => {
        render(
            <ReportActionsWithInboxTabDeferredMount
                reportID="123"
                shouldDefer={false}
            />,
        );

        expect(screen.getByTestId('report-actions')).toBeOnTheScreen();
        expect(screen.queryByTestId('navigation-deferred-mount')).not.toBeOnTheScreen();
    });

    it('defers report actions when the Inbox navigation requests it', () => {
        render(
            <ReportActionsWithInboxTabDeferredMount
                reportID="123"
                shouldDefer
            />,
        );

        expect(screen.getByTestId('navigation-deferred-mount')).toBeOnTheScreen();
        expect(screen.queryByTestId('report-actions')).not.toBeOnTheScreen();
    });
});
