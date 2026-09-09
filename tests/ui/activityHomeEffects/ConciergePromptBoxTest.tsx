import {act, fireEvent, screen} from '@testing-library/react-native';

import type WebComposer from '@components/Composer/implementation';
import useAskConcierge from '@components/Search/SearchRouter/useAskConcierge';

import type useWebHtmlPaste from '@hooks/useHtmlPaste';
import type useWebIsScrollBarVisible from '@hooks/useIsScrollBarVisible';
import useKeyboardState from '@hooks/useKeyboardState';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import ConciergePromptBox from '@pages/home/ForYouSection/ConciergePromptBox';

import * as ReportActions from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type * as ReactNavigation from '@react-navigation/native';
import type {TextInputProps} from 'react-native';

import React, {useState} from 'react';
import {DeviceEventEmitter} from 'react-native';
import Onyx from 'react-native-onyx';

import renderScreenWithCover, {getCoverMode} from '../../utils/ScreenCoverHarness';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';
import createWebComposerTextarea from '../../utils/webComposerTextarea';

/**
 * The Home tab gained a text input when ForYouSection started rendering ConciergePromptBox, which renders the shared
 * web Composer. Covering the tab runs every effect cleanup on that chain and uncovering it runs every effect again,
 * so this suite pins the parts a user can lose: the pending draft save, the typed value and the caret, the focus,
 * the max length warning, the "+" menu, and the DOM listeners the Composer and useHtmlPaste attach.
 */

const INPUT_TEST_ID = 'ConciergePromptBoxInput';
const ADD_ATTACHMENT_BUTTON_TEST_ID = 'ConciergePromptBoxAddAttachmentButton';
const MENU_ITEM_TEST_ID = 'ConciergePromptBoxMenuAddAttachment';
const EXCEEDED_LENGTH_TEST_ID = 'ConciergePromptBoxExceededLength';

// The composer text input the web Composer attaches its DOM listeners to. A real textarea, so the listener calls can be counted.
const mockComposerTextarea = createWebComposerTextarea();
const mockTextarea = mockComposerTextarea.element;
const composerMetrics = mockComposerTextarea.metrics;

const resizeObserverCalls = {observe: 0, disconnect: 0};

/** jsdom ships no ResizeObserver, so useIsScrollBarVisible would skip its effect entirely without this stand-in. */
class TestResizeObserver implements ResizeObserver {
    observe() {
        resizeObserverCalls.observe += 1;
    }

    unobserve() {}

    disconnect() {
        resizeObserverCalls.disconnect += 1;
    }
}

window.ResizeObserver = TestResizeObserver;

// Jest resolves the native platform file, so every web implementation on this chain has to be required by its exact path.
jest.mock('@components/Composer', () => ({
    __esModule: true,
    default: jest.requireActual<{default: typeof WebComposer}>('../../../src/components/Composer/implementation/index.tsx').default,
}));

jest.mock('@hooks/useHtmlPaste', () => ({
    __esModule: true,
    default: jest.requireActual<{default: typeof useWebHtmlPaste}>('../../../src/hooks/useHtmlPaste/index.ts').default,
}));

jest.mock('@hooks/useIsScrollBarVisible', () => ({
    __esModule: true,
    default: jest.requireActual<{default: typeof useWebIsScrollBarVisible}>('../../../src/hooks/useIsScrollBarVisible/index.ts').default,
}));

// The shipped mock hands back a React Native TextInput instance. The web Composer needs a DOM node behind its ref.
jest.mock('@expensify/react-native-live-markdown', () => {
    const ReactModule = jest.requireActual<typeof React>('react');
    const {TextInput} = jest.requireActual<{TextInput: React.ComponentType<TextInputProps>}>('react-native');

    function MarkdownTextInput({ref, ...props}: TextInputProps & {ref?: React.Ref<unknown>}) {
        ReactModule.useImperativeHandle(ref, () => mockTextarea);
        return ReactModule.createElement(TextInput, props);
    }

    return {MarkdownTextInput, parseExpensiMark: () => [], getWorkletRuntime: () => ({})};
});

