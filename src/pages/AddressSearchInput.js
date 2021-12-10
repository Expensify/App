import _ from 'underscore';
import lodashGet from 'lodash/get';
import React, {Component} from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import ExpensiTextInput from '../components/ExpensiTextInput';
import ONYXKEYS from '../ONYXKEYS';
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';

const propTypes = {
    /* Onyx Props */
    address: PropTypes.shape({
        addressStreet: PropTypes.string,
        addressCity: PropTypes.string,
        addressState: PropTypes.string,
        addressZipCode: PropTypes.string,
    }),

    /** Callback to execute when an address is selected */
    onChange: PropTypes.func.isRequired,

    /** Input label */
    label: PropTypes.string,

    /** Error text to display */
    errorText: PropTypes.string,

    /** Customize the ExpensiTextInput container */
    containerStyles: PropTypes.arrayOf(PropTypes.object),
};

const defaultProps = {
    address: {
        addressStreet: '',
        addressCity: '',
        addressState: '',
        addressZipCode: '',
    },
    label: '',
    errorText: '',
    containerStyles: [],
};

class AddressSeachInput extends Component {
    componentDidUpdate(prevProps) {
        if (!this.props.address) {
            return;
        }
        if (_.isEqual(prevProps.address, this.props.address)) {
            return;
        }
        this.props.onChange('addressStreet', this.props.address.addressStreet);
        this.props.onChange('addressCity', this.props.address.addressCity);
        this.props.onChange('addressState', this.props.address.addressState);
        this.props.onChange('addressZipCode', this.props.address.addressZipCode);
    }

    render() {
        return (
            <ExpensiTextInput
                label={this.props.label}
                containerStyles={this.props.containerStyles}
                value={lodashGet(this.props.address, 'addressStreet', '')}
                errorText={this.props.errorText}
                onFocus={() => Navigation.navigate(ROUTES.ADDRESS_SEARCH)}
            />
        );
    }
}

AddressSeachInput.propTypes = propTypes;
AddressSeachInput.defaultProps = defaultProps;

export default withOnyx({
    address: {
        key: ONYXKEYS.SELECTED_ADDRESS,
    },
})(AddressSeachInput);
