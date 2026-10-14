/**
 * Modal where an admin describes a rule in plain English and Concierge fills in the open rule editor's form.
 */
import Button from '@components/Button';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues, FormRef} from '@components/Form/types';
import Modal from '@components/Modal';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import Text from '@components/Text';
import TextInput from '@components/TextInput';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import {getDecodedCategoryName} from '@libs/CategoryUtils';
import Log from '@libs/Log';

import {clearGeneratedRule, clearNewRulePrompt, generateRule, setNewRulePromptError, stopNewRulePromptLoading} from '@userActions/Policy/Rules';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/NewRulePromptForm';
import type {PolicyCategories} from '@src/types/onyx';
import type {GeneratedRuleImpossibleReason, GeneratedRuleState, GeneratedRuleType, GeneratedRuleValues} from '@src/types/onyx/GeneratedRule';

import type {TextInputKeyPressEvent} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';

import {useFocusEffect} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

type NewRulePromptFormID = typeof ONYXKEYS.FORMS.NEW_RULE_PROMPT_FORM;

type DescribeRuleModalProps = {
    isVisible: boolean;

    onClose: () => void;

    policyID: string;

    /** The rule type of the editor that opens the modal. Without it, the modal accepts an answer of any known rule type. */
    ruleType?: GeneratedRuleType;

    /** Called with the generated form values and their rule type after Concierge builds the rule */
    onRuleGenerated: (values: GeneratedRuleValues, generatedRuleType: GeneratedRuleType) => void;

    /**
     * Called in place of the inline error when the description is not one standard rule. `prompt` is the instruction
     * for the agent rule. The modal stays open, and the caller closes it.
     */
    onAgentRuleFallback?: (prompt: string, generationID: string, state: GeneratedRuleState) => void;
};

type PendingGeneration = {
    generationID: string;
    prompt: string;
};

const GENERATED_RULE_TYPES = new Set<string>(Object.values(CONST.GENERATED_RULE.RULE_TYPE));

// A reason that this app version does not know gets the general title
const IMPOSSIBLE_TITLE_BY_REASON: Partial<Record<string, TranslationPaths>> = {
    [CONST.GENERATED_RULE.IMPOSSIBLE_REASON.NO_TRIGGER]: 'workspace.rules.newRule.impossible.noTrigger',
    [CONST.GENERATED_RULE.IMPOSSIBLE_REASON.NO_CAPABILITY]: 'workspace.rules.newRule.impossible.noCapability',
    [CONST.GENERATED_RULE.IMPOSSIBLE_REASON.MISSING_DATA]: 'workspace.rules.newRule.impossible.missingData',
    [CONST.GENERATED_RULE.IMPOSSIBLE_REASON.RETROACTIVE]: 'workspace.rules.newRule.impossible.retroactive',
    [CONST.GENERATED_RULE.IMPOSSIBLE_REASON.HISTORY_LIMIT]: 'workspace.rules.newRule.impossible.historyLimit',
} satisfies Record<GeneratedRuleImpossibleReason, TranslationPaths>;

/** Returns whether a description with this answer can become an agent rule */
function isAgentRuleFallbackState(state: GeneratedRuleState): boolean {
    return state === CONST.GENERATED_RULE.STATE.UNSUPPORTED || state === CONST.GENERATED_RULE.STATE.MULTIPLE_RULES || state === CONST.GENERATED_RULE.STATE.AGENT_RULE;
}

/** Replaces the generated category with the workspace's own spelling of it, or drops it when the workspace has no such category */
function withPolicyCategory(values: GeneratedRuleValues, policyCategories: OnyxEntry<PolicyCategories>): GeneratedRuleValues {
    const {category, ...rest} = values;
    if (!category) {
        return values;
    }
    const policyCategory = Object.values(policyCategories ?? {}).find((candidate) => candidate.enabled && getDecodedCategoryName(candidate.name) === getDecodedCategoryName(category));
    return policyCategory ? {...rest, category: policyCategory.name} : rest;
}

