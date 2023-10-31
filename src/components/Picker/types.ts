import {ChangeEvent, Component, ForwardedRef, ReactElement} from 'react';
import {MeasureLayoutOnSuccessCallback, NativeMethods, ViewStyle} from 'react-native';

type MeasureLayoutOnFailCallback = () => void;

type RelativeToNativeComponentRef = (Component<unknown> & Readonly<NativeMethods>) | number;

type BasePickerHandle = {
    focus: () => void;
    measureLayout: (relativeToNativeComponentRef: RelativeToNativeComponentRef, onSuccess: MeasureLayoutOnSuccessCallback, onFail: MeasureLayoutOnFailCallback) => void;
};

type OnMouseDown = () => void;

type OnChange = (value: string, index: number) => void;

type AdditionalPickerEvents = {
    onMouseDown?: OnMouseDown;
    onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
};

type AdditionalPickerEventsCallback = (onMouseDown: OnMouseDown, onChange: OnChange) => AdditionalPickerEvents;

type DefaultPickerEventsCallback = () => void;

type PickerSize = 'normal' | 'small';

type PickerItem = {
    /** The value of the item that is being selected */
    value: string | number;

    /** The text to display for the item */
    label: string;
};

type PickerPlaceholder = {
    /** The value of the placeholder item, usually an empty string */
    value?: string;

    /** The text to be displayed as the placeholder */
    label?: string;
};

type BasePickerProps = {
    forwardedRef?: ForwardedRef<BasePickerHandle>;

    /** BasePicker label */
    label?: string | null;

    /** Should the picker appear disabled? */
    isDisabled?: boolean;

    /** Input value */
    value?: string | null | number;

    /** The items to display in the list of selections */
    items: PickerItem[];

    /** Something to show as the placeholder before something is selected */
    placeholder?: PickerPlaceholder;

    /** Error text to display */
    errorText?: string;

    /** Customize the BasePicker container */
    containerStyles?: ViewStyle[];

    /** Customize the BasePicker background color */
    backgroundColor?: string;

    /** The ID used to uniquely identify the input in a Form */
    inputID?: string;

    /** A callback method that is called when the value changes and it receives the selected value as an argument */
    onInputChange: (value: string | number, index?: number) => void;

    /** Size of a picker component */
    size?: PickerSize;

    /** An icon to display with the picker */
    icon?: (size: PickerSize) => ReactElement;

    /** Whether we should forward the focus/blur calls to the inner picker * */
    shouldFocusPicker?: boolean;

    /** Callback called when click or tap out of BasePicker */
    onBlur?: () => void;

    /** Additional events passed to the core BasePicker for specific platforms such as web */
    additionalPickerEvents?: AdditionalPickerEventsCallback | DefaultPickerEventsCallback;

    /** Hint text that appears below the picker */
    hintText?: string;
};

export type {BasePickerHandle, BasePickerProps, AdditionalPickerEventsCallback, PickerSize, AdditionalPickerEvents, OnMouseDown, OnChange};
