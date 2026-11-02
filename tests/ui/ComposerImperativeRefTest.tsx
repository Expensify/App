/** Executes Composer platform refs, animated clearing and focus-command consumers. */
import {act, render, renderHook} from '@testing-library/react-native';

import type * as ImplementationModule from '@components/Composer/implementation/index';
import type * as ImplementationNativeModule from '@components/Composer/implementation/index.native';
import NativeComposer from '@components/Composer/implementation/index.native';
import type {ComposerProps, ComposerRef} from '@components/Composer/types';
import RNMarkdownTextInput from '@components/RNMarkdownTextInput';

import type * as UseBlurOnKeyboardHideModule from '@hooks/useBlurOnKeyboardHide';
import type * as UseHtmlPasteModule from '@hooks/useHtmlPaste/index.ts';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';

import {composerFocusKeepFocusOn} from '@libs/actions/InputFocus/index.web';
import {getBrowser, isMobileChrome} from '@libs/Browser';
import type * as ComponentUtilsModule from '@libs/ComponentUtils/index';
import type * as ComponentUtilsNativeModule from '@libs/ComponentUtils/index.native';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import preventFirstResponder from '@libs/preventTextInputFocusOnFirstResponderOnce/index.ios';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';

import type * as ComposerContextModule from '@pages/inbox/report/ReportActionCompose/ComposerContext';
import ComposerWithSuggestions from '@pages/inbox/report/ReportActionCompose/ComposerWithSuggestions';
import type {ComposerWithSuggestionsRef} from '@pages/inbox/report/ReportActionCompose/ComposerWithSuggestions';
import updateNativeTextInputValue from '@pages/inbox/report/ReportActionCompose/updateNativeTextInputValue/index.ios';
import type * as UseComposerSuggestionsModule from '@pages/inbox/report/ReportActionCompose/useComposerSuggestions';
import type * as UseEditComposerToggleModule from '@pages/inbox/report/ReportActionCompose/useEditComposerToggle';
import type * as ReportActionEditMessageContextModule from '@pages/inbox/report/ReportActionEditMessageContext';
import type * as UseDebouncedSaveDraftModule from '@pages/inbox/report/useDebouncedSaveDraft';
import type * as UseDebouncedSaveReportActionDraftModule from '@pages/inbox/report/useDebouncedSaveReportActionDraft';

import type * as ReportModule from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Modal} from '@src/types/onyx';

import type * as MarkdownTextInputWebModule from '@expensify/react-native-live-markdown/lib/typescript/src/MarkdownTextInput.web';
import type * as ReactNavigationModule from '@react-navigation/native';
import type {TextInput, TextInputKeyPressEvent, TextInputSelectionChangeEvent} from 'react-native';
import type * as UseAnimatedRefModule from 'react-native-reanimated/lib/typescript/hook/useAnimatedRef';

import React, {act as actDOM} from 'react';
import {createRoot} from 'react-dom/client';
import Onyx from 'react-native-onyx';
import {dispatchCommand, useAnimatedRef} from 'react-native-reanimated';

import createMock from '../utils/createMock';

let mockShouldMountComposer = true;
let mockShouldUseNativeComposer = false;
let mockMarkdownInput: TextInput | (HTMLDivElement & Pick<TextInput, 'clear' | 'isFocused'>) | null = null;
const WebComposer = jest.requireActual<typeof ImplementationModule>('@components/Composer/implementation/index.tsx').default;
const {forceClearInput: clearWebInput} = jest.requireActual<typeof ComponentUtilsModule>('@libs/ComponentUtils/index.ts');
const mockResetScroll = jest.fn<
    ReturnType<ReturnType<typeof UseComposerSuggestionsModule.default>['resetScrollPosition']>,
    Parameters<ReturnType<typeof UseComposerSuggestionsModule.default>['resetScrollPosition']>
>();
const mockSuggestionsRef = {current: null};
const {forceClearInput: clearNativeInput} = jest.requireActual<typeof ComponentUtilsNativeModule>('@libs/ComponentUtils/index.native.ts');

