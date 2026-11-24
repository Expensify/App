import {act, fireEvent, render, screen} from '@testing-library/react-native';

import type {DropdownFieldHandle, DropdownFieldRenderProps} from '@components/DropdownField';
import DropdownField from '@components/DropdownField';
import Text from '@components/Text';

import getSelectionListPopoverContentHeight from '@libs/getSelectionListPopoverContentHeight';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ComponentRef, ReactNode} from 'react';

import React, {createRef} from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

// Below this width the container is a bottom sheet, so these tests default to a wide layout.
let mockIsSmallScreenWidth = false;
jest.mock('@hooks/useResponsiveLayout', () => jest.fn(() => ({isSmallScreenWidth: mockIsSmallScreenWidth, shouldUseNarrowLayout: mockIsSmallScreenWidth})));
// Read lazily so a test can shrink the viewport, leaving the row short of room on both sides at once.
const WINDOW_HEIGHT = 800;
const WINDOW_WIDTH = 1280;
let mockWindowHeight = WINDOW_HEIGHT;
let mockWindowWidth = WINDOW_WIDTH;
jest.mock('@hooks/useWindowDimensions', () => jest.fn(() => ({windowWidth: mockWindowWidth, windowHeight: mockWindowHeight})));
// Jest resolves the native no-op, but a window is only dragged to a new size on web, which is what these tests cover.
jest.mock('@hooks/useRemeasureOnWindowResize', () => jest.requireActual<Record<string, unknown>>('@hooks/useRemeasureOnWindowResize/index.ts'));

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
const mockRowAt = (rowTop: number, rowX = ROW_X, rowWidth = ROW_WIDTH) =>
    jest.spyOn<ComponentRef<typeof View>, 'measureInWindow'>(View.prototype, 'measureInWindow').mockImplementation((callback) => {
        callback(rowX, rowTop, rowWidth, ROW_HEIGHT);
    });

