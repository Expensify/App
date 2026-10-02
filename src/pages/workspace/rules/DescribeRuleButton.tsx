import Button from '@components/Button';
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

import {clearDraftValues} from '@libs/actions/FormActions';
import {getDecodedCategoryName} from '@libs/CategoryUtils';

import variables from '@styles/variables';

import {clearGeneratedRule, clearNewRulePromptError, generateRule, setNewRulePromptError} from '@userActions/Policy/Rules';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/NewRulePromptForm';
import type {GeneratedRule} from '@src/types/onyx';

import type {StyleProp, TextInputKeyPressEvent, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import React, {useEffect, useRef, useState} from 'react';

type NewRulePromptFormID = typeof ONYXKEYS.FORMS.NEW_RULE_PROMPT_FORM;

type GeneratedRuleValues = NonNullable<GeneratedRule['rule']>;

type DescribeRuleButtonProps = {
    policyID: string;

    /** The rule type of the page the button sits on, so Concierge builds values for that form */
    ruleType: ValueOf<typeof CONST.GENERATED_RULE.RULE_TYPE>;

    /** Called with the generated form values, with the category matched to the workspace's spelling */
    onRuleGenerated: (values: GeneratedRuleValues) => void;

    style?: StyleProp<ViewStyle>;

    sentryLabel: string;
};

function DescribeRuleButton({policyID, ruleType, onRuleGenerated, style, sentryLabel}: DescribeRuleButtonProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    // The modal type depends on the physical screen width, which shouldUseNarrowLayout doesn't track.
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const formRef = useRef<FormRef>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [generationID, setGenerationID] = useState<string>();
    const [generatedRule] = useOnyx(ONYXKEYS.GENERATED_RULE);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const appliedGenerationIDRef = useRef<string>(undefined);
    const inputLabel = translate('workspace.rules.newRule.describeRuleInputLabel');

    const generatedRuleForCurrentPrompt = generationID && generatedRule?.generationID === generationID ? generatedRule : undefined;
    const isGenerating = !!generationID && !generatedRuleForCurrentPrompt;

    const closeModal = () => {
        setIsModalVisible(false);
        setGenerationID(undefined);
        clearDraftValues(ONYXKEYS.FORMS.NEW_RULE_PROMPT_FORM);
        clearNewRulePromptError();
        clearGeneratedRule();
    };

    useEffect(() => {
        if (!generatedRuleForCurrentPrompt || appliedGenerationIDRef.current === generatedRuleForCurrentPrompt.generationID) {
            return;
        }
        appliedGenerationIDRef.current = generatedRuleForCurrentPrompt.generationID;

        if (generatedRuleForCurrentPrompt.state === CONST.GENERATED_RULE.STATE.RULE) {
            const {category, ...ruleValues} = generatedRuleForCurrentPrompt.rule ?? {};
            const matchedCategory = category
                ? Object.values(policyCategories ?? {}).find((policyCategory) => policyCategory.enabled && getDecodedCategoryName(policyCategory.name) === getDecodedCategoryName(category))
                : undefined;
            onRuleGenerated(matchedCategory ? {...ruleValues, category: matchedCategory.name} : ruleValues);
            closeModal();
            return;
        }

        if (generatedRuleForCurrentPrompt.state === CONST.GENERATED_RULE.STATE.UNSUPPORTED) {
            setNewRulePromptError(translate('workspace.rules.newRule.promptErrors.unsupported'));
            return;
        }

        if (generatedRuleForCurrentPrompt.state === CONST.GENERATED_RULE.STATE.MULTIPLE_RULES) {
            setNewRulePromptError(translate('workspace.rules.newRule.promptErrors.multipleRules'));
            return;
        }

        if (generatedRuleForCurrentPrompt.state === CONST.GENERATED_RULE.STATE.UNINTELLIGIBLE) {
            setNewRulePromptError(translate('workspace.rules.newRule.promptErrors.unintelligible'));
            return;
        }

        setNewRulePromptError(translate('common.genericErrorMessage'));
    }, [closeModal, generatedRuleForCurrentPrompt, onRuleGenerated, policyCategories, translate]);

    const describeRule = (values: FormOnyxValues<NewRulePromptFormID>) => {
        clearNewRulePromptError();
        clearGeneratedRule();
        setGenerationID(generateRule(policyID, ruleType, values[INPUT_IDS.PROMPT].trim()));
    };

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

    return (
        <>
            <Button
                onPress={() => setIsModalVisible(true)}
                size={CONST.BUTTON_SIZE.LARGE}
                style={style}
                sentryLabel={sentryLabel}
            >
                <Button.Text>{translate('workspace.rules.newRule.describe')}</Button.Text>
            </Button>
            <Modal
                isVisible={isModalVisible}
                onClose={closeModal}
                type={isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST.MODAL.MODAL_TYPE.CONFIRM}
                avoidKeyboard
                shouldHandleNavigationBack
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <FormProvider
                    ref={formRef}
                    formID={ONYXKEYS.FORMS.NEW_RULE_PROMPT_FORM}
                    validate={validate}
                    onSubmit={describeRule}
                    isLoading={isGenerating}
                    submitButtonText={translate('common.next')}
                    shouldUseScrollView={false}
                    submitFlexEnabled={false}
                    shouldHideFixErrorsAlert
                    shouldValidateOnChange
                    shouldValidateOnBlur
                    keyboardSubmitBehavior={CONST.KEYBOARD_SUBMIT_BEHAVIOR.SUBMIT_ONLY}
                >
                    <Text style={[styles.textNormal, styles.mb5]}>{translate('workspace.rules.newRule.describeRule')}</Text>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.PROMPT}
                        label={inputLabel}
                        accessibilityLabel={inputLabel}
                        role={CONST.ROLE.PRESENTATION}
                        type="markdown"
                        excludedMarkdownStyles={['mentionReport']}
                        onKeyPress={submitFormOnModEnter}
                        onValueChange={clearNewRulePromptError}
                        maxLength={CONST.GENERATED_RULE.PROMPT_MAX_LENGTH}
                        multiline
                        autoGrowHeight
                        maxAutoGrowHeight={variables.textInputAutoGrowMaxHeight}
                        shouldSaveDraft
                        shouldLabelStayOnSingleLine
                    />
                    <Text style={[styles.textMicroSupporting, styles.textAlignCenter, styles.mt2]}>{translate('workspace.rules.agentRules.disclaimer')}</Text>
                </FormProvider>
            </Modal>
        </>
    );
}

DescribeRuleButton.displayName = 'DescribeRuleButton';

export default DescribeRuleButton;
export type {GeneratedRuleValues};
