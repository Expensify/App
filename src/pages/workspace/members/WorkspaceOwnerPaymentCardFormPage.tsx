import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import ScreenWrapper from '@components/ScreenWrapper';
import Section, {CARD_LAYOUT} from '@components/Section';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CardUtils from '@libs/CardUtils';
import * as ValidationUtils from '@libs/ValidationUtils';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import PaidPolicyAccessOrNotFoundWrapper from '@pages/workspace/PaidPolicyAccessOrNotFoundWrapper';
import * as PaymentMethods from '@userActions/PaymentMethods';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/AddDebitCardForm';

type WorkspaceOwnerPaymentCardFormPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.OWNER_PAYMENT_CARD_FORM>;

const REQUIRED_FIELDS = [INPUT_IDS.NAME_ON_CARD, INPUT_IDS.CARD_NUMBER, INPUT_IDS.EXPIRATION_DATE, INPUT_IDS.ADDRESS_STREET, INPUT_IDS.SECURITY_CODE, INPUT_IDS.ADDRESS_ZIP_CODE];

function WorkspaceOwnerPaymentCardFormPage({route}: WorkspaceOwnerPaymentCardFormPageProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();

    const cardNumberRef = useRef<AnimatedTextInputRef>(null);

    const policyID = route.params.policyID;

    useEffect(
        () => () => {
            PaymentMethods.clearDebitCardFormErrorAndSubmit();
            Policy.clearWorkspaceOwnerChangeFlow(policyID);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ADD_DEBIT_CARD_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.ADD_DEBIT_CARD_FORM> => {
        const errors = ValidationUtils.getFieldRequiredErrors(values, REQUIRED_FIELDS);

        if (values.nameOnCard && !ValidationUtils.isValidLegalName(values.nameOnCard)) {
            errors.nameOnCard = 'addDebitCardPage.error.invalidName';
        }

        if (values.cardNumber && !ValidationUtils.isValidDebitCard(values.cardNumber.replace(/ /g, ''))) {
            errors.cardNumber = 'addDebitCardPage.error.debitCardNumber';
        }

        if (values.expirationDate && !ValidationUtils.isValidExpirationDate(values.expirationDate)) {
            errors.expirationDate = 'addDebitCardPage.error.expirationDate';
        }

        if (values.securityCode && !ValidationUtils.isValidSecurityCode(values.securityCode)) {
            errors.securityCode = 'addDebitCardPage.error.securityCode';
        }

        if (values.addressStreet && !ValidationUtils.isValidAddress(values.addressStreet)) {
            errors.addressStreet = 'addDebitCardPage.error.addressStreet';
        }

        if (values.addressZipCode && !ValidationUtils.isValidZipCode(values.addressZipCode)) {
            errors.addressZipCode = 'addDebitCardPage.error.addressZipCode';
        }

        return errors;
    };

    const addPaymentCard = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ADD_DEBIT_CARD_FORM>) => {
            const cardData = {
                cardNumber: values.cardNumber,
                cardMonth: CardUtils.getMonthFromExpirationDateString(values.expirationDate),
                cardYear: CardUtils.getYearFromExpirationDateString(values.expirationDate),
                cardCVV: values.securityCode,
                addressName: values.nameOnCard,
                addressZip: values.addressZipCode,
                currency: CONST.CURRENCY.USD,
            };
            Policy.addBillingCardAndRequestPolicyOwnerChange(policyID, cardData);
            Navigation.goBack();
        },
        [policyID],
    );

    return (
        <AdminPolicyAccessOrNotFoundWrapper policyID={policyID}>
            <PaidPolicyAccessOrNotFoundWrapper policyID={policyID}>
                <ScreenWrapper
                    onEntryTransitionEnd={() => cardNumberRef.current?.focus()}
                    testID={WorkspaceOwnerPaymentCardFormPage.displayName}
                >
                    <HeaderWithBackButton
                        title={translate('workspace.changeOwner.changeOwnerPageTitle')}
                        onBackButtonPress={() => Navigation.goBack()}
                    />
                    <View style={[styles.containerWithSpaceBetween, styles.ph5, styles.pb0]}>
                        <Text style={[styles.textHeadline, styles.mt3]}>{translate('workspace.changeOwner.addPaymentCardTitle')}</Text>
                        <FormProvider
                            formID={ONYXKEYS.FORMS.ADD_DEBIT_CARD_FORM}
                            validate={validate}
                            onSubmit={addPaymentCard}
                            submitButtonText={translate('workspace.changeOwner.addPaymentCardButtonText')}
                            scrollContextEnabled
                            style={[styles.flexGrow1]}
                        >
                            <InputWrapper
                                InputComponent={TextInput}
                                inputID={INPUT_IDS.CARD_NUMBER}
                                label={translate('addDebitCardPage.debitCardNumber')}
                                aria-label={translate('addDebitCardPage.debitCardNumber')}
                                role={CONST.ROLE.PRESENTATION}
                                containerStyles={[styles.mt5]}
                                ref={cardNumberRef}
                                inputMode={CONST.INPUT_MODE.NUMERIC}
                            />
                            <InputWrapper
                                InputComponent={TextInput}
                                inputID={INPUT_IDS.NAME_ON_CARD}
                                label={translate('addDebitCardPage.nameOnCard')}
                                aria-label={translate('addDebitCardPage.nameOnCard')}
                                role={CONST.ROLE.PRESENTATION}
                                containerStyles={[styles.mt5]}
                                spellCheck={false}
                            />
                            <View style={[styles.flexRow, styles.mt5]}>
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
                            <View style={[styles.flexRow, styles.mt5]}>
                                <View style={[styles.flex1, styles.mr2]}>
                                    <InputWrapper
                                        InputComponent={TextInput}
                                        inputID={INPUT_IDS.ADDRESS_ZIP_CODE}
                                        label={translate('common.zip')}
                                        aria-label={translate('common.zip')}
                                        role={CONST.ROLE.PRESENTATION}
                                        inputMode={CONST.INPUT_MODE.NUMERIC}
                                        maxLength={CONST.BANK_ACCOUNT.MAX_LENGTH.ZIP_CODE}
                                    />
                                </View>
                                <View style={[styles.flex1]}>{/*  TODO: currency picker here  */}</View>
                            </View>
                            <Text style={[styles.textMicroSupporting, styles.mt5]}>
                                {translate('workspace.changeOwner.addPaymentCardReadAndAcceptTextPart1')}{' '}
                                <TextLink
                                    style={[styles.textMicroSupporting, styles.link]}
                                    href={CONST.TERMS_URL}
                                >
                                    {translate('workspace.changeOwner.addPaymentCardTerms')}
                                </TextLink>{' '}
                                {translate('workspace.changeOwner.addPaymentCardAnd')}{' '}
                                <TextLink
                                    style={[styles.textMicroSupporting, styles.link]}
                                    href={CONST.PRIVACY_URL}
                                >
                                    {translate('workspace.changeOwner.addPaymentCardPrivacy')}
                                </TextLink>{' '}
                                {translate('workspace.changeOwner.addPaymentCardReadAndAcceptTextPart2')}
                            </Text>
                            <Section
                                icon={Illustrations.ShieldYellow}
                                cardLayout={CARD_LAYOUT.ICON_ON_LEFT}
                                title={translate('requestorStep.isMyDataSafe')}
                                containerStyles={[styles.mh0, styles.mt5]}
                            >
                                <View style={[styles.mt4, styles.ph2, styles.pb2]}>
                                    <Text style={[styles.searchInputStyle, styles.dFlex, styles.alignItemsCenter]}>
                                        <Icon
                                            src={Expensicons.Checkmark}
                                            additionalStyles={[styles.mr3]}
                                            fill={theme.iconSuccessFill}
                                        />
                                        {translate('workspace.changeOwner.addPaymentCardPciCompliant')}
                                    </Text>
                                    <Text style={[styles.mt3, styles.searchInputStyle, styles.dFlex, styles.alignItemsCenter]}>
                                        <Icon
                                            src={Expensicons.Checkmark}
                                            additionalStyles={[styles.mr3]}
                                            fill={theme.iconSuccessFill}
                                        />
                                        {translate('workspace.changeOwner.addPaymentCardBankLevelEncrypt')}
                                    </Text>
                                    <Text style={[styles.mt3, styles.searchInputStyle, styles.dFlex, styles.alignItemsCenter]}>
                                        <Icon
                                            src={Expensicons.Checkmark}
                                            additionalStyles={[styles.mr3]}
                                            fill={theme.iconSuccessFill}
                                        />
                                        {translate('workspace.changeOwner.addPaymentCardRedundant')}
                                    </Text>
                                </View>
                                <Text style={[styles.mt3, styles.searchInputStyle]}>
                                    {translate('workspace.changeOwner.addPaymentCardLearnMore')}{' '}
                                    <TextLink
                                        style={[styles.searchInputStyle, styles.link]}
                                        href={CONST.PERSONAL_DATA_PROTECTION_INFO_URL}
                                    >
                                        {translate('workspace.changeOwner.addPaymentCardSecurity')}
                                    </TextLink>
                                    .
                                </Text>
                            </Section>
                        </FormProvider>
                    </View>
                </ScreenWrapper>
            </PaidPolicyAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

WorkspaceOwnerPaymentCardFormPage.displayName = 'WorkspaceOwnerPaymentCardForm';

export default WorkspaceOwnerPaymentCardFormPage;
