import {Str} from 'expensify-common';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {addErrorMessage} from '@libs/ErrorUtils';
import {getPhoneLogin, validateNumber} from '@libs/LoginUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getFieldRequiredErrors, isValidDisplayName} from '@libs/ValidationUtils';
import TeachersUnite from '@userActions/TeachersUnite';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/IKnowTeacherForm';

function KnowATeacherPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isProduction} = useEnvironment();
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST, {canBeMissing: true});
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});
    /**
     * Submit form to pass firstName, partnerUserID and lastName
     */
    const onSubmit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.I_KNOW_A_TEACHER_FORM>) => {
        const phoneLogin = getPhoneLogin(values.partnerUserID, countryCode);
        const validateIfNumber = validateNumber(phoneLogin);
        const contactMethod = (validateIfNumber || values.partnerUserID).trim().toLowerCase();
        const firstName = values.firstName.trim();
        const lastName = values.lastName.trim();

        const policyID = isProduction ? CONST.TEACHERS_UNITE.PROD_POLICY_ID : CONST.TEACHERS_UNITE.TEST_POLICY_ID;
        const publicRoomReportID = isProduction ? CONST.TEACHERS_UNITE.PROD_PUBLIC_ROOM_ID : CONST.TEACHERS_UNITE.TEST_PUBLIC_ROOM_ID;
        TeachersUnite.referTeachersUniteVolunteer(contactMethod, firstName, lastName, policyID, publicRoomReportID);
    };

    /**
     * @returns - An object containing the errors for each inputID
     */
    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.I_KNOW_A_TEACHER_FORM>) => {
            const errors = getFieldRequiredErrors(values, [INPUT_IDS.FIRST_NAME, INPUT_IDS.LAST_NAME]);
            const phoneLogin = getPhoneLogin(values.partnerUserID, countryCode);
            const validateIfNumber = validateNumber(phoneLogin);

            if (!isValidDisplayName(values.firstName)) {
                addErrorMessage(errors, 'firstName', translate('personalDetails.error.hasInvalidCharacter'));
            } else if (values.firstName.length > CONST.NAME.MAX_LENGTH) {
                addErrorMessage(errors, 'firstName', translate('common.error.characterLimitExceedCounter', values.firstName.length, CONST.NAME.MAX_LENGTH));
            }
            if (!isValidDisplayName(values.lastName)) {
                addErrorMessage(errors, 'lastName', translate('personalDetails.error.hasInvalidCharacter'));
            } else if (values.lastName.length > CONST.NAME.MAX_LENGTH) {
                addErrorMessage(errors, 'lastName', translate('common.error.characterLimitExceedCounter', values.lastName.length, CONST.NAME.MAX_LENGTH));
            }
            if (!values.partnerUserID) {
                addErrorMessage(errors, 'partnerUserID', translate('teachersUnitePage.error.enterPhoneEmail'));
            }
            if (values.partnerUserID && loginList?.[validateIfNumber || values.partnerUserID.toLowerCase()]) {
                addErrorMessage(errors, 'partnerUserID', translate('teachersUnitePage.error.tryDifferentEmail'));
            }
            if (values.partnerUserID && !(validateIfNumber || Str.isValidEmail(values.partnerUserID))) {
                addErrorMessage(errors, 'partnerUserID', translate('contacts.genericFailureMessages.invalidContactMethod'));
            }

            return errors;
        },
        [countryCode, loginList, translate],
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            testID="KnowATeacherPage"
        >
            <HeaderWithBackButton
                title={translate('teachersUnitePage.iKnowATeacher')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <FormProvider
                enabledWhenOffline
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.I_KNOW_A_TEACHER_FORM}
                validate={validate}
                onSubmit={onSubmit}
                submitButtonText={translate('common.letsDoThis')}
            >
                <Text style={[styles.mb6]}>{translate('teachersUnitePage.getInTouch')}</Text>
                <View>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.FIRST_NAME}
                        name="fname"
                        label={translate('common.firstName')}
                        accessibilityLabel={translate('common.firstName')}
                        role={CONST.ROLE.PRESENTATION}
                        autoCapitalize="words"
                    />
                </View>
                <View style={styles.mv4}>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.LAST_NAME}
                        name="lname"
                        label={translate('common.lastName')}
                        accessibilityLabel={translate('common.lastName')}
                        role={CONST.ROLE.PRESENTATION}
                        autoCapitalize="words"
                    />
                </View>
                <View>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.PARTNER_USER_ID}
                        name="partnerUserID"
                        label={`${translate('common.email')}/${translate('common.phoneNumber')}`}
                        accessibilityLabel={`${translate('common.email')}/${translate('common.phoneNumber')}`}
                        role={CONST.ROLE.PRESENTATION}
                        inputMode={CONST.INPUT_MODE.EMAIL}
                        autoCapitalize="none"
                    />
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

export default KnowATeacherPage;
