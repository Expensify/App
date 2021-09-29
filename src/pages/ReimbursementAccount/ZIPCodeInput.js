import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import compose from '../../libs/compose';
import ExpensiTextInput from '../../components/ExpensiTextInput';
import styles from '../../styles/styles';
import StatePicker from '../../components/StatePicker';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import ONYXKEYS from '../../ONYXKEYS';
import {isValidZipCode} from '../../libs/ValidationUtils';
import {fetchCityAndStateFromZIPCode} from '../../libs/actions/GeoLocation';

const propTypes = {
    addressZipCode: PropTypes.string,
    addressCity: PropTypes.string,
    addressState: PropTypes.string,

    errorTextAddressZipCode: PropTypes.string,
    errorTextAddressCity: PropTypes.string,
    errorTextAddressState: PropTypes.string,

    /** A callback that is triggered when the input changes on a field */
    onChange: PropTypes.func.isRequired,

    ...withLocalizePropTypes,
};
const defaultProps = {
    addressZipCode: '',
    addressCity: '',
    addressState: '',
    errorTextAddressZipCode: '',
    errorTextAddressCity: '',
    errorTextAddressState: '',
};

class ZIPCodeInput extends React.Component {
    constructor(props) {
        super(props);

        this.getCityAndStateForZIPCode = this.getCityAndStateForZIPCode.bind(this);

        this.state = {
            isCityDisabled: props.addressCity === '',
            isStateDisabled: props.addressState === '',
        };
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.cityAndStateFromZipCode && this.props.cityAndStateFromZipCode) {
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({
                isCityDisabled: false,
                isStateDisabled: false,
            }, () => {
                this.props.onChange('addressCity', this.props.cityAndStateFromZipCode.city);
                this.props.onChange('addressState', this.props.cityAndStateFromZipCode.state);
            });
        }
    }

    getCityAndStateForZIPCode(zipCode) {
        if (isValidZipCode(zipCode)) {
            this.props.onChange('addressCity', this.props.translate('bankAccount.searching'));
            fetchCityAndStateFromZIPCode(zipCode);
        }
    }

    render() {
        return (
            <>
                <ExpensiTextInput
                    label={this.props.translate('common.zip')}
                    containerStyles={[styles.mt4]}
                    onChangeText={(value) => {
                        this.props.onChange('addressZipCode', value);
                        this.getCityAndStateForZIPCode(value);
                    }}
                    value={this.props.addressZipCode}
                    errorText={this.props.errorTextAddressZipCode}
                />
                <View style={[styles.flexRow, styles.mt4]}>
                    <View style={[styles.flex2, styles.mr2]}>
                        <ExpensiTextInput
                            label={this.props.translate('common.city')}
                            onChangeText={value => this.props.onChange('addressCity', value)}
                            value={this.props.addressCity}
                            errorText={this.props.errorTextAddressCity}
                            translateX={-14}
                            disabled={this.state.isCityDisabled}
                        />
                    </View>
                    <View style={[styles.flex1]}>
                        <StatePicker
                            onChange={value => this.props.onChange('addressState', value)}
                            value={this.props.addressState}
                            hasError={Boolean(this.props.errorTextAddressState)}
                            disabled={this.state.isStateDisabled}
                        />
                    </View>
                </View>
            </>
        );
    }
}

ZIPCodeInput.propTypes = propTypes;
ZIPCodeInput.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        cityAndStateFromZipCode: {
            key: props => `${ONYXKEYS.COLLECTION.CITYSTATE_BY_ZIPCODE}${props.addressZipCode}`,
        },
    }),
)(ZIPCodeInput);
