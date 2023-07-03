import React, {useEffect} from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import compose from '../../../libs/compose';
import HeaderWithBackButton from '../../../components/HeaderWithBackButton';
import ScreenWrapper from '../../../components/ScreenWrapper';
import styles from '../../../styles/styles';
import Text from '../../../components/Text';
import TextLink from '../../../components/TextLink';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import * as PaymentMethods from '../../../libs/actions/PaymentMethods';
import * as ValidationUtils from '../../../libs/ValidationUtils';
import CheckboxWithLabel from '../../../components/CheckboxWithLabel';
import StatePicker from '../../../components/StatePicker';
import TextInput from '../../../components/TextInput';
import CONST from '../../../CONST';
import ONYXKEYS from '../../../ONYXKEYS';
import AddressSearch from '../../../components/AddressSearch';
import * as ComponentUtils from '../../../libs/ComponentUtils';
import Form from '../../../components/Form';
import Permissions from '../../../libs/Permissions';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import usePrevious from '../../../hooks/usePrevious';

const propTypes = {
    /* Onyx Props */
    formData: PropTypes.shape({
        setupComplete: PropTypes.bool,
    }),

    /** List of betas available to current user */
    betas: PropTypes.arrayOf(PropTypes.string),

    ...withLocalizePropTypes,
};

const defaultProps = {
    formData: {
        setupComplete: false,
    },
    betas: [],
};

function DebitCardPage(props) {
    const prevFormDataSetupComplete = usePrevious(props.formData.setupComplete);

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

        if (!Permissions.canUsePasswordlessLogins(props.betas) && (!values.password || _.isEmpty(values.password.trim()))) {
            errors.password = 'addDebitCardPage.error.password';
        }

        if (!values.acceptTerms) {
            errors.acceptTerms = 'common.error.acceptTerms';
        }

        return errors;
    };

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithBackButton
                title={props.translate('addDebitCardPage.addADebitCard')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_PAYMENTS)}
            />
            <Form
                formID={ONYXKEYS.FORMS.ADD_DEBIT_CARD_FORM}
                validate={validate}
                onSubmit={PaymentMethods.addPaymentCard}
                submitButtonText={props.translate('common.save')}
                scrollContextEnabled
                style={[styles.mh5, styles.flexGrow1]}
            >
                <TextInput
                    inputID="nameOnCard"
                    label={props.translate('addDebitCardPage.nameOnCard')}
                />
                <TextInput
                    inputID="cardNumber"
                    label={props.translate('addDebitCardPage.debitCardNumber')}
                    containerStyles={[styles.mt4]}
                    keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                />
                <View style={[styles.flexRow, styles.mt4]}>
                    <View style={[styles.flex1, styles.mr2]}>
                        <TextInput
                            inputID="expirationDate"
                            label={props.translate('addDebitCardPage.expiration')}
                            placeholder={props.translate('addDebitCardPage.expirationDate')}
                            keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                            maxLength={4}
                        />
                    </View>
                    <View style={[styles.flex1]}>
                        <TextInput
                            inputID="securityCode"
                            label={props.translate('addDebitCardPage.cvv')}
                            maxLength={4}
                            keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                        />
                    </View>
                </View>
                <View>
                    <AddressSearch
                        inputID="addressStreet"
                        label={props.translate('addDebitCardPage.billingAddress')}
                        containerStyles={[styles.mt4]}
                        maxInputLength={CONST.FORM_CHARACTER_LIMIT}
                    />
                </View>
                <TextInput
                    inputID="addressZipCode"
                    label={props.translate('common.zip')}
                    keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                    maxLength={CONST.BANK_ACCOUNT.MAX_LENGTH.ZIP_CODE}
                    hint={props.translate('common.zipCodeExampleFormat', {zipSampleFormat: CONST.COUNTRY_ZIP_REGEX_DATA.US.samples})}
                    containerStyles={[styles.mt4]}
                />
                <View style={styles.mt4}>
                    <StatePicker inputID="addressState" />
                </View>
                {!Permissions.canUsePasswordlessLogins(props.betas) && (
                    <View style={[styles.mt4]}>
                        <TextInput
                            inputID="password"
                            label={props.translate('addDebitCardPage.expensifyPassword')}
                            textContentType="password"
                            autoCompleteType={ComponentUtils.PASSWORD_AUTOCOMPLETE_TYPE}
                            secureTextEntry
                        />
                    </View>
                )}
                <CheckboxWithLabel
                    accessibilityLabel={`${props.translate('common.iAcceptThe')} ${props.translate('common.expensifyTermsOfService')}`}
                    inputID="acceptTerms"
                    LabelComponent={() => (
                        <Text>
                            {`${props.translate('common.iAcceptThe')}`}
                            <TextLink href={CONST.TERMS_URL}>{`${props.translate('common.expensifyTermsOfService')}`}</TextLink>
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

export default compose(
    withLocalize,
    withOnyx({
        formData: {
            key: ONYXKEYS.FORMS.ADD_DEBIT_CARD_FORM,
        },
        betas: {
            key: ONYXKEYS.BETAS,
        },
    }),
)(DebitCardPage);
