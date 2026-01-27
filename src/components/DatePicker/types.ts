import type PopoverWithMeasuredContentProps from '@components/PopoverWithMeasuredContent/types';
import type {BaseTextInputProps} from '@components/TextInput/BaseTextInput/types';
import type {ForwardedFSClassProps} from '@libs/Fullstory/types';
import type {OnyxFormValuesMapping} from '@src/ONYXKEYS';

type DatePickerBaseProps = ForwardedFSClassProps & {
    /**
     * The datepicker supports any value that `new Date()` can parse.
     * `onInputChange` would always be called with a Date (or null)
     */
    value?: string;

    /**
     * The datepicker supports any defaultValue that `new Date()` can parse.
     * `onInputChange` would always be called with a Date (or null)
     */
    defaultValue?: string;

    inputID: string;

    /** A minimum date of calendar to select */
    minDate?: Date;

    /** A maximum date of calendar to select */
    maxDate?: Date;

    /** A function that is passed by FormWrapper */
    onInputChange?: (value: string) => void;

    /** A function that is passed by FormWrapper */
    onTouched?: () => void;

    /** Saves a draft of the input value when used in a form */
    shouldSaveDraft?: boolean;

    /** ID of the wrapping form */
    formID?: keyof OnyxFormValuesMapping;
};

type DatePickerModalProps = DatePickerBaseProps & {
    isVisible: boolean;
    onClose: () => void;
    anchorPosition: {
        horizontal: number;
        vertical: number;
    };
    onSelected?: (value: string) => void;
};

type DateInputWithPickerProps = DatePickerBaseProps &
    BaseTextInputProps & {
        /**
         * Whether to always show the clear button, even when the input is not focused
         * @default false
         */
        shouldHideClearButton?: boolean;
    };

type DatePickerProps = {
    /**
     * The datepicker supports any value that `new Date()` can parse.
     * `onInputChange` would always be called with a Date (or null)
     */
    value?: string;

    /**
     * The datepicker supports any defaultValue that `new Date()` can parse.
     * `onInputChange` would always be called with a Date (or null)
     */
    defaultValue?: string;

    inputID: string;

    /** A minimum date of calendar to select */
    minDate?: Date;

    /** A maximum date of calendar to select */
    maxDate?: Date;

    /** A function that is passed by FormWrapper */
    onInputChange?: (value: string) => void;

    /** A function that is passed by FormWrapper */
    onTouched?: () => void;

    /** Saves a draft of the input value when used in a form */
    shouldSaveDraft?: boolean;

    /** ID of the wrapping form */
    formID?: keyof OnyxFormValuesMapping;

    /** Whether the modal is visible */
    isVisible: boolean;

    /** Callback to close the modal */
    onClose: () => void;

    /** Callback when date is selected */
    onSelected?: (value: string) => void;

    /** Whether to close the modal when browser navigation changes */
    shouldCloseWhenBrowserNavigationChanged?: boolean;

    /** If the popover will be positioned from the top */
    shouldPositionFromTop?: boolean;
} & Omit<BaseTextInputProps & PopoverWithMeasuredContentProps, 'anchorRef' | 'children'>;

export type {DatePickerBaseProps, DatePickerModalProps, DateInputWithPickerProps, DatePickerProps};
