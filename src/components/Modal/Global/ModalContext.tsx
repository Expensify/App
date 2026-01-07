import noop from 'lodash/noop';
import React, {useCallback, useContext, useMemo, useRef, useState} from 'react';

const ModalActions = {
    CONFIRM: 'CONFIRM',
    CLOSE: 'CLOSE',
} as const;

type ModalAction = (typeof ModalActions)[keyof typeof ModalActions];

type ModalStateChangePayload<A extends ModalAction = ModalAction> = {action: A};

type ModalProps = {
    closeModal: (param?: ModalStateChangePayload) => void;
};

type ModalContextType = {
    showModal<P extends ModalProps>(options: {component: React.FunctionComponent<P>; props?: Omit<P, 'closeModal'>; id?: string; isCloseable?: boolean}): Promise<ModalStateChangePayload>;
    closeModal(data?: ModalStateChangePayload): void;
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
    promiseWithResolvers: ReturnType<typeof Promise.withResolvers<ModalStateChangePayload>>;
    isCloseable: boolean;
};

function ModalProvider({children}: {children: React.ReactNode}) {
    const [modalStack, setModalStack] = useState<{modals: ModalInfo[]}>({modals: []});
    // Use a ref to track modals synchronously for duplicate ID checks
    const modalStackRef = useRef<ModalInfo[]>([]);

    const showModal = useCallback<ModalContextType['showModal']>(({component, props, id, isCloseable = true}) => {
        const modalId = id ?? String(modalID++);

        // Check for existing modal with the same ID using the ref (synchronous)
        const existingModal = id ? modalStackRef.current.find((modal: ModalInfo) => modal.id === id) : undefined;
        if (existingModal) {
            // There is already a modal with this ID. Return the existing promise.
            return existingModal.promiseWithResolvers.promise;
        }

        // Create the promise outside of the state setter to avoid React batching issues
        const promiseWithResolvers = Promise.withResolvers<ModalStateChangePayload>();

        const newModal: ModalInfo = {
            component: component as React.FunctionComponent<ModalProps>,
            props,
            promiseWithResolvers,
            isCloseable,
            id: modalId,
        };

        // Update the ref synchronously
        modalStackRef.current = [...modalStackRef.current, newModal];

        // Update the state (may be batched by React)
        setModalStack((prevState) => ({
            ...prevState,
            modals: [...prevState.modals, newModal],
        }));

        return promiseWithResolvers.promise;
    }, []);

    const closeModal = useCallback<ModalContextType['closeModal']>((data = {action: 'CLOSE'}) => {
        // Update the ref synchronously
        const lastModal = modalStackRef.current.at(-1);
        lastModal?.promiseWithResolvers.resolve(data);
        modalStackRef.current = modalStackRef.current.slice(0, -1);

        // Update the state
        setModalStack((prevState) => ({
            ...prevState,
            modals: prevState.modals.slice(0, -1),
        }));
    }, []);

    const contextValue = useMemo(() => ({showModal, closeModal}), [closeModal, showModal]);
    const modalToRender = modalStack.modals.length > 0 ? modalStack.modals.at(modalStack.modals.length - 1) : null;
    const ModalComponent = modalToRender?.component;

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

export type {ModalProps};
export {ModalProvider, useModal, ModalActions};
