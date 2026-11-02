/**
 * Write (Edit) tab for the add-agent-rule flow. Owns the free-text prompt form and save path.
 */
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues, FormRef} from '@components/Form/types';
import Text from '@components/Text';
import TextInput from '@components/TextInput';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import ImpossibleRuleNotice from '@pages/workspace/rules/ImpossibleRuleNotice';
import useSuggestionButtonRow from '@pages/workspace/rules/useSuggestionButtonRow';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/AddAgentRuleForm';

import type {TextInputKeyPressEvent} from 'react-native';

import React, {useRef} from 'react';
import {View} from 'react-native';

import useAgentPromptInputStyles from './useAgentPromptInputStyles';
import useAgentRulePromptCheck from './useAgentRulePromptCheck';

type AddAgentRuleFormID = typeof ONYXKEYS.FORMS.ADD_AGENT_RULE_FORM;

type AddAgentRuleWriteTabProps = {
    policyID: string;

    /** A rule with this text saves without a check, because Concierge already wrote it */
    checkedPrompt?: string;

    /** Called with the form values when the user saves the rule */
    onSave: (values: FormOnyxValues<AddAgentRuleFormID>) => void;
};

function AddAgentRuleWriteTab({policyID, checkedPrompt, onSave}: AddAgentRuleWriteTabProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const formRef = useRef<FormRef>(null);
    const {refusal, isChecking, checkThenSavePrompt, trySuggestedPrompt, resetCheck} = useAgentRulePromptCheck({
        policyID,
        formID: ONYXKEYS.FORMS.ADD_AGENT_RULE_FORM,
        formRef,
        checkedPrompt,
        savePrompt: (prompt) => onSave({[INPUT_IDS.PROMPT]: prompt}),
    });
    const suggestionButtonRow = useSuggestionButtonRow(refusal?.suggestedPrompt, trySuggestedPrompt);
    const describeRuleLabel = translate('workspace.rules.agentRules.describeRuleForConcierge');

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

    const validate = (values: FormOnyxValues<AddAgentRuleFormID>): FormInputErrors<AddAgentRuleFormID> => {
        const errors: FormInputErrors<AddAgentRuleFormID> = {};
        if (!values[INPUT_IDS.PROMPT]?.trim()) {
            errors[INPUT_IDS.PROMPT] = translate('common.error.fieldRequired');
        }
        return errors;
    };

    const inputWrapperStyles = useAgentPromptInputStyles();

    return (
        <FormProvider
            ref={formRef}
            formID={ONYXKEYS.FORMS.ADD_AGENT_RULE_FORM}
            validate={validate}
            onSubmit={(values) => checkThenSavePrompt(values[INPUT_IDS.PROMPT])}
            submitButtonText={translate(refusal ? 'workspace.rules.newRule.impossible.createAnyway' : 'workspace.rules.agentRules.createRule')}
            style={[styles.flex1, styles.ph5]}
            submitFlexEnabled={false}
            shouldUseScrollView={false}
            enabledWhenOffline
            shouldHideFixErrorsAlert
            isSubmitButtonNeutral={suggestionButtonRow.isSubmitButtonNeutral}
            submitButtonAndFooterContainerStyles={suggestionButtonRow.containerStyles}
            submitButtonInnerStyles={suggestionButtonRow.submitButtonStyles}
            footerContent={suggestionButtonRow.footerContent}
            shouldValidateOnChange
            shouldValidateOnBlur
            keyboardSubmitBehavior={CONST.KEYBOARD_SUBMIT_BEHAVIOR.SUBMIT_ONLY}
        >
            <View style={styles.flex1}>
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
                        onValueChange={resetCheck}
                        multiline
                        shouldSaveDraft
                        shouldLabelStayOnSingleLine
                        containerStyles={[styles.h100]}
                        touchableInputWrapperStyle={[styles.flex1]}
                        inputStyle={[styles.flex1, styles.textAlignVerticalTop]}
                    />
                </View>
                {!!refusal && <ImpossibleRuleNotice refusal={refusal} />}
                <Text style={[styles.textMicroSupporting, styles.textAlignCenter, styles.mt2]}>
                    {translate(isChecking ? 'workspace.rules.agentRules.checkingRule' : 'workspace.rules.agentRules.disclaimer')}
                </Text>
            </View>
        </FormProvider>
    );
}

AddAgentRuleWriteTab.displayName = 'AddAgentRuleWriteTab';

export default AddAgentRuleWriteTab;
export type {AddAgentRuleFormID};
