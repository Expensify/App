type Modal = {
    /** Indicates when an Alert modal is about to be visible */
    willAlertModalBecomeVisible?: boolean;

    /** Indicates whether the modal should be dismissable using the ESCAPE key */
    disableDismissOnEscape?: boolean;

    /** Indicates if there is a modal currently visible or not */
    isVisible?: boolean;

    isPopover?: boolean;
};

export default Modal;
