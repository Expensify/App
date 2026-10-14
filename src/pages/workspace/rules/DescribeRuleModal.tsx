/**
 * Modal where an admin describes a rule in plain English and Concierge fills in the open rule editor's form.
 */
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
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useViewportOffsetTop from '@hooks/useViewportOffsetTop';
import useWindowDimensions from '@hooks/useWindowDimensions';

import {getDecodedCategoryName} from '@libs/CategoryUtils';

import {clearGeneratedRule, clearNewRulePrompt, generateRule, setNewRulePromptError, setNewRulePromptErrorMessage} from '@userActions/Policy/Rules';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/NewRulePromptForm';
import type {PolicyCategories, PolicyCategory} from '@src/types/onyx';
import type {GeneratedRuleType, GeneratedRuleValues} from '@src/types/onyx/GeneratedRule';

import type {TextInputKeyPressEvent} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';

import {useFocusEffect} from '@react-navigation/native';
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

    /** Whether a new rule can use the category, so a generated category that already has this kind of rule is dropped or rejected */
    isCategoryEligible?: (category: PolicyCategory) => boolean;
};

function findPolicyCategory(categoryName: string, policyCategories: OnyxEntry<PolicyCategories>): PolicyCategory | undefined {
    return Object.values(policyCategories ?? {}).find((candidate) => candidate.enabled && getDecodedCategoryName(candidate.name) === getDecodedCategoryName(categoryName));
}

/** Replaces the generated categories with the workspace's own spelling of them, and drops any the workspace has no enabled category for */
function withPolicyCategories(values: GeneratedRuleValues, policyCategories: OnyxEntry<PolicyCategories>): GeneratedRuleValues {
    const {category, categoriesToMatch, ...rest} = values;
    const policyValues: GeneratedRuleValues = rest;
    const policyCategory = category ? findPolicyCategory(category, policyCategories) : undefined;
    if (policyCategory) {
        policyValues.category = policyCategory.name;
    }
    if (categoriesToMatch) {
        policyValues.categoriesToMatch = categoriesToMatch.flatMap((categoryName) => findPolicyCategory(categoryName, policyCategories)?.name ?? []);
    }
    return policyValues;
}

function DescribeRuleModal({isVisible, onClose, policyID, ruleType, onRuleGenerated, isCategoryEligible}: DescribeRuleModalProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {windowHeight} = useWindowDimensions();
    const viewportOffsetTop = useViewportOffsetTop();
    // We need to use isSmallScreenWidth here because the Modal breaks in RHP with shouldUseNarrowLayout.
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const formRef = useRef<FormRef>(null);
    const inputRef = useRef<AnimatedTextInputRef>(null);
    const pendingGenerationIDRef = useRef<string>(undefined);
    const [generatedRule] = useOnyx(ONYXKEYS.GENERATED_RULE);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const generatedRuleID = generatedRule?.generationID;
    const generatedRuleState = generatedRule?.state;
    const generatedRuleType = generatedRule?.ruleType;
    const generatedRuleValues = generatedRule?.rule;
    const inputLabel = translate('workspace.rules.newRule.describeRuleInputLabel');

    const close = () => {
        pendingGenerationIDRef.current = undefined;
        clearNewRulePrompt();
        onClose();
    };

    useEffect(() => {
        if (!generatedRuleID || !generatedRuleState || generatedRuleID !== pendingGenerationIDRef.current) {
            return;
        }
        if (generatedRuleState !== CONST.GENERATED_RULE.STATE.RULE) {
            setNewRulePromptError(generatedRuleState);
            clearGeneratedRule();
            return;
        }
        // Concierge picks the rule type itself. It can answer with a rule type other than the one this editor asked for.
        if (generatedRuleType !== ruleType) {
            setNewRulePromptError(CONST.GENERATED_RULE.STATE.UNSUPPORTED);
            clearGeneratedRule();
            return;
        }
        const values = withPolicyCategories(generatedRuleValues ?? {}, policyCategories);
        const isCategoryTaken = (categoryName: string) => {
            const policyCategory = policyCategories?.[categoryName];
            return !!policyCategory && !!isCategoryEligible && !isCategoryEligible(policyCategory);
        };
        const eligibleCategoriesToMatch = values.categoriesToMatch?.filter((categoryName) => !isCategoryTaken(categoryName));
        if ((values.category && isCategoryTaken(values.category)) || (values.categoriesToMatch?.length && !eligibleCategoriesToMatch?.length)) {
            setNewRulePromptErrorMessage('workspace.rules.newRule.promptErrors.categoryHasRule');
            clearGeneratedRule();
            return;
        }
        onRuleGenerated(eligibleCategoriesToMatch ? {...values, categoriesToMatch: eligibleCategoriesToMatch} : values);
        close();
    }, [close, generatedRuleID, generatedRuleState, generatedRuleType, generatedRuleValues, isCategoryEligible, onRuleGenerated, policyCategories, ruleType]);

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

    const submit = (values: FormOnyxValues<NewRulePromptFormID>) => {
        pendingGenerationIDRef.current = generateRule(policyID, ruleType, values[INPUT_IDS.PROMPT].trim());
    };

    return (
        <Modal
            isVisible={isVisible}
            onClose={close}
            type={isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST.MODAL.MODAL_TYPE.CONFIRM}
            innerContainerStyle={styles.pv0}
            outerStyle={isSmallScreenWidth ? StyleUtils.getOuterModalStyle(windowHeight, viewportOffsetTop) : undefined}
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
                shouldUseScrollView={isSmallScreenWidth}
                submitFlexEnabled={false}
                shouldHideFixErrorsAlert
                keyboardSubmitBehavior={CONST.KEYBOARD_SUBMIT_BEHAVIOR.SUBMIT_ONLY}
            >
                <Text style={[styles.textNormal, styles.textSupporting, styles.mb5]}>{translate('workspace.rules.newRule.describeRule')}</Text>
                <View style={isSmallScreenWidth ? styles.describeRulePromptInputNarrow : styles.describeRulePromptInput}>
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
            </FormProvider>
        </Modal>
    );
}

DescribeRuleModal.displayName = 'DescribeRuleModal';

export default DescribeRuleModal;
