import _ from 'underscore';
import lodashGet from 'lodash/get';
import React, {Component} from 'react';
import ExpensiTextInput from '../components/ExpensiTextInput';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';

class AddressSeachInput extends Component {
    constructor(props) {
        super(props);
    }

    componentDidUpdate(prevProps) {
        if (!this.props.address) {
            return;
        }
        if (
            prevProps.address.addressStreet === this.props.address.addressStreet 
            && prevProps.address.addressState === this.props.address.addressState
            && prevProps.address.addressZipCode === this.props.address.addressZipCode
            && prevProps.address.addressCity === this.props.address.addressCity
            ) {
            return;
        }
        this.props.onChange('addressCity', this.props.address.addressCity);
        this.props.onChange('addressState', this.props.address.addressState);
        this.props.onChange('addressZipCode', this.props.address.addressZipCode);
        this.props.onChange('addressStreet', this.props.address.addressStreet);
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
        )
    }
}

// AddressSeachInput.propTypes = propTypes;
// AddressSeachInput.defaultProps = defaultProps;

export default withOnyx({
    address: {
        key: ONYXKEYS.SELECTED_ADDRESS,
    },
})(AddressSeachInput);
