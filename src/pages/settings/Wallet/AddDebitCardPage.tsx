import {useRoute} from '@react-navigation/native';
import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import AddressSearch from '@components/AddressSearch';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import ScreenWrapper from '@components/ScreenWrapper';
import StateSelector from '@components/StateSelector';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as PaymentMethods from '@userActions/PaymentMethods';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {AddDebitCardForm} from '@src/types/form';
import INPUT_IDS from '@src/types/form/AddDebitCardForm';

type DebitCardPageOnyxProps = {
    /** Form data propTypes */
    formData: OnyxEntry<AddDebitCardForm>;
};

type DebitCardPageProps = DebitCardPageOnyxProps;

function IAcceptTheLabel() {
    const {translate} = useLocalize();

    return (
        <Text>
            {`${translate('common.iAcceptThe')}`}
            <TextLink href={CONST.TERMS_URL}>{`${translate('common.expensifyTermsOfService')}`}</TextLink>
        </Text>
    );
}

const REQUIRED_FIELDS = [
    INPUT_IDS.NAME_ON_CARD,
    INPUT_IDS.CARD_NUMBER,
    INPUT_IDS.EXPIRATION_DATE,
    INPUT_IDS.SECURITY_CODE,
    INPUT_IDS.ADDRESS_STREET,
    INPUT_IDS.ADDRESS_ZIP_CODE,
    INPUT_IDS.ADDRESS_STATE,
];