jest.mock('@components/OnyxListItemProvider', () => ({useSession: () => ({accountID: 1, encryptedAuthToken: 'token'})}));

jest.mock('@react-navigation/native', () => {
    const actualNavigation = jest.requireActual<typeof ReactNavigation>('@react-navigation/native');
    return {...actualNavigation, useIsFocused: () => true};
});

const mockPickAttachments = jest.fn();
const mockOpenPicker = jest.fn();

jest.mock('@components/Search/SearchRouter/useAskConcierge', () => jest.fn());

jest.mock('@pages/home/ForYouSection/useConciergeAttachmentPicker', () => ({
    __esModule: true,
    default: () => ({pickAttachments: mockPickAttachments, PDFValidationComponent: null}),
}));

jest.mock('@components/AttachmentPicker', () => ({
    __esModule: true,
    default: ({children}: {children: (props: {openPicker: (options: unknown) => void}) => React.ReactNode}) => children({openPicker: mockOpenPicker}),
}));

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
        getLocalDateFromDatetime: () => new Date('2026-08-24T09:00:00'),
        numberFormat: (value: number) => String(value),
    })),
);

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
jest.mock('@hooks/useKeyboardState', () => jest.fn());

jest.mock('@userActions/Session', () => ({
    isAnonymousUser: jest.fn(() => false),
    signOutAndRedirectToSignIn: jest.fn(),
}));

const mockUseAskConcierge = jest.mocked(useAskConcierge);
const mockUseResponsiveLayout = jest.mocked(useResponsiveLayout);
const mockUseKeyboardState = jest.mocked(useKeyboardState);
const saveDraftSpy = jest.spyOn(ReportActions, 'saveConciergePromptDraft');

const composerAddListenerSpy = jest.spyOn(mockTextarea, 'addEventListener');
const composerRemoveListenerSpy = jest.spyOn(mockTextarea, 'removeEventListener');
const documentAddListenerSpy = jest.spyOn(document, 'addEventListener');
const documentRemoveListenerSpy = jest.spyOn(document, 'removeEventListener');
const composerFocusSpy = jest.spyOn(mockTextarea, 'focus');

type ListenerCalls = ReadonlyArray<readonly [eventName: string, ...rest: unknown[]]>;

function countListenerCalls(calls: ListenerCalls, eventName: string): number {
    return calls.filter(([name]) => name === eventName).length;
}

/** Listeners still attached for one event name, meaning every add that no matching remove has undone. */
function attachedListenerCount(addCalls: ListenerCalls, removeCalls: ListenerCalls, eventName: string): number {
    return countListenerCalls(addCalls, eventName) - countListenerCalls(removeCalls, eventName);
}

// jsdom runs no layout, so Range has no getClientRects and the caret math in the web Composer would throw.
Range.prototype.getClientRects = () => document.createElement('div').getClientRects();

/** The caret path in the web Composer reads a live DOM range, so the document needs a selection before it runs. */
function putCaretInTheDocument() {
    const range = document.createRange();
    range.selectNodeContents(document.body);
    const domSelection = window.getSelection();
    domSelection?.removeAllRanges();
    domSelection?.addRange(range);
}

/** Lets the Composer's debounced scroll listener record the current scroll offset. */
async function recordComposerScroll() {
    mockTextarea.dispatchEvent(new Event('scroll'));
    await act(async () => {
        await new Promise((resolve) => {
            setTimeout(resolve, 150);
        });
    });
}

function ConciergePromptBoxHost() {
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    return (
        <ConciergePromptBox
            isMenuVisible={isMenuVisible}
            setIsMenuVisible={setIsMenuVisible}
        />
    );
}

