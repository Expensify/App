import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import useCategoryRuleCreateBackPath from '@hooks/useCategoryRuleCreateBackPath';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicyData from '@hooks/usePolicyData';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useThemeStyles from '@hooks/useThemeStyles';

import {openPolicyCategoriesPage} from '@libs/actions/Policy/Category';
import Tab from '@libs/actions/Tab';
import {clearDraftFlagForReviewRule, setDraftFlagForReviewRule} from '@libs/actions/User';
import {getDecodedCategoryName} from '@libs/CategoryUtils';
import {convertToBackendAmount} from '@libs/CurrencyUtils';
import {getFlagForReviewFormFromCategory, getFlagForReviewRuleAmountError, saveFlagForReviewRule} from '@libs/FlagForReviewRulesUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES, getFlagForReviewRuleAmountRoute, getFlagForReviewRuleCategoryRoute, getWorkspaceCategorySettingsRoute} from '@src/ROUTES';
import type {FlagForReviewRuleForm} from '@src/types/form/FlagForReviewRuleForm';
import INPUT_IDS from '@src/types/form/FlagForReviewRuleForm';

import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

type FlagForReviewRulePageBaseProps = {
    policyID: string;
    categoryName?: string;
    /** Pre-scopes the category when creating a rule (e.g. from the category details RHP). */
    initialCategoryName?: string;
    /** When true, the category field is non-interactive (category-scoped create/edit). */
    isCategoryLocked?: boolean;
    /** When true, nested create pages use category dynamic routes (keeps Categories underlay). */
    isCategoryScopedFlow?: boolean;
    testID: string;
};

function getValidationError(form: FlagForReviewRuleForm | null | undefined, translate: ReturnType<typeof useLocalize>['translate']): string {
    if (!form?.[INPUT_IDS.CATEGORY]) {
        return translate('workspace.rules.flagForReviewRule.confirmErrorCategory');
    }

    return getFlagForReviewRuleAmountError(form[INPUT_IDS.MAX_EXPENSE_AMOUNT], translate) ?? '';
}

