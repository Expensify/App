import {Str} from 'expensify-common';
import React, {useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {addErrorMessage} from '@libs/ErrorUtils';
import {isEmailPublicDomain} from '@libs/LoginUtils';
import Navigation from '@libs/Navigation/Navigation';
import {generateReportID} from '@libs/ReportUtils';
import {isValidPersonName} from '@libs/ValidationUtils';
import TeachersUnite from '@userActions/TeachersUnite';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/IntroSchoolPrincipalForm';

function IntroSchoolPrincipalPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isProduction} = useEnvironment();
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST, {canBeMissing: true});
    const [formState] = useOnyx(ONYXKEYS.FORMS.INTRO_SCHOOL_PRINCIPAL_FORM, {canBeMissing: true});
    const {localCurrencyCode, login, accountID} = useCurrentUserPersonalDetails();
    const optimisticReportID = useRef(generateReportID());
    const hasSubmittedRef = useRef(false);

    // eslint-disable-next-line rulesdir/prefer-early-return
    useEffect(() => {
        if (hasSubmittedRef.current && formState && !formState.isLoading && !formState.errors) {
            Navigation.dismissModalWithReport({reportID: optimisticReportID.current});
            hasSubmittedRef.current = false;
        }
    }, [formState, isProduction]);

    /**
     * Submit form to pass firstName, partnerUserID and lastName
     */
    const onSubmit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.INTRO_SCHOOL_PRINCIPAL_FORM>) => {
        hasSubmittedRef.current = true;
        const policyID = isProduction ? CONST.TEACHERS_UNITE.PROD_POLICY_ID : CONST.TEACHERS_UNITE.TEST_POLICY_ID;
        TeachersUnite.addSchoolPrincipal(
            values.firstName.trim(),
            values.partnerUserID.trim(),
            values.lastName.trim(),
            policyID,
            localCurrencyCode,
            login ?? '',
            accountID,
            optimisticReportID.current,
        );
    };

    /**
     * @returns - An object containing the errors for each inputID
     */
    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.INTRO_SCHOOL_PRINCIPAL_FORM>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.INTRO_SCHOOL_PRINCIPAL_FORM> = {};

            if (!values.firstName || !isValidPersonName(values.firstName)) {
                addErrorMessage(errors, 'firstName', translate('bankAccount.error.firstName'));
            } else if (values.firstName.length > CONST.NAME.MAX_LENGTH) {
                addErrorMessage(errors, 'firstName', translate('common.error.characterLimitExceedCounter', values.firstName.length, CONST.NAME.MAX_LENGTH));
            }
            if (!values.lastName || !isValidPersonName(values.lastName)) {
                addErrorMessage(errors, 'lastName', translate('bankAccount.error.lastName'));
            } else if (values.lastName.length > CONST.NAME.MAX_LENGTH) {
                addErrorMessage(errors, 'lastName', translate('common.error.characterLimitExceedCounter', values.lastName.length, CONST.NAME.MAX_LENGTH));
            }
            if (!values.partnerUserID) {
                addErrorMessage(errors, 'partnerUserID', translate('teachersUnitePage.error.enterEmail'));
            }
            if (values.partnerUserID && loginList?.[values.partnerUserID.toLowerCase()]) {
                addErrorMessage(errors, 'partnerUserID', translate('teachersUnitePage.error.tryDifferentEmail'));
            }
            if (values.partnerUserID && !Str.isValidEmail(values.partnerUserID)) {
                addErrorMessage(errors, 'partnerUserID', translate('teachersUnitePage.error.enterValidEmail'));
            }
            if (values.partnerUserID && isEmailPublicDomain(values.partnerUserID)) {
                addErrorMessage(errors, 'partnerUserID', translate('teachersUnitePage.error.tryDifferentEmail'));
            }

            return errors;
        },
        [loginList, translate],
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            testID="IntroSchoolPrincipalPage"
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
                <Text style={[styles.mb6]}>{translate('teachersUnitePage.schoolPrincipalVerifyExpense')}</Text>
                <View>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.FIRST_NAME}
                        name={INPUT_IDS.FIRST_NAME}
                        label={translate('teachersUnitePage.principalFirstName')}
                        accessibilityLabel={translate('teachersUnitePage.principalFirstName')}
                        role={CONST.ROLE.PRESENTATION}
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

export default IntroSchoolPrincipalPage;
