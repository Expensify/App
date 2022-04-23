import _ from 'underscore';
import React from 'react';
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

    /** A callback method that is called when the value changes and it received the selected value as an argument */
    onChange: PropTypes.func.isRequired,

    /** The value that needs to be selected */
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

    ...withLocalizePropTypes,
};

const defaultProps = {
    label: '',
    value: '',
};

const StatePicker = props => (
    <Picker
        placeholder={{value: '', label: '-'}}
        items={STATES}
        onInputChange={props.onChange}
        value={props.value}
        label={props.label || props.translate('common.state')}
        hasError={props.hasError}
        errorText={props.errorText}
    />
);

StatePicker.propTypes = propTypes;
StatePicker.defaultProps = defaultProps;
StatePicker.displayName = 'StatePicker';

export default withLocalize(StatePicker);
