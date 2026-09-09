import createContextNamespace from '@hooks/createContextNamespace';

import type {Dispatch, RefObject, SetStateAction} from 'react';
import type {View} from 'react-native';

type AnchorRef = RefObject<View | null>;

type AnchorRect = {x: number; y: number; width: number; height: number};

type ActiveAnchor = {
    ref: AnchorRef;
    rect: AnchorRect;
};

type RootVisibility = {isVisible: boolean};

type RootMeta = {
    activeAnchor: ActiveAnchor | null;
    /** Stable id linking Trigger ↔ Content for `accessibilityLabelledBy` / `aria-controls`. */
    triggerID: string;
    /** Stable id on Content's surface so triggers can advertise `aria-controls`. */
    contentID: string;
};

type RootActions = {
    setIsVisible: Dispatch<SetStateAction<boolean>>;
    /** Never-null: reset happens via `setIsVisible(false)` and the next press overwrites. */
    setActiveAnchor: (anchor: ActiveAnchor) => void;
};

const createRootContext = createContextNamespace('PopoverMenu.Root');

const [RootVisibilityContext, useRootVisibility] = createRootContext<RootVisibility>('Visibility');
const [RootMetaContext, useRootMeta] = createRootContext<RootMeta>('Meta');
const [RootActionsContext, useRootActions] = createRootContext<RootActions>('Actions');

export {RootVisibilityContext, RootMetaContext, RootActionsContext, useRootVisibility, useRootMeta, useRootActions};
export type {ActiveAnchor, AnchorRect, AnchorRef, RootVisibility, RootMeta, RootActions};
