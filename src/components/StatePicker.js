import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {CONST} from 'expensify-common/lib/CONST';
import Picker from './Picker';

const STATES = _.map(CONST.STATES, ({stateISO}) => ({
    value: stateISO,
    label: stateISO,
}));

const propTypes = {
    onChange: PropTypes.func.isRequired,
};

const StatePicker = props => <Picker items={STATES} onChange={props.onChange} />;

StatePicker.propTypes = propTypes;
StatePicker.displayName = 'StatePicker';

export default StatePicker;
