import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Text from '../../components/Text';
import StatePicker from '../../components/StatePicker';
import TextInputWithLabel from '../../components/TextInputWithLabel';
import styles from '../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';

const propTypes = {
    /** Style for wrapping View */
    style: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),

    /** Callback fired when a field changes. Passes args as fieldName, val */
    onFieldChange: PropTypes.func.isRequired,

    /** Form values */
    values: PropTypes.shape({
        /** First name field */
        firstName: PropTypes.string,

        /** Last name field */
        lastName: PropTypes.string,

        /** Address street field */
        street: PropTypes.string,

        /** Address city field */
        city: PropTypes.string,

        /** Address state field */
        state: PropTypes.string,

        /** Address zip code field */
        zipCode: PropTypes.string,

        /** Date of birth field */
        dob: PropTypes.string,

        /** Last 4 digits of SSN */
        ssnLast4: PropTypes.string,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    style: {},
    values: {
        firstName: '',
        lastName: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        dob: '',
        ssnLast4: '',
    },
};

const IdentityForm = ({
    translate, values, onFieldChange, style,
}) => {
    const {
        firstName, lastName, street, city, state, zipCode, dob, ssnLast4,
    } = values;
    return (
        <View style={style}>
            <View style={[styles.flexRow]}>
                <View style={[styles.flex2, styles.mr2]}>
                    <TextInputWithLabel
                        label={`${translate('common.firstName')}`}
                        value={firstName}
                        onChangeText={val => onFieldChange('firstName', val)}
                    />
                </View>
                <View style={[styles.flex2]}>
                    <TextInputWithLabel
                        label={`${translate('common.lastName')}`}
                        value={lastName}
                        onChangeText={val => onFieldChange('lastName', val)}
                    />
                </View>
            </View>
            <TextInputWithLabel
                label={`${translate('common.dob')}`}
                containerStyles={[styles.mt4]}
                placeholder={translate('common.dateFormat')}
                value={dob}
                onChangeText={val => onFieldChange('dob', val)}
            />
            <TextInputWithLabel
                label={`${translate('common.ssnLast4')}`}
                containerStyles={[styles.mt4]}
                value={ssnLast4}
                onChangeText={val => onFieldChange('ssnLast4', val)}
            />
            <TextInputWithLabel
                label={translate('common.addressNoPO')}
                containerStyles={[styles.mt4]}
                value={street}
                onChangeText={val => onFieldChange('street', val)}
            />
            <View style={[styles.flexRow, styles.mt4]}>
                <View style={[styles.flex2, styles.mr2]}>
                    <TextInputWithLabel
                        label={translate('common.city')}
                        value={city}
                        onChangeText={val => onFieldChange('city', val)}
                    />
                </View>
                <View style={[styles.flex1]}>
                    <Text style={[styles.formLabel]}>{translate('common.state')}</Text>
                    <StatePicker
                        value={state}
                        onChange={val => onFieldChange('state', val)}
                    />
                </View>
            </View>
            <TextInputWithLabel
                label={translate('common.zip')}
                containerStyles={[styles.mt4]}
                value={zipCode}
                onChangeText={val => onFieldChange('zipCode', val)}
            />
        </View>
    );
};

IdentityForm.propTypes = propTypes;
IdentityForm.defaultProps = defaultProps;
export default withLocalize(IdentityForm);
