import React, {useCallback} from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {connectToSageIntacct} from '@libs/actions/connections/SageIntacct';
import {addErrorMessage} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/SageIntactCredentialsForm';

type SageIntacctPrerequisitesPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_PREREQUISITES>;

function EnterSageIntacctCredentialsPage({route}: SageIntacctPrerequisitesPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();
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

            for (const formItem of formItems) {
                if (values[formItem]) {
                    continue;
                }
                addErrorMessage(errors, formItem, translate('common.error.fieldRequired'));
            }
            return errors;
        },
        [formItems, translate],
    );
    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            testID={EnterSageIntacctCredentialsPage.displayName}
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <HeaderWithBackButton
                title={translate('workspace.intacct.sageIntacctSetup')}
                onBackButtonPress={() => Navigation.goBack()}
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
                addBottomSafeAreaPadding
            >
                <Text style={[styles.textHeadlineH1, styles.pb5, styles.pt3]}>{translate('workspace.intacct.enterCredentials')}</Text>
                {formItems.map((formItem, index) => (
                    <View
                        style={styles.mb4}
                        key={formItem}
                    >
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={formItem}
                            ref={index === 0 ? inputCallbackRef : undefined}
                            label={translate(`common.${formItem}`)}
                            aria-label={translate(`common.${formItem}`)}
                            role={CONST.ROLE.PRESENTATION}
                            spellCheck={false}
                            secureTextEntry={formItem === INPUT_IDS.PASSWORD}
                            autoCorrect={false}
                        />
                    </View>
                ))}
            </FormProvider>
        </ScreenWrapper>
    );
}

EnterSageIntacctCredentialsPage.displayName = 'EnterSageIntacctCredentialsPage';

export default EnterSageIntacctCredentialsPage;
