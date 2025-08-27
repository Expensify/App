import noop from 'lodash/noop';
import React, {useCallback, useContext, useMemo, useState} from 'react';
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
    const [modalStack, setModalStack] = useState<{modals: ModalInfo[]}>({modals: []});

    const showModal = useCallback<ModalContextType['showModal']>(({component, props, id, isCloseable = true}) => {
        // This is a promise that will resolve when the modal is closed
        let showModalPromise: Promise<PromiseResolvePayload> | null = null;

        setModalStack((prevState) => {
            // Check current state for existing modal
            const existingModal = id ? prevState.modals.find((modal: ModalInfo) => modal.id === id) : undefined;
            if (existingModal) {
                // There is already a modal with this ID. Return the existing promise and don't modify state.
                showModalPromise = existingModal.deferred.promise;
                return prevState; // No state change needed
            }

            // Create a new deferred promise to be resolved when the modal is closed
            const deferred = createDeferredPromise<PromiseResolvePayload>();
            showModalPromise = deferred.promise;

            return {
                ...prevState,
                modals: [...prevState.modals, {component: component as React.FunctionComponent<ModalProps>, props, deferred, isCloseable, id: id ?? String(modalID++)}],
            };
        });

        // At this point, showModalPromise should always be assigned
        if (!showModalPromise) {
            throw new Error('Failed to create modal promise');
        }

        return showModalPromise;
    }, []);

    const closeModal = useCallback<ModalContextType['closeModal']>((data = {action: 'CLOSE'}) => {
        setModalStack((prevState) => {
            const lastModal = prevState.modals.at(-1);
            lastModal?.deferred.resolve(data);
            return {
                ...prevState,
                modals: prevState.modals.slice(0, -1),
            };
        });
    }, []);

    const modalToRender = modalStack.modals.length > 0 ? modalStack.modals.at(modalStack.modals.length - 1) : null;
    const ModalComponent = modalToRender?.component;

    const contextValue = useMemo(() => ({showModal, closeModal}), [closeModal, showModal]);

    return (
        <ModalContext.Provider value={contextValue}>
            {children}
            {!!ModalComponent && (
                <ModalComponent
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...modalToRender.props}
                    key={modalToRender.id}
                    closeModal={closeModal}
                />
            )}
        </ModalContext.Provider>
    );
}

export type {PromiseResolvePayload, ModalContextType, ModalInfo, ModalProps, ModalAction};
export {PromiseModalProvider, useModal};
