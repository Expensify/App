import React from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {connectToRillet} from '@libs/actions/connections/Rillet';
import {addErrorMessage} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/RilletCredentialsForm';

type RilletSetupPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.RILLET_SETUP>;

function RilletSetupPage({route}: RilletSetupPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();
    const policyID: string = route.params.policyID;

    const confirmCredentials = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.RILLET_CREDENTIALS_FORM>) => {
        connectToRillet(policyID, values[INPUT_IDS.API_KEY]);
        Navigation.dismissModal();
    };

    const formItems = Object.values(INPUT_IDS);
    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.RILLET_CREDENTIALS_FORM>) => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.RILLET_CREDENTIALS_FORM> = {};

        for (const formItem of formItems) {
            if (values[formItem]) {
                continue;
            }
            addErrorMessage(errors, formItem, translate('common.error.fieldRequired'));
        }
        return errors;
    };

    return (
        <ScreenWrapper
            testID="RilletSetupPage"
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <HeaderWithBackButton
                title={translate('workspace.rillet.rilletSetup')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <FormProvider
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.RILLET_CREDENTIALS_FORM}
                validate={validate}
                onSubmit={confirmCredentials}
                submitButtonText={translate('common.confirm')}
                shouldValidateOnBlur
                shouldUseScrollView
                shouldValidateOnChange
                addBottomSafeAreaPadding
            >
                <Text style={[styles.textHeadlineH1, styles.pb5, styles.pt3]}>{translate('workspace.rillet.enterCredentials')}</Text>
                <View style={[styles.renderHTML, styles.mb5]}>
                    <RenderHTML html={translate('workspace.rillet.howToFindAPIKey')} />
                </View>

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
                            secureTextEntry={formItem === INPUT_IDS.API_KEY}
                            autoCorrect={false}
                        />
                    </View>
                ))}
            </FormProvider>
        </ScreenWrapper>
    );
}

export default RilletSetupPage;
