import type {Dispatch, SetStateAction} from 'react';
import type {AnchorNode, AnchorRect} from '@components/Overlay/libs/measureAnchor';
import createContextNamespace from '@hooks/createContextNamespace';

type PopoverAnchorNode = AnchorNode;

type PopoverContentRole = 'menu' | 'tooltip' | 'region' | 'dialog';

type PopoverState = {
    readonly isOpen: boolean;
    readonly anchor: PopoverAnchorNode | null;
    readonly anchorRect: AnchorRect | null;
    readonly hasCustomAnchor: boolean;
    readonly contentRole: PopoverContentRole | null;
};

type PopoverActions = {
    readonly setOpen: Dispatch<SetStateAction<boolean>>;
    readonly open: () => void;
    readonly close: () => void;
    readonly toggle: () => void;
    readonly setTriggerAnchor: (node: PopoverAnchorNode | null | undefined) => void;
    readonly setCustomAnchor: (node: PopoverAnchorNode | null | undefined) => void;
    readonly setAnchorRect: (rect: AnchorRect | null) => void;
    readonly setContentRole: (role: PopoverContentRole | null) => void;
};

type PopoverMeta = {
    readonly triggerID: string;
    readonly contentID: string;
};

type PopoverContextValue = {
    readonly state: PopoverState;
    readonly actions: PopoverActions;
    readonly meta: PopoverMeta;
};

const createPopoverContext = createContextNamespace('Popover.Root');
const [PopoverContext, usePopover] = createPopoverContext<PopoverContextValue>();

export {PopoverContext, usePopover};
export type {PopoverContextValue, PopoverState, PopoverActions, PopoverMeta, PopoverAnchorNode, PopoverContentRole};
