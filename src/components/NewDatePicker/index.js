import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import moment from 'moment';
import PropTypes from 'prop-types';
import _ from "lodash"
import TextInput from '../TextInput';
import CONST from '../../CONST';
import styles from '../../styles/styles';
import * as Expensicons from '../Icon/Expensicons';
import {
  defaultProps as defaultBaseTextInputPropTypes,
  propTypes as baseTextInputPropTypes
} from '../TextInput/baseTextInputPropTypes';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import CalendarPicker from './CalendarPicker';
import InputWrapper from "../Form/InputWrapper";

const propTypes = {
  /**
   * The datepicker supports any value that `moment` can parse.
   * `onInputChange` would always be called with a Date (or null)
   */
  value: PropTypes.string,

  /**
   * The datepicker supports any defaultValue that `moment` can parse.
   * `onInputChange` would always be called with a Date (or null)
   */
  defaultValue: PropTypes.string,

  inputID: PropTypes.string.isRequired,

  /** A minimum date of calendar to select */
  minDate: PropTypes.objectOf(Date),

  /** A maximum date of calendar to select */
  maxDate: PropTypes.objectOf(Date),

  ...withLocalizePropTypes,
  ...baseTextInputPropTypes,
};

const datePickerDefaultProps = {
  ...defaultBaseTextInputPropTypes,
  minDate: moment().year(CONST.CALENDAR_PICKER.MIN_YEAR).toDate(),
  maxDate: moment().year(CONST.CALENDAR_PICKER.MAX_YEAR).toDate(),
  value: undefined,
};

function NewDatePicker(props) {
  const [date, setDate] = useState(props.value || props.defaultValue || undefined);


  useEffect(() => {
    if (date === props.value || _.isUndefined(props.value)) {
      return;
    }
    setDate(props.value)
  }, [date, props.value]);

  useEffect(() => {
    if (_.isFunction(props.onTouched)) {
      props.onTouched();
    }
    if (_.isFunction(props.onInputChange)) {
      props.onInputChange(date);
    }
    // To keep behavior from class component state update callback, we want to run effect only when the date is changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date])

  return (
    <View style={styles.datePickerRoot}>
      <View style={[props.isSmallScreenWidth ? styles.flex2 : {}, styles.pointerEventsNone]}>
        <InputWrapper
          InputComponent={TextInput}
          inputID={props.inputID}
          forceActiveLabel
          icon={Expensicons.Calendar}
          label={props.label}
          accessibilityLabel={props.label}
          accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
          value={props.value || date || ''}
          placeholder={props.placeholder || props.translate('common.dateFormat')}
          errorText={props.errorText}
          containerStyles={props.containerStyles}
          textInputContainerStyles={[styles.borderColorFocus]}
          inputStyle={[styles.pointerEventsNone]}
          disabled={props.disabled}
          editable={false}
        />
      </View>
      <View style={[styles.datePickerPopover, styles.border]}>
        <CalendarPicker
          minDate={props.minDate}
          maxDate={props.maxDate}
          value={date}
          onSelected={setDate}
        />
      </View>
    </View>
  );
}

NewDatePicker.propTypes = propTypes;
NewDatePicker.defaultProps = datePickerDefaultProps;

export default withLocalize(NewDatePicker);
