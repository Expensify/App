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
        // Given a themed pagination indicator at the older edge.
        const {result: styles} = renderHook(useThemeStyles);
        // When the indicator is rendered.
        const view = render(<ReportActionsPaginationLoadingIndicator direction="older" />);

        // Then only the padded spinner is visible.
        expect(StyleSheet.flatten(screen.getByTestId(OLDER_TEST_ID, {includeHiddenElements: true}).props.style)).toEqual(
            expect.objectContaining({
                alignItems: 'center',
                height: CONST.PAGINATION_LOADING_INDICATOR_HEIGHT,
                justifyContent: 'center',
                paddingBottom: styles.current.pb6.paddingBottom,
                paddingTop: styles.current.pt18.paddingTop,
            }),
        );
        expect(CONST.PAGINATION_LOADING_INDICATOR_HEIGHT).toBeGreaterThan(styles.current.pt18.paddingTop + styles.current.pb6.paddingBottom);
        expect(screen.getByTestId(`${OLDER_TEST_ID}-spinner`, {includeHiddenElements: true})).toBeOnTheScreen();
        expect(screen.queryByTestId(`${OLDER_TEST_ID}-skeleton`, {includeHiddenElements: true})).toBeNull();

        view.rerender(<ReportActionsPaginationLoadingIndicator direction="newer" />);

        expect(screen.getByTestId(`${NEWER_TEST_ID}-spinner`, {includeHiddenElements: true})).toBeOnTheScreen();
    });

    it('keeps pagination loading UI out of interaction and accessibility', () => {
        // Given pagination is loading at the newer edge.
        // When its indicator is rendered.
        render(<ReportActionsPaginationLoadingIndicator direction="newer" />);

        // Then the decorative spinner cannot receive focus or touches.
        expect(screen.getByTestId(NEWER_TEST_ID, {includeHiddenElements: true}).props).toEqual(
            expect.objectContaining({
                accessibilityElementsHidden: true,
                importantForAccessibility: 'no-hide-descendants',
                pointerEvents: 'none',
            }),
        );
    });
});
