import type {ReactNode, RefObject} from 'react';
import {createContext, useContext} from 'react';
import type {BlurEvent, TextInputSelectionChangeEvent, View} from 'react-native';
import type {Emoji} from '@assets/emojis/types';
import type {Mention} from '@components/MentionSuggestions';
import type {FileObject} from '@src/types/utils/Attachment';
import type {ComposerRef} from './ComposerWithSuggestions/ComposerWithSuggestions';

type SuggestionsRef = {
    resetSuggestions: () => void;
    onSelectionChange?: (event: TextInputSelectionChangeEvent) => void;
    triggerHotkeyActions: (event: KeyboardEvent) => boolean | undefined;
    updateShouldShowSuggestionMenuToFalse: (shouldShowSuggestionMenu?: boolean) => void;
    setShouldBlockSuggestionCalc: (shouldBlock: boolean) => void;
    getSuggestions: () => Mention[] | Emoji[];
    getIsSuggestionsMenuVisible: () => boolean;
};

type ComposerState = {
    isFocused: boolean;
    isFullComposerAvailable: boolean;
    isComposerFullSize: boolean;
    isMenuVisible: boolean;
};

type ComposerSendState = {
    isEmpty: boolean;
    exceededMaxLength: number | null;
    isSendDisabled: boolean;
    isBlockedFromConcierge: boolean;
    hasExceededMaxTaskTitleLength: boolean;
};

type ComposerActions = {
    setIsFocused: (v: boolean) => void;
    setIsFullComposerAvailable: (v: boolean) => void;
    setMenuVisibility: (v: boolean) => void;
    setValue: (v: string) => void;
    handleSendMessage: () => void;
    focus: () => void;
    onValueChange: (value: string) => void;
    validateMaxLength: (value: string) => boolean;
    debouncedValidate: {
        (value: string): boolean | undefined;
        cancel: () => void;
        flush: () => boolean | undefined;
    };
};

type ComposerInternalsData = {
    composerRef: RefObject<ComposerRef | null>;
    suggestionsRef: RefObject<SuggestionsRef | null>;
    actionButtonRef: RefObject<View | HTMLDivElement | null>;
    isNextModalWillOpenRef: RefObject<boolean>;
    shouldFocusComposerOnScreenFocus: boolean;
    shouldShowComposeInput: boolean;
    isAttachmentPreviewActive: boolean;
    userBlockedFromConcierge: boolean;
    PDFValidationComponent: ReactNode;
    ErrorModal: ReactNode;
};

type ComposerInternalsActions = {
    setComposerRef: (ref: ComposerRef | null) => void;
    onBlur: (event: BlurEvent) => void;
    onFocus: () => void;
    onAddActionPressed: () => void;
    onItemSelected: () => void;
    onTriggerAttachmentPicker: () => void;
    submitForm: (newComment: string) => void;
    addAttachment: (file: FileObject | FileObject[]) => void;
    onAttachmentPreviewClose: () => void;
    setIsAttachmentPreviewActive: (isActive: boolean) => void;
    onReceiptDropped: (event: DragEvent) => void;
    validateAttachments: (args: {dragEvent?: DragEvent; files?: FileObject | FileObject[]}) => void;
};

const defaultState: ComposerState = {
    isFocused: false,
    isFullComposerAvailable: false,
    isComposerFullSize: false,
    isMenuVisible: false,
};

const defaultSendState: ComposerSendState = {
    isEmpty: true,
    exceededMaxLength: null,
    isSendDisabled: true,
    isBlockedFromConcierge: false,
    hasExceededMaxTaskTitleLength: false,
};

const noop = () => {};
const defaultActions: ComposerActions = {
    setIsFocused: noop,
    setIsFullComposerAvailable: noop,
    setMenuVisibility: noop,
    setValue: noop,
    handleSendMessage: noop,
    focus: noop,
    onValueChange: noop,
    validateMaxLength: () => true,
    debouncedValidate: Object.assign(() => true as boolean | undefined, {cancel: noop, flush: () => true as boolean | undefined}),
};

const ComposerValueContext = createContext<string>('');
const ComposerStateContext = createContext<ComposerState>(defaultState);
const ComposerSendStateContext = createContext<ComposerSendState>(defaultSendState);
const ComposerActionsContext = createContext<ComposerActions>(defaultActions);
const ComposerInternalsDataContext = createContext<ComposerInternalsData | null>(null);
const ComposerInternalsActionsContext = createContext<ComposerInternalsActions | null>(null);

function useComposerValue() {
    return useContext(ComposerValueContext);
}

function useComposerState() {
    return useContext(ComposerStateContext);
}

function useComposerSendState() {
    return useContext(ComposerSendStateContext);
}

function useComposerActions() {
    return useContext(ComposerActionsContext);
}

function useComposerInternalsData() {
    const ctx = useContext(ComposerInternalsDataContext);
    if (!ctx) {
        throw new Error('useComposerInternalsData must be used inside ComposerProvider');
    }
    return ctx;
}

function useComposerInternalsActions() {
    const ctx = useContext(ComposerInternalsActionsContext);
    if (!ctx) {
        throw new Error('useComposerInternalsActions must be used inside ComposerProvider');
    }
    return ctx;
}

export {
    ComposerValueContext,
    ComposerStateContext,
    ComposerSendStateContext,
    ComposerActionsContext,
    ComposerInternalsDataContext,
    ComposerInternalsActionsContext,
    useComposerValue,
    useComposerState,
    useComposerSendState,
    useComposerActions,
    useComposerInternalsData,
    useComposerInternalsActions,
};
export type {SuggestionsRef, ComposerState, ComposerSendState, ComposerActions, ComposerInternalsData, ComposerInternalsActions};
