import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {CONST} from 'expensify-common/lib/CONST';
import ExpensiPicker from './ExpensiPicker';
import withLocalize, {withLocalizePropTypes} from './withLocalize';

const STATES = _.map(CONST.STATES, ({stateISO}) => ({
    value: stateISO,
    label: stateISO,
}));

const propTypes = {
    /** A callback method that is called when the value changes and it received the selected value as an argument */
    onChange: PropTypes.func.isRequired,

    /** The value that needs to be selected */
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

    ...withLocalizePropTypes,
};

const defaultProps = {
    value: '',
};

const StatePicker = props => (
    <ExpensiPicker
        placeholder={{value: '', label: '-'}}
        items={STATES}
        onChange={props.onChange}
        value={props.value}
        label={props.translate('common.state')}
    />
);

StatePicker.propTypes = propTypes;
StatePicker.defaultProps = defaultProps;
StatePicker.displayName = 'StatePicker';

export default withLocalize(StatePicker);
