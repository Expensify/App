import {act, fireEvent, render, screen} from '@testing-library/react-native';

import type {ExpenseFieldDropdownRenderProps} from '@components/MoneyRequestConfirmationList/sections/ExpenseFieldDropdown';
import ExpenseFieldDropdown from '@components/MoneyRequestConfirmationList/sections/ExpenseFieldDropdown';
import Text from '@components/Text';

import ONYXKEYS from '@src/ONYXKEYS';

import type {ReactNode} from 'react';

import React from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

// The container is a bottom sheet below this width, where none of the row's geometry applies. These tests are
// about the pop-over, so they pin the layout wide and the viewport to a known height.
jest.mock('@hooks/useResponsiveLayout', () => jest.fn(() => ({isSmallScreenWidth: false, shouldUseNarrowLayout: false})));
// Read lazily so a test can shrink the viewport, which is the only way to leave the row short of room on both
// sides at once — the case where the container used to ask for more height than it had.
let mockWindowHeight = 800;
jest.mock('@hooks/useWindowDimensions', () => jest.fn(() => ({windowWidth: 1280, windowHeight: mockWindowHeight})));

const WINDOW_HEIGHT = 800;

const FIELD_NAME = 'Category';
const ROW_TEST_ID = 'category-row';
const DROPDOWN_TEXT = 'The category list';

const ROW_X = 16;
const ROW_TOP = 100;
const ROW_WIDTH = 300;
const ROW_HEIGHT = 60;

// `MenuItem.Root` drops a press it was handed no event for, so every press here carries one.
const pressRow = () => fireEvent.press(screen.getByTestId(ROW_TEST_ID), {nativeEvent: {}});

/**
 * Stands in for the measurement the row does when it opens: the container is positioned off the row's real
 * geometry, which the test renderer never lays out, so each test says where the row sits instead.
 */
const mockRowAt = (rowTop: number) => {
    jest.spyOn(View.prototype, 'measureInWindow').mockImplementation((callback) => {
        callback(ROW_X, rowTop, ROW_WIDTH, ROW_HEIGHT);
    });
};

describe('ExpenseFieldDropdown', () => {
    let renderedProps: ExpenseFieldDropdownRenderProps | undefined;
    let renderCount = 0;

    const renderDropdown = (props: ExpenseFieldDropdownRenderProps): ReactNode => {
        renderedProps = props;
        renderCount += 1;
        return props.isVisible ? <Text>{DROPDOWN_TEXT}</Text> : null;
    };

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        renderedProps = undefined;
        renderCount = 0;
        mockWindowHeight = WINDOW_HEIGHT;
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    const renderField = (shouldOpenInDropdown = true, onPress: () => void = jest.fn()) =>
        render(
            <ExpenseFieldDropdown
                name={FIELD_NAME}
                testID={ROW_TEST_ID}
                shouldOpenInDropdown={shouldOpenInDropdown}
                onPress={onPress}
                renderDropdown={renderDropdown}
            />,
        );

    it('does not mount the list until the row is pressed', () => {
        // Given a field whose list opens in the container anchored to the row
        mockRowAt(ROW_TOP);
        renderField();

        // When the row has not been pressed
        // Then the list has never been mounted, so a field nobody opens costs the form nothing
        expect(renderCount).toBe(0);
    });

    it('opens the list in the container rather than navigating', () => {
        // Given a field whose list opens in place
        const onPress = jest.fn();
        mockRowAt(ROW_TOP);
        renderField(true, onPress);

        // When the row is pressed
        act(() => pressRow());

        // Then the list opens in the container and the full-page selector is never reached
        expect(screen.getByText(DROPDOWN_TEXT)).toBeOnTheScreen();
        expect(onPress).not.toHaveBeenCalled();
    });

    it('matches the row width and opens directly below the row', () => {
        // Given a row sitting near the top of a tall form, with room below it
        mockRowAt(ROW_TOP);
        renderField();

        // When the row is pressed
        act(() => pressRow());

        // Then the container is as wide as the row, shares its left edge, and hangs off its bottom edge
        expect(renderedProps?.popoverWidth).toBe(ROW_WIDTH);
        expect(renderedProps?.anchorPosition.horizontal).toBe(ROW_X);
        expect(renderedProps?.anchorPosition.vertical).toBeGreaterThan(ROW_TOP + ROW_HEIGHT);
        expect(renderedProps?.shouldMeasureAnchorPositionFromTop).toBe(true);
    });

    it('opens above the row when there is not enough room below it', () => {
        // Given a row pinned to the bottom of the viewport
        const rowTop = WINDOW_HEIGHT - ROW_HEIGHT;
        mockRowAt(rowTop);
        renderField();

        // When the row is pressed
        act(() => pressRow());

        // Then the container is positioned from its bottom edge, just above the row, so it is never clipped
        expect(renderedProps?.shouldMeasureAnchorPositionFromTop).toBe(false);
        expect(renderedProps?.anchorPosition.vertical).toBeLessThan(rowTop);
    });

    it('never asks for more height than the row leaves it', () => {
        // Given a viewport short enough that the row has little room either side of it, as a row low down in an
        // RHP does
        mockWindowHeight = 300;
        const rowTop = 120;
        mockRowAt(rowTop);
        renderField();

        // When the row is pressed
        act(() => pressRow());

        // Then the container asks for at most the space that is actually there. Flooring this at a minimum was
        // what let it run past the panel it was opened from.
        const openedBelow = renderedProps?.shouldMeasureAnchorPositionFromTop ?? true;
        const spaceUsed = openedBelow ? mockWindowHeight - (renderedProps?.anchorPosition.vertical ?? 0) : (renderedProps?.anchorPosition.vertical ?? 0);
        expect(renderedProps?.popoverHeight).toBeLessThanOrEqual(spaceUsed);
    });

    it('closes the list when the row is pressed again', () => {
        // Given a field whose list is already open
        mockRowAt(ROW_TOP);
        renderField();
        act(() => pressRow());
        expect(screen.getByText(DROPDOWN_TEXT)).toBeOnTheScreen();

        // When the row is pressed a second time
        act(() => pressRow());

        // Then the container is dismissed, the same way clicking outside it dismisses it
        expect(screen.queryByText(DROPDOWN_TEXT)).toBeNull();
    });

    it('opens the full-page selector for a field the container cannot answer', () => {
        // Given a field that has to send the user somewhere else first, e.g. to upgrade or to pick a workspace
        const onPress = jest.fn();
        mockRowAt(ROW_TOP);
        renderField(false, onPress);

        // When the row is pressed
        act(() => pressRow());

        // Then it opens the page it opened before, and no container is mounted
        expect(onPress).toHaveBeenCalledTimes(1);
        expect(renderCount).toBe(0);
    });
});
