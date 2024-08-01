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
import {connectToSageIntacct} from '@libs/actions/connections/SageIntacct';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/SageIntactCredentialsForm';

type SageIntacctPrerequisitesPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_PREREQUISITES>;

function EnterSageIntacctCredentialsPage({route}: SageIntacctPrerequisitesPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policyID: string = route.params.policyID;

    const confirmCredentials = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.SAGE_INTACCT_CREDENTIALS_FORM>) => {
            connectToSageIntacct(policyID, values);
            Navigation.dismissModal();
        },
        [policyID],
    );

    const formItems = Object.values(INPUT_IDS);
    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.SAGE_INTACCT_CREDENTIALS_FORM>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.SAGE_INTACCT_CREDENTIALS_FORM> = {};

            formItems.forEach((formItem) => {
                if (values[formItem]) {
                    return;
                }
                ErrorUtils.addErrorMessage(errors, formItem, translate('common.error.fieldRequired'));
            });
            return errors;
        },
        [formItems, translate],
    );
    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={EnterSageIntacctCredentialsPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('workspace.intacct.sageIntacctSetup')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_PREREQUISITES.getRoute(policyID))}
            />
            <FormProvider
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.SAGE_INTACCT_CREDENTIALS_FORM}
                validate={validate}
                onSubmit={confirmCredentials}
                submitButtonText={translate('common.confirm')}
                enabledWhenOffline
                shouldValidateOnBlur
                shouldValidateOnChange
            >
                <Text style={[styles.textHeadlineH1, styles.pb5, styles.pt3]}>{translate('workspace.intacct.enterCredentials')}</Text>
                {formItems.map((formItem) => (
                    <View
                        style={styles.mb4}
                        key={formItem}
                    >
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={formItem}
                            label={translate(`common.${formItem}`)}
                            aria-label={translate(`common.${formItem}`)}
                            role={CONST.ROLE.PRESENTATION}
                            spellCheck={false}
                            secureTextEntry={formItem === INPUT_IDS.PASSWORD}
                        />
                    </View>
                ))}
            </FormProvider>
        </ScreenWrapper>
    );
}

EnterSageIntacctCredentialsPage.displayName = 'EnterSageIntacctCredentialsPage';

export default EnterSageIntacctCredentialsPage;
