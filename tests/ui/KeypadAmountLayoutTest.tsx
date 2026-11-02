import {fireEvent, renderHook, screen} from '@testing-library/react-native';

import Button from '@components/Button';
import KeypadAmountEditor from '@components/KeypadAmountEditor';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';

import type * as DeviceCapabilities from '@libs/DeviceCapabilities';

import type * as NativeNavigation from '@react-navigation/native';

import React from 'react';
import {StyleSheet} from 'react-native';

import findAncestorWithStyle from '../utils/findAncestorWithStyle';
import {
    AMOUNT_TEST_ID,
    BODY_TEST_ID,
    FLIP_TEST_ID,
    FOOTER_TEST_ID,
    INPUT_TEST_ID,
    MAIN_TEST_ID,
    PAD_TEST_ID,
    ROOT_TEST_ID,
    getLayoutStyles,
    renderWithProviders,
} from '../utils/KeypadAmountLayoutTestUtils';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const PORTRAIT_PHONE = {windowWidth: 390, windowHeight: 844};
const LANDSCAPE_PHONE = {windowWidth: 844, windowHeight: 390};
const NO_SAFE_AREA_INSETS = {top: 0, right: 0, bottom: 0, left: 0};
const HOME_INDICATOR_INSETS = {...NO_SAFE_AREA_INSETS, bottom: 34};

// The real useIsInLandscapeMode runs on top of these dimensions. Jest resolves its native helper (isInLandscapeMode/index.native.ts),
// where the device info mock reports a phone (not a tablet), so the web helper based on window.screen is not covered here
const mockWindowDimensions = jest.fn(() => PORTRAIT_PHONE);

jest.mock('@hooks/useWindowDimensions', () => () => mockWindowDimensions());

// No inset by default; tests that check where the bottom safe area goes give the screen a home indicator
const mockSafeAreaInsets = jest.fn(() => NO_SAFE_AREA_INSETS);

jest.mock('@hooks/useSafeAreaInsets', () => ({
    __esModule: true,
    default: () => mockSafeAreaInsets(),
}));

jest.mock('@libs/DeviceCapabilities', () => ({
    ...jest.requireActual<typeof DeviceCapabilities>('@libs/DeviceCapabilities'),
    canUseTouchScreen: () => true,
}));

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof NativeNavigation>('@react-navigation/native'),
    useIsFocused: jest.fn(() => true),
    useNavigation: jest.fn(() => ({
        navigate: jest.fn(),
        addListener: jest.fn(() => jest.fn()),
    })),
}));

type LayoutOptions = {
    /** Whether the layout renders a footer below the body */
    hasFooter?: boolean;
};

function renderLayout(inputRef?: React.Ref<BaseTextInputRef>, options?: LayoutOptions) {
    return renderWithProviders(getLayout(inputRef, options));
}

function getLayout(inputRef?: React.Ref<BaseTextInputRef>, {hasFooter = true}: LayoutOptions = {}) {
    return (
        // The decimals keep the value as given: sanitizing it on mount would move the caret to the end manually and swallow the
        // next native selection event as its echo, so the highlighted range the refocus tests set would never apply
        <KeypadAmountEditor
            value="12.5"
            decimals={2}
            testID={ROOT_TEST_ID}
            footer={hasFooter ? <Button onPress={jest.fn()}>Save</Button> : undefined}
        >
            <KeypadAmountEditor.Input
                testID={INPUT_TEST_ID}
                ref={inputRef}
            />
            <KeypadAmountEditor.Symbol>%</KeypadAmountEditor.Symbol>
        </KeypadAmountEditor>
    );
}

/** Bottom safe area padding the layout parts add, read through the same hook. Call it before rendering the layout, since it updates `screen`. */
function getSafeAreaPaddingBottom() {
    return renderHook(() => useSafeAreaPaddings(true)).result.current.paddingBottom;
}

function isFocusableInput(input: BaseTextInputRef): input is BaseTextInputRef & {isFocused: () => boolean} {
    return 'isFocused' in input && typeof input.isFocused === 'function';
}

function createMouseDownEvent(target: Node | undefined) {
    return {nativeEvent: {target}, preventDefault: jest.fn(), isDefaultPrevented: () => false};
}

