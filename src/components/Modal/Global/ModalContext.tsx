import noop from 'lodash/noop';
import React, {useCallback, useContext, useMemo, useState} from 'react';
import usePrevious from '@hooks/usePrevious';
import createDeferredPromise from '@libs/createDeferredPromise';

type ModalProps = {
    closeModal: (param?: PromiseResolvePayload) => void;
};

type ModalAction = 'CONFIRM' | 'CANCEL' | 'CLOSE';

type PromiseResolvePayload<A extends string = ModalAction> = {action: A; [key: string]: unknown};

type ModalContextType = {
    showModal<P extends ModalProps>(options: {component: React.FunctionComponent<P>; props?: Omit<P, 'closeModal'>; id?: string; isCloseable?: boolean}): Promise<PromiseResolvePayload>;
    closeModal(data?: PromiseResolvePayload): void;
};

const ModalContext = React.createContext<ModalContextType>({
    showModal: () => Promise.resolve({action: 'CLOSE'}),
    closeModal: noop,
});

const useModal = () => useContext(ModalContext);

let modalID = 1;

type ModalInfo = {
    id: string;
    component: React.FunctionComponent<ModalProps>;
    props?: Record<string, unknown>;
    deferred: ReturnType<typeof createDeferredPromise<PromiseResolvePayload>>;
    isCloseable: boolean;
};

function PromiseModalProvider({children}: {children: React.ReactNode}) {
    const [state, setState] = useState<{modals: ModalInfo[]}>({modals: []});
    const stateRef = usePrevious(state);

    const showModal = useCallback<ModalContextType['showModal']>(
        ({component, props, id, isCloseable = true}) => {
            const existingModal = id ? stateRef.modals.find((modal: ModalInfo) => modal.id === id) : undefined;

            if (existingModal) {
                return existingModal.deferred.promise;
            }

            const deferred = createDeferredPromise<PromiseResolvePayload>();

            setState((prevState) => ({
                ...prevState,
                modals: [...prevState.modals, {component: component as React.FunctionComponent<ModalProps>, props, deferred, isCloseable, id: id ?? String(modalID++)}],
            }));

            return deferred.promise;
        },
        [stateRef],
    );

    const closeModal = useCallback<ModalContextType['closeModal']>((data = {action: 'CLOSE'}) => {
        setState((prevState) => {
            const lastModal = prevState.modals.at(-1);
            lastModal?.deferred.resolve(data);
            return {
                ...prevState,
                modals: prevState.modals.slice(0, -1),
            };
        });
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

export type {PromiseResolvePayload, ModalContextType, ModalInfo, ModalProps, ModalAction};
export {PromiseModalProvider, useModal};
