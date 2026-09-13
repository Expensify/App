import {render, renderHook, screen} from '@testing-library/react-native';

import useThemeStyles from '@hooks/useThemeStyles';

import ReportActionsPaginationLoadingIndicator from '@pages/inbox/report/ReportActionsPaginationLoadingIndicator';

import CONST from '@src/CONST';

import type {ComponentType} from 'react';
import type {ViewProps} from 'react-native';

import React from 'react';
import {StyleSheet} from 'react-native';

jest.mock('@components/ActivityIndicator', () => ({
    __esModule: true,
    default: ({testID}: {testID?: string}) => {
        const {View: MockView} = jest.requireActual<{View: ComponentType<ViewProps>}>('react-native');
        return <MockView testID={testID} />;
    },
}));

const OLDER_TEST_ID = 'report-actions-pagination-older';
const NEWER_TEST_ID = 'report-actions-pagination-newer';

describe('ReportActionsPaginationLoadingIndicator', () => {
    it('renders only a spinner with generous vertical padding', () => {
        const {result: styles} = renderHook(useThemeStyles);
        const view = render(<ReportActionsPaginationLoadingIndicator direction="older" />);

        expect(StyleSheet.flatten(screen.getByTestId(OLDER_TEST_ID, {includeHiddenElements: true}).props.style)).toEqual(
            expect.objectContaining({
                alignItems: 'center',
                height: CONST.PAGINATION_LOADING_INDICATOR_HEIGHT,
                justifyContent: 'center',
                paddingBottom: styles.current.pb6.paddingBottom,
                paddingTop: styles.current.pt16.paddingTop,
            }),
        );
        expect(screen.getByTestId(`${OLDER_TEST_ID}-spinner`, {includeHiddenElements: true})).toBeOnTheScreen();
        expect(screen.queryByTestId(`${OLDER_TEST_ID}-skeleton`, {includeHiddenElements: true})).toBeNull();

        view.rerender(<ReportActionsPaginationLoadingIndicator direction="newer" />);

        expect(screen.getByTestId(`${NEWER_TEST_ID}-spinner`, {includeHiddenElements: true})).toBeOnTheScreen();
    });

    it('keeps pagination loading UI out of interaction and accessibility', () => {
        render(<ReportActionsPaginationLoadingIndicator direction="newer" />);

        expect(screen.getByTestId(NEWER_TEST_ID, {includeHiddenElements: true}).props).toEqual(
            expect.objectContaining({
                accessibilityElementsHidden: true,
                importantForAccessibility: 'no-hide-descendants',
                pointerEvents: 'none',
            }),
        );
    });
});
