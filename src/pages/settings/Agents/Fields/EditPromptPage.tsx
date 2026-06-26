import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';

import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {updateAgentPrompt} from '@libs/actions/Agent';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/EditAgentPromptForm';

import {Str} from 'expensify-common';
import React from 'react';
import {Platform, View} from 'react-native';

type EditPromptPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.AGENTS.EDIT_PROMPT>;

function EditPromptPage({route}: EditPromptPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const shouldUseScrollableLayout = useIsInLandscapeMode();
    const accountID = route.params.accountID;
    const [agentPrompt] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${accountID}`);

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.EDIT_AGENT_PROMPT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.EDIT_AGENT_PROMPT_FORM> => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.EDIT_AGENT_PROMPT_FORM> = {};
        if (!values[INPUT_IDS.PROMPT].trim()) {
            errors[INPUT_IDS.PROMPT] = translate('editAgentPromptPage.error.emptyPrompt');
        }
        return errors;
    };

    const handleSubmit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.EDIT_AGENT_PROMPT_FORM>) => {
        updateAgentPrompt(accountID, values[INPUT_IDS.PROMPT].trim(), agentPrompt?.prompt ?? '');
        Navigation.goBack();
    };

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.CTRL_ENTER, (e) => {
        if (Platform.OS !== 'web') {
            return;
        }

        const textarea = e?.target as HTMLTextAreaElement;

        if (!textarea) {
            return;
        }

        const errors = validate({[INPUT_IDS.PROMPT]: textarea.value.trim()});
        if (Object.keys(errors).length > 0) {
            return;
        }

        handleSubmit({[INPUT_IDS.PROMPT]: textarea.value.trim()});
    });

    return (
        <ScreenWrapper
            testID={EditPromptPage.displayName}
            includeSafeAreaPaddingBottom
            offlineIndicatorStyle={styles.mtAuto}
            shouldEnableMaxHeight={shouldUseScrollableLayout}
        >
            <HeaderWithBackButton
                title={translate('editAgentPromptPage.title')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <FormProvider
                formID={ONYXKEYS.FORMS.EDIT_AGENT_PROMPT_FORM}
                validate={validate}
                onSubmit={handleSubmit}
                submitButtonText={translate('common.save')}
                style={[styles.flex1, styles.ph5]}
                shouldUseScrollView={shouldUseScrollableLayout}
                submitFlexEnabled={shouldUseScrollableLayout ? undefined : false}
                enabledWhenOffline
                shouldHideFixErrorsAlert
                shouldValidateOnChange
                shouldValidateOnBlur
                keyboardSubmitBehavior={CONST.KEYBOARD_SUBMIT_BEHAVIOR.SUBMIT_ONLY}
            >
                <View style={[styles.flex1, shouldUseScrollableLayout && styles.minHeight42]}>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.PROMPT}
                        label={translate('editAgentPage.instructions')}
                        accessibilityLabel={translate('editAgentPage.instructions')}
                        role={CONST.ROLE.PRESENTATION}
                        defaultValue={Str.htmlDecode(agentPrompt?.prompt ?? '')}
                        multiline
                        containerStyles={[styles.flex1]}
                        touchableInputWrapperStyle={[styles.flex1]}
                        textInputContainerStyles={[styles.flex1]}
                        inputStyle={[styles.flex1, styles.textAlignVerticalTop]}
                    />
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

EditPromptPage.displayName = 'EditPromptPage';

export default EditPromptPage;
