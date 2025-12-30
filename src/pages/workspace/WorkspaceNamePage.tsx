import React, {useCallback} from 'react';
import {Keyboard, View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateGeneralSettings} from '@libs/actions/Policy/Policy';
import {addErrorMessage} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {isRequiredFulfilled} from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/WorkspaceSettingsForm';
import AccessOrNotFoundWrapper from './AccessOrNotFoundWrapper';
import withPolicy from './withPolicy';
import type {WithPolicyProps} from './withPolicy';

type Props = WithPolicyProps;

function WorkspaceNamePage({policy}: Props) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const submit = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_SETTINGS_FORM>) => {
            if (!policy || policy.isPolicyUpdating) {
                return;
            }

            updateGeneralSettings(policy.id, values.name.trim(), policy.outputCurrency);
            Keyboard.dismiss();
            Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.goBack());
        },
        [policy],
    );

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_SETTINGS_FORM>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_SETTINGS_FORM> = {};
            const name = values.name.trim();

            if (!isRequiredFulfilled(name)) {
                errors.name = translate('workspace.editor.nameIsRequiredError');
            } else if ([...name].length > CONST.TITLE_CHARACTER_LIMIT) {
                // Uses the spread syntax to count the number of Unicode code points instead of the number of UTF-16
                // code units.
                addErrorMessage(errors, 'name', translate('common.error.characterLimitExceedCounter', [...name].length, CONST.TITLE_CHARACTER_LIMIT));
            }

            return errors;
        },
        [translate],
    );

    return (
        <AccessOrNotFoundWrapper
            policyID={policy?.id}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                testID="WorkspaceNamePage"
            >
                <HeaderWithBackButton
                    title={translate('workspace.common.workspaceName')}
                    onBackButtonPress={() => Navigation.goBack()}
                />

                <FormProvider
                    formID={ONYXKEYS.FORMS.WORKSPACE_SETTINGS_FORM}
                    submitButtonText={translate('workspace.editor.save')}
                    style={[styles.flexGrow1, styles.ph5]}
                    scrollContextEnabled
                    validate={validate}
                    onSubmit={submit}
                    enabledWhenOffline
                    shouldHideFixErrorsAlert
                    addBottomSafeAreaPadding
                >
                    <View style={styles.mb4}>
                        <InputWrapper
                            InputComponent={TextInput}
                            role={CONST.ROLE.PRESENTATION}
                            inputID={INPUT_IDS.NAME}
                            label={translate('workspace.common.workspaceName')}
                            accessibilityLabel={translate('workspace.common.workspaceName')}
                            defaultValue={policy?.name}
                            spellCheck={false}
                            autoFocus
                        />
                    </View>
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicy(WorkspaceNamePage);
