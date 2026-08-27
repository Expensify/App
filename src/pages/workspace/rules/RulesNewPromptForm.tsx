import Button from '@components/ButtonComposed';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues, FormRef} from '@components/Form/types';
import Text from '@components/Text';
import TextInput from '@components/TextInput';

import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearNewRulePromptError} from '@userActions/Policy/Rules';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/NewRulePromptForm';

import type {StyleProp, TextInputKeyPressEvent, ViewStyle} from 'react-native';

import React, {useRef} from 'react';
import {View} from 'react-native';

type NewRulePromptFormID = typeof ONYXKEYS.FORMS.NEW_RULE_PROMPT_FORM;

type RulesNewPromptFormProps = {
    /** Called with the form values when the admin asks Concierge to build the rule */
    onSubmit: (values: FormOnyxValues<NewRulePromptFormID>) => void;

    /** Called when the admin chooses to pick a rule type themselves */
    onBuildManually: () => void;

    /** Whether Concierge is still building the rule */
    isLoading: boolean;

    /** Offers an agent rule instead, when the deterministic rule types cannot express the prompt */
    onCreateAgentRule?: () => void;
};

function RulesNewPromptForm({onSubmit, onBuildManually, isLoading, onCreateAgentRule}: RulesNewPromptFormProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const shouldUseScrollableLayout = useIsInLandscapeMode();
    const formRef = useRef<FormRef>(null);
    const describeRuleLabel = translate('workspace.rules.newRule.describeRule');

    const submitFormOnModEnter = (event: TextInputKeyPressEvent | KeyboardEvent) => {
        if (!('key' in event)) {
            return;
        }
        if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
            // The markdown input inserts a line break for any Enter keydown whose default is not already prevented, so the submit combo has to claim it first.
            event.preventDefault();
            formRef.current?.submit();
        }
    };

    const validate = (values: FormOnyxValues<NewRulePromptFormID>): FormInputErrors<NewRulePromptFormID> => {
        const errors: FormInputErrors<NewRulePromptFormID> = {};
        if (!values[INPUT_IDS.PROMPT]?.trim()) {
            errors[INPUT_IDS.PROMPT] = translate('common.error.fieldRequired');
        }
        return errors;
    };

    const inputWrapperStyles: StyleProp<ViewStyle> = shouldUseScrollableLayout ? [styles.flex1, styles.minHeight42] : [styles.flex1, styles.mnh0, styles.agentRulePromptInput];

    return (
        <FormProvider
            ref={formRef}
            formID={ONYXKEYS.FORMS.NEW_RULE_PROMPT_FORM}
            validate={validate}
            onSubmit={onSubmit}
            isLoading={isLoading}
            submitButtonText={translate('common.next')}
            style={[styles.flex1, styles.ph5]}
            shouldUseScrollView={shouldUseScrollableLayout}
            submitFlexEnabled={shouldUseScrollableLayout ? undefined : false}
            shouldHideFixErrorsAlert
            shouldValidateOnChange
            shouldValidateOnBlur
            keyboardSubmitBehavior={CONST.KEYBOARD_SUBMIT_BEHAVIOR.SUBMIT_ONLY}
            shouldRenderFooterAboveSubmit
            footerContent={
                <>
                    {!!onCreateAgentRule && (
                        <Button
                            onPress={onCreateAgentRule}
                            style={[styles.mb4]}
                            size={CONST.BUTTON_SIZE.LARGE}
                            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.NEW_RULE_CREATE_AGENT_RULE}
                        >
                            <Button.Text>{translate('workspace.rules.newRule.createAgentRuleInstead')}</Button.Text>
                        </Button>
                    )}
                    <Button
                        onPress={onBuildManually}
                        style={[styles.mb4]}
                        size={CONST.BUTTON_SIZE.LARGE}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.NEW_RULE_BUILD_MANUALLY}
                    >
                        <Button.Text>{translate('workspace.rules.newRule.buildManually')}</Button.Text>
                    </Button>
                </>
            }
        >
            <View style={styles.flex1}>
                <Text style={[styles.textHeadlineH1, styles.mv2]}>{translate('workspace.rules.newRule.createRuleHeadline')}</Text>
                <Text style={[styles.textSupporting, styles.mb5]}>{describeRuleLabel}</Text>
                <View style={inputWrapperStyles}>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.PROMPT}
                        label={describeRuleLabel}
                        accessibilityLabel={describeRuleLabel}
                        role={CONST.ROLE.PRESENTATION}
                        type="markdown"
                        excludedMarkdownStyles={['mentionReport']}
                        onKeyPress={submitFormOnModEnter}
                        onValueChange={clearNewRulePromptError}
                        multiline
                        shouldSaveDraft
                        shouldLabelStayOnSingleLine
                        containerStyles={[styles.flex1]}
                        touchableInputWrapperStyle={[styles.flex1]}
                        textInputContainerStyles={[styles.flex1]}
                        inputStyle={[styles.flex1, styles.textAlignVerticalTop]}
                    />
                </View>
                <Text style={[styles.textMicroSupporting, styles.textAlignCenter, styles.mt2]}>{translate('workspace.rules.agentRules.disclaimer')}</Text>
            </View>
        </FormProvider>
    );
}

RulesNewPromptForm.displayName = 'RulesNewPromptForm';

export default RulesNewPromptForm;
