import AmountForm from '@components/AmountForm';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import CategoryFlagLimitsLoadError from '@components/Rule/CategoryFlagLimitsLoadError';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import Text from '@components/Text';

import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useCategoryFlagLimits from '@hooks/useCategoryFlagLimits';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLoadPolicyCategories from '@hooks/useLoadPolicyCategories';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useThemeStyles from '@hooks/useThemeStyles';

import {setDraftFlagForReviewRule} from '@libs/actions/User';
import {
    getCategoryFlagLimit,
    getFlagForReviewConditions,
    getFlagForReviewDraft,
    getFlagForReviewDraftKey,
    getFlagForReviewRuleAmountError,
    qualifyCategoryFlagRulePath,
    usesLegacyFlagLimitEditor,
} from '@libs/FlagForReviewRulesUtils';
import stripDynamicRouteSuffixFromPath from '@libs/Navigation/helpers/dynamicRoutesUtils/stripDynamicRouteSuffixFromPath';
import Navigation from '@libs/Navigation/Navigation';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import FLAG_FOR_REVIEW_RULE_INPUT_IDS from '@src/types/form/FlagForReviewRuleForm';
import INPUT_IDS from '@src/types/form/FlagForReviewRuleMaxAmountForm';
import type {PolicyCategoryExpenseLimitType} from '@src/types/onyx/PolicyCategory';

import React, {useState} from 'react';
import {View} from 'react-native';

type FlagForReviewRuleAmountPageBaseProps = {
    policyID: string;
    categoryName?: string;
    ruleID?: string;
    /** When true, return to the edit screen with the category field still locked. */
    isCategoryLocked?: boolean;
    /** When true, back navigation uses the category dynamic route stack. */
    isCategoryScopedFlow?: boolean;
};

