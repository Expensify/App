/**
 * Write (Edit) tab for the add-agent-rule flow. Owns the free-text prompt form and save path.
 */
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues, FormRef} from '@components/Form/types';
import Text from '@components/Text';
import TextInput from '@components/TextInput';

import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/AddAgentRuleForm';

import type {StyleProp, TextInputKeyPressEvent, ViewStyle} from 'react-native';

import React, {useRef, useState} from 'react';
import {View} from 'react-native';

type AddAgentRuleFormID = typeof ONYXKEYS.FORMS.ADD_AGENT_RULE_FORM;

type AddAgentRuleWriteTabProps = {
    /** Called with the form values and whether the rule should also apply to the workspace's historical activity */
    onSave: (values: FormOnyxValues<AddAgentRuleFormID>, applyRetroactively: boolean) => void;
};

function AddAgentRuleWriteTab({onSave}: AddAgentRuleWriteTabProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const shouldUseScrollableLayout = useIsInLandscapeMode();
    const {isBetaEnabled} = usePermissions();
    const isRulesRevampEnabled = isBetaEnabled(CONST.BETAS.RULES_REVAMP);
    const shouldUseExpandedRevampFormLayout = isRulesRevampEnabled && !shouldUseScrollableLayout;
    const formRef = useRef<FormRef>(null);
    const [applyRetroactively, setApplyRetroactively] = useState(false);
    const describeRuleLabel = isRulesRevampEnabled ? translate('workspace.rules.agentRules.describeRuleForConcierge') : translate('workspace.rules.agentRules.describeRuleTitle');

    const submitFormOnModEnter = (event: TextInputKeyPressEvent | KeyboardEvent) => {
        if (!('key' in event)) {
            return;
        }
        if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
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

    const inputWrapperStyles: StyleProp<ViewStyle> = shouldUseExpandedRevampFormLayout
        ? [styles.flex1, styles.mnh0, styles.agentRulePromptInput]
        : [styles.flex1, shouldUseScrollableLayout && styles.minHeight42];

    return (
        <FormProvider
            ref={formRef}
            formID={ONYXKEYS.FORMS.ADD_AGENT_RULE_FORM}
            validate={validate}
            onSubmit={(values) => onSave(values, applyRetroactively)}
            submitButtonText={isRulesRevampEnabled ? translate('workspace.rules.agentRules.createRule') : translate('common.save')}
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
                {!isRulesRevampEnabled && (
                    <>
                        <Text style={[styles.textHeadlineH1, styles.mv2]}>{translate('workspace.rules.agentRules.describeRuleHeadline')}</Text>
                        <Text style={[styles.textSupporting, styles.mb5]}>{translate('workspace.rules.agentRules.describeRuleForConcierge')}</Text>
                    </>
                )}
                <View style={inputWrapperStyles}>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.PROMPT}
                        label={describeRuleLabel}
                        accessibilityLabel={describeRuleLabel}
                        role={CONST.ROLE.PRESENTATION}
                        onKeyPress={submitFormOnModEnter}
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
            <CheckboxWithLabel
                accessibilityLabel={translate('workspace.rules.agentRules.applyRetroactively')}
                label={translate('workspace.rules.agentRules.applyRetroactively')}
                isChecked={applyRetroactively}
                onInputChange={(value) => setApplyRetroactively(!!value)}
                style={styles.mt4}
            />
        </FormProvider>
    );
}

AddAgentRuleWriteTab.displayName = 'AddAgentRuleWriteTab';

export default AddAgentRuleWriteTab;
export type {AddAgentRuleFormID};
