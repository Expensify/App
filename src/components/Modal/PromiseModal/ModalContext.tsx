import {produce} from 'immer';
import type {DeferredPromise} from 'p-defer';
import pDefer from 'p-defer';
import React, {useCallback, useContext, useMemo, useState} from 'react';
import usePrevious from '@hooks/usePrevious';

const noop = () => {};

type ModalProps = {
    closeModal: (param?: PromiseResolvePayload<'CLOSE'>) => void;
};

type PromiseResolvePayload<A extends string = string> = {action: A; [key: string]: unknown};

type ModalContextType = {
    showModal<P extends ModalProps>(options: {
        component: React.FunctionComponent<P>;
        props?: Omit<P, 'closeModal'>;
        id?: string;
        closeable?: boolean;
    }): Promise<NonNullable<Parameters<P['closeModal']>[0]> | PromiseResolvePayload<'CLOSE'>>;
    closeModal(data?: PromiseResolvePayload): void;
};

const ModalContext = React.createContext<ModalContextType>({
    showModal: () => Promise.resolve({action: 'CLOSE'}),
    closeModal: noop,
});

const useModal = () => useContext(ModalContext);

let modalId = 1;

type ModalInfo = {
    id: string;
    component: React.FunctionComponent<ModalProps>;
    props?: Record<string, unknown>;
    deferred: DeferredPromise<PromiseResolvePayload>;
    closeable: boolean;
};

function PromiseModalProvider({children}: {children: React.ReactNode}) {
    const [state, setState] = useState<{modals: ModalInfo[]}>({modals: []});
    const stateRef = usePrevious(state);

    const showModal = useCallback<ModalContextType['showModal']>(
        ({component, props, id, closeable = true}) => {
            const existingModal = id && stateRef.current ? stateRef.current.modals.find((modal: ModalInfo) => modal.id === id) : undefined;

            if (existingModal) {
                return existingModal.deferred.promise;
            }

            const deferred = pDefer<PromiseResolvePayload<'CLOSE'>>();

            setState((prevState) =>
                produce(prevState, (draft) => {
                    draft.modals.push({component, props, deferred, closeable, id: id ?? String(modalId++)});
                    return draft;
                }),
            );

            return deferred.promise;
        },
        [stateRef],
    );

    const closeModal = useCallback<ModalContextType['closeModal']>((data = {action: 'CLOSE'}) => {
        setState((prevState) =>
            produce(prevState, (draft) => {
                const lastModal = draft.modals.pop();
                lastModal?.deferred.resolve(data);
                return draft;
            }),
        );
    }, []);

    const modalToRender = state.modals.length > 0 ? state.modals.at(state.modals.length - 1) : null;
    const ModalComponent = modalToRender?.component;

    const contextValue = useMemo(() => ({showModal, closeModal}), [closeModal, showModal]);

    return (
        <ModalContext.Provider value={contextValue}>
            {children}
            {ModalComponent ? (
                <ModalComponent
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...modalToRender.props}
                    key={modalToRender.id}
                    closeModal={closeModal}
                />
            ) : null}
        </ModalContext.Provider>
    );
}

export type {PromiseResolvePayload, ModalContextType, ModalInfo, ModalProps};
export {PromiseModalProvider, useModal};
