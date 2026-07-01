import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import AmountForm from '@components/AmountForm';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import Text from '@components/Text';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateDraftFlagForReviewRule} from '@libs/actions/User';
import {getFlagForReviewRuleAmountError} from '@libs/FlagForReviewRulesUtils';
import Navigation from '@libs/Navigation/Navigation';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import FLAG_FOR_REVIEW_RULE_INPUT_IDS from '@src/types/form/FlagForReviewRuleForm';
import INPUT_IDS from '@src/types/form/FlagForReviewRuleMaxAmountForm';
import type {PolicyCategoryExpenseLimitType} from '@src/types/onyx/PolicyCategory';

type FlagForReviewRuleAmountPageBaseProps = {
    policyID: string;
    categoryName?: string;
};

function FlagForReviewRuleAmountPageBase({policyID, categoryName}: FlagForReviewRuleAmountPageBaseProps) {
    const isEditing = !!categoryName;
    const policy = usePolicy(policyID);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();
    const {canWrite: canWriteRules} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.RULES);
    const {isBetaEnabled} = usePermissions();
    const isRulesRevampEnabled = isBetaEnabled(CONST.BETAS.RULES_REVAMP);
    const policyCurrency = policy?.outputCurrency ?? CONST.CURRENCY.USD;

    const [form] = useOnyx(ONYXKEYS.FORMS.FLAG_FOR_REVIEW_RULE_FORM);
    const defaultValue = form?.[FLAG_FOR_REVIEW_RULE_INPUT_IDS.MAX_EXPENSE_AMOUNT] ?? '';
    const draftExpenseLimitType = form?.[FLAG_FOR_REVIEW_RULE_INPUT_IDS.EXPENSE_LIMIT_TYPE] ?? CONST.POLICY.EXPENSE_LIMIT_TYPES.EXPENSE;
    const [expenseLimitType, setExpenseLimitType] = useState<PolicyCategoryExpenseLimitType>(draftExpenseLimitType);
    const selectedExpenseLimitType = expenseLimitType ?? draftExpenseLimitType;

    const backToRoute = isEditing ? ROUTES.RULES_FLAG_FOR_REVIEW_RULE_EDIT.getRoute(policyID, categoryName) : ROUTES.RULES_FLAG_FOR_REVIEW_RULE_NEW.getRoute(policyID);

    const expenseLimitTypes = useMemo(
        () =>
            Object.values(CONST.POLICY.EXPENSE_LIMIT_TYPES).map((value) => ({
                value,
                text: translate(`workspace.rules.categoryRules.expenseLimitTypes.${value}`),
                alternateText: translate(`workspace.rules.categoryRules.expenseLimitTypes.${value}Subtitle`),
                keyForList: value,
                isSelected: selectedExpenseLimitType === value,
            })),
        [selectedExpenseLimitType, translate],
    );

    const goBack = () => {
        Navigation.goBack(backToRoute);
    };

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.FLAG_FOR_REVIEW_RULE_MAX_AMOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.FLAG_FOR_REVIEW_RULE_MAX_AMOUNT_FORM> => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.FLAG_FOR_REVIEW_RULE_MAX_AMOUNT_FORM> = {};
        const amountError = getFlagForReviewRuleAmountError(values.maxAmount, translate);

        if (amountError) {
            errors.maxAmount = amountError;
        }

        return errors;
    };

    const onSubmit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.FLAG_FOR_REVIEW_RULE_MAX_AMOUNT_FORM>) => {
        updateDraftFlagForReviewRule({
            [FLAG_FOR_REVIEW_RULE_INPUT_IDS.MAX_EXPENSE_AMOUNT]: values.maxAmount.trim(),
            [FLAG_FOR_REVIEW_RULE_INPUT_IDS.EXPENSE_LIMIT_TYPE]: selectedExpenseLimitType,
        });
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
                    style={[styles.flexGrow1]}
                    submitButtonStyles={styles.ph5}
                    formID={ONYXKEYS.FORMS.FLAG_FOR_REVIEW_RULE_MAX_AMOUNT_FORM}
                    submitButtonText={translate('common.save')}
                    validate={validate}
                    onSubmit={onSubmit}
                >
                    <View style={[styles.mb4, styles.ph5]}>
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
                    <Text style={[styles.textLabelSupporting, styles.mb3, styles.ph5]}>{translate('common.type')}</Text>
                    <SelectionList
                        data={expenseLimitTypes}
                        ListItem={SingleSelectListItem}
                        onSelectRow={(item) => setExpenseLimitType(item.value as PolicyCategoryExpenseLimitType)}
                        shouldSingleExecuteRowSelect
                        alternateNumberOfSupportedLines={3}
                        disableKeyboardShortcuts
                        initiallyFocusedItemKey={selectedExpenseLimitType}
                    />
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default FlagForReviewRuleAmountPageBase;
