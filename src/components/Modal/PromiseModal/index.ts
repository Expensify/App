export {ModalProvider, useModal} from './ModalContext';
export {default as useModalHook} from './useModalHook';
export {default as ConfirmModalWrapper} from './ConfirmModalWrapper';
export type {ModalProps, ModalContextType, PromiseResolvePayload, ModalInfo} from './ModalContext';

// For backward compatibility with existing MoneyReportHeader usage
export {ModalProvider as PromiseModalProvider} from './ModalContext';
export {default as usePromiseModal} from './useModalHook';