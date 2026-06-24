import React, {useId, useState} from 'react';
import type {ReactNode} from 'react';
import useDisclosureState from '@hooks/useDisclosureState';
import {RootContext} from './RootContext';
import type {ActiveAnchor, RootActions, RootContextValue, RootMeta, RootState} from './RootContext';

type RootProps = {
    children: ReactNode;
    isOpen?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
};

function Root({children, isOpen: controlled, defaultOpen, onOpenChange}: RootProps): React.ReactElement {
    const disclosure = useDisclosureState({isOpen: controlled, defaultOpen, onOpenChange});
    const [activeAnchor, setActiveAnchorState] = useState<ActiveAnchor | null>(null);
    const triggerID = useId();
    const contentID = useId();

    const setActiveAnchor = (anchor: ActiveAnchor) => setActiveAnchorState(anchor);

    const state: RootState = {isOpen: disclosure.isOpen, activeAnchor};
    const actions: RootActions = {
        setOpen: disclosure.setOpen,
        open: disclosure.open,
        close: disclosure.close,
        toggle: disclosure.toggle,
        setActiveAnchor,
    };
    const meta: RootMeta = {triggerID, contentID};
    const value: RootContextValue = {state, actions, meta};

    return <RootContext value={value}>{children}</RootContext>;
}

Root.displayName = 'PopoverMenu.Root';

export default Root;
export type {RootProps};
