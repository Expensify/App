import _ from 'underscore';
import React, {forwardRef} from 'react';
import PropTypes from 'prop-types';
import {CONST} from 'expensify-common/lib/CONST';
import Picker from './Picker';
import withLocalize, {withLocalizePropTypes} from './withLocalize';

const STATES = _.map(CONST.STATES, ({stateISO}) => ({
    value: stateISO,
    label: stateISO,
}));

const propTypes = {
    /** The label for the field */
    label: PropTypes.string,

    /** A callback method that is called when the value changes and it receives the selected value as an argument. */
    onInputChange: PropTypes.func.isRequired,

    /** The value that needs to be selected */
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

    /** The ID used to uniquely identify the input in a Form */
    inputID: PropTypes.string,

    /** Saves a draft of the input value when used in a form */
    shouldSaveDraft: PropTypes.bool,

    /** Callback that is called when the text input is blurred */
    onBlur: PropTypes.func,

    /** Error text to display */
    errorText: PropTypes.string,

    /** The default value of the state picker */
    defaultValue: PropTypes.string,

    ...withLocalizePropTypes,
};

const defaultProps = {
    label: '',
    value: undefined,
    defaultValue: undefined,
    errorText: '',
    shouldSaveDraft: false,
    inputID: undefined,
    onBlur: () => {},
};

const StatePicker = forwardRef((props, ref) => (
    <Picker
        ref={ref}
        inputID={props.inputID}
        placeholder={{value: '', label: '-'}}
        items={STATES}
        onInputChange={props.onInputChange}
        value={props.value}
        defaultValue={props.defaultValue}
        label={props.label || props.translate('common.state')}
        errorText={props.errorText}
        onBlur={props.onBlur}
        shouldSaveDraft={props.shouldSaveDraft}
    />
));

StatePicker.propTypes = propTypes;
StatePicker.defaultProps = defaultProps;
StatePicker.displayName = 'StatePicker';

export default withLocalize(StatePicker);
