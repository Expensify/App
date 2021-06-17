import React from 'react';
import {View} from 'react-native';
import StatePicker from '../../components/StatePicker';
import TextInputWithLabel from '../../components/TextInputWithLabel';
import styles from '../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';

const propTypes = {
    ...withLocalizePropTypes,
};

const IdentityForm = ({
    translate, firstName, lastName, street, city, state, zipCode, dob, ssnLast4, onFieldChange,
}) => (
    <>
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
            value={dob}
            onChangeText={val => onFieldChange('dob', val)}
        />
        <TextInputWithLabel
            label={`${translate('requestorStep.ssnLast4')}`}
            containerStyles={[styles.mt4]}
            value={ssnLast4}
            onChangeText={val => onFieldChange('ssnLast4', val)}
        />
        <TextInputWithLabel
            label={translate('common.companyAddressNoPO')}
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
    </>
);

IdentityForm.propTypes = propTypes;
export default withLocalize(IdentityForm);
