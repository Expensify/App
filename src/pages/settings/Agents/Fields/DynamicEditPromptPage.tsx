import CollapsibleHeaderOnKeyboard from '@components/CollapsibleHeaderOnKeyboard';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues, FormRef} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';

import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useKeyboardState from '@hooks/useKeyboardState';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {updateAgentPrompt} from '@libs/actions/Agent';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import {PROMPT_MAX_AUTO_GROW_HEIGHT, PROMPT_MAX_HEIGHT_ON_KEYBOARD_OPEN_LANDSCAPE_MODE} from '@pages/settings/Agents/const';
import scrollToMultilineInput from '@pages/settings/Agents/scrollToMultilineInput';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/EditAgentPromptForm';

import {Str} from 'expensify-common';
import React, {useRef} from 'react';
import {Platform, View} from 'react-native';

type DynamicEditPromptPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.AGENTS.DYNAMIC_EDIT_PROMPT>;

function DynamicEditPromptPage({route}: DynamicEditPromptPageProps) {
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isKeyboardActive} = useKeyboardState();
    const isInLandscapeMode = useIsInLandscapeMode();
    // On native portrait the prompt grows with its content up to a max height instead of filling the screen, so the open
    // keyboard can't squeeze it or hide the line being edited, and the form scrolls to fit it above the keyboard.
    const shouldAutoGrowPromptInput = Platform.OS !== 'web' && !isInLandscapeMode;
    const shouldUseScrollableLayout = shouldAutoGrowPromptInput || isInLandscapeMode;
    const shouldShrinkPromptInput = isInLandscapeMode && isKeyboardActive;
    const accountID = route.params.accountID;
    const [agentPrompt] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${accountID}`);
    const formRef = useRef<FormRef>(null);
    const promptTopOffsetRef = useRef(0);
    const scrollToInput = () => scrollToMultilineInput(formRef, shouldUseScrollableLayout, promptTopOffsetRef.current);

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.EDIT_AGENT_PROMPT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.EDIT_AGENT_PROMPT_FORM> => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.EDIT_AGENT_PROMPT_FORM> = {};
        if (!values[INPUT_IDS.PROMPT].trim()) {
            errors[INPUT_IDS.PROMPT] = translate('editAgentPromptPage.error.emptyPrompt');
        }
        return errors;
    };

    const handleSubmit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.EDIT_AGENT_PROMPT_FORM>) => {
        updateAgentPrompt(accountID, values[INPUT_IDS.PROMPT].trim(), agentPrompt?.prompt ?? '');
        Navigation.goBack(createDynamicRoute(DYNAMIC_ROUTES.AGENT_EDIT_PROMPT.getRoute(accountID)));
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
            testID={DynamicEditPromptPage.displayName}
            includeSafeAreaPaddingBottom
            offlineIndicatorStyle={styles.mtAuto}
            shouldEnableMaxHeight={shouldAutoGrowPromptInput}
        >
            <CollapsibleHeaderOnKeyboard>
                <HeaderWithBackButton
                    title={translate('editAgentPromptPage.title')}
                    onBackButtonPress={() => Navigation.goBack(createDynamicRoute(DYNAMIC_ROUTES.AGENT_EDIT_PROMPT.getRoute(accountID)))}
                />
            </CollapsibleHeaderOnKeyboard>
            <FormProvider
                ref={formRef}
                formID={ONYXKEYS.FORMS.EDIT_AGENT_PROMPT_FORM}
                validate={validate}
                onSubmit={handleSubmit}
                submitButtonText={translate('common.save')}
                style={[styles.flex1, styles.ph5]}
                shouldUseScrollView={shouldUseScrollableLayout}
                submitFlexEnabled={false}
                enabledWhenOffline
                shouldHideFixErrorsAlert
                shouldValidateOnChange
                shouldValidateOnBlur
                keyboardSubmitBehavior={CONST.KEYBOARD_SUBMIT_BEHAVIOR.SUBMIT_ONLY}
            >
                <View style={[styles.flex1, styles.flexColumn, styles.gap5]}>
                    <View
                        style={
                            shouldShrinkPromptInput
                                ? StyleUtils.getHeight(PROMPT_MAX_HEIGHT_ON_KEYBOARD_OPEN_LANDSCAPE_MODE)
                                : [isInLandscapeMode && styles.h42, !isInLandscapeMode && !shouldAutoGrowPromptInput && styles.flex1]
                        }
                        onLayout={(event) => {
                            promptTopOffsetRef.current = event.nativeEvent.layout.y;
                        }}
                    >
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.PROMPT}
                            label={translate('editAgentPage.instructions')}
                            accessibilityLabel={translate('editAgentPage.instructions')}
                            role={CONST.ROLE.PRESENTATION}
                            type="markdown"
                            excludedMarkdownStyles={['mentionReport']}
                            defaultValue={Str.htmlDecode(agentPrompt?.prompt ?? '')}
                            multiline
                            autoGrowHeight={shouldAutoGrowPromptInput}
                            maxAutoGrowHeight={shouldAutoGrowPromptInput ? PROMPT_MAX_AUTO_GROW_HEIGHT : undefined}
                            containerStyles={shouldAutoGrowPromptInput ? undefined : [styles.h100]}
                            touchableInputWrapperStyle={shouldAutoGrowPromptInput ? undefined : [styles.flex1]}
                            inputStyle={[!shouldAutoGrowPromptInput && styles.flex1, styles.textAlignVerticalTop]}
                            onFocus={scrollToInput}
                        />
                    </View>
                    <Text style={[styles.textMicroSupporting, styles.textAlignCenter]}>{translate('workspace.rules.agentRules.disclaimer')}</Text>
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

DynamicEditPromptPage.displayName = 'DynamicEditPromptPage';

export default DynamicEditPromptPage;
