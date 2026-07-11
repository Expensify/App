/**
 * Write (Edit) tab for the add-agent-rule flow. Owns the free-text prompt form and save path.
 */
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues, FormRef} from '@components/Form/types';
import Text from '@components/Text';
import TextInput from '@components/TextInput';

import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/AddAgentRuleForm';

import type {TextInputKeyPressEvent} from 'react-native';

import React, {useRef} from 'react';
import {View} from 'react-native';

type AddAgentRuleFormID = typeof ONYXKEYS.FORMS.ADD_AGENT_RULE_FORM;

type AddAgentRuleWriteTabProps = {
    /** Called with the form values when the user saves the rule */
    onSave: (values: FormOnyxValues<AddAgentRuleFormID>) => void;
};

function AddAgentRuleWriteTab({onSave}: AddAgentRuleWriteTabProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const shouldUseScrollableLayout = useIsInLandscapeMode();
    const formRef = useRef<FormRef>(null);

    const handleKeyPress = (e: TextInputKeyPressEvent | KeyboardEvent) => {
        if (!('key' in e)) {
            return;
        }
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
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

    return (
        <FormProvider
            ref={formRef}
            formID={ONYXKEYS.FORMS.ADD_AGENT_RULE_FORM}
            validate={validate}
            onSubmit={onSave}
            submitButtonText={translate('common.next')}
            style={[styles.flex1, styles.ph5]}
            shouldUseScrollView={shouldUseScrollableLayout}
            submitFlexEnabled={shouldUseScrollableLayout ? undefined : false}
            enabledWhenOffline
            shouldHideFixErrorsAlert
            shouldValidateOnChange
            shouldValidateOnBlur
            keyboardSubmitBehavior={CONST.KEYBOARD_SUBMIT_BEHAVIOR.SUBMIT_ONLY}
        >
            <View style={styles.flex1}>
                <Text style={[styles.textHeadlineH1, styles.mv2]}>{translate('workspace.rules.agentRules.describeRuleHeadline')}</Text>
                <Text style={[styles.textSupporting, styles.mb5]}>{translate('workspace.rules.agentRules.describeRuleSubtitle')}</Text>
                <View style={styles.flex1}>
                    <View style={[styles.flex2, shouldUseScrollableLayout && styles.minHeight42]}>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.PROMPT}
                            accessibilityLabel={translate('workspace.rules.agentRules.describeRuleHeadline')}
                            role={CONST.ROLE.PRESENTATION}
                            onKeyPress={handleKeyPress}
                            multiline
                            shouldSaveDraft
                            containerStyles={[styles.flex1]}
                            touchableInputWrapperStyle={[styles.flex1]}
                            textInputContainerStyles={[styles.flex1]}
                            inputStyle={[styles.flex1, styles.textAlignVerticalTop]}
                        />
                    </View>
                    <View style={styles.flex1} />
                </View>
            </View>
        </FormProvider>
    );
}

AddAgentRuleWriteTab.displayName = 'AddAgentRuleWriteTab';

export default AddAgentRuleWriteTab;
export type {AddAgentRuleFormID};
