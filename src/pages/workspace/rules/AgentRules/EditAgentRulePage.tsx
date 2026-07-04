import Button from '@components/Button';
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
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import variables from '@styles/variables';

import {deletePolicyAgentRule, updatePolicyAgentRule} from '@userActions/Policy/Rules';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/EditAgentRuleForm';

import type {StyleProp, TextInputKeyPressEvent, ViewStyle} from 'react-native';

import React, {useRef} from 'react';
import {View} from 'react-native';

type EditAgentRulePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_AGENT_EDIT>;
type EditAgentRuleFormID = typeof ONYXKEYS.FORMS.EDIT_AGENT_RULE_FORM;

function EditAgentRulePage({
    route: {
        params: {policyID, ruleID},
    },
}: EditAgentRulePageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const shouldUseScrollableLayout = useIsInLandscapeMode();
    const {showConfirmModal} = useConfirmModal();
    const {isBetaEnabled} = usePermissions();
    const isCustomAgentEnabled = isBetaEnabled(CONST.BETAS.CUSTOM_AGENT);
    const isRulesRevampEnabled = isBetaEnabled(CONST.BETAS.RULES_REVAMP);
    const shouldUseExpandedRevampFormLayout = isRulesRevampEnabled && !shouldUseScrollableLayout;
    const policy = usePolicy(policyID);
    const agentRule = policy?.rules?.agentRules?.[ruleID];
    const formRef = useRef<FormRef>(null);
    const describeRuleLabel = isRulesRevampEnabled ? translate('workspace.rules.agentRules.describeRuleForConcierge') : translate('workspace.rules.agentRules.describeRuleTitle');

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

    const inputWrapperStyles: StyleProp<ViewStyle> = shouldUseExpandedRevampFormLayout
        ? [styles.flex1, styles.mnh0, {maxHeight: variables.agentRulePromptInputHeight}]
        : [styles.flex1, shouldUseScrollableLayout && styles.minHeight42];

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
                shouldEnableMaxHeight={shouldUseScrollableLayout || shouldUseExpandedRevampFormLayout}
            >
                <HeaderWithBackButton title={translate('workspace.rules.agentRules.editRuleTitle')} />
                <FormProvider
                    ref={formRef}
                    formID={ONYXKEYS.FORMS.EDIT_AGENT_RULE_FORM}
                    validate={validate}
                    onSubmit={saveRule}
                    submitButtonText={translate('common.save')}
                    style={[styles.flex1, styles.ph5]}
                    shouldUseScrollView={shouldUseScrollableLayout}
                    submitFlexEnabled={shouldUseScrollableLayout ? undefined : false}
                    shouldSubmitButtonStickToBottom={shouldUseExpandedRevampFormLayout}
                    enabledWhenOffline
                    shouldHideFixErrorsAlert
                    shouldValidateOnChange
                    shouldValidateOnBlur
                    keyboardSubmitBehavior={CONST.KEYBOARD_SUBMIT_BEHAVIOR.SUBMIT_ONLY}
                    shouldRenderFooterAboveSubmit
                    footerContent={
                        <Button
                            text={translate('workspace.rules.agentRules.deleteRule')}
                            onPress={handleDelete}
                            style={[styles.mb4]}
                            large
                            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.AGENT_RULE_DELETE}
                        />
                    }
                >
                    <View style={styles.flex1}>
                        <View style={inputWrapperStyles}>
                            <InputWrapper
                                InputComponent={TextInput}
                                inputID={INPUT_IDS.PROMPT}
                                label={describeRuleLabel}
                                accessibilityLabel={describeRuleLabel}
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
                    </View>
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default EditAgentRulePage;
