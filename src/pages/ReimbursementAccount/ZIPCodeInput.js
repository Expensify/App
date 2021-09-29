import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import ExpensiTextInput from '../../components/ExpensiTextInput';
import styles from '../../styles/styles';
import StatePicker from '../../components/StatePicker';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';

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

const ZIPCodeInput = (props) => {
    return (
        <>
            <ExpensiTextInput
                label={props.translate('common.zip')}
                containerStyles={[styles.mt4]}
                onChangeText={value => props.onChange('addressZipCode', value)}
                value={props.addressZipCode}
                errorText={props.errorTextAddressZipCode}
            />
            <View style={[styles.flexRow, styles.mt4]}>
                <View style={[styles.flex2, styles.mr2]}>
                    <ExpensiTextInput
                        label={props.translate('common.city')}
                        onChangeText={value => props.onChange('addressCity', value)}
                        value={props.addressCity}
                        errorText={props.errorTextAddressCity}
                        translateX={-14}
                    />
                </View>
                <View style={[styles.flex1]}>
                    <StatePicker
                        onChange={value => props.onChange('addressState', value)}
                        value={props.addressState}
                        hasError={Boolean(props.errorTextAddressState)}
                    />
                </View>
            </View>
        </>
    );
};

ZIPCodeInput.propTypes = propTypes;
ZIPCodeInput.defaultProps = defaultProps;
ZIPCodeInput.displayName = 'ZIPCodeInput';
export default withLocalize(ZIPCodeInput);
