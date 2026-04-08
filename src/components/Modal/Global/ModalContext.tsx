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

        const newModalId = id ?? String(modalIDRef.current++);

        if (!closeModalPromise) {
            // Create a new promise with resolvers to be resolved when the modal is closed
            const promiseWithResolvers = Promise.withResolvers<ModalStateChangePayload>();
            closeModalPromise = promiseWithResolvers;

            // New modal => update modals stack
            setModalStack((prevState) => ({
                ...prevState,
                modals: [...prevState.modals, {component: component as React.FunctionComponent<ModalProps>, props, isCloseable, id: newModalId}],
            }));
        }

        modalPromisesStack.current[newModalId] = closeModalPromise;

        return closeModalPromise.promise;
    };

    const closeModal: ModalContextType['closeModal'] = (data = {action: 'CLOSE'}) => {
        setModalStack((prevState) => {
            const lastModalId = prevState.modals.at(-1)?.id;

            if (!lastModalId) {
                Log.alert(`${CONST.ERROR.ENSURE_BUG_BOT} Empty modals stack while attempting to close one. This should never happen.`);
            } else {
                const lastModalPromise = modalPromisesStack.current?.[lastModalId];
                if (!lastModalPromise) {
                    Log.alert(`${CONST.ERROR.ENSURE_BUG_BOT} Missing modal promise while attempting to close modal with id ${lastModalId}. This should never happen.`);
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
        <ModalContext.Provider value={{showModal, closeModal}}>
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
