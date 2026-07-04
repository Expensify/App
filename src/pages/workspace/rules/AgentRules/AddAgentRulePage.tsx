import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues, FormRef} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {BotAvatarBlue} from '@components/Icon/DefaultBotAvatars';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';

import useConfirmModal from '@hooks/useConfirmModal';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';

import Tab from '@libs/actions/Tab';
import {navigateToAgentsTab} from '@libs/AgentRulesUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {rand64} from '@libs/NumberUtils';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import variables from '@styles/variables';

import {addPolicyAgentRule} from '@userActions/Policy/Rules';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/AddAgentRuleForm';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {StyleProp, TextInputKeyPressEvent, ViewStyle} from 'react-native';

import React, {useRef} from 'react';
import {View} from 'react-native';

type AddAgentRulePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_AGENT_NEW>;
type AddAgentRuleFormID = typeof ONYXKEYS.FORMS.ADD_AGENT_RULE_FORM;

function AddAgentRulePage({
    route: {
        params: {policyID},
    },
}: AddAgentRulePageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const shouldUseScrollableLayout = useIsInLandscapeMode();
    const {isBetaEnabled} = usePermissions();
    const isCustomAgentEnabled = isBetaEnabled(CONST.BETAS.CUSTOM_AGENT);
    const isRulesRevampEnabled = isBetaEnabled(CONST.BETAS.RULES_REVAMP);
    const shouldUseExpandedRevampFormLayout = isRulesRevampEnabled && !shouldUseScrollableLayout;
    const policy = usePolicy(policyID);
    const formRef = useRef<FormRef>(null);
    const linkPressedRef = useRef(false);
    const {showConfirmModal, closeModal} = useConfirmModal();

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
        if (!values[INPUT_IDS.PROMPT].trim()) {
            errors[INPUT_IDS.PROMPT] = translate('common.error.fieldRequired');
        }
        return errors;
    };

    const navigateBackToAgentsTab = () => {
        if (isRulesRevampEnabled) {
            Tab.setSelectedTab(CONST.TAB.RULES_TAB_TYPE, CONST.TAB.RULES.AGENTS);
            navigateToAgentsTab(policyID);
            return;
        }

        Navigation.goBack();
    };

    const saveRule = (values: FormOnyxValues<AddAgentRuleFormID>): void => {
        // When the workspace has no agent rules yet, the backend creates the "RuleBot" agent and adds it as
        // an admin. Surface a one-time modal explaining this side effect before navigating back.
        const isFirstRule = isEmptyObject(policy?.rules?.agentRules);
        addPolicyAgentRule(policyID, rand64(), values[INPUT_IDS.PROMPT]);
        if (!isFirstRule) {
            navigateBackToAgentsTab();
            return;
        }
        linkPressedRef.current = false;
        const handleAgentsLinkPress = () => {
            linkPressedRef.current = true;
            closeModal();
        };
        Navigation.dismissModal({
            afterTransition: () => {
                showConfirmModal({
                    title: translate('workspace.rules.agentRules.agentCreatedTitle'),
                    titleStyles: styles.textHeadlineH1,
                    prompt: (
                        <View style={[styles.renderHTML, styles.w100, styles.flexRow]}>
                            <RenderHTML
                                html={translate('workspace.rules.agentRules.agentCreatedDescription', ROUTES.SETTINGS_AGENTS)}
                                onLinkPress={handleAgentsLinkPress}
                            />
                        </View>
                    ),
                    confirmText: isRulesRevampEnabled ? translate('workspace.rules.agentRules.gotIt') : translate('common.buttonConfirm'),
                    shouldShowCancelButton: false,
                    shouldUseSuccessStyleForConfirm: true,
                    iconSource: BotAvatarBlue,
                    iconFill: false,
                    shouldCenterIcon: true,
                    iconWidth: variables.iconSizeUltraLarge,
                    iconHeight: variables.iconSizeUltraLarge,
                    iconAdditionalStyles: {borderRadius: variables.iconSizeUltraLarge / 2, overflow: 'hidden', marginTop: 12},
                }).then(() => {
                    if (linkPressedRef.current) {
                        Navigation.navigate(ROUTES.SETTINGS_AGENTS);
                        return;
                    }

                    navigateBackToAgentsTab();
                });
            },
        });
    };

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
                testID="AddAgentRulePage"
                offlineIndicatorStyle={styles.mtAuto}
                includeSafeAreaPaddingBottom
                shouldEnableMaxHeight={shouldUseScrollableLayout || shouldUseExpandedRevampFormLayout}
            >
                <HeaderWithBackButton title={isRulesRevampEnabled ? translate('workspace.rules.agentRules.newRuleTitle') : translate('workspace.rules.agentRules.addRuleTitle')} />
                <FormProvider
                    ref={formRef}
                    formID={ONYXKEYS.FORMS.ADD_AGENT_RULE_FORM}
                    validate={validate}
                    onSubmit={saveRule}
                    submitButtonText={isRulesRevampEnabled ? translate('workspace.rules.agentRules.nextButton') : translate('common.save')}
                    style={[styles.flex1, styles.ph5]}
                    shouldUseScrollView={shouldUseScrollableLayout}
                    submitFlexEnabled={shouldUseScrollableLayout ? undefined : false}
                    shouldSubmitButtonStickToBottom={shouldUseExpandedRevampFormLayout}
                    enabledWhenOffline
                    shouldHideFixErrorsAlert
                    shouldValidateOnChange
                    shouldValidateOnBlur
                    keyboardSubmitBehavior={CONST.KEYBOARD_SUBMIT_BEHAVIOR.SUBMIT_ONLY}
                >
                    <View style={styles.flex1}>
                        <View style={inputWrapperStyles}>
                            <InputWrapper
                                InputComponent={TextInput}
                                inputID={INPUT_IDS.PROMPT}
                                label={isRulesRevampEnabled ? translate('workspace.rules.agentRules.describeRuleForConcierge') : translate('workspace.rules.agentRules.describeRuleTitle')}
                                accessibilityLabel={
                                    isRulesRevampEnabled ? translate('workspace.rules.agentRules.describeRuleForConcierge') : translate('workspace.rules.agentRules.describeRuleTitle')
                                }
                                role={CONST.ROLE.PRESENTATION}
                                onKeyPress={handleKeyPress}
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

export default AddAgentRulePage;