describe('ConciergePromptBox under a screen cover', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        jest.clearAllMocks();
        putCaretInTheDocument();
        mockComposerTextarea.reset();
        Object.assign(resizeObserverCalls, {observe: 0, disconnect: 0});
        mockUseAskConcierge.mockReturnValue({
            askConcierge: jest.fn(),
            askConciergeWithAttachment: jest.fn(),
            shouldShowAskConcierge: true,
            conciergeTargetReportID: '100',
        });
        mockUseResponsiveLayout.mockReturnValue({
            shouldUseNarrowLayout: false,
            isSmallScreenWidth: false,
            isInNarrowPaneModal: false,
            isExtraSmallScreenHeight: false,
            isMediumScreenWidth: false,
            isLargeScreenWidth: true,
            isExtraLargeScreenWidth: false,
            isExtraSmallScreenWidth: false,
            isSmallScreen: false,
            onboardingIsMediumOrLargerScreenWidth: true,
            isInLandscapeMode: false,
        });
        mockUseKeyboardState.mockReturnValue({
            isKeyboardShown: false,
            isKeyboardActive: false,
            keyboardHeight: 0,
            keyboardActiveHeight: 0,
            isKeyboardAnimatingRef: {current: false},
        });
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    describe('the pending draft save', () => {
        it('flushes the debounced save exactly once when the screen is hidden', async () => {
            const home = renderScreenWithCover(<ConciergePromptBoxHost />);
            await waitForBatchedUpdatesWithAct();

            fireEvent.changeText(screen.getByTestId(INPUT_TEST_ID), 'where is my expense');
            await home.hide();

            // Under 'none' nothing tears down, so the debounce is still pending and Onyx has not been written yet.
            expect(saveDraftSpy.mock.calls).toEqual(getCoverMode() === 'activity' ? [['where is my expense']] : []);
        });

        it('does not save the draft a second time on reveal', async () => {
            const home = renderScreenWithCover(<ConciergePromptBoxHost />);
            await waitForBatchedUpdatesWithAct();

            fireEvent.changeText(screen.getByTestId(INPUT_TEST_ID), 'where is my expense');
            await home.hide();
            const callsAfterHide = saveDraftSpy.mock.calls.length;
            await home.reveal();

            expect(saveDraftSpy.mock.calls.length).toBe(callsAfterHide);
        });

        it('picks up a draft that changed in Onyx while the screen was hidden', async () => {
            const home = renderScreenWithCover(<ConciergePromptBoxHost />);
            await waitForBatchedUpdatesWithAct();

            fireEvent.changeText(screen.getByTestId(INPUT_TEST_ID), 'where is my expense');
            await home.hide();

            // useOnyx is disconnected while the screen is hidden, so this write is the update it never hears about.
            await act(async () => {
                await Onyx.merge(ONYXKEYS.CONCIERGE_PROMPT_DRAFT, 'sent from another tab');
            });
            await home.reveal();

            expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('sent from another tab');
        });

        it('saves nothing when the user never typed', async () => {
            const home = renderScreenWithCover(<ConciergePromptBoxHost />);
            await waitForBatchedUpdatesWithAct();

            await home.hide();
            await home.reveal();

            expect(saveDraftSpy).not.toHaveBeenCalled();
        });
    });

    describe('the typed value and the caret', () => {
        it('keeps the typed value across a hide and reveal', async () => {
            const home = renderScreenWithCover(<ConciergePromptBoxHost />);
            await waitForBatchedUpdatesWithAct();

            fireEvent.changeText(screen.getByTestId(INPUT_TEST_ID), 'where is my expense');
            await home.hide();
            await home.reveal();

            expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('where is my expense');
        });

        it('keeps the caret where the user left it', async () => {
            const home = renderScreenWithCover(<ConciergePromptBoxHost />);
            await waitForBatchedUpdatesWithAct();

            const input = screen.getByTestId(INPUT_TEST_ID);
            fireEvent.changeText(input, 'where is my expense');
            fireEvent(input, 'selectionChange', {nativeEvent: {selection: {start: 5, end: 5}}});
            await waitForBatchedUpdatesWithAct();

            await home.hide();
            await home.reveal();

            expect(screen.getByTestId(INPUT_TEST_ID).props.selection).toEqual(expect.objectContaining({start: 5, end: 5}));
        });
    });

    describe('the focus', () => {
        // The live-markdown web input re-focuses itself on every reveal when autoFocus is set, so this chain must leave it off.
        it('never asks the composer to autoFocus', async () => {
            renderScreenWithCover(<ConciergePromptBoxHost />);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByTestId(INPUT_TEST_ID).props.autoFocus).toBe(false);
        });

        it('does not focus the composer on reveal', async () => {
            const home = renderScreenWithCover(<ConciergePromptBoxHost />);
            await waitForBatchedUpdatesWithAct();

            fireEvent.changeText(screen.getByTestId(INPUT_TEST_ID), 'where is my expense');
            await home.hide();
            await home.reveal();

            expect(composerFocusSpy).not.toHaveBeenCalled();
        });
    });

    describe('the max length validation', () => {
        it('keeps the exceeded length warning across a hide and reveal', async () => {
            const home = renderScreenWithCover(<ConciergePromptBoxHost />);
            await waitForBatchedUpdatesWithAct();

            fireEvent.changeText(screen.getByTestId(INPUT_TEST_ID), 'a'.repeat(CONST.MAX_COMMENT_LENGTH + 1));
            await waitForBatchedUpdatesWithAct();
            expect(screen.getByTestId(EXCEEDED_LENGTH_TEST_ID)).toBeOnTheScreen();

            await home.hide();
            await home.reveal();

            expect(screen.getByTestId(EXCEEDED_LENGTH_TEST_ID)).toBeOnTheScreen();
        });
    });

    describe('the "+" menu', () => {
        it('keeps an open menu open across a hide and reveal, the same as today', async () => {
            const home = renderScreenWithCover(<ConciergePromptBoxHost />);
            await waitForBatchedUpdatesWithAct();

            fireEvent.press(screen.getByTestId(ADD_ATTACHMENT_BUTTON_TEST_ID));
            await waitForBatchedUpdatesWithAct();
            expect(screen.getByTestId(MENU_ITEM_TEST_ID)).toBeOnTheScreen();

            await home.hide();
            await home.reveal();

            expect(screen.getByTestId(MENU_ITEM_TEST_ID)).toBeOnTheScreen();
        });

        it('still opens the menu from the button after a hide and reveal', async () => {
            const home = renderScreenWithCover(<ConciergePromptBoxHost />);
            await waitForBatchedUpdatesWithAct();

            await home.hide();
            await home.reveal();

            expect(screen.queryByTestId(MENU_ITEM_TEST_ID)).not.toBeOnTheScreen();

            fireEvent.press(screen.getByTestId(ADD_ATTACHMENT_BUTTON_TEST_ID));
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByTestId(MENU_ITEM_TEST_ID)).toBeOnTheScreen();
        });
    });

    describe('the composer scroll position', () => {
        it('does not scroll the composer to the caret on reveal', async () => {
            Object.assign(composerMetrics, {scrollHeight: 300, clientHeight: 100});
            const home = renderScreenWithCover(<ConciergePromptBoxHost />);
            await waitForBatchedUpdatesWithAct();

            const input = screen.getByTestId(INPUT_TEST_ID);
            fireEvent.changeText(input, 'where is my expense');
            fireEvent(input, 'selectionChange', {nativeEvent: {selection: {start: 19, end: 19}}});
            await waitForBatchedUpdatesWithAct();

            // The user scrolls the composer back up while the caret stays at the end of the draft.
            composerMetrics.scrollTop = 40;
            await home.hide();
            await home.reveal();

            expect(composerMetrics.scrollTop).toBe(40);
        });

        it('does not replay the full size scroll restore on reveal', async () => {
            Object.assign(composerMetrics, {scrollHeight: 300, clientHeight: 100});
            const home = renderScreenWithCover(<ConciergePromptBoxHost />);
            await waitForBatchedUpdatesWithAct();

            const input = screen.getByTestId(INPUT_TEST_ID);
            fireEvent.changeText(input, 'where is my expense');
            fireEvent(input, 'contentSizeChange', {nativeEvent: {contentSize: {height: 300, width: 100}}});
            fireEvent(input, 'selectionChange', {nativeEvent: {selection: {start: 2, end: 2}}});
            await waitForBatchedUpdatesWithAct();

            composerMetrics.scrollTop = 40;
            await recordComposerScroll();

            await home.hide();
            await home.reveal();

            expect(composerMetrics.scrollTop).toBe(40);
        });
    });

    describe('the report list scrolling flag', () => {
        it('lets the wheel scroll the composer again when the list stopped scrolling while hidden', async () => {
            const home = renderScreenWithCover(<ConciergePromptBoxHost />);
            await waitForBatchedUpdatesWithAct();

            act(() => {
                DeviceEventEmitter.emit(CONST.EVENTS.SCROLLING, true);
            });
            await home.hide();

            // Nothing is listening while the screen is hidden, so this is the event the composer never sees.
            act(() => {
                DeviceEventEmitter.emit(CONST.EVENTS.SCROLLING, false);
            });
            await home.reveal();

            const wheelEvent = new Event('wheel', {bubbles: true, cancelable: true});
            mockTextarea.dispatchEvent(wheelEvent);

            expect(wheelEvent.defaultPrevented).toBe(false);
        });
    });

    describe('the scroll bar observer', () => {
        it('disconnects on hide and observes exactly once again on reveal', async () => {
            const home = renderScreenWithCover(<ConciergePromptBoxHost />);
            await waitForBatchedUpdatesWithAct();

            expect(resizeObserverCalls.observe).toBe(1);

            await home.hide();

            expect(resizeObserverCalls.disconnect).toBe(getCoverMode() === 'activity' ? 1 : 0);

            await home.reveal();

            expect(resizeObserverCalls.observe - resizeObserverCalls.disconnect).toBe(1);
        });
    });

    describe('the DOM listeners', () => {
        it('leaves exactly one composer scroll, wheel and paste listener attached after a reveal', async () => {
            const home = renderScreenWithCover(<ConciergePromptBoxHost />);
            await waitForBatchedUpdatesWithAct();

            expect(countListenerCalls(composerAddListenerSpy.mock.calls, 'scroll')).toBe(1);
            expect(countListenerCalls(composerAddListenerSpy.mock.calls, 'wheel')).toBe(1);
            expect(countListenerCalls(documentAddListenerSpy.mock.calls, 'paste')).toBe(1);

            await home.hide();

            const expectedRemovals = getCoverMode() === 'activity' ? 1 : 0;
            expect(countListenerCalls(composerRemoveListenerSpy.mock.calls, 'scroll')).toBe(expectedRemovals);
            expect(countListenerCalls(composerRemoveListenerSpy.mock.calls, 'wheel')).toBe(expectedRemovals);
            expect(countListenerCalls(documentRemoveListenerSpy.mock.calls, 'paste')).toBe(expectedRemovals);

            await home.reveal();

            expect(attachedListenerCount(composerAddListenerSpy.mock.calls, composerRemoveListenerSpy.mock.calls, 'scroll')).toBe(1);
            expect(attachedListenerCount(composerAddListenerSpy.mock.calls, composerRemoveListenerSpy.mock.calls, 'wheel')).toBe(1);
            expect(attachedListenerCount(documentAddListenerSpy.mock.calls, documentRemoveListenerSpy.mock.calls, 'paste')).toBe(1);
        });
    });
});
