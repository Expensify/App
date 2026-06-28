import React from 'react';
import {View} from 'react-native';
import AmountForm from '@components/AmountForm';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateDraftFlagForReviewRule} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/FlagForReviewRuleMaxAmountForm';

type FlagForReviewRuleAmountPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_FLAG_FOR_REVIEW_RULE_AMOUNT>;

function FlagForReviewRuleAmountPage({route}: FlagForReviewRuleAmountPageProps) {
    const {policyID, ruleKey} = route.params;
    const isEditing = ruleKey !== ROUTES.NEW;
    const policy = usePolicy(policyID);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();
    const {canWrite: canWriteRules} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.RULES);
    const {isBetaEnabled} = usePermissions();
    const isRulesRevampEnabled = isBetaEnabled(CONST.BETAS.RULES_REVAMP);
    const policyCurrency = policy?.outputCurrency ?? CONST.CURRENCY.USD;

    const [form] = useOnyx(ONYXKEYS.FORMS.FLAG_FOR_REVIEW_RULE_FORM);
    const defaultValue = form?.[CONST.FLAG_FOR_REVIEW_RULE.FIELDS.MAX_EXPENSE_AMOUNT] ?? '';

    const backToRoute = isEditing ? ROUTES.RULES_FLAG_FOR_REVIEW_RULE_EDIT.getRoute(policyID, ruleKey) : ROUTES.RULES_FLAG_FOR_REVIEW_RULE_NEW.getRoute(policyID);

    const goBack = () => {
        Navigation.goBack(backToRoute);
    };

    const onSubmit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.FLAG_FOR_REVIEW_RULE_MAX_AMOUNT_FORM>) => {
        updateDraftFlagForReviewRule({[CONST.FLAG_FOR_REVIEW_RULE.FIELDS.MAX_EXPENSE_AMOUNT]: values.maxAmount.trim()});
        goBack();
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyFeature={CONST.POLICY.POLICY_FEATURE.RULES}
            shouldBeBlocked={!isRulesRevampEnabled || !canWriteRules}
        >
            <ScreenWrapper
                shouldEnableMaxHeight
                enableEdgeToEdgeBottomSafeAreaPadding
                testID="FlagForReviewRuleAmountPage"
            >
                <HeaderWithBackButton
                    title={translate('iou.amount')}
                    onBackButtonPress={goBack}
                />
                <FormProvider
                    enabledWhenOffline
                    shouldHideFixErrorsAlert
                    addBottomSafeAreaPadding
                    style={[styles.flexGrow1, styles.ph5]}
                    formID={ONYXKEYS.FORMS.FLAG_FOR_REVIEW_RULE_MAX_AMOUNT_FORM}
                    submitButtonText={translate('common.save')}
                    onSubmit={onSubmit}
                >
                    <View style={styles.mb4}>
                        <InputWrapper
                            displayAsTextInput
                            ref={inputCallbackRef}
                            label={translate('iou.amount')}
                            InputComponent={AmountForm}
                            inputID={INPUT_IDS.MAX_AMOUNT}
                            currency={policyCurrency}
                            defaultValue={defaultValue}
                            isCurrencyPressable={false}
                        />
                    </View>
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default FlagForReviewRuleAmountPage;
