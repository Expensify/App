import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import type {Emoji} from '@assets/emojis/types';

import type {Mention} from '@components/MentionSuggestions';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import useAskConcierge from '@components/Search/SearchRouter/useAskConcierge';

import useKeyboardState from '@hooks/useKeyboardState';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import type * as BrowserModule from '@libs/Browser';
import {isSafari} from '@libs/Browser';

import ConciergePromptBox from '@pages/home/ForYouSection/ConciergePromptBox';

import {close} from '@userActions/Modal';
import {isAnonymousUser, signOutAndRedirectToSignIn} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList} from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';

import type {ViewProps} from 'react-native';

import React, {useState} from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const CONCIERGE_REPORT_ID = '100';
const LONG_PLACEHOLDER = 'homePage.conciergePrompt.inputPlaceholder';
const SHORT_PLACEHOLDER = 'homePage.conciergePrompt.inputPlaceholderMobile';
const ADD_ATTACHMENT = 'reportActionCompose.addAttachment';
const PLUS_BUTTON = 'accessibilityHints.openActionsMenu';
const SEND_BUTTON = 'common.send';
const TEAMMATE = {accountID: 2, login: 'alex@expensify.com', displayName: 'Alex Adams'};
const OTHER_TEAMMATE = {accountID: 3, login: 'blake@expensify.com', displayName: 'Blake Brown'};

const SCROLL_LAYOUT_TRIGGER_RESET_TIME = 500;

const mockAskConcierge = jest.fn();
const mockAskConciergeWithAttachment = jest.fn();
const mockPickAttachments = jest.fn();
const mockOpenPicker = jest.fn();

const pickerHandler: {onConfirm?: (files: FileObject | FileObject[]) => void} = {};

type MentionSuggestionsProps = {
    mentions: Mention[];
    prefix: string;
    onSelect: (index: number) => void;
};

type EmojiSuggestionsProps = {
    emojis: Emoji[];
    prefix: string;
    onSelect: (index: number) => void;
};

const mockMentionSuggestionsSpy = jest.fn<void, [MentionSuggestionsProps]>();
const mockEmojiSuggestionsSpy = jest.fn<void, [EmojiSuggestionsProps]>();

let mockPersonalDetails: PersonalDetailsList = {};

jest.mock('@components/Search/SearchRouter/useAskConcierge', () => jest.fn());

jest.mock('@components/MentionSuggestions', () => {
    const ReactLib = jest.requireActual<typeof React>('react');
    const module = {
        default: (props: MentionSuggestionsProps) => {
            mockMentionSuggestionsSpy(props);
            return ReactLib.createElement('mock-mention-suggestions', {...props, testID: 'mention-suggestions'});
        },
    };
    Object.defineProperty(module, '__esModule', {value: true});
    return module;
});

jest.mock('@components/EmojiSuggestions', () => {
    const ReactLib = jest.requireActual<typeof React>('react');
    const module = {
        default: (props: EmojiSuggestionsProps) => {
            mockEmojiSuggestionsSpy(props);
            return ReactLib.createElement('mock-emoji-suggestions', {...props, testID: 'emoji-suggestions'});
        },
    };
    Object.defineProperty(module, '__esModule', {value: true});
    return module;
});

jest.mock('@components/OnyxListItemProvider', () => ({
    usePersonalDetails: jest.fn(),
}));

jest.mock('@pages/home/ForYouSection/useConciergeAttachmentPicker', () => ({
    __esModule: true,
    default: (_reportID: string | undefined, onConfirm: (files: FileObject | FileObject[]) => void) => {
        pickerHandler.onConfirm = onConfirm;
        return {pickAttachments: mockPickAttachments, PDFValidationComponent: null};
    },
}));

jest.mock('@components/AttachmentPicker', () => ({
    __esModule: true,
    default: ({children}: {children: (props: {openPicker: (options: unknown) => void}) => React.ReactNode}) => children({openPicker: mockOpenPicker}),
}));

