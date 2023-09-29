import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import CONST from '../../../../CONST';
import ONYXKEYS from '../../../../ONYXKEYS';
import TextInput from '../../../../components/TextInput';
import useLocalize from '../../../../hooks/useLocalize';
import styles from '../../../../styles/styles';
import BaseGetPhysicalCard from './BaseGetPhysicalCard';
import AddressSearch from '../../../../components/AddressSearch';

const propTypes = {
    personalDetails: PropTypes.shape({
        address: PropTypes.string,
    }),
};

const defaultProps = {
    personalDetails: {
        address: '',
    },
};

function GetPhysicalCardAddress({personalDetails: {address}}) {
    const {translate} = useLocalize();
    return (
        <BaseGetPhysicalCard
            headline={translate('getPhysicalCard.addressMessage')}
            submitButtonText={translate('getPhysicalCard.next')}
            title={translate('getPhysicalCard.header')}
        >
            <View>
                <AddressSearch
                    inputID="streetName"
                    shouldSaveDraft
                    label={translate('getPhysicalCard.streetAddress')}
                    containerStyles={[styles.mt5]}
                    value={address}
                    defaultValue=""
                    // onInputChange={props.onFieldChange}
                    // errorText={props.errors.street ? props.translate('bankAccount.error.addressStreet') : ''}
                    // hint={props.translate('common.noPO')}
                    // renamedInputKeys={props.inputKeys}
                    renamedInputKeys={{
                        street: 'streetName',
                        city: 'city',
                        state: 'state',
                        zipCode: 'zipCode',
                    }}
                    maxInputLength={CONST.FORM_CHARACTER_LIMIT}
                />
            </View>
            <TextInput
                inputID="city"
                shouldSaveDraft
                label={translate('getPhysicalCard.city')}
                accessibilityLabel={translate('getPhysicalCard.city')}
                accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                // value={city}
                defaultValue=""
                // onChangeText={(value) => props.onFieldChange({city: value})}
                // errorText={props.errors.city ? props.translate('bankAccount.error.addressCity') : ''}
                containerStyles={[styles.mt4]}
            />

            <View style={[styles.flexRow, styles.mt4]}>
                <View style={[styles.flex1, styles.mr4]}>
                    <TextInput
                        inputID="state"
                        shouldSaveDraft
                        label={translate('getPhysicalCard.state')}
                        accessibilityLabel={translate('getPhysicalCard.state')}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                        keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                        // value={zipCode}
                        defaultValue=""
                        // onChangeText={(value) => props.onFieldChange({zipCode: value})}
                        // errorText={props.errors.zipCode ? props.translate('bankAccount.error.zipCode') : ''}
                        maxLength={CONST.BANK_ACCOUNT.MAX_LENGTH.ZIP_CODE}
                        // hint={props.translate('common.zipCodeExampleFormat', {zipSampleFormat: CONST.COUNTRY_ZIP_REGEX_DATA.US.samples})}
                    />
                </View>
                <View style={[styles.w40]}>
                    <TextInput
                        inputID="zipCode"
                        shouldSaveDraft
                        label={translate('getPhysicalCard.zipPostcode')}
                        accessibilityLabel={translate('getPhysicalCard.zipPostcode')}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                        keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                        // value={zipCode}
                        defaultValue=""
                        // onChangeText={(value) => props.onFieldChange({zipCode: value})}
                        // errorText={props.errors.zipCode ? props.translate('bankAccount.error.zipCode') : ''}
                        maxLength={CONST.BANK_ACCOUNT.MAX_LENGTH.ZIP_CODE}
                        // hint={props.translate('common.zipCodeExampleFormat', {zipSampleFormat: CONST.COUNTRY_ZIP_REGEX_DATA.US.samples})}
                    />
                </View>
            </View>
            <TextInput
                inputID="country"
                shouldSaveDraft
                label={translate('getPhysicalCard.country')}
                accessibilityLabel={translate('getPhysicalCard.country')}
                accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                // value={zipCode}
                defaultValue=""
                // onChangeText={(value) => props.onFieldChange({zipCode: value})}
                // errorText={props.errors.zipCode ? props.translate('bankAccount.error.zipCode') : ''}
                maxLength={CONST.BANK_ACCOUNT.MAX_LENGTH.ZIP_CODE}
                // hint={props.translate('common.zipCodeExampleFormat', {zipSampleFormat: CONST.COUNTRY_ZIP_REGEX_DATA.US.samples})}
                containerStyles={[styles.mt4]}
            />
        </BaseGetPhysicalCard>
    );
}

GetPhysicalCardAddress.defaultProps = defaultProps;
GetPhysicalCardAddress.displayName = 'GetPhysicalCardAddress';
GetPhysicalCardAddress.propTypes = propTypes;

export default withOnyx({
    personalDetails: {
        key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    },
})(GetPhysicalCardAddress);