function FlagForReviewRuleAmountPageBase({policyID, categoryName, ruleID, isCategoryLocked, isCategoryScopedFlow = false}: FlagForReviewRuleAmountPageBaseProps) {
    const policy = usePolicy(policyID);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();
    const {canWrite: canWriteRules} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.RULES);
    const {getCurrencyDecimals} = useCurrencyListActions();
    const [expenseLimitType, setExpenseLimitType] = useState<PolicyCategoryExpenseLimitType>();

    const [storedDraft] = useOnyx(ONYXKEYS.FORMS.FLAG_FOR_REVIEW_RULE_FORM);
    const [categories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const category = categoryName ? (categories?.[categoryName] ?? Object.values(categories ?? {}).find((entry) => entry.previousCategoryName === categoryName)) : undefined;
    useLoadPolicyCategories(categoryName && !category ? policyID : undefined);
    const {categoryFlagLimits, areCategoryFlagLimitsLoading, haveCategoryFlagLimitsLoaded} = useCategoryFlagLimits(policyID, category);
    const resolvedRuleID = ruleID ?? getCategoryFlagLimit(category, categoryFlagLimits)?.ruleID;
    const [rule] = useOnyx(`${ONYXKEYS.COLLECTION.RULE}${resolvedRuleID}`);
    const conditions = rule?.scope === CONST.RULES.SCOPE.POLICY && rule.scopeID === policyID ? getFlagForReviewConditions(rule) : undefined;
    const draftKey = getFlagForReviewDraftKey(policyID, resolvedRuleID, categoryName);
    const cachedDraft = storedDraft?.draftKey === draftKey ? storedDraft : undefined;
    const draft = cachedDraft ?? (conditions ? getFlagForReviewDraft(conditions, getCurrencyDecimals, true) : undefined);
    const currency = draft?.currency ?? policy?.outputCurrency ?? CONST.CURRENCY.USD;
    const defaultValue = draft?.maxExpenseAmount ?? '';
    const isMerchantRule = !!draft?.merchantToMatch?.trim();
    const selectedExpenseLimitType = isMerchantRule ? CONST.POLICY.EXPENSE_LIMIT_TYPES.EXPENSE : (expenseLimitType ?? draft?.expenseLimitType ?? CONST.POLICY.EXPENSE_LIMIT_TYPES.EXPENSE);
    const usesCategoryLimitEditor = isCategoryLocked || !!categoryName || usesLegacyFlagLimitEditor(resolvedRuleID, categories, conditions);

    const getBackToRoute = () => {
        if (isCategoryScopedFlow) {
            const path = qualifyCategoryFlagRulePath(policyID, Navigation.getActiveRoute());
            return stripDynamicRouteSuffixFromPath(path, DYNAMIC_ROUTES.WORKSPACE_CATEGORY_RULES_FLAG_FOR_REVIEW_AMOUNT.path);
        }
        if (ruleID) {
            return ROUTES.RULES_FLAG_FOR_REVIEW_RULE_EDIT.getRoute(policyID, ruleID, isCategoryLocked);
        }
        // Only preserve ?categoryName= when create started category-scoped (locked). Never inject the
        // draft-selected category — that remounts Rules-tab create and locks the field.
        return ROUTES.RULES_FLAG_FOR_REVIEW_RULE_NEW.getRoute(policyID, categoryName);
    };

    const expenseLimitTypes = Object.values(CONST.POLICY.EXPENSE_LIMIT_TYPES).map((value) => ({
        value,
        text: translate(`workspace.rules.categoryRules.expenseLimitTypes.${value}`),
        alternateText: translate(`workspace.rules.categoryRules.expenseLimitTypes.${value}Subtitle`),
        keyForList: value,
        isSelected: selectedExpenseLimitType === value,
    }));

    const goBack = () => {
        Navigation.goBack(getBackToRoute());
    };

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.FLAG_FOR_REVIEW_RULE_MAX_AMOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.FLAG_FOR_REVIEW_RULE_MAX_AMOUNT_FORM> => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.FLAG_FOR_REVIEW_RULE_MAX_AMOUNT_FORM> = {};
        const canClearAmount = isMerchantRule && !values.maxAmount?.trim();
        const amountError = canClearAmount ? undefined : getFlagForReviewRuleAmountError(values.maxAmount, translate, selectedExpenseLimitType);

        if (amountError) {
            errors.maxAmount = amountError;
        }

        return errors;
    };

    const onSubmit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.FLAG_FOR_REVIEW_RULE_MAX_AMOUNT_FORM>) => {
        setDraftFlagForReviewRule({
            ...draft,
            [FLAG_FOR_REVIEW_RULE_INPUT_IDS.DRAFT_KEY]: draftKey,
            [FLAG_FOR_REVIEW_RULE_INPUT_IDS.MAX_EXPENSE_AMOUNT]: values.maxAmount?.trim() ?? '',
            [FLAG_FOR_REVIEW_RULE_INPUT_IDS.EXPENSE_LIMIT_TYPE]: selectedExpenseLimitType,
        });
        Navigation.goBack(getBackToRoute(), {shouldSkipFocusRestore: true});
    };

    if ((ruleID || categoryName) && !conditions && areCategoryFlagLimitsLoading) {
        return <FullScreenLoadingIndicator shouldUseGoBackButton />;
    }

    if ((categoryName && !category) || ((ruleID || categoryName) && !conditions && !haveCategoryFlagLimitsLoaded)) {
        return (
            <ScreenWrapper testID="FlagForReviewRuleAmountPage">
                <HeaderWithBackButtonAndTitle
                    title={translate('iou.amount')}
                    onBackButtonPress={goBack}
                />
                <CategoryFlagLimitsLoadError missingCategoriesPolicyID={categoryName && !category ? policyID : undefined} />
            </ScreenWrapper>
        );
    }

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyFeature={CONST.POLICY.POLICY_FEATURE.RULES}
            shouldBeBlocked={!canWriteRules || !usesCategoryLimitEditor || (!!resolvedRuleID && (!conditions || (!!rule?.pendingAction && !rule.errors)))}
        >
            <ScreenWrapper
                shouldEnableMaxHeight
                enableEdgeToEdgeBottomSafeAreaPadding
                testID="FlagForReviewRuleAmountPage"
            >
                <HeaderWithBackButtonAndTitle
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
                            currency={currency}
                            defaultValue={defaultValue}
                            isCurrencyPressable={false}
                        />
                    </View>
                    {!isMerchantRule && (
                        <>
                            <Text style={[styles.textLabelSupporting, styles.mb3, styles.ph5]}>{translate('common.type')}</Text>
                            <SelectionList
                                data={expenseLimitTypes}
                                ListItem={SingleSelectListItem}
                                onSelectRow={(item) => setExpenseLimitType(item.value as PolicyCategoryExpenseLimitType)}
                                shouldSingleExecuteRowSelect
                                alternateNumberOfSupportedLines={4}
                                disableKeyboardShortcuts
                                initiallyFocusedItemKey={selectedExpenseLimitType}
                            />
                        </>
                    )}
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default FlagForReviewRuleAmountPageBase;