jest.mock('@components/PopoverMenu', () => ({
    __esModule: true,
    default: ({isVisible, menuItems, onItemSelected}: {isVisible: boolean; menuItems: Array<{text: string}>; onItemSelected?: (item: {text: string}, index: number) => void}) => {
        const ReactModule = jest.requireActual<typeof React>('react');
        if (!isVisible) {
            return null;
        }
        return menuItems.map((item, index) =>
            ReactModule.createElement(
                'Text',
                {
                    key: item.text,
                    accessibilityRole: 'button',
                    accessibilityLabel: item.text,
                    onPress: () => onItemSelected?.(item, index),
                },
                item.text,
            ),
        );
    },
}));

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
        getLocalDateFromDatetime: () => new Date('2026-08-24T09:00:00'),
        formatPhoneNumber: (value: string) => value,
        localeCompare: (first: string, second: string) => first.localeCompare(second),
    })),
);

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());

jest.mock('@hooks/useKeyboardState', () => jest.fn());

jest.mock('@libs/Browser', () => ({
    ...jest.requireActual<typeof BrowserModule>('@libs/Browser'),
    isSafari: jest.fn(() => false),
}));

jest.mock('@pages/Share/getFileSize', () => jest.fn(() => Promise.resolve(100)));

jest.mock('@userActions/Modal', () => ({
    close: jest.fn(),
}));

jest.mock('@userActions/Session', () => ({
    isAnonymousUser: jest.fn(() => false),
    signOutAndRedirectToSignIn: jest.fn(),
}));

const mockUsePersonalDetails = jest.mocked(usePersonalDetails);
const mockUseAskConcierge = jest.mocked(useAskConcierge);
const mockUseResponsiveLayout = jest.mocked(useResponsiveLayout);
const mockUseKeyboardState = jest.mocked(useKeyboardState);
const mockIsSafari = jest.mocked(isSafari);
const mockClose = jest.mocked(close);
const mockIsAnonymousUser = jest.mocked(isAnonymousUser);
const mockSignOutAndRedirectToSignIn = jest.mocked(signOutAndRedirectToSignIn);

function ConciergePromptBoxWrapper() {
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    return (
        <ConciergePromptBox
            isMenuVisible={isMenuVisible}
            setIsMenuVisible={setIsMenuVisible}
        />
    );
}

function setResponsiveLayout(shouldUseNarrowLayout: boolean) {
    mockUseResponsiveLayout.mockReturnValue({
        shouldUseNarrowLayout,
        isSmallScreenWidth: shouldUseNarrowLayout,
        isInNarrowPaneModal: false,
        isExtraSmallScreenHeight: false,
        isMediumScreenWidth: false,
        isLargeScreenWidth: !shouldUseNarrowLayout,
        isExtraLargeScreenWidth: false,
        isExtraSmallScreenWidth: false,
        isSmallScreen: shouldUseNarrowLayout,
        onboardingIsMediumOrLargerScreenWidth: !shouldUseNarrowLayout,
        isInLandscapeMode: false,
    });
}

function setKeyboardShown(isKeyboardShown: boolean) {
    mockUseKeyboardState.mockReturnValue({
        isKeyboardShown,
        isKeyboardActive: isKeyboardShown,
        keyboardHeight: isKeyboardShown ? 300 : 0,
        keyboardActiveHeight: isKeyboardShown ? 300 : 0,
        isKeyboardAnimatingRef: {current: false},
    });
}

function setAskConcierge(shouldShowAskConcierge = true) {
    mockUseAskConcierge.mockReturnValue({
        askConcierge: mockAskConcierge,
        askConciergeWithAttachment: mockAskConciergeWithAttachment,
        shouldShowAskConcierge,
        conciergeTargetReportID: shouldShowAskConcierge ? CONCIERGE_REPORT_ID : undefined,
    });
}

function getInput() {
    return screen.getByLabelText(/inputPlaceholder/);
}

function pressEnter(options?: {shiftKey?: boolean}) {
    fireEvent(getInput(), 'keyPress', {
        preventDefault: jest.fn(),
        nativeEvent: {key: CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey, shiftKey: options?.shiftKey ?? false},
    });
}

function pasteImage() {
    fireEvent(getInput(), 'paste', {nativeEvent: {items: [{type: 'image/png', data: 'file:///image.png'}]}});
}

