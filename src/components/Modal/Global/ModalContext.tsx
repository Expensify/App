import noop from 'lodash/noop';
import React, {useCallback, useContext, useMemo, useState} from 'react';
import Log from '@libs/Log';
import CONST from '@src/CONST';

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

    const showModal = useCallback<ModalContextType['showModal']>(({component, props, id, isCloseable = true}) => {
        // This is a promise that will resolve when the modal is closed
        let closeModalPromise: Promise<ModalStateChangePayload> | null = null;

        setModalStack((prevState) => {
            // Check current state for existing modal
            const existingModal = id ? prevState.modals.find((modal: ModalInfo) => modal.id === id) : undefined;
            if (existingModal) {
                // There is already a modal with this ID. Return the existing promise and don't modify state.
                closeModalPromise = existingModal.promiseWithResolvers.promise;
                return prevState; // No state change needed
            }

            // Create a new promise with resolvers to be resolved when the modal is closed
            const promiseWithResolvers = Promise.withResolvers<ModalStateChangePayload>();
            closeModalPromise = promiseWithResolvers.promise;

            return {
                ...prevState,
                modals: [...prevState.modals, {component: component as React.FunctionComponent<ModalProps>, props, promiseWithResolvers, isCloseable, id: id ?? String(modalID++)}],
            };
        });

        // At this point, closeModalPromise should always be assigned
        if (!closeModalPromise) {
            Log.alert(`${CONST.ERROR.ENSURE_BUG_BOT} Failed to create modal promise. This should never happen.`);
            throw new Error('Failed to create modal promise');
        }

        return closeModalPromise;
    }, []);

    const closeModal = useCallback<ModalContextType['closeModal']>((data = {action: 'CLOSE'}) => {
        setModalStack((prevState) => {
            const lastModal = prevState.modals.at(-1);
            lastModal?.promiseWithResolvers.resolve(data);
            return {
                ...prevState,
                modals: prevState.modals.slice(0, -1),
            };
        });
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
