import {createContext, use} from 'react';
import type {RefObject} from 'react';
import type {GestureResponderEvent, View} from 'react-native';

type FocusableItem = {
    ref: RefObject<View | null>;
    isDisabled: boolean;
    onActivate: (event?: GestureResponderEvent | KeyboardEvent) => void;
};

type ContentNavigation = {
    currentSubID: string | null;
    isAncestorOfCurrent: (subID: string) => boolean;
};

// Split from navigation so focus changes don't re-render navigation-only consumers.
type ContentFocus = {
    focusedID: string | null;
};

type ContentSubActions = {
    enterSub: (id: string) => void;
    /** `null` pops to root. */
    exitSub: (target?: string | null) => void;
    registerSub: (subID: string, parentSubID: string | null) => void;
    /** Pops to the nearest still-mounted ancestor when an active sub unmounts. */
    unregisterSub: (subID: string) => void;
};

type ContentItemActions = {
    registerItem: (id: string, item: FocusableItem) => void;
    unregisterItem: (id: string) => void;
    setFocusedID: (id: string | null) => void;
};

/** Use instead of `setIsVisible(false)` so the next open lands at root. */
type ContentClose = () => void;

const ContentNavigationContext = createContext<ContentNavigation | null>(null);
ContentNavigationContext.displayName = 'PopoverMenuContentNavigationContext';

const ContentFocusContext = createContext<ContentFocus | null>(null);
ContentFocusContext.displayName = 'PopoverMenuContentFocusContext';

const ContentSubActionsContext = createContext<ContentSubActions | null>(null);
ContentSubActionsContext.displayName = 'PopoverMenuContentSubActionsContext';

const ContentItemActionsContext = createContext<ContentItemActions | null>(null);
ContentItemActionsContext.displayName = 'PopoverMenuContentItemActionsContext';

const ContentCloseContext = createContext<ContentClose | null>(null);
ContentCloseContext.displayName = 'PopoverMenuContentCloseContext';

function useContentNavigation(componentName: string): ContentNavigation {
    const value = use(ContentNavigationContext);
    if (!value) {
        throw new Error(`<${componentName}> must be rendered inside <PopoverMenu.Content>.`);
    }
    return value;
}

function useContentFocus(componentName: string): ContentFocus {
    const value = use(ContentFocusContext);
    if (!value) {
        throw new Error(`<${componentName}> must be rendered inside <PopoverMenu.Content>.`);
    }
    return value;
}

function useContentSubActions(componentName: string): ContentSubActions {
    const value = use(ContentSubActionsContext);
    if (!value) {
        throw new Error(`<${componentName}> must be rendered inside <PopoverMenu.Content>.`);
    }
    return value;
}

function useContentItemActions(componentName: string): ContentItemActions {
    const value = use(ContentItemActionsContext);
    if (!value) {
        throw new Error(`<${componentName}> must be rendered inside <PopoverMenu.Content>.`);
    }
    return value;
}

function useContentClose(componentName: string): ContentClose {
    const value = use(ContentCloseContext);
    if (value === null) {
        throw new Error(`<${componentName}> must be rendered inside <PopoverMenu.Content>.`);
    }
    return value;
}

/** Hierarchy throw for passthrough components that touch no Content state. */
function useAssertInsideContent(componentName: string): void {
    useContentSubActions(componentName);
}

export {
    ContentNavigationContext,
    ContentFocusContext,
    ContentSubActionsContext,
    ContentItemActionsContext,
    ContentCloseContext,
    useContentNavigation,
    useContentFocus,
    useContentSubActions,
    useContentItemActions,
    useContentClose,
    useAssertInsideContent,
};
export type {ContentNavigation, ContentFocus, ContentSubActions, ContentItemActions, ContentClose, FocusableItem};