describe('KeypadAmountLayout', () => {
    beforeEach(() => {
        mockWindowDimensions.mockReturnValue(PORTRAIT_PHONE);
        mockSafeAreaInsets.mockReturnValue(NO_SAFE_AREA_INSETS);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders a single scrollable column with the footer inside the scroll view outside phone landscape', async () => {
        // Given a phone in portrait (tablets in landscape are covered by KeypadAmountEditorLayoutTabletTest)
        mockWindowDimensions.mockReturnValue(PORTRAIT_PHONE);

        // When the layout renders
        renderLayout();
        await waitForBatchedUpdatesWithAct();

        // Then the root is the scroll view holding the body and footer, and the body is a plain column
        const root = screen.getByTestId(ROOT_TEST_ID);
        expect(StyleSheet.flatten(root.props.contentContainerStyle)).toMatchObject({flexGrow: 1});
        expect(root).toContainElement(screen.getByTestId(FOOTER_TEST_ID));
        expect(screen.getByTestId(BODY_TEST_ID).props.contentContainerStyle).toBeUndefined();
    });

    it('renders two columns in a scrollable row with the footer pinned outside it on phones in landscape', async () => {
        // Given a phone in landscape, the only case that splits the screen into two columns
        mockWindowDimensions.mockReturnValue(LANDSCAPE_PHONE);
        const styles = getLayoutStyles();

        // When the layout renders
        renderLayout();
        await waitForBatchedUpdatesWithAct();

        // Then the body is a scroll view laying the main column and the pad side by side
        const body = screen.getByTestId(BODY_TEST_ID);
        expect(StyleSheet.flatten(body.props.contentContainerStyle)).toMatchObject({flexDirection: 'row'});
        expect(body).toContainElement(screen.getByTestId(MAIN_TEST_ID));
        expect(body).toContainElement(screen.getByTestId(PAD_TEST_ID));

        // Then the pad takes the rest of the row next to the fixed-width main column and is centred vertically in it
        expect(screen.getByTestId(PAD_TEST_ID)).toHaveStyle({...styles.flex1, ...styles.justifyContentCenter});

        // Then the footer stays outside the scrolling body, so it remains visible
        expect(body).not.toContainElement(screen.getByTestId(FOOTER_TEST_ID));
        expect(screen.getByTestId(ROOT_TEST_ID).props.contentContainerStyle).toBeUndefined();

        // Then the main column is centred in the row at its content height rather than stretched to the row's height, so the
        // growing amount container has no free space to push the actions and error down to the bottom of the screen
        expect(screen.getByTestId(MAIN_TEST_ID)).toHaveStyle({...styles.alignSelfCenter, ...styles.numberWithSymbolFormInputContainerLandscape});
    });

    it('switches between one and two columns when the phone rotates', async () => {
        // Given the layout rendered on a phone in portrait, as a single scrollable column
        const {rerender} = renderLayout();
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByTestId(ROOT_TEST_ID)).toContainElement(screen.getByTestId(FOOTER_TEST_ID));

        // When the phone rotates to landscape
        mockWindowDimensions.mockReturnValue(LANDSCAPE_PHONE);
        rerender(getLayout());
        await waitForBatchedUpdatesWithAct();

        // Then the body becomes the scrollable row and the footer is pinned outside it
        const body = screen.getByTestId(BODY_TEST_ID);
        expect(StyleSheet.flatten(body.props.contentContainerStyle)).toMatchObject({flexDirection: 'row'});
        expect(body).not.toContainElement(screen.getByTestId(FOOTER_TEST_ID));

        // When the phone rotates back to portrait
        mockWindowDimensions.mockReturnValue(PORTRAIT_PHONE);
        rerender(getLayout());
        await waitForBatchedUpdatesWithAct();

        // Then the root is the scroll view again, holding the footer
        expect(StyleSheet.flatten(screen.getByTestId(ROOT_TEST_ID).props.contentContainerStyle)).toMatchObject({flexGrow: 1});
        expect(screen.getByTestId(BODY_TEST_ID).props.contentContainerStyle).toBeUndefined();
    });

    it('leaves the bottom spacing to the screen edge when a footer follows the pad in a single column', async () => {
        // Given a phone in portrait, where the pad and the footer stack at the bottom of the column
        mockWindowDimensions.mockReturnValue(PORTRAIT_PHONE);
        const styles = getLayoutStyles();

        // When the layout renders a footer below the pad
        renderLayout(undefined, {hasFooter: true});
        await waitForBatchedUpdatesWithAct();

        // Then the footer keeps a gap from the keys right above it and the scroll view pads the bottom
        expect(StyleSheet.flatten(screen.getByTestId(FOOTER_TEST_ID).props.style)).toMatchObject({...styles.alignItemsCenter, ...styles.mt5});
        expect(StyleSheet.flatten(screen.getByTestId(ROOT_TEST_ID).props.contentContainerStyle)).toMatchObject(styles.pb5);
    });

    it('adds the bottom safe area to the scroll view in a single column, not to the footer inside it', async () => {
        // Given a phone in portrait with a home indicator, where the footer scrolls with the column
        mockWindowDimensions.mockReturnValue(PORTRAIT_PHONE);
        mockSafeAreaInsets.mockReturnValue(HOME_INDICATOR_INSETS);
        const styles = getLayoutStyles();
        const safeAreaPaddingBottom = getSafeAreaPaddingBottom();

        // When the layout renders a footer
        renderLayout(undefined, {hasFooter: true});
        await waitForBatchedUpdatesWithAct();

        // Then the scroll view clears the home indicator below its spacing, and the footer adds nothing on top, so the safe area is not doubled
        expect(safeAreaPaddingBottom).toBeGreaterThan(0);
        expect(StyleSheet.flatten(screen.getByTestId(ROOT_TEST_ID).props.contentContainerStyle)).toMatchObject({paddingBottom: styles.pb5.paddingBottom + safeAreaPaddingBottom});
        expect(StyleSheet.flatten(screen.getByTestId(FOOTER_TEST_ID).props.style)).not.toHaveProperty('paddingBottom');
    });

    it('adds the bottom safe area to the pinned footer in two columns', async () => {
        // Given a phone in landscape with a home indicator, where the footer is pinned below the scrollable columns
        mockWindowDimensions.mockReturnValue(LANDSCAPE_PHONE);
        mockSafeAreaInsets.mockReturnValue(HOME_INDICATOR_INSETS);
        const styles = getLayoutStyles();
        const safeAreaPaddingBottom = getSafeAreaPaddingBottom();

        // When the layout renders a footer
        renderLayout(undefined, {hasFooter: true});
        await waitForBatchedUpdatesWithAct();

        // Then the footer clears the home indicator itself, since it is the last element above the screen edge, and the body above it adds nothing
        expect(safeAreaPaddingBottom).toBeGreaterThan(0);
        expect(StyleSheet.flatten(screen.getByTestId(FOOTER_TEST_ID).props.style)).toMatchObject({paddingBottom: styles.pb5.paddingBottom + safeAreaPaddingBottom});
        expect(StyleSheet.flatten(screen.getByTestId(BODY_TEST_ID).props.contentContainerStyle)).not.toHaveProperty('paddingBottom');
    });

    it('adds the bottom safe area to the scrolling body in two columns when there is no footer', async () => {
        // Given a phone in landscape with a home indicator and no footer pinned below the scrollable columns
        mockWindowDimensions.mockReturnValue(LANDSCAPE_PHONE);
        mockSafeAreaInsets.mockReturnValue(HOME_INDICATOR_INSETS);
        const safeAreaPaddingBottom = getSafeAreaPaddingBottom();

        // When the layout renders without a footer
        renderLayout(undefined, {hasFooter: false});
        await waitForBatchedUpdatesWithAct();

        // Then the body clears the home indicator itself, since it is the last element above the screen edge
        expect(safeAreaPaddingBottom).toBeGreaterThan(0);
        expect(screen.queryByTestId(FOOTER_TEST_ID)).toBeNull();
        expect(StyleSheet.flatten(screen.getByTestId(BODY_TEST_ID).props.contentContainerStyle)).toMatchObject({paddingBottom: safeAreaPaddingBottom});
    });

    it.each([
        ['a single column footer', PORTRAIT_PHONE, FOOTER_TEST_ID],
        ['a single column pad gap', PORTRAIT_PHONE, PAD_TEST_ID],
        ['two columns footer', LANDSCAPE_PHONE, FOOTER_TEST_ID],
        ['two columns pad gap', LANDSCAPE_PHONE, PAD_TEST_ID],
    ])('keeps the input focused and collapses selection when pressing an empty area of the layout in %s', async (_, windowDimensions, targetTestID) => {
        // Given an input with a highlighted range, so the refocus has a selection to collapse, in a layout whose root differs per column count
        mockWindowDimensions.mockReturnValue(windowDimensions);
        const inputRef = React.createRef<BaseTextInputRef>();
        renderLayout(inputRef);
        await waitForBatchedUpdatesWithAct();

        const input = screen.getByTestId(INPUT_TEST_ID);
        fireEvent(input, 'selectionChange', {nativeEvent: {selection: {start: 0, end: 2}}});
        await waitForBatchedUpdatesWithAct();

        if (!inputRef.current) {
            throw new Error('Input ref was not assigned');
        }
        const focusSpy = jest.spyOn(inputRef.current, 'focus');

        // When pressing an empty area of the layout, which bubbles up to the layout root
        const event = createMouseDownEvent(document.createElement('div'));
        fireEvent(screen.getByTestId(targetTestID), 'mouseDown', event);
        await waitForBatchedUpdatesWithAct();

        // Then the browser blur is prevented, the selection collapses, and the input is refocused
        expect(event.preventDefault).toHaveBeenCalledTimes(1);
        expect(input.props.selection).toEqual({start: 2, end: 2});
        expect(focusSpy).toHaveBeenCalledTimes(1);
        focusSpy.mockRestore();
    });

    it('collapses the selection without focusing again when the input is already focused', async () => {
        // Given an input that is already focused and has a highlighted range
        const inputRef = React.createRef<BaseTextInputRef>();
        renderLayout(inputRef);
        await waitForBatchedUpdatesWithAct();

        const input = screen.getByTestId(INPUT_TEST_ID);
        fireEvent(input, 'selectionChange', {nativeEvent: {selection: {start: 0, end: 2}}});
        await waitForBatchedUpdatesWithAct();

        const inputElement = inputRef.current;
        if (!inputElement || !isFocusableInput(inputElement)) {
            throw new Error('Input ref was not assigned to a focusable input');
        }
        const isFocusedSpy = jest.spyOn(inputElement, 'isFocused').mockReturnValue(true);
        const focusSpy = jest.spyOn(inputElement, 'focus');

        // When pressing an empty area of the layout
        const event = createMouseDownEvent(document.createElement('div'));
        fireEvent(screen.getByTestId(FOOTER_TEST_ID), 'mouseDown', event);
        await waitForBatchedUpdatesWithAct();

        // Then the browser blur is still prevented and the selection collapses, but focus is not requested twice
        expect(event.preventDefault).toHaveBeenCalledTimes(1);
        expect(input.props.selection).toEqual({start: 2, end: 2});
        expect(focusSpy).not.toHaveBeenCalled();
        isFocusedSpy.mockRestore();
        focusSpy.mockRestore();
    });

    it.each([
        ['a button', () => document.createElement('button')],
        [
            'an element with the button role',
            () => {
                const element = document.createElement('div');
                element.setAttribute('role', 'button');
                return element;
            },
        ],
        ['the input', () => document.createElement('input')],
        [
            'an element nested inside a button',
            () => {
                const button = document.createElement('button');
                const label = document.createElement('span');
                button.appendChild(label);
                return label;
            },
        ],
    ])('does not interfere when pressing %s', async (_, createTarget) => {
        // Given the layout, whose root listens to every mouse down bubbling from its parts, and an input with a highlighted range
        const inputRef = React.createRef<BaseTextInputRef>();
        renderLayout(inputRef);
        await waitForBatchedUpdatesWithAct();

        const input = screen.getByTestId(INPUT_TEST_ID);
        fireEvent(input, 'selectionChange', {nativeEvent: {selection: {start: 0, end: 2}}});
        await waitForBatchedUpdatesWithAct();

        if (!inputRef.current) {
            throw new Error('Input ref was not assigned');
        }
        const focusSpy = jest.spyOn(inputRef.current, 'focus');

        // When pressing an interactive element inside the layout
        const event = createMouseDownEvent(createTarget());
        fireEvent(screen.getByTestId(FOOTER_TEST_ID), 'mouseDown', event);
        await waitForBatchedUpdatesWithAct();

        // Then its default behavior is kept, the input is not refocused, and the highlighted range stays, so the press reaches the element
        expect(event.preventDefault).not.toHaveBeenCalled();
        expect(focusSpy).not.toHaveBeenCalled();
        expect(input.props.selection).toEqual({start: 0, end: 2});
        focusSpy.mockRestore();
    });

    it('does not refocus again when a control already handled the press', async () => {
        // Given the layout and a mouse down that a control keeping the caret itself (such as the flip button) already prevented
        const inputRef = React.createRef<BaseTextInputRef>();
        renderLayout(inputRef);
        await waitForBatchedUpdatesWithAct();

        if (!inputRef.current) {
            throw new Error('Input ref was not assigned');
        }
        const focusSpy = jest.spyOn(inputRef.current, 'focus');
        const event = {...createMouseDownEvent(document.createElement('div')), isDefaultPrevented: () => true};

        // When the event bubbles up to the layout root
        fireEvent(screen.getByTestId(FOOTER_TEST_ID), 'mouseDown', event);
        await waitForBatchedUpdatesWithAct();

        // Then the root leaves it alone and does not refocus the input on top of the control
        expect(event.preventDefault).not.toHaveBeenCalled();
        expect(focusSpy).not.toHaveBeenCalled();
        focusSpy.mockRestore();
    });

    it('lays the actions out in a centered row below the amount area on touch screens', async () => {
        // Given a currency button and a flip button passed as actions on a touch screen
        const styles = getLayoutStyles();

        // When the layout renders
        renderWithProviders(
            <KeypadAmountEditor
                value="10"
                allowNegative
                testID={ROOT_TEST_ID}
                actions={
                    <>
                        <KeypadAmountEditor.CurrencyPickerButton
                            currency="USD"
                            onPress={jest.fn()}
                        />
                        <KeypadAmountEditor.SignFlipButton testID={FLIP_TEST_ID} />
                    </>
                }
            >
                <KeypadAmountEditor.Input />
            </KeypadAmountEditor>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then both buttons sit in the main column but outside the amount area, so they never shift the centered amount
        const currencyButton = screen.getByText('USD');
        expect(screen.getByTestId(MAIN_TEST_ID)).toContainElement(currencyButton);
        expect(screen.getByTestId(MAIN_TEST_ID)).toContainElement(screen.getByTestId(FLIP_TEST_ID));
        expect(screen.getByTestId(AMOUNT_TEST_ID)).not.toContainElement(currencyButton);

        // Then the buttons share one centered row spaced by the layout gap, so they sit side by side under the amount
        const actionsRow = findAncestorWithStyle(screen.getByTestId(FLIP_TEST_ID), 'gap', styles.gap2.gap);
        expect(actionsRow).toHaveStyle({...styles.flexRow, ...styles.justifyContentCenter});
        expect(actionsRow).toContainElement(currencyButton);
    });

    it('floats the error over the bottom of the amount area in a single column', async () => {
        // Given an error on a phone in portrait
        const styles = getLayoutStyles();

        // When the layout renders
        renderWithProviders(
            <KeypadAmountEditor
                value="10"
                errorText="Amount is too high"
                testID={ROOT_TEST_ID}
            >
                <KeypadAmountEditor.Input testID={INPUT_TEST_ID} />
            </KeypadAmountEditor>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then the error is positioned absolutely inside the amount area, so showing it never moves the amount or the pad
        const error = screen.getByText('Amount is too high');
        const floatingError = findAncestorWithStyle(error, 'position', 'absolute');
        expect(floatingError).toBeDefined();
        expect(screen.getByTestId(AMOUNT_TEST_ID)).toContainElement(floatingError ?? null);
        expect(floatingError).toHaveStyle({...styles.b0, ...styles.mb5});

        // Then the amount container reserves minimum height to prevent layout shifts
        expect(findAncestorWithStyle(screen.getByTestId(INPUT_TEST_ID), 'minHeight', styles.moneyRequestAmountContainer.minHeight)).toBeDefined();
    });

    it('keeps the error in flow under the amount in two columns', async () => {
        // Given an error on a phone in landscape, where the main column is sized by its content
        mockWindowDimensions.mockReturnValue(LANDSCAPE_PHONE);
        const styles = getLayoutStyles();

        // When the layout renders
        renderWithProviders(
            <KeypadAmountEditor
                value="10"
                errorText="Amount is too high"
                testID={ROOT_TEST_ID}
            >
                <KeypadAmountEditor.Input testID={INPUT_TEST_ID} />
            </KeypadAmountEditor>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then the error follows the amount area in the main column instead of floating over it
        const error = screen.getByText('Amount is too high');
        expect(screen.getByTestId(MAIN_TEST_ID)).toContainElement(error);
        expect(screen.getByTestId(AMOUNT_TEST_ID)).not.toContainElement(error);
        expect(findAncestorWithStyle(error, 'position', 'absolute')).toBeFalsy();

        // Then the amount row reserves no room for a floating error, which would only add empty height to the centred column
        expect(findAncestorWithStyle(screen.getByTestId(INPUT_TEST_ID), 'minHeight', styles.moneyRequestAmountContainer.minHeight)).toBeUndefined();
    });
});
