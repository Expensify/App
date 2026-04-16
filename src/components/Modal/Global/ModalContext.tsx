import noop from 'lodash/noop';
import React, {useContext, useRef, useState} from 'react';
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
    resolveModal: (param?: ModalStateChangePayload) => void;
};

type ModalContextType = {
    showModal<P extends ModalProps>(options: {
        component: React.FunctionComponent<P>;
        props?: Omit<P, 'closeModal' | 'resolveModal'>;
        id?: string;
        isCloseable?: boolean;
    }): Promise<ModalStateChangePayload>;
    closeModal(data?: ModalStateChangePayload): void;
    resolveModal(data?: ModalStateChangePayload): void;
};

const ModalContext = React.createContext<ModalContextType>({
    showModal: () => Promise.resolve({action: 'CLOSE'}),
    closeModal: noop,
    resolveModal: noop,
});

const useModal = () => useContext(ModalContext);

type ModalInfo = {
    id: string;
    component: React.FunctionComponent<ModalProps>;
    props?: Record<string, unknown>;
    isCloseable: boolean;
};

type CloseModalPromiseWithResolvers = ReturnType<typeof Promise.withResolvers<ModalStateChangePayload>>;

function ModalProvider({children}: {children: React.ReactNode}) {
    const [modalStack, setModalStack] = useState<{modals: ModalInfo[]}>({modals: []});
    const modalIDRef = useRef(1);
    const modalPromisesStack = useRef<Record<string, CloseModalPromiseWithResolvers>>({});

    const showModal: ModalContextType['showModal'] = ({component, props, id, isCloseable = true}) => {
        // This is a promise that will resolve when the modal is closed
        let closeModalPromise: CloseModalPromiseWithResolvers | null = id ? modalPromisesStack.current?.[id] : null;

        const modalID = id ?? String(modalIDRef.current++);

        if (!closeModalPromise) {
            // Create a new promise with resolvers to be resolved when the modal is closed
            const promiseWithResolvers = Promise.withResolvers<ModalStateChangePayload>();
            closeModalPromise = promiseWithResolvers;

            // New modal => update modals stack
            setModalStack((prevState) => ({
                ...prevState,
                modals: [...prevState.modals, {component: component as React.FunctionComponent<ModalProps>, props, isCloseable, id: modalID}],
            }));
            modalPromisesStack.current[modalID] = closeModalPromise;
        } else {
            // If it is an existing modal, update props in place instead of stacking a new modal
            setModalStack((prevState) => {
                const modals = prevState.modals.map((modal) => {
                    if (modal.id === id) {
                        return {component: component as React.FunctionComponent<ModalProps>, props, isCloseable, id: modalID};
                    }
                    return modal;
                });
                return {...prevState, modals};
            });
        }

        return closeModalPromise.promise;
    };

    // Resolves the modal promise without closing the modal
    // Used for async confirmation flows where the modal stays open with loading state
    const resolveModal: ModalContextType['resolveModal'] = (data = {action: ModalActions.CONFIRM}) => {
        const lastModalId = modalStack.modals.at(-1)?.id;

        if (!lastModalId) {
            return;
        }

        const lastModalPromise = modalPromisesStack.current?.[lastModalId];
        if (lastModalPromise) {
            lastModalPromise.resolve(data);
            delete modalPromisesStack.current[lastModalId];
        }
    };

    const closeModal: ModalContextType['closeModal'] = (data = {action: ModalActions.CLOSE}) => {
        setModalStack((prevState) => {
            const lastModalId = prevState.modals.at(-1)?.id;

            if (!lastModalId) {
                Log.alert(`${CONST.ERROR.ENSURE_BUG_BOT} Empty modals stack while attempting to close one. This should never happen.`);
            } else {
                const lastModalPromise = modalPromisesStack.current?.[lastModalId];
                if (!lastModalPromise) {
                    // Promise may have already been resolved by resolveModal, which is fine
                } else {
                    lastModalPromise.resolve(data);
                    delete modalPromisesStack.current[lastModalId];
                }
            }

            return {
                ...prevState,
                modals: prevState.modals.slice(0, -1),
            };
        });
    };

    const modalToRender = modalStack.modals.length > 0 ? modalStack.modals.at(modalStack.modals.length - 1) : null;
    const ModalComponent = modalToRender?.component;

    return (
        <ModalContext.Provider value={{showModal, closeModal, resolveModal}}>
            {children}
            {!!ModalComponent && (
                <ModalComponent
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...modalToRender.props}
                    key={modalToRender.id}
                    closeModal={closeModal}
                    resolveModal={resolveModal}
                />
            )}
        </ModalContext.Provider>
    );
}

export type {ModalProps};
export {ModalProvider, useModal, ModalActions};