jest.mock('@components/Composer', () => {
    const ReactModule = jest.requireActual<typeof React>('react');
    const Web = jest.requireActual<typeof ImplementationModule>('@components/Composer/implementation/index.tsx').default;
    const Native = jest.requireActual<typeof ImplementationNativeModule>('@components/Composer/implementation/index.native').default;
    return (props: ComposerProps) => (mockShouldMountComposer ? ReactModule.createElement(mockShouldUseNativeComposer ? Native : Web, {...props, key: props.placeholder}) : null);
});
jest.mock('@components/RNMarkdownTextInput', () => {
    const ReactModule = jest.requireActual<typeof React>('react');
    return jest.fn((props: Parameters<typeof RNMarkdownTextInput>[0]) => ReactModule.createElement('MarkdownInput', {ref: props.ref}));
});
jest.mock('@expensify/react-native-live-markdown/lib/commonjs/web/MarkdownTextInput.css', () => ({}));
jest.mock('@components/OnyxListItemProvider', () => ({useSession: () => undefined}));
jest.mock('@components/WideRHPContextProvider', () => ({useWideRHPState: () => ({superWideRHPRouteKeys: [], wideRHPRouteKeys: []})}));
jest.mock('@hooks/useTheme', () => () => ({}));
jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@hooks/useStyleUtils', () => () => ({
    getComposeTextAreaPadding: () => ({}),
    getComposerMaxHeightStyle: () => ({}),
    getContainerComposeStyles: () => ({paddingVertical: 0}),
}));
jest.mock('@hooks/useMarkdownStyle', () => () => ({}));
jest.mock('@hooks/useIsScrollBarVisible', () => () => false);
jest.mock('@hooks/useBlurOnKeyboardHide', () => jest.fn<ReturnType<typeof UseBlurOnKeyboardHideModule.default>, Parameters<typeof UseBlurOnKeyboardHideModule.default>>());
jest.mock('@hooks/useIsInLandscapeMode', () => jest.fn(() => false));
jest.mock('@hooks/useOnyx', () => () => [undefined]);
jest.mock('@hooks/useHtmlPaste', () => jest.requireActual<typeof UseHtmlPasteModule>('@hooks/useHtmlPaste/index.ts'));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => () => ({accountID: 1}));
jest.mock('@hooks/useIsInSidePanel', () => () => false);
jest.mock('@hooks/useKeyboardState', () => () => ({isKeyboardShown: false}));
jest.mock('@hooks/useLocalize', () => () => ({preferredLocale: 'en'}));
jest.mock('@hooks/useNetwork', () => () => ({isOffline: false}));
jest.mock('@hooks/useReportIDToNameMap', () => () => ({}));
jest.mock('@hooks/useResponsiveLayout', () => () => ({shouldUseNarrowLayout: false}));
jest.mock('@hooks/useSidePanelState', () => () => ({isSidePanelHiddenOrLargeScreen: true, shouldHideSidePanel: false}));
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigationModule>('@react-navigation/native'),
    useIsFocused: () => true,
    useRoute: () => ({name: 'Report', key: 'report'}),
    useNavigation: () => ({addListener: () => () => {}}),
}));
jest.mock('@libs/Browser', () => ({isMobileSafari: () => false, isSafari: () => false, isMobileChrome: jest.fn(() => false), getBrowser: jest.fn(() => 'chrome')}));
jest.mock('@libs/ComponentUtils', () => jest.requireActual<typeof ComponentUtilsModule>('@libs/ComponentUtils/index.ts'));
jest.mock('@libs/Navigation/TransitionTracker', () => ({runAfterTransitions: jest.fn(() => ({cancel: jest.fn<void, []>()}))}));
jest.mock('@libs/canFocusInputOnScreenFocus', () => () => false);
jest.mock('@libs/willBlurTextInputOnTapOutside', () => () => false);
jest.mock('@pages/Share/getFileSize', () => () => Promise.resolve(7));
jest.mock('@pages/inbox/report/ReportActionEditMessageContext', () => ({
    useReportActionActiveEditActions: () => ({
        setEditingMessage: jest.fn<
            ReturnType<ReturnType<typeof ReportActionEditMessageContextModule.useReportActionActiveEditActions>['setEditingMessage']>,
            Parameters<ReturnType<typeof ReportActionEditMessageContextModule.useReportActionActiveEditActions>['setEditingMessage']>
        >(),
        setCurrentEditMessageSelection: jest.fn<
            ReturnType<ReturnType<typeof ReportActionEditMessageContextModule.useReportActionActiveEditActions>['setCurrentEditMessageSelection']>,
            Parameters<ReturnType<typeof ReportActionEditMessageContextModule.useReportActionActiveEditActions>['setCurrentEditMessageSelection']>
        >(),
    }),
}));
jest.mock('@pages/inbox/report/useDebouncedSaveDraft', () => () => ({
    saveDraft: jest.fn<ReturnType<ReturnType<typeof UseDebouncedSaveDraftModule.default>['saveDraft']>, Parameters<ReturnType<typeof UseDebouncedSaveDraftModule.default>['saveDraft']>>(),
    isSavePending: {current: false},
}));
jest.mock('@pages/inbox/report/useDebouncedSaveReportActionDraft', () => () => ({
    saveDraft: jest.fn<
        ReturnType<ReturnType<typeof UseDebouncedSaveReportActionDraftModule.default>['saveDraft']>,
        Parameters<ReturnType<typeof UseDebouncedSaveReportActionDraftModule.default>['saveDraft']>
    >(),
    isSavePending: {current: false},
    cancelSaveDraft: jest.fn<void, []>(),
}));
jest.mock('@pages/inbox/report/useDraftMessageVideoAttributeCache', () => () => {});
jest.mock('@pages/inbox/report/useShouldEditInComposer', () => () => false);
jest.mock('@pages/inbox/report/ReportActionCompose/ComposerContext', () => ({
    useComposerText: () => '',
    useComposerActions: () => ({
        setText: jest.fn<
            ReturnType<ReturnType<typeof ComposerContextModule.useComposerActions>['setText']>,
            Parameters<ReturnType<typeof ComposerContextModule.useComposerActions>['setText']>
        >(),
    }),
    useComposerEditState: () => ({editingState: 'off', effectiveDraft: null}),
}));
jest.mock('@pages/inbox/report/ReportActionCompose/useComposerSuggestions', () => () => ({
    measureParentContainerAndReportCursor: jest.fn<
        ReturnType<ReturnType<typeof UseComposerSuggestionsModule.default>['measureParentContainerAndReportCursor']>,
        Parameters<ReturnType<typeof UseComposerSuggestionsModule.default>['measureParentContainerAndReportCursor']>
    >(),
    onSaveScrollAndHideSuggestionMenu: jest.fn<
        ReturnType<ReturnType<typeof UseComposerSuggestionsModule.default>['onSaveScrollAndHideSuggestionMenu']>,
        Parameters<ReturnType<typeof UseComposerSuggestionsModule.default>['onSaveScrollAndHideSuggestionMenu']>
    >(),
    resetScrollPosition: mockResetScroll,
    raiseIsScrollLayoutTriggered: jest.fn<
        ReturnType<ReturnType<typeof UseComposerSuggestionsModule.default>['raiseIsScrollLayoutTriggered']>,
        Parameters<ReturnType<typeof UseComposerSuggestionsModule.default>['raiseIsScrollLayoutTriggered']>
    >(),
}));
jest.mock('@pages/inbox/report/ReportActionCompose/useEditComposerToggle', () =>
    jest.fn<ReturnType<typeof UseEditComposerToggleModule.default>, Parameters<typeof UseEditComposerToggleModule.default>>(),
);
jest.mock('@pages/inbox/report/ReportActionCompose/useLastEditableAction', () => () => undefined);
jest.mock('@pages/inbox/report/ReportActionCompose/Suggestions', () => () => null);
jest.mock('@pages/inbox/report/ReportActionCompose/SilentCommentUpdater', () => () => null);
jest.mock('@userActions/Report', () => ({
    broadcastUserIsTyping: jest.fn<ReturnType<typeof ReportModule.broadcastUserIsTyping>, Parameters<typeof ReportModule.broadcastUserIsTyping>>(),
    saveReportActionDraft: jest.fn<ReturnType<typeof ReportModule.saveReportActionDraft>, Parameters<typeof ReportModule.saveReportActionDraft>>(),
    saveReportDraftComment: jest.fn<ReturnType<typeof ReportModule.saveReportDraftComment>, Parameters<typeof ReportModule.saveReportDraftComment>>(),
}));
jest.mock('@userActions/Modal', () => ({areAllModalsHidden: () => true}));

