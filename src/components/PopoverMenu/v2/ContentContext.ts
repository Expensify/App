import {createContext, use} from 'react';
import type {RefObject} from 'react';
import type {GestureResponderEvent, View} from 'react-native';
import type {AnchorPosition} from '@src/styles';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';

/** Registry entry written by `<Item>`, `<SubTrigger>`, and SubContent's back button on mount. */
type FocusableItem = {
    ref: RefObject<View | null>;
    isDisabled: boolean;
    onActivate: (event?: GestureResponderEvent | KeyboardEvent) => void;
};

type ContentStateValue = {
    state: {
        currentSubId: string | null;
        focusedId: string | null;
    };
    meta: {
        anchorPosition: AnchorPosition | null;
        anchorAlignment: AnchorAlignment | undefined;
    };
};

type ContentActionsValue = {
    enterSub: (id: string) => void;
    /** Pop to the given sub id; default `null` pops to root. */
    exitSub: (target?: string | null) => void;
    registerItem: (id: string, item: FocusableItem) => void;
    unregisterItem: (id: string) => void;
    setFocusedId: (id: string | null) => void;
};

const ContentStateContext = createContext<ContentStateValue | null>(null);
ContentStateContext.displayName = 'PopoverMenuContentStateContext';

const ContentActionsContext = createContext<ContentActionsValue | null>(null);
ContentActionsContext.displayName = 'PopoverMenuContentActionsContext';

function useContentState(consumerName = 'usePopoverMenuContentState'): ContentStateValue {
    const value = use(ContentStateContext);
    if (!value) {
        throw new Error(`\`${consumerName}\` must be called inside <PopoverMenu.Content>`);
    }
    return value;
}

function useContentActions(consumerName = 'usePopoverMenuContentActions'): ContentActionsValue {
    const value = use(ContentActionsContext);
    if (!value) {
        throw new Error(`\`${consumerName}\` must be called inside <PopoverMenu.Content>`);
    }
    return value;
}

export {ContentStateContext, ContentActionsContext, useContentState, useContentActions};
export type {ContentStateValue, ContentActionsValue, FocusableItem};
