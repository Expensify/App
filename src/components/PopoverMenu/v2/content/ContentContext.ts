import type {RefObject} from 'react';
import type {View} from 'react-native';
import createContextNamespace from '@hooks/createContextNamespace';

type FocusableItem = {
    ref: RefObject<View | null>;
    isDisabled: boolean;
    onActivate: () => void;
    text?: string;
};

type ContentState = {
    readonly focusedID: string | null;
    readonly currentSubID: string | null;
    readonly isAncestorOfCurrent: (subID: string) => boolean;
};

type ContentActions = {
    readonly enterSub: (id: string, level: number) => void;
    readonly exitSub: (target?: string | null) => void;
    readonly registerSub: (subID: string) => void;
    readonly unregisterSub: (subID: string) => void;
    readonly registerItem: (id: string, item: FocusableItem) => void;
    readonly unregisterItem: (id: string) => void;
    readonly setFocusedID: (id: string | null) => void;
    readonly close: () => void;
};

type ContentContextValue = {
    readonly state: ContentState;
    readonly actions: ContentActions;
};

const [ContentContext, useContent] = createContextNamespace('PopoverMenu.Content')<ContentContextValue>();

export {ContentContext, useContent};
export type {ContentActions, ContentContextValue, ContentState, FocusableItem};
