import {act, fireEvent, render, screen} from '@testing-library/react-native';

import type {ExpenseFieldDropdownRenderProps} from '@components/MoneyRequestConfirmationList/sections/ExpenseFieldDropdown';
import ExpenseFieldDropdown from '@components/MoneyRequestConfirmationList/sections/ExpenseFieldDropdown';
import Text from '@components/Text';

import getSelectionListPopoverContentHeight from '@libs/getSelectionListPopoverContentHeight';

import variables from '@styles/variables';

import ONYXKEYS from '@src/ONYXKEYS';

import type {ReactNode} from 'react';

import React from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

// Below this width the container is a bottom sheet, so these tests default to a wide layout.
let mockIsSmallScreenWidth = false;
jest.mock('@hooks/useResponsiveLayout', () => jest.fn(() => ({isSmallScreenWidth: mockIsSmallScreenWidth, shouldUseNarrowLayout: mockIsSmallScreenWidth})));
// Read lazily so a test can shrink the viewport, leaving the row short of room on both sides at once.
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
        mockIsSmallScreenWidth = false;
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    const renderField = (shouldOpenInDropdown = true, onPress: () => void = jest.fn(), listHeaderHeight?: number) =>
        render(
            <ExpenseFieldDropdown
                name={FIELD_NAME}
                testID={ROW_TEST_ID}
                shouldOpenInDropdown={shouldOpenInDropdown}
                onPress={onPress}
                renderDropdown={renderDropdown}
                listHeaderHeight={listHeaderHeight}
            />,
        );

    describe('with a header above the list', () => {
        const HEADER_HEIGHT = variables.componentSizeNormal;

        it('grows the container by the header so it still fits as many options', () => {
            // Given a row with plenty of room below, whose list shows a header above its options
            mockRowAt(ROW_TOP);
            renderField(true, jest.fn(), HEADER_HEIGHT);

            // When the row is pressed
            act(() => pressRow());

            // Then the container is taller by the header, so the header doesn't take the place of an option
            expect(renderedProps?.popoverHeight).toBe(getSelectionListPopoverContentHeight({optionCount: 4}) + HEADER_HEIGHT);
        });

        it('falls back to the full page when the room left fits one option but not the header too', () => {
            // Given a row with room below for one option, but not for one option and the header
            const onPress = jest.fn();
            mockWindowHeight = ROW_TOP + ROW_HEIGHT + 6 + getSelectionListPopoverContentHeight({optionCount: 1}) + HEADER_HEIGHT / 2;
            mockRowAt(ROW_TOP);
            renderField(true, onPress, HEADER_HEIGHT);

            // When the row is pressed
            act(() => pressRow());

            // Then it opens the page, rather than a container showing the header and no categories
            expect(onPress).toHaveBeenCalledTimes(1);
            expect(renderCount).toBe(0);
        });
    });

    it('does not mount the list until the row is pressed', () => {
        // Given a field whose list opens in the container anchored to the row
        mockRowAt(ROW_TOP);
        renderField();

        // When the row has not been pressed
        // Then the list was never mounted, so an untouched field costs the form nothing
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

    it('stops short of the header when it opens above the row', () => {
        // Given a row with too little room below, and just enough above to reach the top of the window
        mockWindowHeight = 500;
        mockRowAt(304);
        renderField();

        // When the row is pressed
        act(() => pressRow());

        // Then its top edge clears the header, so it never covers the back button. Opening above is positioned
        // from the bottom edge, so the top is that minus the height.
        expect(renderedProps?.shouldMeasureAnchorPositionFromTop).toBe(false);
        const containerTop = (renderedProps?.anchorPosition.vertical ?? 0) - (renderedProps?.popoverHeight ?? 0);
        expect(containerTop).toBeGreaterThanOrEqual(variables.contentHeaderHeight);
    });

    it('prefers the side of the row with more room', () => {
        // Given a row with enough room below it for a usable list, but more room above it than below
        mockWindowHeight = 900;
        mockRowAt(500);
        renderField();

        // When the row is pressed
        act(() => pressRow());

        // Then it opens above, into the room it has, rather than below into the smaller gap
        expect(renderedProps?.shouldMeasureAnchorPositionFromTop).toBe(false);
    });

    it('never asks for more height than the row leaves it', () => {
        // Given a viewport short enough that the row has a usable but limited gap under it
        mockWindowHeight = 500;
        mockRowAt(120);
        renderField();

        // When the row is pressed
        act(() => pressRow());

        // Then it asks for at most the space that is there. Flooring this at a minimum ran it past the panel.
        const openedBelow = renderedProps?.shouldMeasureAnchorPositionFromTop ?? true;
        const spaceUsed = openedBelow ? mockWindowHeight - (renderedProps?.anchorPosition.vertical ?? 0) : (renderedProps?.anchorPosition.vertical ?? 0);
        expect(renderedProps?.popoverHeight).toBeLessThanOrEqual(spaceUsed);
    });

    it('falls back to the full page when neither side has room for a list', () => {
        // Given a viewport too short for a usable list on either side of the row
        const onPress = jest.fn();
        mockWindowHeight = 300;
        mockRowAt(120);
        renderField(true, onPress);

        // When the row is pressed
        act(() => pressRow());

        // Then it opens the page. A container with no height sizes itself to its content and is dragged back
        // over the row to fit the window.
        expect(onPress).toHaveBeenCalledTimes(1);
        expect(renderCount).toBe(0);
    });

    it('opens the bottom sheet on a narrow layout however little room the row has', () => {
        // Given a narrow layout and a row with too little room either side for a pop-over
        const onPress = jest.fn();
        mockIsSmallScreenWidth = true;
        mockWindowHeight = 300;
        mockRowAt(120);
        renderField(true, onPress);

        // When the row is pressed
        act(() => pressRow());

        // Then the sheet opens anyway: it is placed and sized by the screen, not by the row
        expect(screen.getByText(DROPDOWN_TEXT)).toBeOnTheScreen();
        expect(onPress).not.toHaveBeenCalled();
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