function markdownProps() {
    const props = jest.mocked(RNMarkdownTextInput).mock.calls.at(-1)?.[0];
    if (!props) {
        throw new Error('Expected actual Composer to render markdown input');
    }
    return props;
}

function webMarkdownInput(value?: string) {
    // Live-markdown augments its actual div with clear/isFocused and may omit value before parsing.
    const div = Object.assign(document.createElement('div'), {
        clear: jest.fn(() => {
            div.textContent = '';
        }),
        isFocused: () => document.activeElement === div,
    });
    div.setAttribute('contenteditable', 'true');
    div.tabIndex = 0;
    document.body.appendChild(div);
    if (value !== undefined) {
        Object.assign(div, {value});
    }
    mockMarkdownInput = div;
    return div;
}

function forwardingProps(ref: React.Ref<ComposerWithSuggestionsRef>): Parameters<typeof ComposerWithSuggestions>[0] {
    return {
        reportID: '1',
        onFocus: jest.fn<ReturnType<Parameters<typeof ComposerWithSuggestions>[0]['onFocus']>, Parameters<Parameters<typeof ComposerWithSuggestions>[0]['onFocus']>>(),
        onBlur: jest.fn<ReturnType<Parameters<typeof ComposerWithSuggestions>[0]['onBlur']>, Parameters<Parameters<typeof ComposerWithSuggestions>[0]['onBlur']>>(),
        onValueChange: jest.fn<ReturnType<Parameters<typeof ComposerWithSuggestions>[0]['onValueChange']>, Parameters<Parameters<typeof ComposerWithSuggestions>[0]['onValueChange']>>(),
        isComposerFullSize: false,
        setIsFullComposerAvailable: jest.fn<
            ReturnType<Parameters<typeof ComposerWithSuggestions>[0]['setIsFullComposerAvailable']>,
            Parameters<Parameters<typeof ComposerWithSuggestions>[0]['setIsFullComposerAvailable']>
        >(),
        isMenuVisible: false,
        inputPlaceholder: '',
        onPasteFile: jest.fn<ReturnType<Parameters<typeof ComposerWithSuggestions>[0]['onPasteFile']>, Parameters<Parameters<typeof ComposerWithSuggestions>[0]['onPasteFile']>>(),
        onEnterKeyPress: jest.fn<
            ReturnType<Parameters<typeof ComposerWithSuggestions>[0]['onEnterKeyPress']>,
            Parameters<Parameters<typeof ComposerWithSuggestions>[0]['onEnterKeyPress']>
        >(),
        measureParentContainer: jest.fn<
            ReturnType<Parameters<typeof ComposerWithSuggestions>[0]['measureParentContainer']>,
            Parameters<Parameters<typeof ComposerWithSuggestions>[0]['measureParentContainer']>
        >(),
        suggestionsRef: mockSuggestionsRef,
        isNextModalWillOpenRef: {current: false},
        isGroupPolicyReport: false,
        ref,
    };
}

