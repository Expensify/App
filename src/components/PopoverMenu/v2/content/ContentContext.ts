import {createContext, use} from 'react';
import type {RefObject} from 'react';
import type {GestureResponderEvent, View} from 'react-native';

type FocusableItem = {
    ref: RefObject<View | null>;
    isDisabled: boolean;
    onActivate: (event?: GestureResponderEvent | KeyboardEvent) => void;
};

type ContentNavigationValue = {
    currentSubID: string | null;
    currentSubAncestorChain: readonly string[];
};

// Split from navigation so focus changes don't re-render navigation-only consumers.
type ContentFocusValue = {
    focusedID: string | null;
};

type ContentActionsValue = {
    enterSub: (id: string, ancestorChain: readonly string[]) => void;
    /** `null` pops to root. */
    exitSub: (target?: string | null) => void;
    registerSub: (subID: string) => void;
    /** Pops to the nearest still-mounted ancestor when an active sub unmounts. */
    unregisterSub: (subID: string, ancestorChain: readonly string[]) => void;
    registerItem: (id: string, item: FocusableItem) => void;
    unregisterItem: (id: string) => void;
    setFocusedID: (id: string | null) => void;
    /** Use instead of `setIsVisible(false)` so the next open lands at root. */
    close: () => void;
};

const ContentNavigationContext = createContext<ContentNavigationValue | null>(null);
ContentNavigationContext.displayName = 'PopoverMenuContentNavigationContext';

const ContentFocusContext = createContext<ContentFocusValue | null>(null);
ContentFocusContext.displayName = 'PopoverMenuContentFocusContext';

const ContentActionsContext = createContext<ContentActionsValue | null>(null);
ContentActionsContext.displayName = 'PopoverMenuContentActionsContext';

function useContentNavigation(componentName: string): ContentNavigationValue {
    const value = use(ContentNavigationContext);
    if (!value) {
        throw new Error(`<${componentName}> must be rendered inside <PopoverMenu.Content>.`);
    }
    return value;
}

function useContentFocus(componentName: string): ContentFocusValue {
    const value = use(ContentFocusContext);
    if (!value) {
        throw new Error(`<${componentName}> must be rendered inside <PopoverMenu.Content>.`);
    }
    return value;
}

function useContentActions(componentName: string): ContentActionsValue {
    const value = use(ContentActionsContext);
    if (!value) {
        throw new Error(`<${componentName}> must be rendered inside <PopoverMenu.Content>.`);
    }
    return value;
}

export {ContentNavigationContext, ContentFocusContext, ContentActionsContext, useContentNavigation, useContentFocus, useContentActions};
export type {ContentNavigationValue, ContentFocusValue, ContentActionsValue, FocusableItem};
