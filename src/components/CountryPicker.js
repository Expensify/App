import _ from 'underscore';
import React, {forwardRef} from 'react';
import PropTypes from 'prop-types';
import Picker from './Picker';
import withLocalize, {withLocalizePropTypes} from './withLocalize';

const propTypes = {
    /** The label for the field */
    label: PropTypes.string,

    /** A callback method that is called when the value changes and it receives the selected value as an argument. */
    onInputChange: PropTypes.func.isRequired,

    /** The value that needs to be selected */
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

    /** The ID used to uniquely identify the input in a form */
    inputID: PropTypes.string,

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
    value: undefined,
    errorText: '',
    shouldSaveDraft: false,
    inputID: undefined,
    onBlur: () => {},
};

const CountryPicker = forwardRef((props, ref) => {
    const COUNTRIES = _.map(props.translate('allCountries'), (countryName, countryISO) => ({
        value: countryISO,
        label: countryName,
    }));

    return (
        <Picker
            ref={ref}
            inputID={props.inputID}
            placeholder={{value: '', label: '-'}}
            items={COUNTRIES}
            onInputChange={props.onInputChange}
            value={props.value}
            label={props.label || props.translate('common.country')}
            errorText={props.errorText}
            onBlur={props.onBlur}
            shouldSaveDraft={props.shouldSaveDraft}
        />
    );
});

CountryPicker.propTypes = propTypes;
CountryPicker.defaultProps = defaultProps;
CountryPicker.displayName = 'CountryPicker';

export default withLocalize(CountryPicker);
