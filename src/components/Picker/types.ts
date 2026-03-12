import type {ChangeEvent, Component, ForwardedRef, ReactElement} from 'react';
import type {MeasureLayoutOnSuccessCallback, NativeMethods, StyleProp, ViewStyle} from 'react-native';

type MeasureLayoutOnFailCallback = () => void;

type RelativeToNativeComponentRef = (Component<unknown> & Readonly<NativeMethods>) | number;

type BasePickerHandle = {
    focus: () => void;
    measureLayout: (relativeToNativeComponentRef: RelativeToNativeComponentRef, onSuccess: MeasureLayoutOnSuccessCallback, onFail: MeasureLayoutOnFailCallback) => void;
};

type OnMouseDown = () => void;

type OnChange<TPickerValue> = (value: TPickerValue, index: number) => void;

type AdditionalPickerEvents = {
    onMouseDown?: OnMouseDown;
    onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
};

type AdditionalPickerEventsCallback<TPickerValue> = (onMouseDown: OnMouseDown, onChange: OnChange<TPickerValue>) => AdditionalPickerEvents;

type DefaultPickerEventsCallback = () => void;

type PickerSize = 'normal' | 'small';

type PickerItem<TPickerValue> = {
    /** The value of the item that is being selected */
    value: TPickerValue;

    /** The text to display for the item */
    label: string;
};

type PickerPlaceholder = {
    /** The value of the placeholder item, usually an empty string */
    value?: string;

    /** The text to be displayed as the placeholder */
    label?: string;
};

type BasePickerProps<TPickerValue> = {
    /** BasePicker label */
    label?: string | null;

    /** Accessibility label for screen readers */
    accessibilityLabel?: string;

    /** Should the picker appear disabled? */
    isDisabled?: boolean;

    /** Input value */
    value?: TPickerValue | null;

    /** The items to display in the list of selections */
    items: Array<PickerItem<TPickerValue>>;

    /** Something to show as the placeholder before something is selected */
    placeholder?: PickerPlaceholder;

    /** Error text to display */
    errorText?: string;

    /** Customize the BasePicker container */
    containerStyles?: StyleProp<ViewStyle>;

    /** Customize the BasePicker background color */
    backgroundColor?: string;

    /** The ID used to uniquely identify the input in a Form */
    inputID?: string;

    /** Show disabled style when disabled */
    shouldAllowDisabledStyle?: boolean;

    /** Saves a draft of the input value when used in a form */
    shouldSaveDraft?: boolean;

    /** Show only picker's label and value when disabled */
    shouldShowOnlyTextWhenDisabled?: boolean;

    /** A callback method that is called when the value changes and it receives the selected value as an argument */
    onInputChange?: (value: TPickerValue, index?: number) => void;

    /** Size of a picker component */
    size?: PickerSize;

    /** An icon to display with the picker */
    icon?: (size: PickerSize) => ReactElement;

    /** Whether we should forward the focus/blur calls to the inner picker * */
    shouldFocusPicker?: boolean;

    /** Callback called when click or tap out of BasePicker */
    onBlur?: () => void;

    /** Additional events passed to the core BasePicker for specific platforms such as web */
    additionalPickerEvents?: AdditionalPickerEventsCallback<TPickerValue> | DefaultPickerEventsCallback;

    /** Hint text that appears below the picker */
    hintText?: string;

    /** Reference to the outer element */
    ref?: ForwardedRef<BasePickerHandle>;
};

export type {BasePickerHandle, BasePickerProps, PickerSize, AdditionalPickerEvents, OnMouseDown, OnChange};