describe('Composer imperative refs', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockShouldMountComposer = true;
        mockShouldUseNativeComposer = false;
        jest.mocked(useIsInLandscapeMode).mockReturnValue(false);
        jest.mocked(useAnimatedRef).mockImplementation(jest.requireActual<typeof UseAnimatedRefModule>('react-native-reanimated/src/hook/useAnimatedRef.ts').useAnimatedRef);
        jest.mocked(isMobileChrome).mockReturnValue(false);
        jest.mocked(getBrowser).mockReturnValue(CONST.BROWSER.CHROME);
        jest.spyOn(Onyx, 'set').mockResolvedValue();
    });
    afterEach(() => {
        jest.restoreAllMocks();
        document.body.replaceChildren();
        ReportActionComposeFocusManager.composerRef.current = null;
        ReportActionComposeFocusManager.sidePanelComposerRef.current = null;
    });

    it('observes the installed live-markdown div with value omitted before parsing', () => {
        // Given the installed web producer receives no value, matching an initially uncontrolled composer.
        const LiveMarkdown = jest.requireActual<typeof MarkdownTextInputWebModule>('@expensify/react-native-live-markdown/lib/commonjs/MarkdownTextInput.web.js').default;
        const host = document.createElement('div');
        document.body.appendChild(host);
        const root = createRoot(host);
        const ref = React.createRef<React.ComponentRef<typeof LiveMarkdown>>();
        const parser = jest.fn(() => []);

        // When the actual library attaches its div and runs its initial effects.
        actDOM(() =>
            root.render(
                <LiveMarkdown
                    ref={ref}
                    parser={parser}
                />,
            ),
        );
        const input = host.querySelector('div');
        const commands = ref.current;
        if (!input || !commands) {
            throw new Error('Expected live-markdown host and commands');
        }

        // Then DOM identity and common commands exist while the producer leaves value absent.
        expect(commands).toBe(input);
        expect('value' in input).toBe(false);
        expect(parser).not.toHaveBeenCalled();
        input.textContent = 'unparsed';
        actDOM(() => commands.clear());
        expect(input.textContent).toBe('');
        expect('value' in input).toBe(false);
        actDOM(() => root.unmount());
    });

    it.each(['hello', undefined])('keeps web commands, absent native capabilities and clear order for value %s', (value) => {
        // Given an actual markdown div with either parsed text or the producer's omitted value.
        const input = webMarkdownInput(value);
        const onSelectionChange = jest.fn<ReturnType<NonNullable<ComposerProps['onSelectionChange']>>, Parameters<NonNullable<ComposerProps['onSelectionChange']>>>();
        const onClear = jest.fn<ReturnType<NonNullable<ComposerProps['onClear']>>, Parameters<NonNullable<ComposerProps['onClear']>>>();
        const ref = React.createRef<ComposerRef>();
        render(
            <WebComposer
                ref={ref}
                onSelectionChange={onSelectionChange}
                onClear={onClear}
            />,
            {createNodeMock: () => mockMarkdownInput},
        );
        const handle = ref.current;
        if (!handle) {
            throw new Error('Expected web Composer ref');
        }
        const blur = jest.spyOn(input, 'blur');
        const focus = jest.spyOn(input, 'focus');
        input.scrollTop = 23;

        // When common commands and the custom clear sequence execute.
        act(() => {
            handle.focus();
            handle.blur();
            handle.clear();
        });

        // Then clear precedes selection reset and a missing input value is normalized to an empty string.
        expect(focus).toHaveBeenCalledTimes(1);
        expect(blur).toHaveBeenCalledTimes(1);
        expect(handle.isFocused()).toBe(false);
        expect(handle.setSelection).toBeUndefined();
        expect(handle.setNativeProps).toBeUndefined();
        expect(handle.preventFocusOnFirstResponderOnce).toBeUndefined();
        expect('scrollTop' in handle && handle.scrollTop).toBe(23);
        expect(input.clear).toHaveBeenCalledTimes(1);
        expect(onSelectionChange).toHaveBeenCalledWith({nativeEvent: {selection: {start: 0, end: 0}}});
        expect(onClear).toHaveBeenCalledWith(value ?? '');
        const earlierCallOrder1 = input.clear.mock.invocationCallOrder.at(0);
        const laterCallOrder1 = onSelectionChange.mock.invocationCallOrder.at(0);
        if (earlierCallOrder1 === undefined || laterCallOrder1 === undefined) {
            throw new Error('Expected both invocation order values');
        }
        expect(earlierCallOrder1).toBeLessThan(laterCallOrder1);
        const earlierCallOrder2 = onSelectionChange.mock.invocationCallOrder.at(0);
        const laterCallOrder2 = onClear.mock.invocationCallOrder.at(0);
        if (earlierCallOrder2 === undefined || laterCallOrder2 === undefined) {
            throw new Error('Expected both invocation order values');
        }
        expect(earlierCallOrder2).toBeLessThan(laterCallOrder2);
        expect(markdownProps().selection).toEqual({start: 0, end: 0});
    });

    it('preserves raw native identity, top-level commands and non-null callback timing', () => {
        // Given the native markdown input owns the real input commands at its top level.
        const inputClear = jest.fn<ReturnType<TextInput['clear']>, Parameters<TextInput['clear']>>();
        const inputSetNativeProps = jest.fn<ReturnType<TextInput['setNativeProps']>, Parameters<TextInput['setNativeProps']>>();
        const inputPreventFocusOnFirstResponderOnce = jest.fn<ReturnType<TextInput['preventFocusOnFirstResponderOnce']>, Parameters<TextInput['preventFocusOnFirstResponderOnce']>>();
        const input = createMock<TextInput>({
            clear: inputClear,
            blur: jest.fn<ReturnType<TextInput['blur']>, Parameters<TextInput['blur']>>(),
            focus: jest.fn<ReturnType<TextInput['focus']>, Parameters<TextInput['focus']>>(),
            isFocused: () => false,
            setSelection: jest.fn<ReturnType<TextInput['setSelection']>, Parameters<TextInput['setSelection']>>(),
            setNativeProps: inputSetNativeProps,
            preventFocusOnFirstResponderOnce: inputPreventFocusOnFirstResponderOnce,
        });
        mockMarkdownInput = input;
        const callback = jest.fn<void, [ComposerRef | null]>();
        const view = render(<NativeComposer ref={callback} />, {createNodeMock: () => mockMarkdownInput});
        const ref = {current: input};

        // When native selection/update/first-responder operations and clear use that ref.
        input.clear();
        preventFirstResponder(ref);
        updateNativeTextInputValue({composerRef: ref, shouldForceNativeValueUpdate: true, text: 'draft'});
        updateNativeTextInputValue({composerRef: ref, shouldForceNativeValueUpdate: false, text: 'ignored'});
        view.unmount();

        // Then the callback exposes the same object and detachment does not add a null notification.
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(input);
        expect(inputClear).toHaveBeenCalledTimes(1);
        expect(inputPreventFocusOnFirstResponderOnce).toHaveBeenCalledTimes(1);
        expect(inputSetNativeProps).toHaveBeenCalledTimes(1);
        expect(inputSetNativeProps).toHaveBeenCalledWith({text: 'draft'});
    });

    it('keeps the landscape proxy focus suppression and object-ref behavior', () => {
        // Given native landscape mode suppresses programmatic focus through its existing proxy.
        const inputFocus = jest.fn<ReturnType<TextInput['focus']>, Parameters<TextInput['focus']>>();
        const inputClear = jest.fn<ReturnType<TextInput['clear']>, Parameters<TextInput['clear']>>();
        const input = createMock<TextInput>({
            focus: inputFocus,
            clear: inputClear,
            isFocused: () => false,
        });
        mockMarkdownInput = input;
        jest.mocked(useIsInLandscapeMode).mockReturnValue(true);
        const callback = jest.fn<void, [ComposerRef | null]>();
        render(
            <NativeComposer
                ref={callback}
                autoFocus
            />,
            {createNodeMock: () => mockMarkdownInput},
        );
        const proxy = callback.mock.calls.at(0)?.[0];
        if (!proxy) {
            throw new Error('Expected landscape proxy');
        }

        // When consumers request focus and clear, and a separate object ref is supplied.
        proxy.focus();
        proxy.clear();
        const objectRef = React.createRef<ComposerRef>();
        render(<NativeComposer ref={objectRef} />, {createNodeMock: () => mockMarkdownInput});

        // Then only focus is suppressed and the original object-ref behavior remains intact.
        expect(proxy).not.toBe(input);
        expect(inputFocus).not.toHaveBeenCalled();
        expect(inputClear).toHaveBeenCalledTimes(1);
        expect(markdownProps().autoFocus).toBe(false);
        expect(objectRef.current).toBeNull();
    });

    it('keeps the outer commands tied to the current input and safely handles an absent input', () => {
        // Given the outer handle exposes only the commands its consumers use.
        mockShouldUseNativeComposer = true;
        const firstBlur = jest.fn<ReturnType<TextInput['blur']>, Parameters<TextInput['blur']>>();
        const firstFocus = jest.fn<ReturnType<TextInput['focus']>, Parameters<TextInput['focus']>>();
        const firstSetSelection = jest.fn<ReturnType<TextInput['setSelection']>, Parameters<TextInput['setSelection']>>();
        const firstIsFocused = jest.fn<ReturnType<TextInput['isFocused']>, Parameters<TextInput['isFocused']>>(() => false);
        const first = createMock<TextInput>({blur: firstBlur, focus: firstFocus, isFocused: firstIsFocused, setSelection: firstSetSelection});
        const secondBlur = jest.fn<ReturnType<TextInput['blur']>, Parameters<TextInput['blur']>>();
        const second = createMock<TextInput>({blur: secondBlur, isFocused: () => false});
        mockMarkdownInput = first;
        const ref = React.createRef<ComposerWithSuggestionsRef>();
        const props = forwardingProps(ref);
        const view = render(<ComposerWithSuggestions {...props} />, {createNodeMock: () => mockMarkdownInput});
        const handle = ref.current;
        if (!handle) {
            throw new Error('Expected forwarding interface');
        }
        expect(Object.keys(handle)).toEqual(['focus', 'replaceSelectionWithText', 'getCurrentText', 'clearWorklet', 'resetHeight', 'blur', 'isFocused']);
        handle.focus(false, {start: 2, end: 4});
        handle.blur();
        expect(firstFocus).toHaveBeenCalledTimes(1);
        expect(firstSetSelection).toHaveBeenCalledWith(2, 4);
        expect(firstBlur).toHaveBeenCalledTimes(1);
        firstIsFocused.mockReturnValue(true);
        expect(handle.isFocused()).toBe(true);
        expect(ReportActionComposeFocusManager.composerRef.current).toBe(first);

        // When the input remounts, the retained handle uses the replacement input.
        mockMarkdownInput = second;
        view.rerender(
            <ComposerWithSuggestions
                {...props}
                inputPlaceholder="replacement"
            />,
        );
        handle.blur();

        // Then commands observe the current input and missing inputs are safe.
        expect(ReportActionComposeFocusManager.composerRef.current).toBe(second);
        expect(secondBlur).toHaveBeenCalledTimes(1);
        expect(firstBlur).toHaveBeenCalledTimes(1);
        expect(handle.isFocused()).toBe(false);
        mockShouldMountComposer = false;
        view.unmount();
        const absentRef = React.createRef<ComposerWithSuggestionsRef>();
        render(<ComposerWithSuggestions {...forwardingProps(absentRef)} />);
        const absent = absentRef.current;
        if (!absent) {
            throw new Error('Expected absent-input forwarding interface');
        }
        expect(() => absent.blur()).not.toThrow();
        expect(absent.isFocused()).toBe(false);
        expect(() => absent.focus()).not.toThrow();
        expect(Object.keys(absent)).toEqual(Object.keys(handle));
    });

    it('preserves native clear values and MIME-derived attachment filenames', async () => {
        // Given clipboard files without extensions rely on their MIME type, while plain text is ignored.
        mockMarkdownInput = createMock<TextInput>({isFocused: () => false});
        const onClear = jest.fn<ReturnType<NonNullable<ComposerProps['onClear']>>, Parameters<NonNullable<ComposerProps['onClear']>>>();
        const onPasteFile = jest.fn<ReturnType<NonNullable<ComposerProps['onPasteFile']>>, Parameters<NonNullable<ComposerProps['onPasteFile']>>>();
        render(
            <NativeComposer
                onClear={onClear}
                onPasteFile={onPasteFile}
            />,
            {createNodeMock: () => mockMarkdownInput},
        );
        const props = markdownProps();
        const paste = props.onPaste;
        const clear = props.onClear;
        if (!paste || !clear) {
            throw new Error('Expected native clear and paste callbacks');
        }

        // When native notifications pass through Composer without a ref wrapper.
        await act(async () => {
            clear(createMock<Parameters<typeof clear>[0]>({nativeEvent: {text: 'draft'}}));
            paste(createMock<Parameters<typeof paste>[0]>({nativeEvent: {items: [{type: 'text/plain', data: 'hello'}]}}));
            paste(createMock<Parameters<typeof paste>[0]>({nativeEvent: {items: [{type: 'image/png', data: 'file:///photo'}]}}));
            await Promise.resolve();
        });

        // Then text absence is not coerced and the attachment keeps its MIME-derived extension and observed size.
        expect(onClear).toHaveBeenCalledWith('draft');
        expect(onPasteFile).toHaveBeenCalledTimes(1);
        expect(onPasteFile).toHaveBeenCalledWith({uri: 'file:///photo', name: 'photo.png', type: 'image/png', size: 7});
    });

    it.each([
        {browser: CONST.BROWSER.CHROME, isComposing: true, keyCode: 13, mobile: false, calls: 0},
        {browser: CONST.BROWSER.SAFARI, isComposing: false, keyCode: 229, mobile: false, calls: 0},
        {browser: CONST.BROWSER.CHROME, isComposing: true, keyCode: 13, mobile: true, calls: 1},
        {browser: CONST.BROWSER.CHROME, isComposing: false, keyCode: 13, mobile: false, calls: 1},
    ])('preserves nativeEvent IME handling for $browser/$keyCode/mobile=$mobile', ({browser, isComposing, keyCode, mobile, calls}) => {
        // Given the input owns a real native KeyboardEvent in its React Native notification.
        webMarkdownInput('text');
        jest.mocked(getBrowser).mockReturnValue(browser);
        jest.mocked(isMobileChrome).mockReturnValue(mobile);
        const onKeyPress = jest.fn<ReturnType<NonNullable<ComposerProps['onKeyPress']>>, Parameters<NonNullable<ComposerProps['onKeyPress']>>>();
        render(<WebComposer onKeyPress={onKeyPress} />, {createNodeMock: () => mockMarkdownInput});
        const event = createMock<TextInputKeyPressEvent>({nativeEvent: new KeyboardEvent('keydown', {key: 'Enter', isComposing, keyCode})});

        // When Enter is delivered through the actual web Composer handler and unchanged IME helper.
        act(() => markdownProps().onKeyPress?.(event));

        // Then IME confirmation is suppressed except for the helper's mobile Chrome behavior.
        expect(onKeyPress).toHaveBeenCalledTimes(calls);
        if (calls) {
            expect(onKeyPress).toHaveBeenCalledWith(event);
        }
    });

    it('retains paste ownership for another input and accepts attachments from the composer itself', () => {
        // Given the active composer and another real input share the document paste listener.
        const input = webMarkdownInput('text');
        input.focus();
        const onPasteFile = jest.fn<ReturnType<NonNullable<ComposerProps['onPasteFile']>>, Parameters<NonNullable<ComposerProps['onPasteFile']>>>();
        render(
            <WebComposer
                checkComposerVisibility={() => true}
                onPasteFile={onPasteFile}
            />,
            {createNodeMock: () => mockMarkdownInput},
        );
        const other = document.createElement('textarea');
        document.body.appendChild(other);
        const file = new File(['photo'], 'photo.png', {type: 'image/png'});
        const otherEvent = new Event('paste', {bubbles: true, cancelable: true});
        Object.defineProperty(otherEvent, 'clipboardData', {value: {files: [file], types: [], getData: () => ''}});
        const ownEvent = new Event('paste', {bubbles: true, cancelable: true});
        Object.defineProperty(ownEvent, 'clipboardData', {value: {files: [file], types: [], getData: () => ''}});

        // When the paste target belongs first to the other input and then to the raw markdown div.
        act(() => other.dispatchEvent(otherEvent));
        expect(onPasteFile).not.toHaveBeenCalled();
        expect(otherEvent.defaultPrevented).toBe(false);
        act(() => input.dispatchEvent(ownEvent));

        // Then ownership preserves other input paste while handling the composer's attachment once.
        expect(ownEvent.defaultPrevented).toBe(true);
        expect(onPasteFile).toHaveBeenCalledWith([file]);
    });

    it('retains caret coordinates on real selection notifications', () => {
        // Given layout belongs to the raw markdown div and the current browser range.
        const input = webMarkdownInput('text');
        input.textContent = 'text';
        input.scrollTop = 8;
        const range = document.createRange();
        range.selectNodeContents(input);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        const rectsDescriptor = Object.getOwnPropertyDescriptor(Range.prototype, 'getClientRects');
        Object.defineProperty(Range.prototype, 'getClientRects', {
            configurable: true,
            value: () => {
                const rects = createMock<DOMRectList>({length: 1});
                Object.defineProperty(rects, 0, {value: createMock<DOMRect>({left: 20, top: 40, height: 10}), enumerable: true, configurable: true, writable: true});
                return rects;
            },
        });
        jest.spyOn(input, 'getBoundingClientRect').mockReturnValue(createMock<DOMRect>({left: 5, top: 10}));
        const changed = jest.fn<ReturnType<NonNullable<ComposerProps['onSelectionChange']>>, Parameters<NonNullable<ComposerProps['onSelectionChange']>>>();
        render(
            <WebComposer
                shouldCalculateCaretPosition
                onSelectionChange={changed}
            />,
            {createNodeMock: () => mockMarkdownInput},
        );
        const event = createMock<TextInputSelectionChangeEvent>({nativeEvent: {selection: {start: 1, end: 2}}});

        // When the actual Composer adds relative caret geometry to a real notification.
        act(() => markdownProps().onSelectionChange?.(event));

        // Then selection indices and geometry both reach consumers.
        expect(changed).toHaveBeenCalledWith(expect.objectContaining({nativeEvent: {selection: {start: 1, end: 2, positionX: 15 - CONST.SPACE_CHARACTER_WIDTH, positionY: 33}}}));
        if (rectsDescriptor) {
            Object.defineProperty(Range.prototype, 'getClientRects', rectsDescriptor);
        } else {
            Reflect.deleteProperty(Range.prototype, 'getClientRects');
        }
    });

    it('clears the current animated web handle after replacement and retains native dispatch', () => {
        // Given Reanimated stores the actual public Composer object in its current field.
        const first = webMarkdownInput('first');
        const ref = React.createRef<ComposerWithSuggestionsRef>();
        const props = forwardingProps(ref);
        const view = render(<ComposerWithSuggestions {...props} />, {createNodeMock: () => mockMarkdownInput});
        const retainedHandle = ref.current;
        if (!retainedHandle) {
            throw new Error('Expected retained forwarding interface');
        }
        const firstHandle = ReportActionComposeFocusManager.composerRef.current;
        expect(firstHandle).toBe(ReportActionComposeFocusManager.composerRef.current);
        expect(firstHandle).not.toBeNull();
        const second = webMarkdownInput('second');

        // When the real child is reattached before the existing clearWorklet executes.
        view.rerender(
            <ComposerWithSuggestions
                {...props}
                inputPlaceholder="replacement"
            />,
        );
        const handle = ref.current;
        if (!handle) {
            throw new Error('Expected forwarding interface');
        }
        const focus = jest.spyOn(second, 'focus');
        act(() => retainedHandle.focus());
        expect(focus).toHaveBeenCalledTimes(1);
        act(() => handle.clearWorklet());
        const {result} = renderHook(() => jest.requireActual<typeof UseAnimatedRefModule>('react-native-reanimated/src/hook/useAnimatedRef.ts').useAnimatedRef<ComposerRef>());
        act(() => result.current(ReportActionComposeFocusManager.composerRef.current));
        clearNativeInput(result.current);

        // Then current-ref clearing uses the replacement and native clearing still dispatches the same ref.
        expect(first.clear).not.toHaveBeenCalled();
        expect(second.clear).toHaveBeenCalledTimes(1);
        expect(ReportActionComposeFocusManager.composerRef.current).not.toBe(firstHandle);
        expect(dispatchCommand).toHaveBeenCalledWith(result.current, 'clear');
        expect(mockResetScroll).toHaveBeenCalledTimes(1);
        result.current.current = null;
        expect(() => clearWebInput(result.current)).not.toThrow();
    });
});

