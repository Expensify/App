import React, {useId} from 'react';
import type {ReactNode} from 'react';
import useDisclosureState from '@hooks/useDisclosureState';
import {ModalLayoutContext, useLayoutState} from './Layout';
import {ModalContext} from './state';
import type {ModalActions, ModalContextValue, ModalMeta, ModalState} from './state';

type ModalRootProps = {
    isOpen?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
    children: ReactNode;
};

function Root({isOpen, defaultOpen, onOpenChange, children}: ModalRootProps) {
    const disclosure = useDisclosureState({isOpen, defaultOpen, onOpenChange});
    const triggerID = useId();
    const contentID = useId();
    const layoutState = useLayoutState();

    const state: ModalState = {isOpen: disclosure.isOpen};
    const actions: ModalActions = {
        setOpen: disclosure.setOpen,
        open: disclosure.open,
        close: disclosure.close,
        toggle: disclosure.toggle,
    };
    const meta: ModalMeta = {triggerID, contentID};
    const value: ModalContextValue = {state, actions, meta};

    return (
        <ModalContext value={value}>
            <ModalLayoutContext value={layoutState}>{children}</ModalLayoutContext>
        </ModalContext>
    );
}

export default Root;
export type {ModalRootProps};