function DescribeRuleModal({isVisible, onClose, policyID, ruleType, onRuleGenerated, onAgentRuleFallback}: DescribeRuleModalProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    // We need to use isSmallScreenWidth here because the Modal breaks in RHP with shouldUseNarrowLayout.
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const formRef = useRef<FormRef>(null);
    const inputRef = useRef<AnimatedTextInputRef>(null);
    const pendingGenerationRef = useRef<PendingGeneration>(undefined);
    const [submittedGenerationID, setSubmittedGenerationID] = useState<string>();
    const [generatedRule] = useOnyx(ONYXKEYS.GENERATED_RULE);
    const [newRulePromptForm] = useOnyx(ONYXKEYS.FORMS.NEW_RULE_PROMPT_FORM);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const generatedRuleID = generatedRule?.generationID;
    const generatedRuleState = generatedRule?.state;
    const generatedRuleType = generatedRule?.ruleType;
    const generatedRuleValues = generatedRule?.rule;
    const generatedAgentRulePrompt = generatedRule?.agentRulePrompt;
    const refusal = generatedRuleState === CONST.GENERATED_RULE.STATE.IMPOSSIBLE && !!generatedRuleID && generatedRuleID === submittedGenerationID ? generatedRule : undefined;
    const refusalSuggestedPrompt = refusal?.suggestedPrompt;
    const inputLabel = translate('workspace.rules.newRule.describeRuleInputLabel');

    const close = () => {
        pendingGenerationRef.current = undefined;
        clearNewRulePrompt();
        onClose();
    };

    // The answer stays in Onyx after the modal closes. Forget the description, so a refusal does not show again when the
    // modal opens.
    const dismiss = () => {
        setSubmittedGenerationID(undefined);
        close();
    };

    useEffect(() => {
        const pendingGeneration = pendingGenerationRef.current;
        if (!generatedRuleID || !generatedRuleState || generatedRuleID !== pendingGeneration?.generationID) {
            return;
        }
        if (onAgentRuleFallback && isAgentRuleFallbackState(generatedRuleState)) {
            // The answer stays in Onyx, and the effect runs again. Clear the pending generation first, because the caller
            // must get the answer one time only.
            pendingGenerationRef.current = undefined;
            const agentRulePrompt = generatedRuleState === CONST.GENERATED_RULE.STATE.AGENT_RULE && generatedAgentRulePrompt ? generatedAgentRulePrompt : pendingGeneration.prompt;
            onAgentRuleFallback(agentRulePrompt, generatedRuleID, generatedRuleState);
            return;
        }
        if (generatedRuleState === CONST.GENERATED_RULE.STATE.IMPOSSIBLE) {
            // The form shows this answer until the next description, so the answer stays in Onyx
            pendingGenerationRef.current = undefined;
            stopNewRulePromptLoading();
            return;
        }
        if (generatedRuleState !== CONST.GENERATED_RULE.STATE.RULE) {
            setNewRulePromptError(generatedRuleState);
            clearGeneratedRule();
            return;
        }
        // Concierge picks the rule type itself. It can answer with a rule type other than `ruleType`, or with a rule type
        // that this app version does not know.
        const canApplyRuleType = ruleType ? generatedRuleType === ruleType : GENERATED_RULE_TYPES.has(generatedRuleType ?? '');
        if (!generatedRuleType || !canApplyRuleType) {
            setNewRulePromptError(CONST.GENERATED_RULE.STATE.UNSUPPORTED);
            clearGeneratedRule();
            return;
        }
        onRuleGenerated(withPolicyCategory(generatedRuleValues ?? {}, policyCategories), generatedRuleType);
        close();
    }, [close, generatedAgentRulePrompt, generatedRuleID, generatedRuleState, generatedRuleType, generatedRuleValues, onAgentRuleFallback, onRuleGenerated, policyCategories, ruleType]);

    useEffect(() => {
        if (!isVisible || !newRulePromptForm?.isLoading || pendingGenerationRef.current) {
            return;
        }
        clearNewRulePrompt();
    }, [isVisible, newRulePromptForm?.isLoading]);

    // Focus only after the open animation, because focusing mid-animation blurs the input on mWeb and native
    useFocusEffect(() => {
        if (!isVisible) {
            return;
        }
        const focusTimeout = setTimeout(() => inputRef.current?.focus(), CONST.ANIMATED_TRANSITION);
        return () => clearTimeout(focusTimeout);
    });

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

    const describeRule = (prompt: string) => {
        const generationID = generateRule(policyID, prompt, ruleType);
        pendingGenerationRef.current = {generationID, prompt};
        setSubmittedGenerationID(generationID);
    };

    const submit = (values: FormOnyxValues<NewRulePromptFormID>) => {
        describeRule(values[INPUT_IDS.PROMPT].trim());
    };

    const describeSuggestedRule = (suggestedPrompt: string) => {
        Log.info('[GenerateRule] Tried the suggested description', false, {policyID, generationID: refusal?.generationID, reason: refusal?.reason});
        formRef.current?.resetForm({[INPUT_IDS.PROMPT]: suggestedPrompt});
        describeRule(suggestedPrompt);
    };

    return (
        <Modal
            isVisible={isVisible}
            onClose={dismiss}
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
                keyboardSubmitBehavior={CONST.KEYBOARD_SUBMIT_BEHAVIOR.SUBMIT_ONLY}
            >
                <Text style={[styles.textNormal, styles.textSupporting, styles.mb5]}>{translate('workspace.rules.newRule.describeRule')}</Text>
                <View style={styles.describeRulePromptInput}>
                    <InputWrapper
                        InputComponent={TextInput}
                        ref={inputRef}
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
                {!!refusal && (
                    <View style={styles.mt4}>
                        <Text style={styles.textStrong}>{translate(IMPOSSIBLE_TITLE_BY_REASON[refusal.reason ?? ''] ?? 'workspace.rules.newRule.impossible.noCapability')}</Text>
                        {!!refusal.explanation && <Text style={[styles.textSupporting, styles.mt1]}>{refusal.explanation}</Text>}
                        {!!refusalSuggestedPrompt && (
                            <>
                                <Text style={styles.mt3}>{refusalSuggestedPrompt}</Text>
                                <Button
                                    size={CONST.BUTTON_SIZE.SMALL}
                                    onPress={() => describeSuggestedRule(refusalSuggestedPrompt)}
                                    style={[styles.mt2, styles.alignSelfStart]}
                                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.DESCRIBE_RULE_TRY_SUGGESTION}
                                >
                                    <Button.Text>{translate('workspace.rules.newRule.impossible.tryThisInstead')}</Button.Text>
                                </Button>
                            </>
                        )}
                    </View>
                )}
            </FormProvider>
        </Modal>
    );
}

DescribeRuleModal.displayName = 'DescribeRuleModal';

export default DescribeRuleModal;
