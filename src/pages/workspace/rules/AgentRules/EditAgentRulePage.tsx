import Button from '@components/Button';
import CollapsibleHeaderOnKeyboard from '@components/CollapsibleHeaderOnKeyboard';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues, FormRef} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';

import useConfirmModal from '@hooks/useConfirmModal';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useKeyboardState from '@hooks/useKeyboardState';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import {PROMPT_MAX_HEIGHT_ON_KEYBOARD_OPEN_LANDSCAPE_MODE, COLLAPSIBLE_HEADER_OFFSET} from '@pages/settings/Agents/const';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import {deletePolicyAgentRule, updatePolicyAgentRule} from '@userActions/Policy/Rules';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/EditAgentRuleForm';

import type {TextInputKeyPressEvent} from 'react-native';

import React, {useRef} from 'react';
import {View} from 'react-native';

type EditAgentRulePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_AGENT_EDIT>;
type EditAgentRuleFormID = typeof ONYXKEYS.FORMS.EDIT_AGENT_RULE_FORM;

function EditAgentRulePage({
    route: {
        params: {policyID, ruleID},
    },
}: EditAgentRulePageProps) {
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const isInLandscapeMode = useIsInLandscapeMode();
    const {isKeyboardActive} = useKeyboardState();
    const shouldShrinkPromptInput = isInLandscapeMode && isKeyboardActive;
    const {showConfirmModal} = useConfirmModal();
    const {isBetaEnabled} = usePermissions();
    const isCustomAgentEnabled = isBetaEnabled(CONST.BETAS.CUSTOM_AGENT);
    const policy = usePolicy(policyID);
    const agentRule = policy?.rules?.agentRules?.[ruleID];
    const formRef = useRef<FormRef>(null);

    const handleKeyPress = (e: TextInputKeyPressEvent | KeyboardEvent) => {
        if (!('key' in e)) {
            return;
        }
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            formRef.current?.submit();
        }
    };

    const validate = (values: FormOnyxValues<EditAgentRuleFormID>): FormInputErrors<EditAgentRuleFormID> => {
        const errors: FormInputErrors<EditAgentRuleFormID> = {};
        if (!values[INPUT_IDS.PROMPT].trim()) {
            errors[INPUT_IDS.PROMPT] = translate('common.error.fieldRequired');
        }
        return errors;
    };

    const saveRule = (values: FormOnyxValues<EditAgentRuleFormID>): void => {
        const newPrompt = values[INPUT_IDS.PROMPT];
        const previousPrompt = agentRule?.prompt ?? '';
        if (newPrompt !== previousPrompt) {
            updatePolicyAgentRule(policyID, ruleID, newPrompt, previousPrompt);
        }
        Navigation.goBack();
    };

    const handleDelete = () => {
        if (!policy || !agentRule) {
            return;
        }

        showConfirmModal({
            title: translate('workspace.rules.agentRules.deleteRule'),
            prompt: translate('workspace.rules.agentRules.deleteRuleConfirmation'),
            confirmText: translate('common.delete'),
            cancelText: translate('common.cancel'),
            danger: true,
        }).then((result) => {
            if (result.action !== ModalActions.CONFIRM) {
                return;
            }

            deletePolicyAgentRule(policy, ruleID);
            Navigation.goBack();
        });
    };

    if (!agentRule) {
        return <NotFoundPage />;
    }

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            shouldBeBlocked={!isCustomAgentEnabled}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
        >
            <ScreenWrapper
                testID="EditAgentRulePage"
                offlineIndicatorStyle={styles.mtAuto}
                includeSafeAreaPaddingBottom
            >
                <CollapsibleHeaderOnKeyboard collapsibleHeaderOffset={COLLAPSIBLE_HEADER_OFFSET}>
                    <HeaderWithBackButton title={translate('workspace.rules.agentRules.editRuleTitle')} />
                </CollapsibleHeaderOnKeyboard>
                <FormProvider
                    ref={formRef}
                    formID={ONYXKEYS.FORMS.EDIT_AGENT_RULE_FORM}
                    validate={validate}
                    onSubmit={saveRule}
                    submitButtonText={translate('common.save')}
                    style={[styles.flex1, styles.ph5]}
                    shouldUseScrollView={false}
                    submitFlexEnabled={false}
                    enabledWhenOffline
                    shouldHideFixErrorsAlert
                    shouldValidateOnChange
                    shouldValidateOnBlur
                    keyboardSubmitBehavior={CONST.KEYBOARD_SUBMIT_BEHAVIOR.SUBMIT_ONLY}
                    shouldRenderFooterAboveSubmit
                    shouldDisplaySubmitButtonAndFooterInOneRowInLandscapeMode
                    footerContent={
                        <Button
                            text={translate('workspace.rules.agentRules.deleteRule')}
                            onPress={handleDelete}
                            style={[isInLandscapeMode ? styles.flex1 : styles.mb4]}
                            large
                            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.AGENT_RULE_DELETE}
                        />
                    }
                >
                    <View style={shouldShrinkPromptInput ? StyleUtils.getHeight(PROMPT_MAX_HEIGHT_ON_KEYBOARD_OPEN_LANDSCAPE_MODE) : [styles.flex1]}>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.PROMPT}
                            label={translate('workspace.rules.agentRules.describeRuleTitle')}
                            accessibilityLabel={translate('workspace.rules.agentRules.describeRuleTitle')}
                            role={CONST.ROLE.PRESENTATION}
                            onKeyPress={handleKeyPress}
                            defaultValue={agentRule.prompt}
                            multiline
                            shouldLabelStayOnSingleLine
                            containerStyles={[styles.flex1]}
                            touchableInputWrapperStyle={[styles.flex1]}
                            textInputContainerStyles={[styles.flex1]}
                            inputStyle={[styles.flex1, styles.textAlignVerticalTop]}
                        />
                    </View>
                    <Text style={[styles.textMicroSupporting, styles.textAlignCenter, styles.mt2]}>{translate('workspace.rules.agentRules.disclaimer')}</Text>
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default EditAgentRulePage;
