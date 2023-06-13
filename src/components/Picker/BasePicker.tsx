import React, {useCallback, useContext, useEffect, useRef, useState} from 'react';
import {HostComponent, MeasureLayoutOnSuccessCallback, StyleProp, View, ViewStyle} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import _ from 'underscore';
import usePrevious from '../../hooks/usePrevious';
import styles from '../../styles/styles';
import themeColors from '../../styles/themes/default';
import FormHelpMessage from '../FormHelpMessage';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';
import {ScrollContext} from '../ScrollViewWithContext';
import Text from '../Text';

type Props = {
    /** BasePicker label */
    label?: string;

    /** Should the picker appear disabled? */
    isDisabled: boolean;

    /** Input value */
    value?: string | number;

    /** The items to display in the list of selections */
    items: Array<{
        value: string | number;
        label: string;
    }>;

    /** Something to show as the placeholder before something is selected */
    placeholder:
        | {
              value: string;
              label: string;
          }
        | Record<string, never>;

    /** Error text to display */
    errorText: string;

    /** Customize the BasePicker container */
    containerStyles: StyleProp<ViewStyle>;

    /** Customize the BasePicker background color */
    backgroundColor?: string;

    /** The ID used to uniquely identify the input in a Form */
    inputID?: string;

    /** Saves a draft of the input value when used in a form */
    // eslint-disable-next-line react/no-unused-prop-types
    shouldSaveDraft: boolean;

    /** A callback method that is called when the value changes and it receives the selected value as an argument */
    onInputChange: (value: string | number, index: number) => void;

    /** Size of a picker component */
    size: 'normal' | 'small';

    /** An icon to display with the picker */
    icon: (size: 'normal' | 'small') => JSX.Element;

    /** Whether we should forward the focus/blur calls to the inner picker * */
    shouldFocusPicker: boolean;

    /** Callback called when click or tap out of BasePicker */
    onBlur: () => void;

    /** Additional events passed to the core BasePicker for specific platforms such as web */
    additionalPickerEvents: (onMouseDown: any, onChange: any) => void;

    /** Hint text that appears below the picker */
    hintText: string;
};

const defaultProps: Omit<Props, 'items' | 'onInputChange'> = {
    label: '',
    isDisabled: false,
    errorText: '',
    hintText: '',
    containerStyles: [],
    backgroundColor: undefined,
    inputID: undefined,
    shouldSaveDraft: false,
    value: undefined,
    placeholder: {},
    size: 'normal',
    icon: (size) => (
        <Icon
            src={Expensicons.DownArrow}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...(size === 'small' ? {width: styles.pickerSmall().icon.width, height: styles.pickerSmall().icon.height} : {})}
        />
    ),
    shouldFocusPicker: false,
    onBlur: () => {},
    additionalPickerEvents: () => {},
};