function DebitCardPage({formData}: DebitCardPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const prevFormDataSetupComplete = usePrevious(!!formData?.setupComplete);
    const nameOnCardRef = useRef<AnimatedTextInputRef>(null);
    const route = useRoute();

    /**
     * Reset the form values on the mount and unmount so that old errors don't show when this form is displayed again.
     */
    useEffect(() => {
        PaymentMethods.clearDebitCardFormErrorAndSubmit();

        return () => {
            PaymentMethods.clearDebitCardFormErrorAndSubmit();
        };
    }, []);

    useEffect(() => {
        if (prevFormDataSetupComplete || !formData?.setupComplete) {
            return;
        }

        PaymentMethods.continueSetup();
    }, [prevFormDataSetupComplete, formData?.setupComplete]);

    /**
     * @param values - form input values passed by the Form component
     */
    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ADD_DEBIT_CARD_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.ADD_DEBIT_CARD_FORM> => {
        const errors = ValidationUtils.getFieldRequiredErrors(values, REQUIRED_FIELDS);

        if (values.nameOnCard && !ValidationUtils.isValidLegalName(values.nameOnCard)) {
            errors.nameOnCard = translate('addDebitCardPage.error.invalidName');
        }

        if (values.cardNumber && !ValidationUtils.isValidDebitCard(values.cardNumber.replace(/ /g, ''))) {
            errors.cardNumber = translate('addDebitCardPage.error.debitCardNumber');
        }

        if (values.expirationDate && !ValidationUtils.isValidExpirationDate(values.expirationDate)) {
            errors.expirationDate = translate('addDebitCardPage.error.expirationDate');
        }

        if (values.securityCode && !ValidationUtils.isValidSecurityCode(values.securityCode)) {
            errors.securityCode = translate('addDebitCardPage.error.securityCode');
        }

        if (values.addressStreet && !ValidationUtils.isValidAddress(values.addressStreet)) {
            errors.addressStreet = translate('addDebitCardPage.error.addressStreet');
        }

        if (values.addressZipCode && !ValidationUtils.isValidZipCode(values.addressZipCode)) {
            errors.addressZipCode = translate('addDebitCardPage.error.addressZipCode');
        }

        if (!values.acceptTerms) {
            errors.acceptTerms = translate('common.error.acceptTerms');
        }

        return errors;
    };

    return (
        <ScreenWrapper
            onEntryTransitionEnd={() => nameOnCardRef.current?.focus()}
            includeSafeAreaPaddingBottom={false}
            testID={DebitCardPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('addDebitCardPage.addADebitCard')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <FormProvider
                formID={ONYXKEYS.FORMS.ADD_DEBIT_CARD_FORM}
                validate={validate}
                onSubmit={PaymentMethods.addPaymentCard}
                submitButtonText={translate('common.save')}
                scrollContextEnabled
                style={[styles.mh5, styles.flexGrow1]}
            >
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={INPUT_IDS.NAME_ON_CARD}
                    label={translate('addDebitCardPage.nameOnCard')}
                    aria-label={translate('addDebitCardPage.nameOnCard')}
                    role={CONST.ROLE.PRESENTATION}
                    ref={nameOnCardRef}
                    spellCheck={false}
                />
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={INPUT_IDS.CARD_NUMBER}
                    label={translate('addDebitCardPage.debitCardNumber')}
                    aria-label={translate('addDebitCardPage.debitCardNumber')}
                    role={CONST.ROLE.PRESENTATION}
                    containerStyles={[styles.mt4]}
                    inputMode={CONST.INPUT_MODE.NUMERIC}
                />
                <View style={[styles.flexRow, styles.mt4]}>
                    <View style={[styles.flex1, styles.mr2]}>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.EXPIRATION_DATE}
                            label={translate('addDebitCardPage.expiration')}
                            aria-label={translate('addDebitCardPage.expiration')}
                            role={CONST.ROLE.PRESENTATION}
                            placeholder={translate('addDebitCardPage.expirationDate')}
                            inputMode={CONST.INPUT_MODE.NUMERIC}
                            maxLength={4}
                        />
                    </View>
                    <View style={[styles.flex1]}>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.SECURITY_CODE}
                            label={translate('addDebitCardPage.cvv')}
                            aria-label={translate('addDebitCardPage.cvv')}
                            role={CONST.ROLE.PRESENTATION}
                            maxLength={4}
                            inputMode={CONST.INPUT_MODE.NUMERIC}
                        />
                    </View>
                </View>
                <View>
                    <InputWrapper
                        InputComponent={AddressSearch}
                        inputID={INPUT_IDS.ADDRESS_STREET}
                        label={translate('addDebitCardPage.billingAddress')}
                        containerStyles={[styles.mt4]}
                        maxInputLength={CONST.FORM_CHARACTER_LIMIT}
                        // Limit the address search only to the USA until we fully can support international debit cards
                        isLimitedToUSA
                    />
                </View>
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={INPUT_IDS.ADDRESS_ZIP_CODE}
                    label={translate('common.zip')}
                    aria-label={translate('common.zip')}
                    role={CONST.ROLE.PRESENTATION}
                    inputMode={CONST.INPUT_MODE.NUMERIC}
                    maxLength={CONST.BANK_ACCOUNT.MAX_LENGTH.ZIP_CODE}
                    hint={translate('common.zipCodeExampleFormat', {zipSampleFormat: CONST.COUNTRY_ZIP_REGEX_DATA.US.samples})}
                    containerStyles={[styles.mt4]}
                />
                <View style={[styles.mt4, styles.mhn5]}>
                    <InputWrapper
                        stateSelectorRoute={route.name === SCREENS.IOU_SEND.ADD_DEBIT_CARD ? ROUTES.MONEY_REQUEST_STATE_SELECTOR : undefined}
                        InputComponent={StateSelector}
                        inputID={INPUT_IDS.ADDRESS_STATE}
                    />
                </View>
                <InputWrapper
                    InputComponent={CheckboxWithLabel}
                    accessibilityLabel={`${translate('common.iAcceptThe')} ${translate('common.expensifyTermsOfService')}`}
                    inputID={INPUT_IDS.ACCEPT_TERMS}
                    defaultValue={false}
                    LabelComponent={IAcceptTheLabel}
                    style={[styles.mt4]}
                />
            </FormProvider>
        </ScreenWrapper>
    );
}

DebitCardPage.displayName = 'DebitCardPage';

export default withOnyx<DebitCardPageProps, DebitCardPageOnyxProps>({
    formData: {
        key: ONYXKEYS.FORMS.ADD_DEBIT_CARD_FORM,
    },
})(DebitCardPage);
