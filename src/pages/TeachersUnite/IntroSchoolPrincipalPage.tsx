import {Str} from 'expensify-common';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
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
import INPUT_IDS from '@src/types/form/IntroSchoolPrincipalForm';
import type {LoginList} from '@src/types/onyx';

type IntroSchoolPrincipalPageOnyxProps = {
    loginList: OnyxEntry<LoginList>;
};

type IntroSchoolPrincipalPageProps = IntroSchoolPrincipalPageOnyxProps;

function IntroSchoolPrincipalPage(props: IntroSchoolPrincipalPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isProduction} = useEnvironment();

    /**
     * Submit form to pass firstName, partnerUserID and lastName
     */
    const onSubmit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.INTRO_SCHOOL_PRINCIPAL_FORM>) => {
        const policyID = isProduction ? CONST.TEACHERS_UNITE.PROD_POLICY_ID : CONST.TEACHERS_UNITE.TEST_POLICY_ID;
        TeachersUnite.addSchoolPrincipal(values.firstName.trim(), values.partnerUserID.trim(), values.lastName.trim(), policyID);
    };

    /**
     * @returns - An object containing the errors for each inputID
     */
    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.INTRO_SCHOOL_PRINCIPAL_FORM>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.INTRO_SCHOOL_PRINCIPAL_FORM> = {};

            if (!values.firstName || !ValidationUtils.isValidPersonName(values.firstName)) {
                ErrorUtils.addErrorMessage(errors, 'firstName', translate('bankAccount.error.firstName'));
            }
            if (!values.lastName || !ValidationUtils.isValidPersonName(values.lastName)) {
                ErrorUtils.addErrorMessage(errors, 'lastName', translate('bankAccount.error.lastName'));
            }
            if (!values.partnerUserID) {
                ErrorUtils.addErrorMessage(errors, 'partnerUserID', translate('teachersUnitePage.error.enterEmail'));
            }
            if (values.partnerUserID && props.loginList?.[values.partnerUserID.toLowerCase()]) {
                ErrorUtils.addErrorMessage(errors, 'partnerUserID', translate('teachersUnitePage.error.tryDifferentEmail'));
            }
            if (values.partnerUserID && !Str.isValidEmail(values.partnerUserID)) {
                ErrorUtils.addErrorMessage(errors, 'partnerUserID', translate('teachersUnitePage.error.enterValidEmail'));
            }
            if (values.partnerUserID && LoginUtils.isEmailPublicDomain(values.partnerUserID)) {
                ErrorUtils.addErrorMessage(errors, 'partnerUserID', translate('teachersUnitePage.error.tryDifferentEmail'));
            }

            return errors;
        },
        [props.loginList, translate],
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            testID={IntroSchoolPrincipalPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('teachersUnitePage.introSchoolPrincipal')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <FormProvider
                enabledWhenOffline
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.INTRO_SCHOOL_PRINCIPAL_FORM}
                validate={validate}
                onSubmit={onSubmit}
                submitButtonText={translate('common.letsStart')}
            >
                <Text style={[styles.mb6]}>{translate('teachersUnitePage.schoolPrincipalVerfiyExpense')}</Text>
                <View>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.FIRST_NAME}
                        name={INPUT_IDS.FIRST_NAME}
                        label={translate('teachersUnitePage.principalFirstName')}
                        accessibilityLabel={translate('teachersUnitePage.principalFirstName')}
                        role={CONST.ROLE.PRESENTATION}
                        maxLength={CONST.DISPLAY_NAME.MAX_LENGTH}
                        autoCapitalize="words"
                    />
                </View>
                <View style={styles.mv4}>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.LAST_NAME}
                        name={INPUT_IDS.LAST_NAME}
                        label={translate('teachersUnitePage.principalLastName')}
                        accessibilityLabel={translate('teachersUnitePage.principalLastName')}
                        role={CONST.ROLE.PRESENTATION}
                        maxLength={CONST.DISPLAY_NAME.MAX_LENGTH}
                        autoCapitalize="words"
                    />
                </View>
                <View>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.PARTNER_USER_ID}
                        name={INPUT_IDS.PARTNER_USER_ID}
                        label={translate('teachersUnitePage.principalWorkEmail')}
                        accessibilityLabel={translate('teachersUnitePage.principalWorkEmail')}
                        role={CONST.ROLE.PRESENTATION}
                        inputMode={CONST.INPUT_MODE.EMAIL}
                        autoCapitalize="none"
                    />
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

IntroSchoolPrincipalPage.displayName = 'IntroSchoolPrincipalPage';

export default withOnyx<IntroSchoolPrincipalPageProps, IntroSchoolPrincipalPageOnyxProps>({
    loginList: {key: ONYXKEYS.LOGIN_LIST},
})(IntroSchoolPrincipalPage);
