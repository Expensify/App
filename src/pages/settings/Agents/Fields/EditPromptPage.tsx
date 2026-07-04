import CollapsibleHeaderOnKeyboard from '@components/CollapsibleHeaderOnKeyboard';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';

import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useKeyboardState from '@hooks/useKeyboardState';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import {updateAgentPrompt} from '@libs/actions/Agent';
import {isMobile} from '@libs/Browser';
import isInLandscapeModeUtil from '@libs/isInLandscapeMode';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import PROMPT_MAX_HEIGHT_ON_KEYBOARD_OPEN_LANDSCAPE_MODE from '@pages/settings/Agents/const';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/EditAgentPromptForm';

import {Str} from 'expensify-common';
import React from 'react';
import {Platform, View} from 'react-native';

type EditPromptPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.AGENTS.EDIT_PROMPT>;

function EditPromptPage({route}: EditPromptPageProps) {
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {windowWidth, windowHeight} = useWindowDimensions();
    const {isKeyboardActive} = useKeyboardState();
    const isInLandscapeMode = isInLandscapeModeUtil(windowWidth, windowHeight) || (isMobile() && windowWidth > windowHeight);
    const shouldShrinkPromptInput = isInLandscapeMode && isKeyboardActive;
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
        >
            <CollapsibleHeaderOnKeyboard alwaysCollapseHeaderOnKeyboard>
                <HeaderWithBackButton
                    title={translate('editAgentPromptPage.title')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
            </CollapsibleHeaderOnKeyboard>
            <FormProvider
                formID={ONYXKEYS.FORMS.EDIT_AGENT_PROMPT_FORM}
                validate={validate}
                onSubmit={handleSubmit}
                submitButtonText={translate('common.save')}
                style={[styles.flex1, styles.ph5]}
                shouldUseScrollView={false}
                submitFlexEnabled={false}
                enabledWhenOffline
                shouldHideFixErrorsAlert
                shouldValidateOnChange
                shouldValidateOnBlur
                keyboardSubmitBehavior={CONST.KEYBOARD_SUBMIT_BEHAVIOR.SUBMIT_ONLY}
            >
                <View style={shouldShrinkPromptInput ? StyleUtils.getHeight(PROMPT_MAX_HEIGHT_ON_KEYBOARD_OPEN_LANDSCAPE_MODE) : [styles.flex1]}>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.PROMPT}
                        label={translate('editAgentPage.instructions')}
                        accessibilityLabel={translate('editAgentPage.instructions')}
                        role={CONST.ROLE.PRESENTATION}
                        defaultValue={Str.htmlDecode(agentPrompt?.prompt ?? '')}
                        multiline
                        containerStyles={[styles.h100]}
                        touchableInputWrapperStyle={[styles.flex1]}
                        inputStyle={[styles.flex1, styles.textAlignVerticalTop]}
                    />
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

EditPromptPage.displayName = 'EditPromptPage';

export default EditPromptPage;
