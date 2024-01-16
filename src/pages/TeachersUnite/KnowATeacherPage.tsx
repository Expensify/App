import Str from 'expensify-common/lib/str';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx/lib/types';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as LoginUtils from '@libs/LoginUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as ValidationUtils from '@libs/ValidationUtils';
import TeachersUnite from '@userActions/TeachersUnite';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {LoginList} from '@src/types/onyx';

type KnowATeacherFormData = {
    firstName: string;
    lastName: string;
    partnerUserID: string;
};

type KnowATeacherPageOnyxProps = {
    loginList: OnyxEntry<LoginList>;
};

type KnowATeacherPageProps = KnowATeacherPageOnyxProps;

function KnowATeacherPage(props: KnowATeacherPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isProduction} = useEnvironment();

    /**
     * Submit form to pass firstName, partnerUserID and lastName
     */
    const onSubmit = (values: KnowATeacherFormData) => {
        const phoneLogin = LoginUtils.getPhoneLogin(values.partnerUserID);
        const validateIfnumber = LoginUtils.validateNumber(phoneLogin);
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
        (values: KnowATeacherFormData) => {
            const errors = {};
            const phoneLogin = LoginUtils.getPhoneLogin(values.partnerUserID);
            const validateIfnumber = LoginUtils.validateNumber(phoneLogin);

            if (!ValidationUtils.isValidLegalName(values.firstName)) {
                ErrorUtils.addErrorMessage(errors, 'firstName', 'privatePersonalDetails.error.hasInvalidCharacter');
            } else if (!values.firstName) {
                ErrorUtils.addErrorMessage(errors, 'firstName', 'bankAccount.error.firstName');
            }
            if (!ValidationUtils.isValidLegalName(values.lastName)) {
                ErrorUtils.addErrorMessage(errors, 'lastName', 'privatePersonalDetails.error.hasInvalidCharacter');
            } else if (!values.lastName) {
                ErrorUtils.addErrorMessage(errors, 'lastName', 'bankAccount.error.lastName');
            }
            if (!values.partnerUserID) {
                ErrorUtils.addErrorMessage(errors, 'partnerUserID', 'teachersUnitePage.error.enterPhoneEmail');
            }
            if (values.partnerUserID && props.loginList?.[validateIfnumber || values.partnerUserID.toLowerCase()]) {
                ErrorUtils.addErrorMessage(errors, 'partnerUserID', 'teachersUnitePage.error.tryDifferentEmail');
            }
            if (values.partnerUserID && !(validateIfnumber || Str.isValidEmail(values.partnerUserID))) {
                ErrorUtils.addErrorMessage(errors, 'partnerUserID', 'contacts.genericFailureMessages.invalidContactMethod');
            }

            return errors;
        },
        [props.loginList],
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={KnowATeacherPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('teachersUnitePage.iKnowATeacher')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.TEACHERS_UNITE)}
            />
            {/* @ts-expect-error TODO: Remove this once FormProvider (https://github.com/Expensify/App/issues/31972) is migrated to TypeScript. */}
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
                        // @ts-expect-error TODO: Remove this once InputWrapper (https://github.com/Expensify/App/issues/31972) is migrated to TypeScript.
                        InputComponent={TextInput}
                        inputID="firstName"
                        name="fname"
                        label={translate('common.firstName')}
                        accessibilityLabel={translate('common.firstName')}
                        role={CONST.ROLE.PRESENTATION}
                        maxLength={CONST.DISPLAY_NAME.MAX_LENGTH}
                        autoCapitalize="words"
                    />
                </View>
                <View style={styles.mv4}>
                    <InputWrapper
                        // @ts-expect-error TODO: Remove this once InputWrapper (https://github.com/Expensify/App/issues/31972) is migrated to TypeScript.
                        InputComponent={TextInput}
                        inputID="lastName"
                        name="lname"
                        label={translate('common.lastName')}
                        accessibilityLabel={translate('common.lastName')}
                        role={CONST.ROLE.PRESENTATION}
                        maxLength={CONST.DISPLAY_NAME.MAX_LENGTH}
                        autoCapitalize="words"
                    />
                </View>
                <View>
                    <InputWrapper
                        // @ts-expect-error TODO: Remove this once InputWrapper (https://github.com/Expensify/App/issues/31972) is migrated to TypeScript.
                        InputComponent={TextInput}
                        inputID="partnerUserID"
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

export default withOnyx<KnowATeacherPageProps, KnowATeacherPageOnyxProps>({
    loginList: {key: ONYXKEYS.LOGIN_LIST},
})(KnowATeacherPage);