function typeText(text: string) {
    fireEvent(getInput(), 'focus');
    fireEvent.changeText(getInput(), text);
    fireEvent(getInput(), 'selectionChange', {nativeEvent: {selection: {start: text.length, end: text.length}}});

    act(() => jest.advanceTimersByTime(CONST.TIMING.SUGGESTION_DEBOUNCE_TIME));
}

function scrollInput(offsetY = 40) {
    fireEvent(getInput(), 'scroll', {nativeEvent: {contentOffset: {y: offsetY}}});
}

function settleLayoutTriggeredScroll() {
    act(() => jest.advanceTimersByTime(SCROLL_LAYOUT_TRIGGER_RESET_TIME));
}

/**
 * On web the composer's key event carries `key`/`shiftKey` both at the top level (where the suggestion layer reads them)
 * and on `nativeEvent` (where the submit handler reads them), so tests that involve suggestions must set both.
 */
function pressKeyWithSuggestions(key: string, options?: {shiftKey?: boolean}) {
    const shiftKey = options?.shiftKey ?? false;
    fireEvent(getInput(), 'keyPress', {
        key,
        shiftKey,
        preventDefault: jest.fn(),
        nativeEvent: {key, shiftKey},
    });
}

function getLastMentionSuggestionsProps(): MentionSuggestionsProps {
    const props = mockMentionSuggestionsSpy.mock.calls.at(-1)?.[0];
    if (!props) {
        throw new Error('Expected mention suggestions to have rendered');
    }
    return props;
}

function getLastEmojiSuggestionsProps(): EmojiSuggestionsProps {
    const props = mockEmojiSuggestionsSpy.mock.calls.at(-1)?.[0];
    if (!props) {
        throw new Error('Expected emoji suggestions to have rendered');
    }
    return props;
}

function measureLongPlaceholder(height: number) {
    fireEvent(screen.getByText(LONG_PLACEHOLDER), 'layout', {nativeEvent: {layout: {height}}});
}

