import type {Dispatch, SetStateAction} from 'react';
import type {AnchorNode, AnchorRect} from '@components/Overlay/libs/measureAnchor';
import createContextNamespace from '@hooks/createContextNamespace';

type ActiveAnchor = {node: AnchorNode; rect: AnchorRect};

type RootState = {
    readonly isOpen: boolean;
    readonly activeAnchor: ActiveAnchor | null;
};

type RootActions = {
    readonly setOpen: Dispatch<SetStateAction<boolean>>;
    readonly open: () => void;
    readonly close: () => void;
    readonly toggle: () => void;
    readonly setActiveAnchor: (anchor: ActiveAnchor) => void;
};

type RootMeta = {
    readonly triggerID: string;
    readonly contentID: string;
};

type RootContextValue = {
    readonly state: RootState;
    readonly actions: RootActions;
    readonly meta: RootMeta;
};

const createRootContext = createContextNamespace('PopoverMenu.Root');
const [RootContext, useRoot] = createRootContext<RootContextValue>();

export {RootContext, useRoot};
export type {ActiveAnchor, RootContextValue, RootState, RootActions, RootMeta};
