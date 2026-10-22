/**
 * Form where an admin describes a rule in plain English and Concierge builds the rule.
 */
import Button from '@components/Button';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues, FormRef} from '@components/Form/types';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import Text from '@components/Text';
import TextInput from '@components/TextInput';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {getDecodedCategoryName} from '@libs/CategoryUtils';
import Log from '@libs/Log';

import {
    clearGeneratedRule,
    clearNewRulePrompt,
    generateRule,
    setNewRulePromptEmptyError,
    setNewRulePromptError,
    setNewRulePromptErrorMessage,
    stopNewRulePromptLoading,
} from '@userActions/Policy/Rules';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/NewRulePromptForm';
import type {PolicyCategories, PolicyCategory} from '@src/types/onyx';
import type {GeneratedRuleImpossibleReason, GeneratedRuleState, GeneratedRuleType, GeneratedRuleValues} from '@src/types/onyx/GeneratedRule';

import type {ReactNode} from 'react';
import type {StyleProp, TextInputKeyPressEvent, ViewStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';

import {useFocusEffect} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

type NewRulePromptFormID = typeof ONYXKEYS.FORMS.NEW_RULE_PROMPT_FORM;

type DescribeRuleFormProps = {
    policyID: string;

    /** The rule type of the editor that asks for the rule. Without it, the form accepts an answer of any known rule type. */
    ruleType?: GeneratedRuleType;

    /** Whether the form takes answers. A form that is hidden or behind another page ignores them. */
    isActive: boolean;

    /** Whether the input gets focus when the form becomes active */
    shouldFocusInput?: boolean;

    submitButtonText: string;

    /** The style of the view around the input, which sets the height of the input */
    inputContainerStyle: StyleProp<ViewStyle>;

    style?: StyleProp<ViewStyle>;

    addBottomSafeAreaPadding?: boolean;

    shouldUseScrollView?: boolean;

    submitFlexEnabled?: boolean;

    /**
     * Whether the admin can leave the description empty, because the screen offers another way to make a rule. The input
     * then shows no error for an empty description. Submit shows the error above the submit button instead.
     */
    canSkipDescription?: boolean;

    /** An example description. The input shows it in place of its label, because the input hides a placeholder behind a label until it gets focus. */
    placeholder?: string;

    /** Content above the input */
    children?: ReactNode;

    /** Called with the generated form values and their rule type after Concierge builds the rule */
    onRuleGenerated: (values: GeneratedRuleValues, generatedRuleType: GeneratedRuleType) => void;

    /** Whether a new rule of the generated rule type can use the category, so a generated category that already has this kind of rule shows an error */
    isCategoryEligible?: (category: PolicyCategory, generatedRuleType: GeneratedRuleType) => boolean;

    /** Called in place of the inline error when the description is not one standard rule. `prompt` is the instruction for the agent rule. */
    onAgentRuleFallback?: (prompt: string, generationID: string, state: GeneratedRuleState) => void;

    /** Called after the form gives an answer to the caller and clears itself */
    onFinish?: () => void;
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

/** Replaces the generated categories with the workspace's own spelling of them, and drops any the workspace has no enabled category for */
function withPolicyCategories(values: GeneratedRuleValues, policyCategories: OnyxEntry<PolicyCategories>): GeneratedRuleValues {
    const {category, categoriesToMatch, ...rest} = values;
    const findPolicyCategoryName = (categoryName: string) =>
        Object.values(policyCategories ?? {}).find((candidate) => candidate.enabled && getDecodedCategoryName(candidate.name) === getDecodedCategoryName(categoryName))?.name;
    const policyCategoryName = category ? findPolicyCategoryName(category) : undefined;
    return {
        ...rest,
        ...(policyCategoryName ? {category: policyCategoryName} : {}),
        ...(categoriesToMatch ? {categoriesToMatch: categoriesToMatch.flatMap((categoryName) => findPolicyCategoryName(categoryName) ?? [])} : {}),
    };
}

function DescribeRuleForm({
    policyID,
    ruleType,
    isActive,
    shouldFocusInput = false,
    submitButtonText,
    inputContainerStyle,
    style,
    addBottomSafeAreaPadding = false,
    shouldUseScrollView = false,
    submitFlexEnabled = false,
    canSkipDescription = false,
    placeholder,
    children,
    onRuleGenerated,
    isCategoryEligible,
    onAgentRuleFallback,
    onFinish,
}: DescribeRuleFormProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
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

    const finish = () => {
        pendingGenerationRef.current = undefined;
        clearNewRulePrompt();
        onFinish?.();
    };

    useEffect(() => {
        const pendingGeneration = pendingGenerationRef.current;
        if (!isActive || !generatedRuleID || !generatedRuleState || generatedRuleID !== pendingGeneration?.generationID) {
            return;
        }
        if (onAgentRuleFallback && isAgentRuleFallbackState(generatedRuleState)) {
            // The answer stays in Onyx, and the effect runs again. Clear the pending generation first, because the caller
            // must get the answer one time only.
            pendingGenerationRef.current = undefined;
            const agentRulePrompt = generatedRuleState === CONST.GENERATED_RULE.STATE.AGENT_RULE && generatedAgentRulePrompt ? generatedAgentRulePrompt : pendingGeneration.prompt;
            onAgentRuleFallback(agentRulePrompt, generatedRuleID, generatedRuleState);
            finish();
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
        const values = withPolicyCategories(generatedRuleValues ?? {}, policyCategories);
        const hasCategoryWithRule = [values.category, ...(values.categoriesToMatch ?? [])].some((categoryName) => {
            const policyCategory = categoryName ? policyCategories?.[categoryName] : undefined;
            return !!policyCategory && !!isCategoryEligible && !isCategoryEligible(policyCategory, generatedRuleType);
        });
        if (hasCategoryWithRule) {
            setNewRulePromptErrorMessage('workspace.rules.newRule.promptErrors.categoryHasRule');
            clearGeneratedRule();
            return;
        }
        onRuleGenerated(values, generatedRuleType);
        finish();
    }, [
        finish,
        generatedAgentRulePrompt,
        generatedRuleID,
        generatedRuleState,
        generatedRuleType,
        generatedRuleValues,
        isActive,
        isCategoryEligible,
        onAgentRuleFallback,
        onRuleGenerated,
        policyCategories,
        ruleType,
    ]);

    useEffect(() => {
        if (!isActive || !newRulePromptForm?.isLoading || pendingGenerationRef.current) {
            return;
        }
        clearNewRulePrompt();
    }, [isActive, newRulePromptForm?.isLoading]);

    // Focus only after the open animation, because focusing mid-animation blurs the input on mWeb and native
    useFocusEffect(() => {
        if (!isActive || !shouldFocusInput) {
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
        if (!canSkipDescription && !values[INPUT_IDS.PROMPT]?.trim()) {
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
        const prompt = values[INPUT_IDS.PROMPT]?.trim() ?? '';
        if (!prompt) {
            setNewRulePromptEmptyError();
            return;
        }
        describeRule(prompt);
    };

    const describeSuggestedRule = (suggestedPrompt: string) => {
        Log.info('[GenerateRule] Tried the suggested description', false, {policyID, generationID: refusal?.generationID, reason: refusal?.reason});
        formRef.current?.resetForm({[INPUT_IDS.PROMPT]: suggestedPrompt});
        describeRule(suggestedPrompt);
    };

    return (
        <FormProvider
            ref={formRef}
            formID={ONYXKEYS.FORMS.NEW_RULE_PROMPT_FORM}
            validate={validate}
            onSubmit={submit}
            submitButtonText={submitButtonText}
            style={style}
            addBottomSafeAreaPadding={addBottomSafeAreaPadding}
            shouldUseScrollView={shouldUseScrollView}
            submitFlexEnabled={submitFlexEnabled}
            shouldHideFixErrorsAlert
            // An empty description sends no request, so nothing would stop a loading state that starts on the press.
            shouldShowLoadingImmediatelyOnPress={!canSkipDescription}
            keyboardSubmitBehavior={CONST.KEYBOARD_SUBMIT_BEHAVIOR.SUBMIT_ONLY}
        >
            {children}
            <View style={inputContainerStyle}>
                <InputWrapper
                    InputComponent={TextInput}
                    ref={inputRef}
                    inputID={INPUT_IDS.PROMPT}
                    label={placeholder ? undefined : inputLabel}
                    placeholder={placeholder}
                    // Without a label, the input has no top padding. Match the padding at its sides.
                    textInputContainerStyles={placeholder ? styles.pt2 : undefined}
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
    );
}

DescribeRuleForm.displayName = 'DescribeRuleForm';

export default DescribeRuleForm;
