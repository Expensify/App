import _ from 'underscore';
import React,{forwardRef} from 'react';
import PropTypes from 'prop-types';
import {CONST} from 'expensify-common/lib/CONST';
import Picker from './Picker';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import * as FormUtils from '../libs/FormUtils';

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

    /** Indicates that the input is being used with the Form component */
    isFormInput: PropTypes.bool,

    /**
    * The ID used to uniquely identify the input
    *
    * @param {Object} props - props passed to the input
    * @returns {Object} - returns an Error object if isFormInput is supplied but inputID is falsey or not a string
    */
    inputID: props => FormUtils.validateInputIDProps(props),
    
    /** Saves a draft of the input value when used in a form */
    shouldSaveDraft: PropTypes.bool,

    /** Callback that is called when the text input is blurred */
    onBlur: PropTypes.func,

    /** Error text to display */
    errorText: PropTypes.string,
   
    ...withLocalizePropTypes,
};

const defaultProps = {
    label: '',
    value: '',
    errorText: '',
    shouldSaveDraft: false,
};

const StatePicker = forwardRef((props, ref) => (
    <Picker
        ref={ref}
        placeholder={{value: '', label: '-'}}
        items={STATES}
        onInputChange={props.onInputChange}
        value={props.value}
        label={props.label || props.translate('common.state')}
        hasError={props.hasError}
        errorText={props.errorText}
        onBlur={props.onBlur}
        containerStyles={props.containerStyles}
        isFormInput={props.isFormInput}
        shouldSaveDraft={props.shouldSaveDraft}
    />
));

StatePicker.propTypes = propTypes;
StatePicker.defaultProps = defaultProps;
StatePicker.displayName = 'StatePicker';

export default withLocalize(StatePicker);
