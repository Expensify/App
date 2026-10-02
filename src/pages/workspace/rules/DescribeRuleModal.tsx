import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues, FormRef} from '@components/Form/types';
import Modal from '@components/Modal';
import Text from '@components/Text';
import TextInput from '@components/TextInput';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import {getDecodedCategoryName} from '@libs/CategoryUtils';

import {clearGeneratedRule, clearNewRulePrompt, generateRule, setNewRulePromptError} from '@userActions/Policy/Rules';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/NewRulePromptForm';
import type {PolicyCategories} from '@src/types/onyx';
import type {GeneratedRuleType, GeneratedRuleValues} from '@src/types/onyx/GeneratedRule';

import type {TextInputKeyPressEvent} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';

import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';

type NewRulePromptFormID = typeof ONYXKEYS.FORMS.NEW_RULE_PROMPT_FORM;

type DescribeRuleModalProps = {
    isVisible: boolean;

    onClose: () => void;

    policyID: string;

    /** The rule type of the editor the modal opens from, so Concierge fills in that form */
    ruleType: GeneratedRuleType;

    /** Called with the generated form values once Concierge has built the rule */
    onRuleGenerated: (values: GeneratedRuleValues) => void;
};

/** Replaces the generated category with the workspace's own spelling of it, or drops it when the workspace has no such category */
function withPolicyCategory(values: GeneratedRuleValues, policyCategories: OnyxEntry<PolicyCategories>): GeneratedRuleValues {
    const {category, ...rest} = values;
    if (!category) {
        return values;
    }
    const policyCategory = Object.values(policyCategories ?? {}).find((candidate) => candidate.enabled && getDecodedCategoryName(candidate.name) === getDecodedCategoryName(category));
    return policyCategory ? {...rest, category: policyCategory.name} : rest;
}

function DescribeRuleModal({isVisible, onClose, policyID, ruleType, onRuleGenerated}: DescribeRuleModalProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    // We need to use isSmallScreenWidth here because the Modal breaks in RHP with shouldUseNarrowLayout.
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const formRef = useRef<FormRef>(null);
    const [generatedRule] = useOnyx(ONYXKEYS.GENERATED_RULE);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const inputLabel = translate('workspace.rules.newRule.describeRuleInputLabel');

    const close = () => {
        clearNewRulePrompt();
        onClose();
    };

    useEffect(() => {
        if (!isVisible || !generatedRule) {
            return;
        }
        if (generatedRule.state !== CONST.GENERATED_RULE.STATE.RULE) {
            setNewRulePromptError(generatedRule.state);
            clearGeneratedRule();
            return;
        }
        onRuleGenerated(withPolicyCategory(generatedRule.rule ?? {}, policyCategories));
        close();
    }, [close, generatedRule, isVisible, onRuleGenerated, policyCategories]);

    const submitFormOnModEnter = (event: TextInputKeyPressEvent | KeyboardEvent) => {
        if (!('key' in event)) {
            return;
        }
        if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
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

    const submit = (values: FormOnyxValues<NewRulePromptFormID>) => {
        generateRule(policyID, ruleType, values[INPUT_IDS.PROMPT].trim());
    };

    return (
        <Modal
            isVisible={isVisible}
            onClose={close}
            type={isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST.MODAL.MODAL_TYPE.CONFIRM}
            innerContainerStyle={styles.pv0}
            avoidKeyboard
            shouldHandleNavigationBack
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <FormProvider
                ref={formRef}
                formID={ONYXKEYS.FORMS.NEW_RULE_PROMPT_FORM}
                validate={validate}
                onSubmit={submit}
                submitButtonText={translate('common.next')}
                style={[styles.mt5, styles.mh5]}
                addBottomSafeAreaPadding={isSmallScreenWidth}
                shouldUseScrollView={false}
                submitFlexEnabled={false}
                shouldHideFixErrorsAlert
                shouldValidateOnChange
                shouldValidateOnBlur
                keyboardSubmitBehavior={CONST.KEYBOARD_SUBMIT_BEHAVIOR.SUBMIT_ONLY}
            >
                <Text style={[styles.textNormal, styles.mb5]}>{translate('workspace.rules.newRule.describeRule')}</Text>
                <View style={styles.describeRulePromptInput}>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.PROMPT}
                        label={inputLabel}
                        accessibilityLabel={inputLabel}
                        role={CONST.ROLE.PRESENTATION}
                        onKeyPress={submitFormOnModEnter}
                        maxLength={CONST.GENERATED_RULE.PROMPT_MAX_LENGTH}
                        multiline
                        shouldSaveDraft
                        shouldLabelStayOnSingleLine
                        containerStyles={[styles.h100]}
                        touchableInputWrapperStyle={[styles.flex1]}
                        inputStyle={[styles.flex1, styles.textAlignVerticalTop]}
                    />
                </View>
            </FormProvider>
        </Modal>
    );
}

DescribeRuleModal.displayName = 'DescribeRuleModal';

export default DescribeRuleModal;
