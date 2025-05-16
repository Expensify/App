import type ModalType from '@src/types/utils/ModalType';

/** Modal state */
type Modal = {
    /** Indicates when an Alert modal is about to be visible */
    willAlertModalBecomeVisible?: boolean;

    /** Indicates whether the modal should be dismissible using the ESCAPE key */
    disableDismissOnEscape?: boolean;

    /** Indicates if there is a modal currently visible or not */
    isVisible?: boolean;

    /** The type of the modal if it's visible */
    type?: ModalType;

    /** Indicates if the modal is a popover */
    isPopover?: boolean;
};

export default Modal;
