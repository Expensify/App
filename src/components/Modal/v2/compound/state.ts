import {createContext, use} from 'react';
import type {Dispatch, SetStateAction} from 'react';
import {useTopModal} from '@components/Overlay/hooks/useOverlaySelectors';
import type {ModalKind, ModalOverlayEntry} from '@components/Overlay/libs/overlayStore';

type ModalState = {
    readonly isOpen: boolean;
};

type ModalActions = {
    readonly setOpen: Dispatch<SetStateAction<boolean>>;
    readonly open: () => void;
    readonly close: () => void;
    readonly toggle: () => void;
};

type ModalMeta = {
    readonly triggerID: string;
    readonly contentID: string;
};

type ModalContextValue = {
    readonly state: ModalState;
    readonly actions: ModalActions;
    readonly meta: ModalMeta;
};

const ModalContext = createContext<ModalContextValue | null>(null);

const ModalKindContext = createContext<ModalKind | null>(null);

function useModal(consumerName: string): ModalContextValue {
    const value = use(ModalContext);
    if (!value) {
        throw new Error(`${consumerName} must be rendered inside <Modal.Root>`);
    }
    return value;
}

function useActiveModalKind(): ModalKind | null {
    return use(ModalKindContext);
}

function useActiveModalEntry(): ModalOverlayEntry | null {
    return useTopModal();
}

export {ModalContext, ModalKindContext, useModal, useActiveModalKind, useActiveModalEntry};
export type {ModalState, ModalActions, ModalMeta, ModalContextValue};
