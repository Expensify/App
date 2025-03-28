import {Str} from 'expensify-common';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {addErrorMessage} from '@libs/ErrorUtils';
import {getPhoneLogin, validateNumber} from '@libs/LoginUtils';
import Navigation from '@libs/Navigation/Navigation';
import {isValidDisplayName} from '@libs/ValidationUtils';
import TeachersUnite from '@userActions/TeachersUnite';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/IKnowTeacherForm';

function KnowATeacherPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isProduction} = useEnvironment();
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST);

    /**
     * Submit form to pass firstName, partnerUserID and lastName
     */
    const onSubmit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.I_KNOW_A_TEACHER_FORM>) => {
        const phoneLogin = getPhoneLogin(values.partnerUserID);
        const validateIfnumber = validateNumber(phoneLogin);
        const contactMethod = (validateIfnumber || values.partnerUserID).trim().toLowerCase();
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
            const errors = {};
            const phoneLogin = getPhoneLogin(values.partnerUserID);
            const validateIfNumber = validateNumber(phoneLogin);

            if (!values.firstName || !isValidDisplayName(values.firstName)) {
                addErrorMessage(errors, 'firstName', translate('personalDetails.error.hasInvalidCharacter'));
            } else if (values.firstName.length > CONST.DISPLAY_NAME.MAX_LENGTH) {
                addErrorMessage(
                    errors,
                    'firstName',
                    translate('common.error.characterLimitExceedCounter', {
                        length: values.firstName.length,
                        limit: CONST.DISPLAY_NAME.MAX_LENGTH,
                    }),
                );
            }
            if (!values.lastName || !isValidDisplayName(values.lastName)) {
                addErrorMessage(errors, 'lastName', translate('personalDetails.error.hasInvalidCharacter'));
            } else if (values.lastName.length > CONST.DISPLAY_NAME.MAX_LENGTH) {
                addErrorMessage(
                    errors,
                    'lastName',
                    translate('common.error.characterLimitExceedCounter', {
                        length: values.lastName.length,
                        limit: CONST.DISPLAY_NAME.MAX_LENGTH,
                    }),
                );
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
        [loginList, translate],
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            testID={KnowATeacherPage.displayName}
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

KnowATeacherPage.displayName = 'KnowATeacherPage';

export default KnowATeacherPage;
