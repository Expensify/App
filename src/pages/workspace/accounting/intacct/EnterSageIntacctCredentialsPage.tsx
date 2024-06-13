import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/SageIntactCredentialsForm';

type IntacctPrerequisitesPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_PREREQUISITES>;

function EnterSageIntacctCredentialsPage({route}: IntacctPrerequisitesPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const policyID = route.params.policyID; // this will be used for connecting to Sage Intacct

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const updateDisplayName = useCallback((values: FormOnyxValues<typeof ONYXKEYS.FORMS.SAGE_INTACCT_CREDENTIALS_FORM>) => {
        // here we call ConnectToSageIntacct API command
        Navigation.goBack();
    }, []);

    const validate = useCallback((values: FormOnyxValues<typeof ONYXKEYS.FORMS.SAGE_INTACCT_CREDENTIALS_FORM>) => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.SAGE_INTACCT_CREDENTIALS_FORM> = {};

        if (!values.companyID) {
            ErrorUtils.addErrorMessage(errors, 'companyID', 'personalDetails.error.hasInvalidCharacter'); // dodać nazwy
        }

        if (!values.userID) {
            ErrorUtils.addErrorMessage(errors, 'userID', 'personalDetails.error.hasInvalidCharacter'); // dodać nazwy
        }

        if (!values.password) {
            ErrorUtils.addErrorMessage(errors, 'password', 'personalDetails.error.hasInvalidCharacter'); // dodać nazwy
        }
        return errors;
    }, []);
    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={EnterSageIntacctCredentialsPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('workspace.intacct.sageIntacctSetup')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <FormProvider
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.SAGE_INTACCT_CREDENTIALS_FORM}
                validate={validate}
                onSubmit={updateDisplayName}
                submitButtonText={translate('common.confirm')}
                enabledWhenOffline
                shouldValidateOnBlur
                shouldValidateOnChange
            >
                <Text style={[styles.textHeadlineH1, styles.pb5, styles.pt3]}>{translate('workspace.intacct.enterCredentials')}</Text>
                <View style={styles.mb4}>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.COMPANY_ID}
                        name="companyID"
                        label={translate('common.companyID')}
                        aria-label={translate('common.companyID')}
                        role={CONST.ROLE.PRESENTATION}
                        defaultValue=""
                        spellCheck={false}
                    />
                </View>
                <View style={styles.mb4}>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.USER_ID}
                        name="userID"
                        label={translate('common.userID')}
                        aria-label={translate('common.userID')}
                        role={CONST.ROLE.PRESENTATION}
                        defaultValue=""
                        spellCheck={false}
                    />
                </View>
                <View style={styles.mb4}>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.PASSWORD}
                        name="password"
                        label={translate('common.password')}
                        aria-label={translate('common.password')}
                        role={CONST.ROLE.PRESENTATION}
                        defaultValue=""
                        spellCheck={false}
                    />
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

EnterSageIntacctCredentialsPage.displayName = 'EnterSageIntacctCredentialsPage';

export default EnterSageIntacctCredentialsPage;