const hiddenModal = {} satisfies Modal;

describe('composerFocusKeepFocusOn actual focus commands', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Onyx, 'set').mockResolvedValue();
        jest.spyOn(ReportActionComposeFocusManager, 'isFocused').mockReturnValue(false);
        // The focused branch intentionally saves null without an immediate invocation when Onyx is already focused.
        composerFocusKeepFocusOn(null, true, hiddenModal, true);
    });
    afterEach(() => jest.restoreAllMocks());

    it('updates Onyx before immediate focus and safely skips a missing ref', () => {
        // Given the helper consumes only a focus command, not a DOM element.
        const ref = {focus: jest.fn<ReturnType<TextInput['focus']>, Parameters<TextInput['focus']>>()} satisfies NonNullable<Parameters<typeof composerFocusKeepFocusOn>[0]>;

        // When initial focus executes and a missing ref reaches the same immediate branch.
        composerFocusKeepFocusOn(ref, true, hiddenModal, false);
        expect(() => composerFocusKeepFocusOn(null, true, hiddenModal, false)).not.toThrow();

        // Then both calls update Onyx first, while only the real command object focuses.
        expect(Onyx.set).toHaveBeenNthCalledWith(1, ONYXKEYS.INPUT_FOCUSED, true);
        expect(Onyx.set).toHaveBeenNthCalledWith(2, ONYXKEYS.INPUT_FOCUSED, true);
        expect(ref.focus).toHaveBeenCalledTimes(1);
        const earlierCallOrder3 = jest.mocked(Onyx.set).mock.invocationCallOrder.at(0);
        const laterCallOrder3 = ref.focus.mock.invocationCallOrder.at(0);
        if (earlierCallOrder3 === undefined || laterCallOrder3 === undefined) {
            throw new Error('Expected both invocation order values');
        }
        expect(earlierCallOrder3).toBeLessThan(laterCallOrder3);
    });

    it('defers focus against the latest saved command object and respects modal/manager gates', () => {
        // Given a saved composer loses focus while all modals are hidden.
        const first = {focus: jest.fn<ReturnType<TextInput['focus']>, Parameters<TextInput['focus']>>()};
        const second = {focus: jest.fn<ReturnType<TextInput['focus']>, Parameters<TextInput['focus']>>()};
        composerFocusKeepFocusOn(first, true, hiddenModal, true);
        composerFocusKeepFocusOn(null, false, {isVisible: true}, false);
        composerFocusKeepFocusOn(null, false, {willAlertModalBecomeVisible: true}, false);
        expect(TransitionTracker.runAfterTransitions).not.toHaveBeenCalled();

        // When restoration is queued and another composer replaces the saved ref before transitions finish.
        composerFocusKeepFocusOn(null, false, hiddenModal, false);
        composerFocusKeepFocusOn(second, true, hiddenModal, true);
        const deferred = jest.mocked(TransitionTracker.runAfterTransitions).mock.calls.at(0)?.[0];
        if (!deferred?.callback) {
            throw new Error('Expected deferred focus');
        }
        deferred.callback();

        // Then the latest object focuses. An already focused manager clears the saved object and prevents later restoration.
        expect(first.focus).not.toHaveBeenCalled();
        expect(second.focus).toHaveBeenCalledTimes(1);
        jest.mocked(ReportActionComposeFocusManager.isFocused).mockReturnValue(true);
        composerFocusKeepFocusOn(null, false, hiddenModal, false);
        jest.mocked(ReportActionComposeFocusManager.isFocused).mockReturnValue(false);
        composerFocusKeepFocusOn(null, false, hiddenModal, false);
        expect(TransitionTracker.runAfterTransitions).toHaveBeenCalledTimes(1);
    });
});
