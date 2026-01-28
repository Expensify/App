import type {ComponentType, ForwardedRef} from 'react';
import React, {useState} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import Checkbox from './Checkbox';
import FormHelpMessage from './FormHelpMessage';
import PressableWithFeedback from './Pressable/PressableWithFeedback';
import Text from './Text';

type RequiredLabelProps =
    | {
          /** Text that appears next to check box */
          label: string;

          /** Component to display for label
           * If label is provided, LabelComponent is not required
           */
          LabelComponent?: ComponentType;
      }
    | {
          /** Component to display for label */
          LabelComponent: ComponentType;

          /** Text that appears next to check box
           * If LabelComponent is provided, label is not required
           */
          label?: string;
      };

type CheckboxWithLabelProps = RequiredLabelProps & {
    /** Whether the checkbox is checked */
    isChecked?: boolean;

    /** Called when the checkbox or label is pressed */
    onInputChange?: (value?: boolean) => void;

    /** Container styles */
    style?: StyleProp<ViewStyle>;

    /** Error text to display */
    errorText?: string;

    /** Value for checkbox. This prop is intended to be set by FormProvider only */
    value?: boolean;

    /** The default value for the checkbox */
    defaultValue?: boolean;

    /** The ID used to uniquely identify the input in a Form */
    /* eslint-disable-next-line react/no-unused-prop-types */
    inputID?: string;

    /** Saves a draft of the input value when used in a form */
    // eslint-disable-next-line react/no-unused-prop-types
    shouldSaveDraft?: boolean;

    /** An accessibility label for the checkbox */
    accessibilityLabel?: string;

    /** Reference to the outer element */
    ref?: ForwardedRef<View>;
};

function CheckboxWithLabel({
    errorText = '',
    isChecked: isCheckedProp = false,
    defaultValue = false,
    onInputChange = () => {},
    LabelComponent,
    label,
    accessibilityLabel,
    style,
    value,
    ref,
}: CheckboxWithLabelProps) {
    const styles = useThemeStyles();
    // We need to pick the first value that is strictly a boolean
    // https://github.com/Expensify/App/issues/16885#issuecomment-1520846065
    const [isChecked, setIsChecked] = useState(() => [value, defaultValue, isCheckedProp].find((item) => typeof item === 'boolean'));

    const isActuallyChecked = value !== undefined && typeof value === 'boolean' ? value : isChecked;

    const toggleCheckbox = () => {
        const newValue = !isActuallyChecked;
        onInputChange(newValue);
        // Only update internal state if not controlled by value prop
        if (value === undefined) {
            setIsChecked(newValue);
        }
    };

    return (
        <View style={style}>
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.breakWord]}>
                <Checkbox
                    isChecked={isActuallyChecked}
                    onPress={toggleCheckbox}
                    style={[styles.checkboxWithLabelCheckboxStyle]}
                    hasError={!!errorText}
                    ref={ref}
                    accessibilityLabel={accessibilityLabel ?? label ?? ''}
                />
                <PressableWithFeedback
                    tabIndex={-1}
                    accessible={false}
                    onPress={toggleCheckbox}
                    pressDimmingValue={variables.checkboxLabelActiveOpacity}
                    // We want to disable hover dimming
                    hoverDimmingValue={variables.checkboxLabelHoverOpacity}
                    style={[styles.flexRow, styles.alignItemsCenter, styles.noSelect, styles.w100]}
                    wrapperStyle={[styles.ml3, styles.pr2, styles.w100, styles.flexWrap, styles.flexShrink1]}
                >
                    {!!label && <Text style={[styles.ml1]}>{label}</Text>}
                    {!!LabelComponent && <LabelComponent />}
                </PressableWithFeedback>
            </View>
            <FormHelpMessage message={errorText} />
        </View>
    );
}

export default CheckboxWithLabel;

export type {CheckboxWithLabelProps};