describe('ConciergePromptBox', () => {
    beforeEach(async () => {
        jest.clearAllMocks();
        await act(async () => {
            await Onyx.set(ONYXKEYS.CONCIERGE_PROMPT_DRAFT, null);
        });
        pickerHandler.onConfirm = undefined;
        mockPersonalDetails = {
            [TEAMMATE.accountID]: TEAMMATE,
            [OTHER_TEAMMATE.accountID]: OTHER_TEAMMATE,
        };
        mockUsePersonalDetails.mockImplementation(() => mockPersonalDetails);
        setAskConcierge();
        setResponsiveLayout(false);
        setKeyboardShown(false);
        mockIsSafari.mockReturnValue(false);
        mockIsAnonymousUser.mockReturnValue(false);
    });

    describe('sending a message', () => {
        it('sends the typed message and clears the input', () => {
            // Given a typed message
            render(<ConciergePromptBoxWrapper />);
            fireEvent.changeText(getInput(), 'Where is my expense?');

            // When the send button is pressed
            fireEvent.press(screen.getByLabelText(SEND_BUTTON));

            // Then the message is sent to Concierge and the input is emptied
            expect(mockAskConcierge).toHaveBeenCalledWith('Where is my expense?');
            expect(getInput()).toHaveDisplayValue('');
        });

        it('cannot send until the input holds more than whitespace', () => {
            // Given an empty input
            render(<ConciergePromptBoxWrapper />);
            expect(screen.getByLabelText(SEND_BUTTON)).toBeDisabled();

            // When only whitespace is typed and the send button is pressed
            fireEvent.changeText(getInput(), '   ');
            fireEvent.press(screen.getByLabelText(SEND_BUTTON));

            // Then the button stays disabled and nothing is sent
            expect(screen.getByLabelText(SEND_BUTTON)).toBeDisabled();
            expect(mockAskConcierge).not.toHaveBeenCalled();
        });

        it('disables both buttons until the Concierge report is ready', () => {
            // Given the Concierge report has not loaded
            setAskConcierge(false);
            render(<ConciergePromptBoxWrapper />);
            fireEvent.changeText(getInput(), 'Where is my expense?');

            // When the buttons are inspected
            // Then neither the send nor the "+" button can be used
            expect(screen.getByLabelText(SEND_BUTTON)).toBeDisabled();
            expect(screen.getByLabelText(PLUS_BUTTON)).toBeDisabled();
        });
    });

    describe('mentions', () => {
        beforeEach(() => jest.useFakeTimers());
        afterEach(() => jest.useRealTimers());

        it('suggests users matching what was typed after the @', () => {
            // Given a rendered prompt box
            render(<ConciergePromptBoxWrapper />);

            // When a mention prefix is typed
            typeText('Show me @ale');

            // Then only the matching user is offered
            const {mentions, prefix} = getLastMentionSuggestionsProps();
            expect(prefix).toBe('ale');
            expect(mentions.map((mention) => mention.handle)).toEqual(['alex@expensify.com']);
        });

        it('does not suggest anything without an @', () => {
            // Given a rendered prompt box
            render(<ConciergePromptBoxWrapper />);

            // When plain text is typed
            typeText('Show me my expenses');

            // Then no picker is rendered
            expect(screen.queryByTestId('mention-suggestions')).not.toBeOnTheScreen();
        });

        it('inserts the selected mention into the prompt', () => {
            // Given a visible suggestion list
            render(<ConciergePromptBoxWrapper />);
            typeText('Show me @ale');

            // When the suggestion is selected
            act(() => getLastMentionSuggestionsProps().onSelect(0));

            // Then the typed prefix is replaced by the full mention and the list closes
            expect(getInput()).toHaveDisplayValue('Show me @alex@expensify.com ');
            expect(screen.queryByTestId('mention-suggestions')).not.toBeOnTheScreen();
        });

        it('selects the mention on Enter instead of sending the prompt', () => {
            // Given a visible suggestion list
            render(<ConciergePromptBoxWrapper />);
            typeText('Show me @ale');

            // When Enter is pressed
            pressKeyWithSuggestions(CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey);

            // Then the mention is inserted and the half-typed prompt is not sent
            expect(getInput()).toHaveDisplayValue('Show me @alex@expensify.com ');
            expect(mockAskConcierge).not.toHaveBeenCalled();
        });

        it('still sends on Enter once no suggestions are showing', () => {
            // Given a prompt with no open suggestion list
            render(<ConciergePromptBoxWrapper />);
            typeText('Show me my expenses');

            // When Enter is pressed
            pressKeyWithSuggestions(CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey);

            // Then the prompt is sent as usual
            expect(mockAskConcierge).toHaveBeenCalledWith('Show me my expenses');
        });

        it('dismisses the suggestions on Escape', () => {
            // Given a visible suggestion list
            render(<ConciergePromptBoxWrapper />);
            typeText('Show me @ale');

            // When Escape is pressed
            pressKeyWithSuggestions(CONST.KEYBOARD_SHORTCUTS.ESCAPE.shortcutKey);

            // Then the list closes and the typed text is left alone
            expect(screen.queryByTestId('mention-suggestions')).not.toBeOnTheScreen();
            expect(getInput()).toHaveDisplayValue('Show me @ale');
        });

        it('hides the suggestions when the input loses focus', () => {
            // Given a visible suggestion list
            render(<ConciergePromptBoxWrapper />);
            typeText('Show me @ale');
            expect(screen.getByTestId('mention-suggestions')).toBeOnTheScreen();

            // When the input is blurred
            fireEvent(getInput(), 'blur');

            // Then the list closes
            expect(screen.queryByTestId('mention-suggestions')).not.toBeOnTheScreen();
        });
    });

    describe('emojis', () => {
        beforeEach(() => jest.useFakeTimers());
        afterEach(() => jest.useRealTimers());

        it('suggests emojis matching what was typed after the colon', () => {
            // Given a rendered prompt box
            render(<ConciergePromptBoxWrapper />);

            // When an emoji code is typed
            typeText('Nice work :smile');

            // Then the matching emojis are offered
            const {emojis, prefix} = getLastEmojiSuggestionsProps();
            expect(prefix).toBe('smile');
            expect(emojis.map((emoji) => emoji.name)).toContain('smile');
        });

        it('does not suggest anything without a colon', () => {
            // Given a rendered prompt box
            render(<ConciergePromptBoxWrapper />);

            // When plain text is typed
            typeText('Nice work');

            // Then no picker is rendered
            expect(screen.queryByTestId('emoji-suggestions')).not.toBeOnTheScreen();
        });

        it('inserts the selected emoji into the prompt', () => {
            // Given a visible suggestion list
            render(<ConciergePromptBoxWrapper />);
            typeText('Nice work :smile');
            const {emojis} = getLastEmojiSuggestionsProps();

            // When the first suggestion is selected
            act(() => getLastEmojiSuggestionsProps().onSelect(0));

            // Then the typed code is replaced by the emoji itself and the list closes
            expect(getInput()).toHaveDisplayValue(`Nice work ${emojis.at(0)?.code} `);
            expect(screen.queryByTestId('emoji-suggestions')).not.toBeOnTheScreen();
        });

        it('selects the emoji on Enter instead of sending the prompt', () => {
            // Given a visible suggestion list
            render(<ConciergePromptBoxWrapper />);
            typeText('Nice work :smile');
            const {emojis} = getLastEmojiSuggestionsProps();

            // When Enter is pressed
            pressKeyWithSuggestions(CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey);

            // Then the emoji is inserted and the half-typed prompt is not sent
            expect(getInput()).toHaveDisplayValue(`Nice work ${emojis.at(0)?.code} `);
            expect(mockAskConcierge).not.toHaveBeenCalled();
        });

        it('dismisses the suggestions on Escape', () => {
            // Given a visible suggestion list
            render(<ConciergePromptBoxWrapper />);
            typeText('Nice work :smile');

            // When Escape is pressed
            pressKeyWithSuggestions(CONST.KEYBOARD_SHORTCUTS.ESCAPE.shortcutKey);

            // Then the list closes and the typed text is left alone
            expect(screen.queryByTestId('emoji-suggestions')).not.toBeOnTheScreen();
            expect(getInput()).toHaveDisplayValue('Nice work :smile');
        });

        it('hides the suggestions when the input loses focus', () => {
            // Given a visible suggestion list
            render(<ConciergePromptBoxWrapper />);
            typeText('Nice work :smile');
            expect(screen.getByTestId('emoji-suggestions')).toBeOnTheScreen();

            // When the input is blurred
            fireEvent(getInput(), 'blur');

            // Then the list closes
            expect(screen.queryByTestId('emoji-suggestions')).not.toBeOnTheScreen();
        });
    });

    describe('scrolling the input', () => {
        beforeEach(() => jest.useFakeTimers());
        afterEach(() => jest.useRealTimers());

        it('hides the suggestions when the input is scrolled', () => {
            // Given a visible suggestion list that is no longer settling after the text change
            render(<ConciergePromptBoxWrapper />);
            typeText('Show me @ale');
            settleLayoutTriggeredScroll();
            expect(screen.getByTestId('mention-suggestions')).toBeOnTheScreen();

            // When the input is scrolled
            scrollInput();

            // Then the list closes, so it never floats away from the text it belongs to
            expect(screen.queryByTestId('mention-suggestions')).not.toBeOnTheScreen();
        });

        it('keeps the suggestions open when the text change itself moved the input', () => {
            // Given a visible suggestion list right after typing, where the input reflows and fires onScroll on its own
            render(<ConciergePromptBoxWrapper />);
            typeText('Show me @ale');

            // When that layout-triggered scroll arrives
            scrollInput();

            // Then the list stays open, since the user never scrolled
            expect(screen.getByTestId('mention-suggestions')).toBeOnTheScreen();
        });
    });

    describe('focus', () => {
        it('claims taps that land on the box itself', () => {
            // Given a rendered prompt box
            render(<ConciergePromptBoxWrapper />);

            // When the box is asked whether it wants the touch
            // Then it claims it, so the surrounding ScrollView never becomes the responder and cannot blur the input,
            // and nothing is handled on release, so the tap neither steals nor grants focus
            const box = screen.getByTestId('ConciergePromptBox');
            expect(fireEvent(box, 'startShouldSetResponder')).toBe(true);
            expect((box.props as ViewProps).onResponderRelease).toBeUndefined();
        });
    });

    describe('Enter key', () => {
        it('submits on Enter', () => {
            // Given a typed message
            render(<ConciergePromptBoxWrapper />);
            fireEvent.changeText(getInput(), 'Where is my expense?');

            // When Enter is pressed
            pressEnter();

            // Then the message is sent and the input is emptied
            expect(mockAskConcierge).toHaveBeenCalledWith('Where is my expense?');
            expect(getInput()).toHaveDisplayValue('');
        });

        it('does not submit on Shift+Enter', () => {
            // Given a typed message
            render(<ConciergePromptBoxWrapper />);
            fireEvent.changeText(getInput(), 'Where is my expense?');

            // When Shift+Enter is pressed
            pressEnter({shiftKey: true});

            // Then nothing is sent
            expect(mockAskConcierge).not.toHaveBeenCalled();
        });

        it('does not submit while the on-screen keyboard is up', () => {
            // Given a narrow layout with the keyboard shown, where Enter inserts a newline instead
            setResponsiveLayout(true);
            setKeyboardShown(true);
            render(<ConciergePromptBoxWrapper />);
            fireEvent.changeText(getInput(), 'Where is my expense?');

            // When Enter is pressed
            pressEnter();

            // Then nothing is sent
            expect(mockAskConcierge).not.toHaveBeenCalled();
        });
    });

    describe('attachments', () => {
        it('toggles the actions menu from the "+" button without opening the picker', () => {
            // Given the closed actions menu
            render(<ConciergePromptBoxWrapper />);
            expect(screen.queryByLabelText(ADD_ATTACHMENT)).toBeNull();

            // When the "+" button is pressed
            fireEvent.press(screen.getByLabelText(PLUS_BUTTON));

            // Then the menu opens and no picker is opened yet
            expect(screen.getByLabelText(ADD_ATTACHMENT)).toBeOnTheScreen();
            expect(mockOpenPicker).not.toHaveBeenCalled();

            // When the "+" button is pressed again
            fireEvent.press(screen.getByLabelText(PLUS_BUTTON));

            // Then the menu closes
            expect(screen.queryByLabelText(ADD_ATTACHMENT)).toBeNull();
        });

        it('opens the picker after the menu finishes closing', () => {
            // Given the open actions menu
            render(<ConciergePromptBoxWrapper />);
            fireEvent.press(screen.getByLabelText(PLUS_BUTTON));

            // When "Add attachment" is selected
            fireEvent.press(screen.getByLabelText(ADD_ATTACHMENT));

            // Then the picker waits for the modal to hide, and opens with the box's file handler
            expect(mockOpenPicker).not.toHaveBeenCalled();
            expect(mockClose).toHaveBeenCalledTimes(1);
            mockClose.mock.calls.at(0)?.[0]?.();
            expect(mockOpenPicker).toHaveBeenCalledWith({onPicked: mockPickAttachments});
        });

        it('opens the picker straight away on Safari', () => {
            // Given Safari, where the file picker must open inside the press handler
            mockIsSafari.mockReturnValue(true);
            render(<ConciergePromptBoxWrapper />);
            fireEvent.press(screen.getByLabelText(PLUS_BUTTON));

            // When "Add attachment" is selected
            fireEvent.press(screen.getByLabelText(ADD_ATTACHMENT));

            // Then the picker opens without waiting for the modal to hide
            expect(mockClose).not.toHaveBeenCalled();
            expect(mockOpenPicker).toHaveBeenCalledWith({onPicked: mockPickAttachments});
        });

        it('sends the confirmed attachments with the typed message and clears the input', () => {
            // Given a typed message and attachments confirmed in the preview modal
            const files: FileObject[] = [{name: 'receipt.jpg', type: 'image/jpeg', uri: 'file://receipt.jpg'}];
            render(<ConciergePromptBoxWrapper />);
            fireEvent.changeText(getInput(), 'Here it is');

            // When the modal confirms
            act(() => pickerHandler.onConfirm?.(files));

            // Then the attachments are sent with the message and the input is emptied
            expect(mockAskConciergeWithAttachment).toHaveBeenCalledWith(files, 'Here it is');
            expect(getInput()).toHaveDisplayValue('');
        });

        it('starts the attachment flow for a pasted image', async () => {
            // Given the prompt box
            render(<ConciergePromptBoxWrapper />);

            // When an image is pasted into the input
            pasteImage();

            // Then the pasted file goes through the same validation and preview flow as the picker
            await waitFor(() => {
                expect(mockPickAttachments).toHaveBeenCalled();
            });
        });

        it('ignores a pasted image until the Concierge report is ready', async () => {
            // Given a prompt box that has nowhere to send the attachment yet
            setAskConcierge(false);
            render(<ConciergePromptBoxWrapper />);

            // When an image is pasted into the input
            pasteImage();
            await waitForBatchedUpdatesWithAct();

            // Then the attachment flow is not started
            expect(mockPickAttachments).not.toHaveBeenCalled();
        });
    });

    describe('anonymous user', () => {
        beforeEach(() => {
            mockIsAnonymousUser.mockReturnValue(true);
        });

        it('asks to sign in instead of sending on the send button', () => {
            // Given an anonymous user with a typed message
            render(<ConciergePromptBoxWrapper />);
            fireEvent.changeText(getInput(), 'Where is my expense?');

            // When the send button is pressed
            fireEvent.press(screen.getByLabelText(SEND_BUTTON));

            // Then nothing is sent and the sign in flow opens
            expect(mockAskConcierge).not.toHaveBeenCalled();
            expect(mockSignOutAndRedirectToSignIn).toHaveBeenCalled();
        });

        it('asks to sign in instead of sending on Enter', () => {
            // Given an anonymous user with a typed message
            render(<ConciergePromptBoxWrapper />);
            fireEvent.changeText(getInput(), 'Where is my expense?');

            // When Enter is pressed
            pressEnter();

            // Then nothing is sent and the sign in flow opens
            expect(mockAskConcierge).not.toHaveBeenCalled();
            expect(mockSignOutAndRedirectToSignIn).toHaveBeenCalled();
        });

        it('asks to sign in instead of opening the actions menu', () => {
            // Given an anonymous user
            render(<ConciergePromptBoxWrapper />);

            // When the "+" button is pressed
            fireEvent.press(screen.getByLabelText(PLUS_BUTTON));

            // Then the menu stays closed and the sign in flow opens
            expect(screen.queryByLabelText(ADD_ATTACHMENT)).toBeNull();
            expect(mockSignOutAndRedirectToSignIn).toHaveBeenCalled();
        });

        it('asks to sign in instead of starting the attachment flow for a pasted image', async () => {
            // Given an anonymous user
            render(<ConciergePromptBoxWrapper />);

            // When an image is pasted into the input
            pasteImage();
            await waitForBatchedUpdatesWithAct();

            // Then the attachment flow is not started and the sign in flow opens
            expect(mockPickAttachments).not.toHaveBeenCalled();
            expect(mockSignOutAndRedirectToSignIn).toHaveBeenCalled();
        });

        it('asks to sign in instead of sending a confirmed attachment', () => {
            // Given an anonymous user with attachments confirmed in the preview modal
            const files: FileObject[] = [{name: 'receipt.jpg', type: 'image/jpeg', uri: 'file://receipt.jpg'}];
            render(<ConciergePromptBoxWrapper />);

            // When the modal confirms
            act(() => pickerHandler.onConfirm?.(files));

            // Then nothing is sent and the sign in flow opens
            expect(mockAskConciergeWithAttachment).not.toHaveBeenCalled();
            expect(mockSignOutAndRedirectToSignIn).toHaveBeenCalled();
        });
    });

    describe('placeholder', () => {
        it('uses the long copy only once it is known to fit one line', () => {
            // Given a wide layout
            render(<ConciergePromptBoxWrapper />);

            // When the long copy turns out to wrap
            measureLongPlaceholder(200);

            // Then the short copy stays, so the long one never flashes wrapped
            expect(screen.getByLabelText(SHORT_PLACEHOLDER)).toBeOnTheScreen();

            // When it fits one line instead
            measureLongPlaceholder(20);

            // Then the long copy is used
            expect(screen.getByLabelText(LONG_PLACEHOLDER)).toBeOnTheScreen();
        });

        it('keeps the short copy on the narrow layout', () => {
            // Given a narrow layout
            setResponsiveLayout(true);
            render(<ConciergePromptBoxWrapper />);

            // When the long copy would fit one line
            measureLongPlaceholder(20);

            // Then the short copy stays
            expect(screen.getByLabelText(SHORT_PLACEHOLDER)).toBeOnTheScreen();
        });
    });
});
