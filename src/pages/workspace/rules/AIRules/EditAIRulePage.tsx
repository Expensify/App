import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {ModalActions} from '@components/Modal/Global/ModalContext';
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
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {deletePolicyAIRule, updatePolicyAIRule} from '@userActions/Policy/Rules';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/EditAIRuleForm';

type EditAIRulePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_AI_EDIT>;
type EditAIRuleFormID = 'editAIRuleForm';

function EditAIRulePage({
    route: {
        params: {policyID, ruleID},
    },
}: EditAIRulePageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {showConfirmModal} = useConfirmModal();
    const {isBetaEnabled} = usePermissions();
    const isCustomAgentEnabled = isBetaEnabled(CONST.BETAS.CUSTOM_AGENT);
    const policy = usePolicy(policyID);
    const aiRule = policy?.rules?.aiRules?.[ruleID];

    const validate = (values: FormOnyxValues<EditAIRuleFormID>): FormInputErrors<EditAIRuleFormID> => {
        const errors: FormInputErrors<EditAIRuleFormID> = {};
        if (!values[INPUT_IDS.PROMPT].trim()) {
            errors[INPUT_IDS.PROMPT] = translate('common.error.fieldRequired');
        }
        return errors;
    };

    const saveRule = (values: FormOnyxValues<EditAIRuleFormID>): void => {
        updatePolicyAIRule(policyID, ruleID, values[INPUT_IDS.PROMPT], aiRule?.prompt ?? '');
        Navigation.goBack();
    };

    const handleDelete = () => {
        if (!policy || !aiRule) {
            return;
        }

        showConfirmModal({
            title: translate('workspace.rules.aiRules.deleteRule'),
            prompt: translate('workspace.rules.aiRules.deleteRuleConfirmation'),
            confirmText: translate('common.delete'),
            cancelText: translate('common.cancel'),
            danger: true,
        }).then((result) => {
            if (result.action !== ModalActions.CONFIRM) {
                return;
            }

            deletePolicyAIRule(policy, ruleID);
            Navigation.goBack();
        });
    };

    if (!aiRule) {
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
                testID="EditAIRulePage"
                offlineIndicatorStyle={styles.mtAuto}
                includeSafeAreaPaddingBottom
            >
                <HeaderWithBackButton title={translate('workspace.rules.aiRules.editRuleTitle')} />
                <FormProvider
                    formID={ONYXKEYS.FORMS.EDIT_AI_RULE_FORM}
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
                    footerContent={
                        <Button
                            text={translate('workspace.rules.aiRules.deleteRule')}
                            onPress={handleDelete}
                            style={[styles.mb4]}
                            large
                            danger
                            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.AI_RULE_DELETE}
                        />
                    }
                >
                    <View style={styles.flex1}>
                        <View style={[styles.gap2, styles.mv4]}>
                            <Text style={[styles.textHeadlineH2]}>{translate('workspace.rules.aiRules.describeRuleTitle')}</Text>
                            <Text style={[styles.textSupporting]}>{translate('workspace.rules.aiRules.describeRuleSubtitle')}</Text>
                        </View>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.PROMPT}
                            label={translate('workspace.rules.aiRules.describeRuleTitle')}
                            accessibilityLabel={translate('workspace.rules.aiRules.describeRuleTitle')}
                            role={CONST.ROLE.PRESENTATION}
                            defaultValue={aiRule.prompt}
                            multiline
                            containerStyles={[styles.flex1]}
                            touchableInputWrapperStyle={[styles.flex1]}
                            textInputContainerStyles={[styles.flex1]}
                            inputStyle={[styles.flex1, styles.textAlignVerticalTop]}
                        />
                    </View>
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default EditAIRulePage;
