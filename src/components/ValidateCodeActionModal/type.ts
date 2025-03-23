import type React from 'react';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import type {PendingContactAction, ValidateMagicCodeAction} from '@src/types/onyx';
import type {Errors, PendingAction} from '@src/types/onyx/OnyxCommon';

type ValidateCodeActionModalProps = {
    /** Whether the modal is visible */
    isVisible: boolean;

    /** Title of the modal */
    title: string;

    /** Primary description of the modal */
    descriptionPrimary: string;

    /** Secondary description of the modal */
    descriptionSecondary?: string | null;

    /** Function to call when the user closes the modal */
    onClose?: () => void;

    /** Function to be called when the modal is closed */
    onModalHide?: () => void;

    /** The state of the magic code being sent */
    validateCodeAction?: ValidateMagicCodeAction | PendingContactAction | undefined;

    validatePendingAction?: PendingAction | undefined;

    /** The error of submitting, this hold any error sepcifc to the flow (e.g invalid reason when replacing a card) but NOT an incorrect magic code  */
    validateError?: Errors;

    /** Where incorrect magic code error will be stored for each flow */
    validateActionErrorField?: string | undefined;

    /** Function is called when submitting form  */
    handleSubmitForm: (validateCode: string) => void;

    /** Function to clear error of the form */
    clearError: () => void;

    /** A component to be rendered inside the modal */
    footer?: () => React.JSX.Element;

    /** Function is called when validate code modal is mounted and on magic code resend */
    sendValidateCode: () => void;

    /** If the magic code has been resent previously */
    hasMagicCodeBeenSent?: boolean;

    /** Whether the form is loading or not */
    isLoading?: boolean;

    /** Whether handle navigation back when modal show. */
    shouldHandleNavigationBack?: boolean;

    /** Whether disable the animations */
    disableAnimation?: boolean;

    /** List of menu items for more(three dots) menu */
    threeDotsMenuItems?: PopoverMenuItem[];

    /** Method to trigger when pressing more options button of the header */
    onThreeDotsButtonPress?: () => void;
};

// eslint-disable-next-line import/prefer-default-export
export type {ValidateCodeActionModalProps};
