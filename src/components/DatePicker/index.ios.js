import React, {useState, useRef, useCallback, useEffect} from 'react';
import {Button, View, Keyboard} from 'react-native';
import RNDatePicker from '@react-native-community/datetimepicker';
import {format} from 'date-fns';
import isFunction from 'lodash/isFunction';
import TextInput from '../TextInput';
import Popover from '../Popover';
import CONST from '../../CONST';
import styles from '../../styles/styles';
import themeColors from '../../styles/themes/default';
import {propTypes, defaultProps} from './datepickerPropTypes';
import useKeyboardState from '../../hooks/useKeyboardState';
import useLocalize from '../../hooks/useLocalize';

function DatePicker({value, defaultValue, innerRef, onInputChange, preferredLocale, minDate, maxDate, label, disabled, onBlur, placeholder, containerStyles, errorText}) {
    const dateValue = value || defaultValue;
    const [isPickerVisible, setIsPickerVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState(dateValue ? new Date(dateValue) : new Date());
    const {isKeyboardShown} = useKeyboardState();
    const {translate} = useLocalize();
    const initialValue = useRef(null);
    const inputRef = useRef(null);

    const showPicker = useCallback(() => {
        initialValue.current = selectedDate;

        // Opens the popover only after the keyboard is hidden to avoid a "blinking" effect where the keyboard was on iOS
        // See https://github.com/Expensify/App/issues/14084 for more context
        if (!isKeyboardShown) {
            setIsPickerVisible(true);
            return;
        }

        const listener = Keyboard.addListener('keyboardDidHide', () => {
            setIsPickerVisible(true);
            listener.remove();
        });
        Keyboard.dismiss();
    }, [isKeyboardShown, selectedDate]);

    useEffect(() => {
        if (!isFunction(innerRef)) {
            return;
        }

        const input = inputRef.current;

        if (input && input.focus && isFunction(input.focus)) {
            innerRef({...input, focus: showPicker});
            return;
        }

        innerRef(input);
    }, [innerRef, showPicker]);

    /**
     * Reset the date spinner to the initial value
     */
    const reset = () => {
        setSelectedDate(initialValue.current);
    };

    /**
     * Accept the current spinner changes, close the spinner and propagate the change
     * to the parent component (onInputChange)
     */
    const selectDate = () => {
        setIsPickerVisible(false);
        onInputChange(format(selectedDate, CONST.DATE.FNS_FORMAT_STRING));
    };

    /**
     * @param {Event} event
     * @param {Date} date
     */
    const updateLocalDate = (event, date) => {
        setSelectedDate(date);
    };

    const dateAsText = dateValue ? format(new Date(dateValue), CONST.DATE.FNS_FORMAT_STRING) : '';

    return (
        <>
            <TextInput
                forceActiveLabel
                label={label}
                accessibilityLabel={label}
                accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                value={dateAsText}
                placeholder={placeholder}
                errorText={errorText}
                containerStyles={containerStyles}
                textInputContainerStyles={[isPickerVisible && styles.borderColorFocus]}
                onPress={showPicker}
                editable={false}
                disabled={disabled}
                onBlur={onBlur}
                ref={inputRef}
            />
            <Popover
                isVisible={isPickerVisible}
                onClose={selectDate}
            >
                <View style={[styles.flexRow, styles.justifyContentBetween, styles.borderBottom, styles.pb1, styles.ph4]}>
                    <Button
                        title={translate('common.reset')}
                        color={themeColors.textError}
                        onPress={reset}
                    />
                    <Button
                        title={translate('common.done')}
                        color={themeColors.link}
                        onPress={selectDate}
                    />
                </View>
                <RNDatePicker
                    value={selectedDate}
                    mode="date"
                    display="spinner"
                    themeVariant="dark"
                    onChange={updateLocalDate}
                    locale={preferredLocale}
                    maximumDate={maxDate}
                    minimumDate={minDate}
                />
            </Popover>
        </>
    );
}

DatePicker.propTypes = propTypes;
DatePicker.defaultProps = defaultProps;
DatePicker.displayName = 'DatePicker';

/**
 * We're applying localization here because we present a modal (with buttons) ourselves
 * Furthermore we're passing the locale down so that the modal and the date spinner are in the same
 * locale. Otherwise the spinner would be present in the system locale and it would be weird if it happens
 * that the modal buttons are in one locale (app) while the (spinner) month names are another (system)
 */
export default React.forwardRef((props, ref) => (
    <DatePicker
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        innerRef={ref}
    />
));
