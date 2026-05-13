import type {RefObject} from 'react';
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

// Hot — changes on every keystroke
type ComposerText = string;

// Warm — changes on interaction
type ComposerState = {
    isFocused: boolean;
    isMenuVisible: boolean;
    isFullComposerAvailable: boolean;
};

// Warm — changes based on content + policy
type ComposerSendState = {
    isSendDisabled: boolean;
    exceededMaxLength: number | null;
    hasExceededMaxTaskTitleLength: boolean;
    isBlockedFromConcierge: boolean;
};

// Frozen — stable references, never changes after mount
type ComposerActions = {
    setText: (v: string) => void;
    setMenuVisibility: (v: boolean) => void;
    setIsFullComposerAvailable: (v: boolean) => void;
    setComposerRef: (ref: ComposerRef | null) => void;
    focus: () => void;
    onBlur: (event: BlurEvent) => void;
    onFocus: () => void;
    onAddActionPressed: () => void;
    onItemSelected: () => void;
    onTriggerAttachmentPicker: () => void;
    clearComposer: () => void;
};

// Infrequent — changes only when send logic changes
type ComposerSendActions = {
    handleSendMessage: () => void;
    onValueChange: (value: string) => void;
};

// Frozen — stable refs, set once
type ComposerMeta = {
    containerRef: RefObject<View | null>;
    composerRef: RefObject<ComposerRef | null>;
    suggestionsRef: RefObject<SuggestionsRef | null>;
    actionButtonRef: RefObject<View | HTMLDivElement | null>;
    isNextModalWillOpenRef: RefObject<boolean>;
    attachmentFileRef: RefObject<FileObject | FileObject[] | null>;
};

const noop = () => {};

const ComposerTextContext = createContext<ComposerText>('');

const defaultState: ComposerState = {
    isFocused: false,
    isMenuVisible: false,
    isFullComposerAvailable: false,
};
const ComposerStateContext = createContext<ComposerState>(defaultState);

const defaultSendState: ComposerSendState = {
    isSendDisabled: true,
    exceededMaxLength: null,
    hasExceededMaxTaskTitleLength: false,
    isBlockedFromConcierge: false,
};
const ComposerSendStateContext = createContext<ComposerSendState>(defaultSendState);

const defaultActions: ComposerActions = {
    setText: noop,
    setMenuVisibility: noop,
    setIsFullComposerAvailable: noop,
    setComposerRef: noop,
    focus: noop,
    onBlur: noop,
    onFocus: noop,
    onAddActionPressed: noop,
    onItemSelected: noop,
    onTriggerAttachmentPicker: noop,
    clearComposer: noop,
};
const ComposerActionsContext = createContext<ComposerActions>(defaultActions);

const defaultSendActions: ComposerSendActions = {
    handleSendMessage: noop,
    onValueChange: noop,
};
const ComposerSendActionsContext = createContext<ComposerSendActions>(defaultSendActions);

const ComposerMetaContext = createContext<ComposerMeta | null>(null);

function useComposerText() {
    return useContext(ComposerTextContext);
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

function useComposerSendActions() {
    return useContext(ComposerSendActionsContext);
}

function useComposerMeta() {
    const ctx = useContext(ComposerMetaContext);
    if (!ctx) {
        throw new Error('useComposerMeta must be used inside ComposerProvider');
    }
    return ctx;
}

export {
    ComposerTextContext,
    ComposerStateContext,
    ComposerSendStateContext,
    ComposerActionsContext,
    ComposerSendActionsContext,
    ComposerMetaContext,
    useComposerText,
    useComposerState,
    useComposerSendState,
    useComposerActions,
    useComposerSendActions,
    useComposerMeta,
};
export type {SuggestionsRef, ComposerText, ComposerState, ComposerSendState, ComposerActions, ComposerSendActions, ComposerMeta};
