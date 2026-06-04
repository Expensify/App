import React, {useState} from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import {addPolicyAIRule} from '@libs/actions/Policy/Rules';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {rand64} from '@libs/NumberUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/AddAIRuleForm';
import type {Errors} from '@src/types/onyx/OnyxCommon';

type AddAIRulePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_AI_NEW>;

function AddAIRulePage({route}: AddAIRulePageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isBetaEnabled} = usePermissions();
    const isCustomAgentEnabled = isBetaEnabled(CONST.BETAS.CUSTOM_AGENT);
    const policyID = route.params.policyID;
    const [prompt, setPrompt] = useState('');

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ADD_AI_RULE_FORM>): Errors => {
        const errors: Errors = {};
        if (!values[INPUT_IDS.PROMPT].trim()) {
            errors[INPUT_IDS.PROMPT] = translate('common.error.fieldRequired');
        }
        return errors;
    };
    const saveRule = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ADD_AI_RULE_FORM>): void => {
        addPolicyAIRule(policyID, rand64(), values[INPUT_IDS.PROMPT]);
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
                testID="AddAIRulePage"
                offlineIndicatorStyle={styles.mtAuto}
                includeSafeAreaPaddingBottom
            >
                <HeaderWithBackButton title={translate('workspace.rules.aiRules.addRuleTitle')} />
                <FormProvider
                    formID={ONYXKEYS.FORMS.ADD_AI_RULE_FORM}
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
                            <Text style={[styles.textHeadlineH2]}>{translate('workspace.rules.aiRules.describeRuleTitle')}</Text>
                            <Text style={[styles.textSupporting]}>{translate('workspace.rules.aiRules.describeRuleSubtitle')}</Text>
                        </View>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.PROMPT}
                            label={translate('workspace.rules.aiRules.describeRuleTitle')}
                            accessibilityLabel={translate('workspace.rules.aiRules.describeRuleTitle')}
                            role={CONST.ROLE.PRESENTATION}
                            value={prompt}
                            onChangeText={setPrompt}
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

export default AddAIRulePage;
