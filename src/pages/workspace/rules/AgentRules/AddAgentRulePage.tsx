import React, {useRef} from 'react';
import type {TextInputKeyPressEvent} from 'react-native';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues, FormRef} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {rand64} from '@libs/NumberUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {addPolicyAgentRule} from '@userActions/Policy/Rules';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/AddAgentRuleForm';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type AddAgentRulePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_AGENT_NEW>;
type AddAgentRuleFormID = typeof ONYXKEYS.FORMS.ADD_AGENT_RULE_FORM;

function AddAgentRulePage({
    route: {
        params: {policyID},
    },
}: AddAgentRulePageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isBetaEnabled} = usePermissions();
    const isCustomAgentEnabled = isBetaEnabled(CONST.BETAS.CUSTOM_AGENT);
    const policy = usePolicy(policyID);
    const formRef = useRef<FormRef>(null);
    const {showConfirmModal} = useConfirmModal();

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

    const saveRule = (values: FormOnyxValues<AddAgentRuleFormID>): void => {
        // When the workspace has no agent rules yet, the backend creates the "RuleBot" agent and adds it as
        // an admin. Surface a one-time modal explaining this side effect before navigating back.
        const isFirstRule = isEmptyObject(policy?.rules?.agentRules);
        addPolicyAgentRule(policyID, rand64(), values[INPUT_IDS.PROMPT]);
        if (isFirstRule) {
            showConfirmModal({
                title: translate('workspace.rules.agentRules.agentCreatedTitle'),
                prompt: translate('workspace.rules.agentRules.agentCreatedDescription'),
                confirmText: translate('common.buttonConfirm'),
                shouldShowCancelButton: false,
            }).then(() => Navigation.goBack());
            return;
        }
        Navigation.goBack();
    };

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
            >
                <HeaderWithBackButton title={translate('workspace.rules.agentRules.addRuleTitle')} />
                <FormProvider
                    ref={formRef}
                    formID={ONYXKEYS.FORMS.ADD_AGENT_RULE_FORM}
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
                >
                    <View style={styles.flex1}>
                        <View style={[styles.gap2, styles.mv4]}>
                            <Text style={[styles.textHeadlineH2]}>{translate('workspace.rules.agentRules.describeRuleTitle')}</Text>
                            <Text style={[styles.textSupporting]}>{translate('workspace.rules.agentRules.describeRuleSubtitle')}</Text>
                        </View>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.PROMPT}
                            label={translate('workspace.rules.agentRules.describeRuleTitle')}
                            accessibilityLabel={translate('workspace.rules.agentRules.describeRuleTitle')}
                            role={CONST.ROLE.PRESENTATION}
                            onKeyPress={handleKeyPress}
                            multiline
                            containerStyles={[styles.flex1]}
                            touchableInputWrapperStyle={[styles.flex1]}
                            textInputContainerStyles={[styles.flex1]}
                            inputStyle={[styles.flex1, styles.textAlignVerticalTop]}
                        />
                        <Text style={[styles.textMicroSupporting, styles.textAlignCenter, styles.mt2]}>{translate('workspace.rules.agentRules.disclaimer')}</Text>
                    </View>
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default AddAgentRulePage;
