import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {CONST} from 'expensify-common/lib/CONST';
import Picker from './Picker';

const STATES = _.map(CONST.STATES, ({stateISO}) => ({
    value: stateISO,
    label: stateISO,
}));


// Add a blank state so users are sure to actively choose a state instead accidentally going with the default choice
STATES.unshift({
    value: '',
    label: '-',
});

const propTypes = {
    /** A callback method that is called when the value changes and it received the selected value as an argument */
    onChange: PropTypes.func.isRequired,

    /** The value that needs to be selected */
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

const defaultProps = {
    value: '',
};

const StatePicker = props => <Picker items={STATES} onChange={props.onChange} value={props.value} />;

StatePicker.propTypes = propTypes;
StatePicker.defaultProps = defaultProps;
StatePicker.displayName = 'StatePicker';

export default StatePicker;
