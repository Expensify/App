import type {PopoverMenuItem} from '@components/PopoverMenu';
import type {Errors, PendingAction} from '@src/types/onyx/OnyxCommon';

type ValidateCodeActionContentProps = {
    /** Title of the modal */
    title: string;

    /** Primary description of the modal */
    descriptionPrimary: string;

    /** Secondary description of the modal */
    descriptionSecondary?: string | null;

    /** Function to call when the user closes the modal */
    onClose?: () => void;

    /** The pending action we're trying to validate */
    validatePendingAction?: PendingAction;

    /** The error of submitting, this holds any error specific to the flow (e.g invalid reason when replacing a card) but NOT an incorrect magic code  */
    validateError?: Errors;

    /** The errorField name of validateCodeAction.errorFields, e.g. "addLogin" to store the magic code error when adding a new contact method */
    validateCodeActionErrorField: string;

    /** Function is called when submitting form  */
    handleSubmitForm: (validateCode: string) => void;

    /** Function to clear error of the form */
    clearError: () => void;

    /** Function is called when validate code modal is mounted and on magic code resend */
    sendValidateCode: () => void;

    /** Whether the form is loading or not */
    isLoading?: boolean;

    /** List of menu items for more(three dots) menu */
    threeDotsMenuItems?: PopoverMenuItem[];

    /** Method to trigger when pressing more options button of the header */
    onThreeDotsButtonPress?: () => void;

    /** Whether the modal is used as a page modal. Used to determine input auto focus timing. */
    isPageModal?: boolean;
};

type ValidateCodeActionModalProps = ValidateCodeActionContentProps & {
    /** Whether the modal is visible */
    isVisible: boolean;

    /** Whether handle navigation back when modal show. */
    shouldHandleNavigationBack?: boolean;

    /** Whether disable the animations */
    disableAnimation?: boolean;

    /** Callback method fired when the modal is hidden */
    onModalHide?: () => void;
};

export type {ValidateCodeActionContentProps, ValidateCodeActionModalProps};
