import {act, fireEvent, render, screen} from '@testing-library/react-native';

import type {ExpenseFieldDropdownHandle, ExpenseFieldDropdownRenderProps} from '@components/MoneyRequestConfirmationList/sections/ExpenseFieldDropdown';
import ExpenseFieldDropdown from '@components/MoneyRequestConfirmationList/sections/ExpenseFieldDropdown';
import Text from '@components/Text';

import type TransitionTracker from '@libs/Navigation/TransitionTracker';

import variables from '@styles/variables';

import ONYXKEYS from '@src/ONYXKEYS';

import type {ReactNode} from 'react';

import React, {createRef} from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

// Below this width the container is a bottom sheet, so these tests default to a wide layout.
let mockIsSmallScreenWidth = false;
let mockIsInLandscapeMode = false;
jest.mock('@hooks/useResponsiveLayout', () =>
    jest.fn(() => ({isSmallScreenWidth: mockIsSmallScreenWidth, shouldUseNarrowLayout: mockIsSmallScreenWidth, isInLandscapeMode: mockIsInLandscapeMode})),
);
// Read lazily so a test can shrink the viewport, leaving the row short of room on both sides at once.
let mockWindowHeight = 800;
jest.mock('@hooks/useWindowDimensions', () => jest.fn(() => ({windowWidth: 1280, windowHeight: mockWindowHeight})));

// Mirrors `useFocusEffect`: runs the effect while the screen is focused, and again whenever the effect changes.
let mockIsFocused = true;
jest.mock('@react-navigation/native', () => {
    const {useEffect} = jest.requireActual<typeof React>('react');
    return {
        ...jest.requireActual<Record<string, unknown>>('@react-navigation/native'),
        useIsFocused: () => mockIsFocused,
        useFocusEffect: (effect: () => void | (() => void)) => {
            const isFocused = mockIsFocused;
            useEffect(() => (isFocused ? effect() : undefined), [effect, isFocused]);
        },
    };
});

// Run the post-transition work right away, since no sheet or screen actually animates in a unit test.
jest.mock('@libs/Navigation/TransitionTracker', () => ({
    runAfterTransitions: ({callback}: Parameters<typeof TransitionTracker.runAfterTransitions>[0]): ReturnType<typeof TransitionTracker.runAfterTransitions> => {
        callback();
        return {cancel: () => {}};
    },
}));

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
        mockIsInLandscapeMode = false;
        mockIsFocused = true;
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
                onLandscapePress={jest.fn()}
                renderDropdown={renderDropdown}
            />,
        );

    describe('open()', () => {
        const renderFieldWithRef = (shouldOpenInDropdown: boolean, onPress: () => void) => {
            const ref = createRef<ExpenseFieldDropdownHandle>();
            render(
                <ExpenseFieldDropdown
                    ref={ref}
                    name={FIELD_NAME}
                    testID={ROW_TEST_ID}
                    shouldOpenInDropdown={shouldOpenInDropdown}
                    onPress={onPress}
                    onLandscapePress={jest.fn()}
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

    describe('on a phone in landscape', () => {
        let onPress: jest.Mock;
        let onLandscapePress: jest.Mock;

        /** Renders the field on a phone, where the list is a bottom sheet, and returns a way to render it again after the phone or the screen changes */
        const renderOnPhone = () => {
            onPress = jest.fn();
            onLandscapePress = jest.fn();
            mockIsSmallScreenWidth = true;
            mockRowAt(ROW_TOP);
            const field = () => (
                <ExpenseFieldDropdown
                    name={FIELD_NAME}
                    testID={ROW_TEST_ID}
                    shouldOpenInDropdown
                    onPress={onPress}
                    onLandscapePress={onLandscapePress}
                    renderDropdown={renderDropdown}
                />
            );
            const {rerender} = render(field());
            return () => rerender(field());
        };

        it('opens the full-page selector instead of the sheet', () => {
            // Given a phone turned to landscape, where a bottom sheet is taller than the screen and would scroll as a whole
            mockIsInLandscapeMode = true;
            renderOnPhone();

            // When the row is pressed
            act(() => pressRow());

            // Then it opens the page meant for landscape, so the list itself can scroll, and no sheet is mounted
            expect(onLandscapePress).toHaveBeenCalledTimes(1);
            expect(onPress).not.toHaveBeenCalled();
            expect(renderCount).toBe(0);
        });

        it('hands an open sheet over to the full-page selector once the phone is turned', () => {
            // Given a phone in portrait with the sheet already open
            const rerenderField = renderOnPhone();
            act(() => pressRow());
            expect(screen.getByText(DROPDOWN_TEXT)).toBeOnTheScreen();

            // When the phone is turned to landscape, where the sheet has no room to scroll its list
            mockIsInLandscapeMode = true;
            rerenderField();

            // Then the sheet closes and the page meant for landscape opens in its place, the same as a press in landscape
            expect(screen.queryByText(DROPDOWN_TEXT)).not.toBeOnTheScreen();
            expect(onLandscapePress).toHaveBeenCalledTimes(1);
            expect(screen.getByTestId(ROW_TEST_ID)).toBeCollapsed();
        });

        it('reopens the sheet once the phone is back in portrait and the page has closed', () => {
            // Given the row opened its full page in landscape, and the form is now behind that page
            mockIsInLandscapeMode = true;
            const rerenderField = renderOnPhone();
            act(() => pressRow());
            mockIsFocused = false;
            rerenderField();

            // When the phone is turned back to portrait, the page closes itself and the form is focused again
            mockIsInLandscapeMode = false;
            mockIsFocused = true;
            rerenderField();

            // Then the list is back in the sheet, where the user was picking from before turning the phone
            expect(screen.getByText(DROPDOWN_TEXT)).toBeOnTheScreen();
            expect(onPress).not.toHaveBeenCalled();
        });

        it('does not reopen the sheet when the user comes back while still in landscape', () => {
            // Given the row opened its full page in landscape, and the form is now behind that page
            mockIsInLandscapeMode = true;
            const rerenderField = renderOnPhone();
            act(() => pressRow());
            mockIsFocused = false;
            rerenderField();

            // When the user picks a category or goes back while still in landscape, then turns the phone on the form
            mockIsFocused = true;
            rerenderField();
            mockIsInLandscapeMode = false;
            rerenderField();

            // Then nothing opens by itself: the trip to the page is over, so turning the phone later is not a reason to open the list
            expect(screen.queryByText(DROPDOWN_TEXT)).not.toBeOnTheScreen();
            expect(onLandscapePress).toHaveBeenCalledTimes(1);
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
