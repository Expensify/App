import type PopoverWithMeasuredContentProps from '@components/PopoverWithMeasuredContent/types';
import type {BaseTextInputProps} from '@components/TextInput/BaseTextInput/types';

import type {ForwardedFSClassProps} from '@libs/Fullstory/types';

import type {OnyxFormValuesMapping} from '@src/ONYXKEYS';

import type {ComponentRef, RefObject} from 'react';
import type {StyleProp, View, ViewStyle} from 'react-native';

type DatePickerBaseProps = ForwardedFSClassProps & {
    /** The selected date as a `yyyy-MM-dd` string, read with DateUtils.parseCalendarDate. `onInputChange` is called with the picked date in the same format. */
    value?: string;

    /** The date the field starts with when there is no value, in the same format as `value`. When the field is empty, the calendar opens on its month without selecting it. */
    defaultValue?: string;

    inputID: string;

    /** A minimum date (oldest) allowed to select. The calendar can't move to a month before it. */
    minDate?: Date;

    /** A maximum date (latest) allowed to select. The calendar can't move to a month after it. */
    maxDate?: Date;

    /** A function that is passed by FormWrapper */
    onInputChange?: (value: string) => void;

    /** A function that is passed by FormWrapper */
    onTouched?: () => void;

    /** Saves a draft of the input value when used in a form */
    shouldSaveDraft?: boolean;

    formID?: keyof OnyxFormValuesMapping;

    /**
     * Whether Month/Year right-docked picker modals should keep backdrop in narrow pane context.
     * Used by inline editing flows that require background dimming.
     */
    shouldEnableMonthYearBackdropInNarrowPane?: boolean;
};

type DateInputWithPickerProps = DatePickerBaseProps &
    BaseTextInputProps & {
        /**
         * Whether to always show the clear button, even when the input is not focused
         * @default false
         */
        shouldHideClearButton?: boolean;

        /**
         * Defers showing the popover until the anchor position has been freshly measured, and opens the picker on
         * press instead of focus. Use in scrollable contexts where the field position can
         * change after mount: it prevents the popover from blinking at a stale position, and the press-based open
         * prevents the picker from reopening when focus returns to the input as it is dismissed.
         * @default false
         */
        shouldDeferShowUntilPositioned?: boolean;

        /**
         * Blurs any focused text input and dismisses the keyboard when opening the picker, then prevents focus from
         * returning when the picker closes. Use in multi-field forms where another text input may still be focused
         * (e.g. a name field above the date picker) to avoid a brief keyboard flash after closing the calendar.
         * The picker opens immediately after blur; keyboard dismissal runs in parallel rather than blocking the open.
         * @default false
         */
        shouldDismissKeyboardBeforeShow?: boolean;

        /**
         * Style for the view that wraps the input and anchors the calendar. It carries a vertical margin by default,
         * which a caller laying the field out itself can override, for example to line the input up with a plain
         * `TextInput` beside it.
         */
        wrapperStyle?: StyleProp<ViewStyle>;

        /**
         * Reports whether the calendar is open. Opening the picker blurs the input, so this is the signal for "the
         * user is on this field" rather than `onFocus`, and it is what drives the input's focused border.
         */
        onPickerVisibilityChange?: (isVisible: boolean) => void;

        /**
         * Hides the trailing calendar icon the empty input shows by default. Use it when the caller renders its own
         * `rightHandSideComponent` in that space and the two would otherwise sit side by side.
         * @default false
         */
        shouldHideCalendarIcon?: boolean;

        /**
         * Reports an error the field works out for itself, such as a date outside the range its calendar offers or
         * digits that do not make a date. A field inside a form reports these to the form, so this is for the pages
         * that own their own submit. An empty string withdraws the error.
         */
        onValidationErrorChange?: (error: string) => void;
    };

type DatePickerProps = {
    /** The selected date as a `yyyy-MM-dd` string, read with DateUtils.parseCalendarDate. `onInputChange` is called with the picked date in the same format. */
    value?: string;

    /** The month the calendar opens on when there is no value, in the same format as `value`. It isn't selected. */
    defaultValue?: string;

    inputID: string;

    /** A minimum date (oldest) allowed to select. The calendar can't move to a month before it. */
    minDate?: Date;

    /** A maximum date (latest) allowed to select. The calendar can't move to a month after it. */
    maxDate?: Date;

    /** Whether a day between minDate and maxDate can be selected. Unlike the bounds, it doesn't limit which months and years can be shown. */
    isDateSelectable?: (date: Date) => boolean;

    /** A function that is passed by FormWrapper */
    onInputChange?: (value: string) => void;

    /** A function that is passed by FormWrapper */
    onTouched?: () => void;

    /** Saves a draft of the input value when used in a form */
    shouldSaveDraft?: boolean;

    formID?: keyof OnyxFormValuesMapping;

    /** Whether the modal is visible */
    isVisible: boolean;

    /** Callback to close the modal */
    onClose: () => void;

    onSelected?: (value: string) => void;

    /** Whether to close the modal when browser navigation changes */
    shouldCloseWhenBrowserNavigationChanged?: boolean;

    /** If the popover will be positioned from the top */
    shouldPositionFromTop?: boolean;

    /**
     * Whether Month/Year right-docked picker modals should keep backdrop in narrow pane context.
     * Used by inline editing flows that require background dimming.
     */
    shouldEnableMonthYearBackdropInNarrowPane?: boolean;

    /**
     * The element the calendar is positioned against, normally the date input. Clicks inside it do not dismiss the
     * calendar, so the user can keep editing the input while the calendar is open. Falls back to an internal ref.
     */
    anchorRef?: RefObject<ComponentRef<typeof View> | null>;

    /** Moves the calendar to this month without selecting a day, so it follows the date being typed into the input */
    viewDate?: Date;

    /** Changes every time `viewDate` is asserted, including when it repeats the month the calendar already shows */
    viewDateVersion?: number;

    /**
     * Called when a month or year is picked from its own picker, with the date that pick lands on. The calendar stays
     * open, so the user can still press a day. Leave it out to have those picks only move the view.
     */
    onMonthOrYearSelected?: (selectedDate: string) => void;

    /** Called once the month or year picker has closed, which is where focus has to be taken back from it */
    onMonthOrYearPickerClose?: () => void;

    /**
     * Whether to measure the calendar's rendered height instead of assuming `POPOVER_DATE_MIN_HEIGHT`, which only covers
     * a 5-row month: months that need a sixth week row reach `POPOVER_DATE_MAX_HEIGHT` instead. Needed where the popover
     * can open above its anchor, or its top edge clips in those months.
     */
    shouldMeasureContentHeight?: boolean;
} & Omit<BaseTextInputProps & PopoverWithMeasuredContentProps, 'anchorRef' | 'children'>;

export type {DateInputWithPickerProps, DatePickerProps};
