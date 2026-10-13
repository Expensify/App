import type {PopoverMenuItem} from '@components/PopoverMenu';

import type {Errors, PendingAction} from '@src/types/onyx/OnyxCommon';
import type {ValidateCodeReason} from '@src/types/onyx/VerifyValidateCodeAction';

type ValidateCodeActionContentProps = {
    title: string;
    descriptionPrimary: string;
    descriptionSecondary?: string | null;

    /** Function to call when the user closes the modal */
    onClose?: () => void;

    /** The pending action we're trying to validate */
    validatePendingAction?: PendingAction;

    /** The error of submitting, this holds any error specific to the flow (e.g invalid reason when replacing a card) but NOT an incorrect validateCode  */
    validateError?: Errors;

    /** The errorField name of validateCodeAction.errorFields, e.g. "addLogin" to store the validateCode error when adding a new contact method */
    validateCodeActionErrorField: string;

    handleSubmitForm: (validateCode: string) => void;

    /** Function to clear error of the form */
    clearError: () => void;

    /** Function is called when validate code modal is mounted and on validateCode resend */
    sendValidateCode: () => void;

    /** When set, a recent request only suppresses the mount-time send if it was for this same reason */
    validateCodeReasonCode?: ValidateCodeReason;

    /** Whether the form is loading or not */
    isLoading?: boolean;

    threeDotsMenuItems?: PopoverMenuItem[];

    /** Method to trigger when pressing more options button of the header */
    onThreeDotsButtonPress?: () => void;

    /** Whether the modal is used as a page modal. Used to determine input auto focus timing. */
    isPageModal?: boolean;
};

// eslint-disable-next-line import/prefer-default-export
export type {ValidateCodeActionContentProps};
