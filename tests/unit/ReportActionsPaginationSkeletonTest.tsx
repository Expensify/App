import {render, screen} from '@testing-library/react-native';

import ReportActionsPaginationSkeleton, {PAGINATION_SPINNER_HEIGHT, PAGINATION_TOP_OVERLAY_CLEARANCE} from '@pages/inbox/report/ReportActionsPaginationSkeleton';

import type {ComponentType} from 'react';
import type {ViewProps} from 'react-native';

import React from 'react';
import {StyleSheet, View} from 'react-native';

const mockReportActionsSkeletonView = jest.fn((props: {possibleVisibleContentItems?: number; shouldAnimate?: boolean}) => (
    <View testID={`mock-report-actions-skeleton-${props.possibleVisibleContentItems}`} />
));

jest.mock('@components/ReportActionsSkeletonView', () => ({
    __esModule: true,
    default: (props: {possibleVisibleContentItems?: number; shouldAnimate?: boolean}) => mockReportActionsSkeletonView(props),
}));

jest.mock('@components/ActivityIndicator', () => ({
    __esModule: true,
    default: ({testID}: {testID?: string}) => {
        const {View: MockView} = jest.requireActual<{View: ComponentType<ViewProps>}>('react-native');
        return <MockView testID={testID} />;
    },
}));

const VIEWPORT_HEIGHT = 361;
const OLDER_TEST_ID = 'report-actions-pagination-older';
const NEWER_TEST_ID = 'report-actions-pagination-newer';

describe('ReportActionsPaginationSkeleton', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('covers one full viewport with enough static skeleton rows', () => {
        render(
            <ReportActionsPaginationSkeleton
                direction="older"
                viewportHeight={VIEWPORT_HEIGHT}
                isLoading={false}
                hasError={false}
            />,
        );

        expect(StyleSheet.flatten(screen.getByTestId(`${OLDER_TEST_ID}-skeleton`, {includeHiddenElements: true}).props.style)).toEqual(
            expect.objectContaining({height: VIEWPORT_HEIGHT, overflow: 'hidden'}),
        );
        expect(mockReportActionsSkeletonView).toHaveBeenCalledWith({possibleVisibleContentItems: Math.ceil(VIEWPORT_HEIGHT / 60), shouldAnimate: false});
    });

    it('puts the fixed spinner slot beyond the skeleton in each pagination direction', () => {
        const view = render(
            <ReportActionsPaginationSkeleton
                direction="older"
                viewportHeight={VIEWPORT_HEIGHT}
                isLoading
                hasError={false}
            />,
        );

        expect(view.toJSON()).toEqual(
            expect.objectContaining({
                children: [
                    expect.objectContaining({props: expect.objectContaining({style: {height: PAGINATION_TOP_OVERLAY_CLEARANCE}})}),
                    expect.objectContaining({props: expect.objectContaining({testID: `${OLDER_TEST_ID}-spinner-slot`})}),
                    expect.objectContaining({props: expect.objectContaining({testID: `${OLDER_TEST_ID}-skeleton`})}),
                ],
            }),
        );
        expect(StyleSheet.flatten(screen.getByTestId(`${OLDER_TEST_ID}-spinner-slot`, {includeHiddenElements: true}).props.style)).toEqual(
            expect.objectContaining({height: PAGINATION_SPINNER_HEIGHT}),
        );
        expect(screen.getByTestId(`${OLDER_TEST_ID}-spinner`, {includeHiddenElements: true})).toBeOnTheScreen();

        view.rerender(
            <ReportActionsPaginationSkeleton
                direction="newer"
                viewportHeight={VIEWPORT_HEIGHT}
                isLoading
                hasError={false}
            />,
        );

        expect(view.toJSON()).toEqual(
            expect.objectContaining({
                children: [
                    expect.objectContaining({props: expect.objectContaining({testID: `${NEWER_TEST_ID}-skeleton`})}),
                    expect.objectContaining({props: expect.objectContaining({testID: `${NEWER_TEST_ID}-spinner-slot`})}),
                ],
            }),
        );
        expect(StyleSheet.flatten(screen.getByTestId(`${NEWER_TEST_ID}-spinner-slot`, {includeHiddenElements: true}).props.style)).toEqual(
            expect.objectContaining({height: PAGINATION_SPINNER_HEIGHT}),
        );
        expect(screen.getByTestId(`${NEWER_TEST_ID}-spinner`, {includeHiddenElements: true})).toBeOnTheScreen();
    });

    it('keeps the spinner slot stable while hiding the spinner when idle or failed', () => {
        const view = render(
            <ReportActionsPaginationSkeleton
                direction="newer"
                viewportHeight={VIEWPORT_HEIGHT}
                isLoading={false}
                hasError={false}
            />,
        );

        expect(screen.getByTestId(`${NEWER_TEST_ID}-spinner-slot`, {includeHiddenElements: true})).toBeOnTheScreen();
        expect(screen.queryByTestId(`${NEWER_TEST_ID}-spinner`, {includeHiddenElements: true})).toBeNull();

        view.rerender(
            <ReportActionsPaginationSkeleton
                direction="newer"
                viewportHeight={VIEWPORT_HEIGHT}
                isLoading
                hasError
            />,
        );

        expect(screen.getByTestId(`${NEWER_TEST_ID}-spinner-slot`, {includeHiddenElements: true})).toBeOnTheScreen();
        expect(screen.queryByTestId(`${NEWER_TEST_ID}-spinner`, {includeHiddenElements: true})).toBeNull();
    });
});
