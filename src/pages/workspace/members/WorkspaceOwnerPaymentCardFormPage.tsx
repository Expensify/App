import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useRef} from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import PaidPolicyAccessOrNotFoundWrapper from '@pages/workspace/PaidPolicyAccessOrNotFoundWrapper';
import type SCREENS from '@src/SCREENS';
import FormProvider from '@components/Form/FormProvider';
import ONYXKEYS from "@src/ONYXKEYS";
import type {FormInputErrors, FormOnyxValues} from "@components/Form/types";
import * as ValidationUtils from "@libs/ValidationUtils";
import INPUT_IDS from "@src/types/form/AddDebitCardForm";
import InputWrapper from "@components/Form/InputWrapper";
import TextInput from "@components/TextInput";
import CONST from "@src/CONST";
import AddressSearch from "@components/AddressSearch";
import type {AnimatedTextInputRef} from "@components/RNTextInput";
import TextLink from "@components/TextLink";

type WorkspaceOwnerPaymentCardFormPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.OWNER_PAYMENT_CARD_FORM>;

const REQUIRED_FIELDS = [
    INPUT_IDS.NAME_ON_CARD,
    INPUT_IDS.CARD_NUMBER,
    INPUT_IDS.EXPIRATION_DATE,
    INPUT_IDS.SECURITY_CODE,
    INPUT_IDS.ADDRESS_STREET,
    INPUT_IDS.ADDRESS_ZIP_CODE,
    INPUT_IDS.ADDRESS_STATE,
];

function WorkspaceOwnerPaymentCardFormPage({route}: WorkspaceOwnerPaymentCardFormPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const nameOnCardRef = useRef<AnimatedTextInputRef>(null);

    const policyID = route.params.policyID;

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ADD_DEBIT_CARD_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.ADD_DEBIT_CARD_FORM> => {
        const errors = ValidationUtils.getFieldRequiredErrors(values, REQUIRED_FIELDS);

        // TODO Implement validation for the form

        return errors;
    }

    const addPaymentCard = useCallback(() => {
        // TODO: Implement addPaymentCard
    }, []);

    return (
        <AdminPolicyAccessOrNotFoundWrapper policyID={policyID}>
            <PaidPolicyAccessOrNotFoundWrapper policyID={policyID}>
                <ScreenWrapper
                    onEntryTransitionEnd={() => nameOnCardRef.current?.focus()}
                    testID={WorkspaceOwnerPaymentCardFormPage.displayName}
                >
                    <HeaderWithBackButton
                        title={translate('workspace.changeOwner.changeOwnerPageTitle')}
                        onBackButtonPress={() => Navigation.goBack()}
                    />
                    <View style={[styles.containerWithSpaceBetween, styles.ph5, styles.pb0]}>
                        <Text style={[styles.textHeadline, styles.mt3, styles.mb5]}>{translate('workspace.changeOwner.addPaymentCardTitle')}</Text>
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
                                containerStyles={[styles.mt4]}
                                inputMode={CONST.INPUT_MODE.NUMERIC}
                            />
                            <InputWrapper
                                InputComponent={TextInput}
                                inputID={INPUT_IDS.NAME_ON_CARD}
                                label={translate('addDebitCardPage.nameOnCard')}
                                aria-label={translate('addDebitCardPage.nameOnCard')}
                                role={CONST.ROLE.PRESENTATION}
                                ref={nameOnCardRef}
                                spellCheck={false}
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
                            <View style={[styles.flexRow, styles.mt4]}>
                                <View style={[styles.flex1, styles.mr2]}>
                                    <InputWrapper
                                        InputComponent={TextInput}
                                        inputID={INPUT_IDS.ADDRESS_ZIP_CODE}
                                        label={translate('common.zip')}
                                        aria-label={translate('common.zip')}
                                        role={CONST.ROLE.PRESENTATION}
                                        inputMode={CONST.INPUT_MODE.NUMERIC}
                                        maxLength={CONST.BANK_ACCOUNT.MAX_LENGTH.ZIP_CODE}
                                        hint={['common.zipCodeExampleFormat', {zipSampleFormat: CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}]}
                                        containerStyles={[styles.mt4]}
                                    />
                                </View>
                                <View style={[styles.flex1]}>
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
                            </View>
                            <Text style={styles.textMicroSupporting}>
                                {translate('workspace.changeOwner.addPaymentCardReadAndAcceptTextPart1')}{' '}
                                <TextLink style={[styles.textMicroSupporting, styles.link]} href={CONST.TERMS_URL}>{translate('workspace.changeOwner.addPaymentCardTerms')}</TextLink>{' '}
                                {translate('workspace.changeOwner.addPaymentCardAnd')}{' '}
                                <TextLink style={[styles.textMicroSupporting, styles.link]} href={CONST.PRIVACY_URL}>{translate('workspace.changeOwner.addPaymentCardPrivacy')}</TextLink>{' '}
                                {translate('workspace.changeOwner.addPaymentCardReadAndAcceptTextPart2')}
                            </Text>
                        </FormProvider>
                    </View>
                </ScreenWrapper>
            </PaidPolicyAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

WorkspaceOwnerPaymentCardFormPage.displayName = 'WorkspaceOwnerPaymentCardForm';

export default WorkspaceOwnerPaymentCardFormPage;
