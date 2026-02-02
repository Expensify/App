import noop from 'lodash/noop';
import React, {useCallback, useContext, useMemo, useState} from 'react';
import Log from '@libs/Log';
import CONST from '@src/CONST';

type ModalStateChangePayload<ActionType extends string = string> = {action: ActionType};

type ModalProps<ActionType extends string = string> = {
    closeModal: (param?: ModalStateChangePayload<ActionType>) => void;
};

type ModalContextType = {
    showModal<ActionType extends string, P extends ModalProps<ActionType>>(options: {
        component: React.FunctionComponent<P>;
        props?: Omit<P, 'closeModal'>;
        id?: string;
        isCloseable?: boolean;
    }): Promise<ModalStateChangePayload<ActionType>>;
    closeModal<ActionType extends string>(data?: ModalStateChangePayload<ActionType>): void;
};

const ModalContext = React.createContext<ModalContextType>({
    // Type assertion needed because the context default must work with any action type
    showModal: <ActionType extends string>() => Promise.resolve({action: 'CLOSE'} as ModalStateChangePayload<ActionType>),
    closeModal: noop,
});

const useModal = () => useContext(ModalContext);

let modalID = 1;

type ModalInfo<ActionType extends string = string> = {
    id: string;
    component: React.FunctionComponent<ModalProps<ActionType>>;
    props?: Record<string, unknown>;
    promiseWithResolvers: ReturnType<typeof Promise.withResolvers<ModalStateChangePayload<ActionType>>>;
    isCloseable: boolean;
};

function ModalProvider({children}: {children: React.ReactNode}) {
    const [modalStack, setModalStack] = useState<{modals: ModalInfo[]}>({modals: []});

    const showModal = useCallback(
        <ActionType extends string, P extends ModalProps<ActionType>>({
            component,
            props,
            id,
            isCloseable = true,
        }: {
            component: React.FunctionComponent<P>;
            props?: Omit<P, 'closeModal'>;
            id?: string;
            isCloseable?: boolean;
        }): Promise<ModalStateChangePayload<ActionType>> => {
            // This is a promise that will resolve when the modal is closed
            let closeModalPromise: Promise<ModalStateChangePayload<ActionType>> | null = null;

            setModalStack((prevState) => {
                // Check current state for existing modal
                const existingModal = id ? prevState.modals.find((modal: ModalInfo) => modal.id === id) : undefined;
                if (existingModal) {
                    // There is already a modal with this ID. Return the existing promise and don't modify state.
                    closeModalPromise = existingModal.promiseWithResolvers.promise as Promise<ModalStateChangePayload<ActionType>>;
                    return prevState; // No state change needed
                }

                // Create a new promise with resolvers to be resolved when the modal is closed
                const promiseWithResolvers = Promise.withResolvers<ModalStateChangePayload<ActionType>>();
                closeModalPromise = promiseWithResolvers.promise;

                return {
                    ...prevState,
                    modals: [
                        ...prevState.modals,
                        {
                            // Type assertion needed to store modals with different action types in the same array
                            component: component as unknown as React.FunctionComponent<ModalProps<string>>,
                            props,
                            promiseWithResolvers: promiseWithResolvers as unknown as ReturnType<typeof Promise.withResolvers<ModalStateChangePayload<string>>>,
                            isCloseable,
                            id: id ?? String(modalID++),
                        },
                    ],
                };
            });

            // At this point, closeModalPromise should always be assigned
            if (!closeModalPromise) {
                Log.alert(`${CONST.ERROR.ENSURE_BUG_BOT} Failed to create modal promise. This should never happen.`);
                throw new Error('Failed to create modal promise');
            }

            return closeModalPromise;
        },
        [],
    );

    const closeModal = useCallback(<ActionType extends string>(data: ModalStateChangePayload<ActionType> = {action: 'CLOSE' as ActionType}) => {
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

export type {ModalProps, ModalStateChangePayload};
export {ModalProvider, useModal};