function FlagForReviewRulePageBase({
    policyID,
    categoryName,
    initialCategoryName,
    isCategoryLocked: isCategoryLockedProp,
    isCategoryScopedFlow = false,
    testID,
}: FlagForReviewRulePageBaseProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyData = usePolicyData(policyID);
    const {policy} = policyData;
    const {convertToDisplayString, getCurrencyDecimals} = useCurrencyListActions();
    const {canWrite: canWriteRules} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.RULES);
    const {isBetaEnabled} = usePermissions();
    const isRulesRevampEnabled = isBetaEnabled(CONST.BETAS.RULES_REVAMP);
    const icons = useMemoizedLazyExpensifyIcons(['Folder', 'CoinsButton']);
    const isEditing = !!categoryName;
    const isCategoryLocked = isCategoryLockedProp ?? !!initialCategoryName;
    const canEditCategory = canWriteRules && !isCategoryLocked;
    const categorySettingsBackPath = useCategoryRuleCreateBackPath(DYNAMIC_ROUTES.WORKSPACE_CATEGORY_RULES_FLAG_FOR_REVIEW_NEW.path);
    const policyCurrency = policy?.outputCurrency ?? CONST.CURRENCY.USD;

    const [form] = useOnyx(ONYXKEYS.FORMS.FLAG_FOR_REVIEW_RULE_FORM);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const [shouldShowError, setShouldShowError] = useState(false);
    const initializedDraftForRuleKeyRef = useRef<string | null>(null);

    const category = categoryName ? policyCategories?.[categoryName] : undefined;
    const selectedCategoryName = form?.[INPUT_IDS.CATEGORY];
    const categoryDisplayName = selectedCategoryName ? getDecodedCategoryName(selectedCategoryName) : undefined;

    const draftMaxExpenseAmount = form?.[INPUT_IDS.MAX_EXPENSE_AMOUNT];
    const parsedMaxAmount = Number.parseFloat(form?.[INPUT_IDS.MAX_EXPENSE_AMOUNT] ?? '');
    const maxAmountMenuTitle = Number.isFinite(parsedMaxAmount) ? convertToDisplayString(convertToBackendAmount(parsedMaxAmount), policyCurrency) : '';

    useEffect(() => () => clearDraftFlagForReviewRule(), []);

    useEffect(() => {
        if (!isEditing) {
            if (initializedDraftForRuleKeyRef.current !== ROUTES.NEW) {
                initializedDraftForRuleKeyRef.current = ROUTES.NEW;
                setDraftFlagForReviewRule(initialCategoryName ? {[INPUT_IDS.CATEGORY]: initialCategoryName} : {});
            }
            return;
        }

        if (!category || !categoryName) {
            return;
        }

        if (initializedDraftForRuleKeyRef.current === categoryName) {
            return;
        }

        // A draft holding the category *and* an amount is either already seeded or the user's in-progress edit, so
        // leave it alone. A draft with only the category came from the create flow's initial seed, which is what
        // happens when this page opens before policyCategories has loaded: the rule is only recognized once the
        // category arrives, and the amount still has to be seeded then.
        if (selectedCategoryName === categoryName && draftMaxExpenseAmount !== undefined) {
            initializedDraftForRuleKeyRef.current = categoryName;
            return;
        }

        initializedDraftForRuleKeyRef.current = categoryName;
        setDraftFlagForReviewRule(getFlagForReviewFormFromCategory(category, getCurrencyDecimals, policyCurrency));
    }, [category, categoryName, draftMaxExpenseAmount, getCurrencyDecimals, initialCategoryName, isEditing, policyCurrency, selectedCategoryName]);
    const fetchPolicyData = useCallback(() => {
        if (!policy?.areCategoriesEnabled || policyCategories) {
            return;
        }
        openPolicyCategoriesPage(policyID);
    }, [policyID, policy?.areCategoriesEnabled, policyCategories]);

    useNetwork({onReconnect: fetchPolicyData});

    useFocusEffect(
        useCallback(() => {
            fetchPolicyData();
        }, [fetchPolicyData]),
    );

    const errorMessage = getValidationError(form, translate);

    const handleSave = () => {
        if (!form) {
            return;
        }

        saveFlagForReviewRule(policyID, policyData.categories, form, isEditing ? categoryName : undefined);

        // initialCategoryName is also set when the create screen is editing a category's existing rule, and in that
        // case going back one step would land on the New rule hub instead of the category we came from.
        if ((!isEditing || !!initialCategoryName) && isRulesRevampEnabled) {
            const savedCategoryName = form[INPUT_IDS.CATEGORY] ?? initialCategoryName;
            if (initialCategoryName && savedCategoryName) {
                Navigation.goBack(categorySettingsBackPath ?? getWorkspaceCategorySettingsRoute(policyID, savedCategoryName));
                return;
            }

            Tab.setSelectedTab(CONST.TAB.RULES_TAB_TYPE, CONST.TAB.RULES.FLAG_FOR_REVIEW);
            Navigation.goBack(ROUTES.WORKSPACE_RULES.getRoute(policyID));
            return;
        }

        Navigation.goBack();
    };

    const handleSubmit = () => {
        if (!canWriteRules) {
            return;
        }

        if (errorMessage) {
            setShouldShowError(true);
            return;
        }

        handleSave();
    };

    if (isEditing && categoryName && !category) {
        return <NotFoundPage />;
    }

    if (!isEditing && !!policy && !canWriteRules) {
        return <NotFoundPage />;
    }

    const footer = canWriteRules ? (
        <FormAlertWithSubmitButton
            buttonText={translate('workspace.rules.flagForReviewRule.saveRule')}
            containerStyles={[styles.m4, styles.mb5, styles.mh5]}
            isAlertVisible={shouldShowError && !!errorMessage}
            message={errorMessage}
            onSubmit={handleSubmit}
            enabledWhenOffline
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.FLAG_FOR_REVIEW_RULE_SAVE}
        />
    ) : null;

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyFeature={CONST.POLICY.POLICY_FEATURE.RULES}
            shouldBeBlocked={!isRulesRevampEnabled}
        >
            <ScreenWrapper
                testID={testID}
                offlineIndicatorStyle={styles.mtAuto}
                includeSafeAreaPaddingBottom
            >
                <HeaderWithBackButton title={translate('workspace.rules.flagForReviewRule.title')} />
                <ScrollView contentContainerStyle={[styles.flexGrow1]}>
                    <View style={[styles.ph5, styles.pv3, styles.gap6]}>
                        <Text style={[styles.textNormal, styles.textSupporting]}>{translate('workspace.rules.flagForReviewRule.subtitle')}</Text>
                        <Text style={[styles.textLabel, styles.textStrong, styles.lh16]}>{translate('workspace.rules.merchantRules.ifAnyExpenseMatches')}</Text>
                    </View>
                    <MenuItemWithTopDescription
                        description={translate('common.category')}
                        title={categoryDisplayName}
                        errorText={canEditCategory && shouldShowError && !form?.[INPUT_IDS.CATEGORY] ? translate('common.error.fieldRequired') : ''}
                        onPress={canEditCategory ? () => Navigation.navigate(getFlagForReviewRuleCategoryRoute(policyID, categoryName)) : undefined}
                        shouldShowRightIcon={canEditCategory}
                        interactive={canEditCategory}
                        icon={icons.Folder}
                        iconWidth={variables.iconSizeNormal}
                        iconHeight={variables.iconSizeNormal}
                        shouldIconUseAutoWidthStyle
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.FLAG_FOR_REVIEW_RULE_CATEGORY}
                    />
                    <MenuItemWithTopDescription
                        description={translate('iou.amount')}
                        title={maxAmountMenuTitle ? translate('workspace.rules.spendRules.maxAmountAbove', {amount: maxAmountMenuTitle}) : undefined}
                        errorText={canWriteRules && shouldShowError ? getFlagForReviewRuleAmountError(form?.[INPUT_IDS.MAX_EXPENSE_AMOUNT], translate) : ''}
                        onPress={
                            canWriteRules
                                ? () =>
                                      Navigation.navigate(
                                          isCategoryScopedFlow
                                              ? createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_CATEGORY_RULES_FLAG_FOR_REVIEW_AMOUNT.path)
                                              : getFlagForReviewRuleAmountRoute(policyID, categoryName, isCategoryLocked),
                                      )
                                : undefined
                        }
                        shouldShowRightIcon={canWriteRules}
                        interactive={canWriteRules}
                        icon={icons.CoinsButton}
                        iconWidth={variables.iconSizeNormal}
                        iconHeight={variables.iconSizeNormal}
                        shouldIconUseAutoWidthStyle
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.FLAG_FOR_REVIEW_RULE_AMOUNT}
                    />
                    <View style={[styles.sectionDividerLine, styles.mh5, styles.mv3]} />
                    <Text style={[styles.textLabel, styles.textStrong, styles.lh16, styles.ph5, styles.pv3]}>{translate('workspace.rules.flagForReviewRule.thenDoTheFollowing')}</Text>
                    <MenuItemWithTopDescription
                        description={translate('workspace.rules.flagForReviewRule.flagType')}
                        title={translate('workspace.rules.flagForReviewRule.flagTypeWarning')}
                        furtherDetails={translate('workspace.rules.flagForReviewRule.flagTypeWarningDescription')}
                        interactive={false}
                        shouldShowRightIcon={false}
                    />
                </ScrollView>
                {footer}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default FlagForReviewRulePageBase;
