import {createContext, use} from 'react';
import type {RefObject} from 'react';
import type {GestureResponderEvent, View} from 'react-native';

/** Registry entry written by focusable rows on mount. */
type FocusableItem = {
    ref: RefObject<View | null>;
    isDisabled: boolean;
    onActivate: (event?: GestureResponderEvent | KeyboardEvent) => void;
};

/** Navigation state — changes when the user enters/exits a `<Sub>`. */
type ContentNavigationValue = {
    currentSubID: string | null;
    /** Ancestor chain of `currentSubID`; empty at root. */
    currentSubAncestorChain: readonly string[];
};

/** Focus state. Split from navigation so focus changes don't re-render navigation-only consumers. */
type ContentFocusValue = {
    focusedID: string | null;
};

type ContentActionsValue = {
    /** Caller passes the entered Sub's own ancestor chain so `currentSubAncestorChain` stays in sync. */
    enterSub: (id: string, ancestorChain: readonly string[]) => void;
    /** Pop to the given sub id; default `null` pops to root. */
    exitSub: (target?: string | null) => void;
    registerSub: (subID: string) => void;
    /** Pops state to the nearest still-mounted ancestor in the chain (or root) when an active `<Sub>` unmounts. */
    unregisterSub: (subID: string, ancestorChain: readonly string[]) => void;
    registerItem: (id: string, item: FocusableItem) => void;
    unregisterItem: (id: string) => void;
    setFocusedID: (id: string | null) => void;
    /**
     * Atomically hides the popover and resets navigation/focus to the root level. Use this
     * instead of `useRootActions().setIsVisible(false)` so that the next open lands at the top
     * level.
     */
    close: () => void;
};

const ContentNavigationContext = createContext<ContentNavigationValue | null>(null);
ContentNavigationContext.displayName = 'PopoverMenuContentNavigationContext';

const ContentFocusContext = createContext<ContentFocusValue | null>(null);
ContentFocusContext.displayName = 'PopoverMenuContentFocusContext';

const ContentActionsContext = createContext<ContentActionsValue | null>(null);
ContentActionsContext.displayName = 'PopoverMenuContentActionsContext';

function useContentNavigation(): ContentNavigationValue {
    const value = use(ContentNavigationContext);
    if (!value) {
        throw new Error('PopoverMenu hook used outside <PopoverMenu.Content>');
    }
    return value;
}

function useContentFocus(): ContentFocusValue {
    const value = use(ContentFocusContext);
    if (!value) {
        throw new Error('PopoverMenu hook used outside <PopoverMenu.Content>');
    }
    return value;
}

function useContentActions(): ContentActionsValue {
    const value = use(ContentActionsContext);
    if (!value) {
        throw new Error('PopoverMenu hook used outside <PopoverMenu.Content>');
    }
    return value;
}

export {ContentNavigationContext, ContentFocusContext, ContentActionsContext, useContentNavigation, useContentFocus, useContentActions};
export type {ContentNavigationValue, ContentFocusValue, ContentActionsValue, FocusableItem};
