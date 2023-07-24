import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import HeaderWithBackButton from '../../../components/HeaderWithBackButton';
import ScreenWrapper from '../../../components/ScreenWrapper';
import styles from '../../../styles/styles';
import Text from '../../../components/Text';
import TextLink from '../../../components/TextLink';
import useLocalize from '../../../hooks/useLocalize';
import * as PaymentMethods from '../../../libs/actions/PaymentMethods';
import * as ValidationUtils from '../../../libs/ValidationUtils';
import CheckboxWithLabel from '../../../components/CheckboxWithLabel';
import StatePicker from '../../../components/StatePicker';
import TextInput from '../../../components/TextInput';
import CONST from '../../../CONST';
import ONYXKEYS from '../../../ONYXKEYS';
import AddressSearch from '../../../components/AddressSearch';
import Form from '../../../components/Form';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import usePrevious from '../../../hooks/usePrevious';

const propTypes = {
    /* Onyx Props */
    formData: PropTypes.shape({
        setupComplete: PropTypes.bool,
    }),
};

const defaultProps = {
    formData: {
        setupComplete: false,
    },
};

function DebitCardPage(props) {
    const {translate} = useLocalize();
    const prevFormDataSetupComplete = usePrevious(props.formData.setupComplete);
    const nameOnCardRef = useRef(null);

    useEffect(() => {
        PaymentMethods.clearDebitCardFormErrorAndSubmit();
    }, []);

    useEffect(() => {
        if (prevFormDataSetupComplete || !props.formData.setupComplete) {
            return;
        }

        PaymentMethods.continueSetup();

        return () => {
            PaymentMethods.clearDebitCardFormErrorAndSubmit();
        };
    }, [prevFormDataSetupComplete, props.formData.setupComplete]);

    /**
     * @param {Object} values - form input values passed by the Form component
     * @returns {Boolean}
     */
    const validate = (values) => {
        const errors = {};

        if (!values.nameOnCard || !ValidationUtils.isValidLegalName(values.nameOnCard)) {
            errors.nameOnCard = 'addDebitCardPage.error.invalidName';
        }

        if (!values.cardNumber || !ValidationUtils.isValidDebitCard(values.cardNumber.replace(/ /g, ''))) {
            errors.cardNumber = 'addDebitCardPage.error.debitCardNumber';
        }

        if (!values.expirationDate || !ValidationUtils.isValidExpirationDate(values.expirationDate)) {
            errors.expirationDate = 'addDebitCardPage.error.expirationDate';
        }

        if (!values.securityCode || !ValidationUtils.isValidSecurityCode(values.securityCode)) {
            errors.securityCode = 'addDebitCardPage.error.securityCode';
        }

        if (!values.addressStreet || !ValidationUtils.isValidAddress(values.addressStreet)) {
            errors.addressStreet = 'addDebitCardPage.error.addressStreet';
        }

        if (!values.addressZipCode || !ValidationUtils.isValidZipCode(values.addressZipCode)) {
            errors.addressZipCode = 'addDebitCardPage.error.addressZipCode';
        }

        if (!values.addressState || !values.addressState) {
            errors.addressState = 'addDebitCardPage.error.addressState';
        }

        if (!values.acceptTerms) {
            errors.acceptTerms = 'common.error.acceptTerms';
        }

        return errors;
    };

    return (
        <ScreenWrapper
            onEntryTransitionEnd={() => nameOnCardRef.current && nameOnCardRef.current.focus()}
            includeSafeAreaPaddingBottom={false}
        >
            <HeaderWithBackButton
                title={translate('addDebitCardPage.addADebitCard')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_PAYMENTS)}
            />
            <Form
                formID={ONYXKEYS.FORMS.ADD_DEBIT_CARD_FORM}
                validate={validate}
                onSubmit={PaymentMethods.addPaymentCard}
                submitButtonText={translate('common.save')}
                scrollContextEnabled
                style={[styles.mh5, styles.flexGrow1]}
            >
                <TextInput
                    inputID="nameOnCard"
                    label={translate('addDebitCardPage.nameOnCard')}
                    accessibilityLabel={translate('addDebitCardPage.nameOnCard')}
                    accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                    ref={(ref) => (nameOnCardRef.current = ref)}
                />
                <TextInput
                    inputID="cardNumber"
                    label={translate('addDebitCardPage.debitCardNumber')}
                    accessibilityLabel={translate('addDebitCardPage.debitCardNumber')}
                    accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                    containerStyles={[styles.mt4]}
                    keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                />
                <View style={[styles.flexRow, styles.mt4]}>
                    <View style={[styles.flex1, styles.mr2]}>
                        <TextInput
                            inputID="expirationDate"
                            label={translate('addDebitCardPage.expiration')}
                            accessibilityLabel={translate('addDebitCardPage.expiration')}
                            accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                            placeholder={translate('addDebitCardPage.expirationDate')}
                            keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                            maxLength={4}
                        />
                    </View>
                    <View style={[styles.flex1]}>
                        <TextInput
                            inputID="securityCode"
                            label={translate('addDebitCardPage.cvv')}
                            accessibilityLabel={translate('addDebitCardPage.cvv')}
                            accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                            maxLength={4}
                            keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                        />
                    </View>
                </View>
                <View>
                    <AddressSearch
                        inputID="addressStreet"
                        label={translate('addDebitCardPage.billingAddress')}
                        containerStyles={[styles.mt4]}
                        maxInputLength={CONST.FORM_CHARACTER_LIMIT}
                    />
                </View>
                <TextInput
                    inputID="addressZipCode"
                    label={translate('common.zip')}
                    accessibilityLabel={translate('common.zip')}
                    accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                    keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                    maxLength={CONST.BANK_ACCOUNT.MAX_LENGTH.ZIP_CODE}
                    hint={translate('common.zipCodeExampleFormat', {zipSampleFormat: CONST.COUNTRY_ZIP_REGEX_DATA.US.samples})}
                    containerStyles={[styles.mt4]}
                />
                <View style={styles.mt4}>
                    <StatePicker inputID="addressState" />
                </View>
                <CheckboxWithLabel
                    accessibilityLabel={`${translate('common.iAcceptThe')} ${translate('common.expensifyTermsOfService')}`}
                    inputID="acceptTerms"
                    LabelComponent={() => (
                        <Text>
                            {`${translate('common.iAcceptThe')}`}
                            <TextLink href={CONST.TERMS_URL}>{`${translate('common.expensifyTermsOfService')}`}</TextLink>
                        </Text>
                    )}
                    style={[styles.mt4]}
                />
            </Form>
        </ScreenWrapper>
    );
}

DebitCardPage.propTypes = propTypes;
DebitCardPage.defaultProps = defaultProps;

export default withOnyx({
    formData: {
        key: ONYXKEYS.FORMS.ADD_DEBIT_CARD_FORM,
    },
})(DebitCardPage);