function BasePicker(props: Props) {
    const [isHighlighted, setIsHighlighted] = useState(false);
    const ref = useRef<View>(null);
    const pickerRef = useRef<View>(null);
    const prevItems = usePrevious(props.items);
    const context = useContext(ScrollContext);

    const placeholder = _.isEmpty(props.placeholder)
        ? {}
        : {
              ...props.placeholder,
              color: themeColors.pickerOptionsTextColor,
          };

    /**
     * Forms use inputID to set values. But BasePicker passes an index as the second parameter to onInputChange
     * We are overriding this behavior to make BasePicker work with Form
     */
    const onInputChange = (value: string, index: number) => {
        if (props.inputID) {
            props.onInputChange(value, index);
            return;
        }

        onInputChange(value, index);
    };

    // FIXME: The linter should warn to wrap this function with useCallback.
    const setDefaultValue = useCallback(() => {
        // When there is only 1 element in the selector, we do the user a favor and automatically select it for them
        // so they don't have to spend extra time selecting the only possible value.
        if (props.value || !props.items || props.items.length !== 1 || !props.onInputChange) {
            return;
        }

        props.onInputChange(props.items[0].value, 0);
    }, [props.value, props.items, props.onInputChange]);

    const enableHighlight = () => {
        setIsHighlighted(true);
    };

    const disableHighlight = () => {
        setIsHighlighted(false);
    };

    /**
     * Focuses the picker (if configured to do so)
     *
     * This method is used by Form
     */
    const focus = () => {
        if (!props.shouldFocusPicker) {
            return;
        }

        // Defer the focusing to work around a bug on Mobile Safari, where focusing the `select` element in the same
        // task when we scrolled to it left that element in a glitched state, where the dropdown list can't be opened
        // until the element gets re-focused
        _.defer(() => {
            pickerRef.current?.focus();
        });
    };

    /**
     * Like measure(), but measures the view relative to an ancestor
     *
     * This method is used by Form when scrolling to the input
     */
    const measureLayout = (relativeToNativeComponentRef: React.ElementRef<HostComponent<unknown>> | number, onSuccess: MeasureLayoutOnSuccessCallback, onFail?: () => void) => {
        if (!ref.current) {
            return;
        }

        ref.current.measureLayout(relativeToNativeComponentRef, onSuccess, onFail);
    };

    const hasError = !_.isEmpty(props.errorText);

    useEffect(() => {
        setDefaultValue();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (prevItems === props.items) {
            return;
        }
        setDefaultValue();
    }, [prevItems, props.items, setDefaultValue]);

    if (props.isDisabled) {
        return (
            <View>
                {Boolean(props.label) && (
                    <Text
                        style={[styles.textLabelSupporting, styles.mb1]}
                        numberOfLines={1}
                    >
                        {props.label}
                    </Text>
                )}
                <Text numberOfLines={1}>{props.value}</Text>
                {Boolean(props.hintText) && <Text style={[styles.textLabel, styles.colorMuted, styles.mt2]}>{props.hintText}</Text>}
            </View>
        );
    }

    return (
        <>
            <View
                ref={ref}
                style={[
                    styles.pickerContainer,
                    props.isDisabled && styles.inputDisabled,
                    props.containerStyles,
                    isHighlighted && styles.borderColorFocus,
                    hasError && styles.borderColorDanger,
                ]}
            >
                {props.label && (
                    <Text
                        pointerEvents="none"
                        style={[styles.pickerLabel, styles.textLabelSupporting]}
                    >
                        {props.label}
                    </Text>
                )}
                <RNPickerSelect
                    onValueChange={onInputChange}
                    // We add a text color to prevent white text on white background dropdown items on Windows
                    items={_.map(props.items, (item) => ({...item, color: themeColors.pickerOptionsTextColor}))}
                    style={props.size === 'normal' ? styles.picker(props.isDisabled, props.backgroundColor) : styles.pickerSmall(props.backgroundColor)}
                    useNativeAndroidPickerStyle={false}
                    placeholder={placeholder}
                    value={props.value}
                    // @ts-expect-error
                    Icon={() => props.icon(props.size)}
                    disabled={props.isDisabled}
                    fixAndroidTouchableBug
                    onOpen={enableHighlight}
                    onClose={disableHighlight}
                    textInputProps={{
                        allowFontScaling: false,
                    }}
                    pickerProps={{
                        ref: pickerRef,
                        onFocus: enableHighlight,
                        onBlur: () => {
                            disableHighlight();
                            props.onBlur();
                        },
                        // @ts-expect-error
                        ...props.additionalPickerEvents(enableHighlight, (value, index) => {
                            onInputChange(value, index);
                            disableHighlight();
                        }),
                    }}
                    scrollViewRef={context?.scrollViewRef}
                    scrollViewContentOffsetY={context?.contentOffsetY}
                />
            </View>
            <FormHelpMessage message={props.errorText} />
            {Boolean(props.hintText) && <Text style={[styles.textLabel, styles.colorMuted, styles.mt2]}>{props.hintText}</Text>}
        </>
    );
}

BasePicker.defaultProps = defaultProps;

export default React.forwardRef((props, ref) => (
    <BasePicker
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        // Forward the ref to BasePicker, as we implement imperative methods there
        ref={ref}
        key={props.inputID}
    />
));
