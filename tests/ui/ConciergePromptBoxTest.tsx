import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import useAskConcierge from '@components/Search/SearchRouter/useAskConcierge';

import useKeyboardState from '@hooks/useKeyboardState';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import type * as BrowserModule from '@libs/Browser';
import {isSafari} from '@libs/Browser';

import ConciergePromptBox from '@pages/home/ForYouSection/ConciergePromptBox';

import {close} from '@userActions/Modal';
import {isAnonymousUser, signOutAndRedirectToSignIn} from '@userActions/Session';

import CONST from '@src/CONST';
import type {FileObject} from '@src/types/utils/Attachment';

import React, {useState} from 'react';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const CONCIERGE_REPORT_ID = '100';
const LONG_PLACEHOLDER = 'homePage.conciergePrompt.inputPlaceholder';
const SHORT_PLACEHOLDER = 'homePage.conciergePrompt.inputPlaceholderMobile';
const ADD_ATTACHMENT = 'reportActionCompose.addAttachment';
const PLUS_BUTTON = 'accessibilityHints.openActionsMenu';
const SEND_BUTTON = 'common.send';

const mockAskConcierge = jest.fn();
const mockAskConciergeWithAttachment = jest.fn();
const mockPickAttachments = jest.fn();
const mockOpenPicker = jest.fn();

const pickerHandler: {onConfirm?: (files: FileObject | FileObject[]) => void} = {};

jest.mock('@components/Search/SearchRouter/useAskConcierge', () => jest.fn());

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

function measureLongPlaceholder(height: number) {
    fireEvent(screen.getByText(LONG_PLACEHOLDER), 'layout', {nativeEvent: {layout: {height}}});
}

describe('ConciergePromptBox', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        pickerHandler.onConfirm = undefined;
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