describe('DropdownField', () => {
    let renderedProps: DropdownFieldRenderProps | undefined;
    let renderCount = 0;

    const renderDropdown = (props: DropdownFieldRenderProps): ReactNode => {
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
        mockWindowWidth = WINDOW_WIDTH;
        mockIsSmallScreenWidth = false;
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    const buildField = (shouldOpenInDropdown = true, onPress: () => void = jest.fn(), listHeaderHeight?: number) => (
        <DropdownField
            sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
            name={FIELD_NAME}
            testID={ROW_TEST_ID}
            shouldOpenInDropdown={shouldOpenInDropdown}
            onPress={onPress}
            renderDropdown={renderDropdown}
            listHeaderHeight={listHeaderHeight}
        />
    );

    const renderField = (shouldOpenInDropdown = true, onPress: () => void = jest.fn(), listHeaderHeight?: number) => render(buildField(shouldOpenInDropdown, onPress, listHeaderHeight));

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

        it('grows the bottom sheet by the header too, so a long list loses no row to it on a phone', () => {
            // Given a phone, where the list opens as a bottom sheet, whose list shows a header above its options
            mockIsSmallScreenWidth = true;
            mockRowAt(ROW_TOP);
            renderField(true, jest.fn(), HEADER_HEIGHT);

            // When the row is pressed
            act(() => pressRow());

            // Then the sheet may be taller than the standard dropdown height by the header, just like the pop-over
            expect(renderedProps?.popoverHeight).toBe(CONST.POPOVER_DROPDOWN_MAX_HEIGHT + HEADER_HEIGHT);
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

    describe('open()', () => {
        const renderFieldWithRef = (shouldOpenInDropdown: boolean, onPress: () => void) => {
            const ref = createRef<DropdownFieldHandle>();
            render(
                <DropdownField
                    sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
                    ref={ref}
                    name={FIELD_NAME}
                    testID={ROW_TEST_ID}
                    shouldOpenInDropdown={shouldOpenInDropdown}
                    onPress={onPress}
                    renderDropdown={renderDropdown}
                />,
            );
            return ref;
        };

        it('opens the list in the container without a press', () => {
            // Given a field whose list can open in place, opened by its parent rather than by the user
            const onPress = jest.fn();
            mockRowAt(ROW_TOP);
            const ref = renderFieldWithRef(true, onPress);

            // When the parent opens it
            act(() => ref.current?.open());

            // Then the list opens in the container and the full-page selector is never reached
            expect(screen.getByText(DROPDOWN_TEXT)).toBeOnTheScreen();
            expect(onPress).not.toHaveBeenCalled();
        });

        it('falls back to the full-page selector when the list cannot open in place', () => {
            // Given a field whose list cannot open in place, e.g. because there is no workspace to list categories from
            const onPress = jest.fn();
            mockRowAt(ROW_TOP);
            const ref = renderFieldWithRef(false, onPress);

            // When the parent opens it
            act(() => ref.current?.open());

            // Then it does what a press would and hands over to the full-page selector, never mounting the list
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

    it('opens into the room there is when the field has no page to fall back to', () => {
        // Given a field with no full-page selector, e.g. a Yes or No list, on a viewport too short for the usual minimum
        mockWindowHeight = 300;
        mockRowAt(120);
        render(
            <DropdownField
                sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
                name={FIELD_NAME}
                testID={ROW_TEST_ID}
                shouldOpenInDropdown
                renderDropdown={renderDropdown}
            />,
        );

        // When the row is pressed
        act(() => pressRow());

        // Then the list still opens, sized to the room below the row so the list scrolls rather than the press doing
        // nothing
        expect(screen.getByText(DROPDOWN_TEXT)).toBeOnTheScreen();
        const spaceBelow = mockWindowHeight - (renderedProps?.anchorPosition.vertical ?? 0);
        expect(renderedProps?.popoverHeight).toBeGreaterThan(0);
        expect(renderedProps?.popoverHeight).toBeLessThanOrEqual(spaceBelow);
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

    describe('when the window is resized', () => {
        // A narrower window, and the row moved and narrowed along with it
        const RESIZE_DELTA = 40;
        const RESIZED_WINDOW_WIDTH = WINDOW_WIDTH - RESIZE_DELTA;
        const RESIZED_ROW_X = ROW_X + RESIZE_DELTA;
        const RESIZED_ROW_WIDTH = ROW_WIDTH - RESIZE_DELTA;

        // The row is measured once more after a resize settles, so these tests step the clock past that wait
        const waitForResizeToSettle = () => act(() => jest.advanceTimersByTime(CONST.TIMING.RESIZE_DEBOUNCE_TIME));

        // Opening the list schedules that same settled measurement, so it is let run first and can't stand in for the one a resize schedules
        const openListAndSettle = () => {
            act(() => pressRow());
            waitForResizeToSettle();
        };

        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('follows the row to its new place and width once the resize settles', () => {
            // Given a field whose list is open, pinned to where the row sat when it was pressed
            const onPress = jest.fn();
            mockRowAt(ROW_TOP);
            const {rerender} = renderField(true, onPress);
            openListAndSettle();

            // When the window narrows, and the row only reaches its new place and width a moment later, once the RHP has laid
            // itself out at the new size
            mockWindowWidth = RESIZED_WINDOW_WIDTH;
            rerender(buildField(true, onPress));
            mockRowAt(ROW_TOP, RESIZED_ROW_X, RESIZED_ROW_WIDTH);
            waitForResizeToSettle();

            // Then the pop-over is placed off where the row ended up, instead of where it was on the frame the window changed
            expect(renderedProps?.popoverWidth).toBe(RESIZED_ROW_WIDTH);
            expect(renderedProps?.anchorPosition.horizontal).toBe(RESIZED_ROW_X);
        });

        it('follows the row while the window is still being resized', () => {
            // Given a field whose list is open
            const onPress = jest.fn();
            mockRowAt(ROW_TOP);
            const {rerender} = renderField(true, onPress);
            openListAndSettle();

            // When the window narrows and the row has already moved, with the resize not settled yet, as on every step of a drag
            mockWindowWidth = RESIZED_WINDOW_WIDTH;
            mockRowAt(ROW_TOP, RESIZED_ROW_X, RESIZED_ROW_WIDTH);
            rerender(buildField(true, onPress));

            // Then the pop-over is placed off the row right away, so it doesn't hang where the drag started until the window stops
            expect(renderedProps?.popoverWidth).toBe(RESIZED_ROW_WIDTH);
            expect(renderedProps?.anchorPosition.horizontal).toBe(RESIZED_ROW_X);
        });

        it('places a list opened as a bottom sheet under the row once the layout turns wide', () => {
            // Given a narrow layout, where the list opened as a bottom sheet without measuring the row
            const onPress = jest.fn();
            mockIsSmallScreenWidth = true;
            mockRowAt(ROW_TOP);
            const {rerender} = renderField(true, onPress);
            act(() => pressRow());

            // When the window widens past the breakpoint while the list is still open
            mockIsSmallScreenWidth = false;
            rerender(buildField(true, onPress));
            waitForResizeToSettle();

            // Then the pop-over is placed and sized off the row, not in the window's corner at the default width
            expect(renderedProps?.popoverWidth).toBe(ROW_WIDTH);
            expect(renderedProps?.anchorPosition.horizontal).toBe(ROW_X);
        });

        it('leaves a bottom sheet open and unmeasured when the window gets shorter', () => {
            // Given a narrow layout, where the list is open as a bottom sheet
            const onPress = jest.fn();
            mockIsSmallScreenWidth = true;
            const measureSpy = mockRowAt(120);
            const {rerender} = renderField(true, onPress);
            act(() => pressRow());
            // The spy sits on the shared View prototype, so it starts this test with calls from earlier ones
            measureSpy.mockClear();

            // When the window gets so short that a pop-over would have no room next to the row
            mockWindowHeight = 300;
            rerender(buildField(true, onPress));
            waitForResizeToSettle();

            // Then the sheet stays open, since it is docked to the bottom of the window and doesn't depend on where the row is
            expect(screen.getByText(DROPDOWN_TEXT)).toBeTruthy();
            expect(measureSpy).not.toHaveBeenCalled();
        });

        it('closes the list instead of opening the page when the window leaves no room for it', () => {
            // Given a field whose list is open below the row
            const onPress = jest.fn();
            mockRowAt(120);
            const {rerender} = renderField(true, onPress);
            openListAndSettle();

            // When the window gets so short that neither side of the row has room for a list
            mockWindowHeight = 300;
            rerender(buildField(true, onPress));
            waitForResizeToSettle();

            // Then the list closes rather than shrinking to nothing, and the page does not open, since a resize is no reason to navigate
            expect(screen.queryByText(DROPDOWN_TEXT)).toBeNull();
            expect(onPress).not.toHaveBeenCalled();
        });

        it('ignores a measurement that lands after the list closed', () => {
            // Given an open list, and a row that answers its measurements later, as it does on native
            const onPress = jest.fn();
            mockRowAt(ROW_TOP);
            const {rerender} = renderField(true, onPress);
            openListAndSettle();
            let answerMeasurement: (() => void) | undefined;
            jest.spyOn<ComponentRef<typeof View>, 'measureInWindow'>(View.prototype, 'measureInWindow').mockImplementation((callback) => {
                answerMeasurement = () => callback(RESIZED_ROW_X, ROW_TOP, RESIZED_ROW_WIDTH, ROW_HEIGHT);
            });

            // When the window narrows, and the list closes before the last measurement comes back
            mockWindowWidth = RESIZED_WINDOW_WIDTH;
            rerender(buildField(true, onPress));
            waitForResizeToSettle();
            act(() => pressRow());
            act(() => answerMeasurement?.());

            // Then the closed list keeps the layout it had, instead of taking a measurement meant for an open one
            expect(renderedProps?.isVisible).toBe(false);
            expect(renderedProps?.popoverWidth).toBe(ROW_WIDTH);
        });
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

    it('tells the form when the list opens and when it closes', () => {
        // Given a field whose form listens for its list opening and closing
        const onVisibilityChange = jest.fn();
        mockRowAt(ROW_TOP);
        render(
            <DropdownField
                sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
                name={FIELD_NAME}
                testID={ROW_TEST_ID}
                shouldOpenInDropdown
                renderDropdown={renderDropdown}
                onVisibilityChange={onVisibilityChange}
            />,
        );

        // When the list is opened and then dismissed from inside it
        act(() => pressRow());
        expect(onVisibilityChange).toHaveBeenLastCalledWith(true);
        act(() => renderedProps?.onClose());

        // Then the form hears both, so it can keep its own Enter shortcut off only while the list is open
        expect(onVisibilityChange).toHaveBeenLastCalledWith(false);
        expect(onVisibilityChange).toHaveBeenCalledTimes(2);
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
