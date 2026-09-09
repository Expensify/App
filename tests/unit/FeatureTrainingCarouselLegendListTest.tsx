import {act, fireEvent, render, screen} from '@testing-library/react-native';

import FeatureTrainingCarousel from '@components/FeatureTraining/FeatureTrainingCarousel';
import Body from '@components/FeatureTraining/primitives/Body';
import Illustration from '@components/FeatureTraining/primitives/Illustration';
import Page from '@components/FeatureTraining/primitives/Page';

import type {LegendListProps} from '@legendapp/list/react-native';
import type {View as ReactNativeView} from 'react-native';

import React from 'react';

let mockLegendListProps: LegendListProps<unknown> | undefined;

jest.mock('@legendapp/list/react-native', () => ({
    __esModule: true,
    LegendList: (props: LegendListProps<unknown>) => {
        const {View: MockView} = jest.requireActual<{View: typeof ReactNativeView}>('react-native');
        mockLegendListProps = props;
        return <MockView testID="feature-training-list" />;
    },
}));

jest.mock('@components/FeatureTraining/hooks/useScrollableWrapper', () => {
    const {View: MockView} = jest.requireActual<{View: typeof ReactNativeView}>('react-native');
    return {
        __esModule: true,
        default: () => ({
            Wrapper: MockView,
            wrapperProps: {testID: 'feature-training-wrapper'},
            setContainerHeight: jest.fn(),
            shouldUseScrollView: false,
            isInLandscapeMode: false,
        }),
    };
});

jest.mock('@components/FeatureTraining/primitives/Body', () => {
    const {View: MockView} = jest.requireActual<{View: typeof ReactNativeView}>('react-native');
    return {
        __esModule: true,
        default: ({children}: {children?: React.ReactNode}) => <MockView>{children}</MockView>,
    };
});

jest.mock('@components/FeatureTraining/primitives/Illustration', () => {
    const {View: MockView} = jest.requireActual<{View: typeof ReactNativeView}>('react-native');
    return {__esModule: true, default: () => <MockView />};
});

jest.mock('@components/FeatureTraining/primitives/CloseButton', () => ({
    __esModule: true,
    default: () => null,
}));

jest.mock('@components/FeatureTraining/primitives/PaginationDots', () => ({
    __esModule: true,
    default: () => null,
}));

describe('FeatureTrainingCarousel LegendList', () => {
    beforeEach(() => {
        mockLegendListProps = undefined;
    });

    it('invalidates mounted pages when the active page or viewport width changes', () => {
        render(
            <FeatureTrainingCarousel>
                <Page>
                    <Illustration videoURL="first" />
                    <Body />
                </Page>
                <Page>
                    <Illustration videoURL="second" />
                    <Body />
                </Page>
            </FeatureTrainingCarousel>,
        );

        fireEvent(screen.getByTestId('feature-training-wrapper'), 'layout', {nativeEvent: {layout: {height: 200, width: 320, x: 0, y: 0}}});

        expect(mockLegendListProps?.extraData).toEqual({currentPage: 0, carouselViewportWidth: 320});

        act(() => {
            mockLegendListProps?.onViewableItemsChanged?.({
                changed: [],
                end: 1,
                endBuffered: 1,
                start: 0,
                startBuffered: 0,
                viewableItems: [{containerId: 0, index: 1, isViewable: true, item: {}, key: 'page-1'}],
            });
        });

        expect(mockLegendListProps?.extraData).toEqual({currentPage: 1, carouselViewportWidth: 320});
    });
});
