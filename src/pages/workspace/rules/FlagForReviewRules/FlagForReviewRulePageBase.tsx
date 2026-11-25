import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Header from '@components/Header';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import CategoryFlagLimitsLoadError from '@components/Rule/CategoryFlagLimitsLoadError';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import useCategoryFlagLimits from '@hooks/useCategoryFlagLimits';
import useCategoryRuleCreateBackPath from '@hooks/useCategoryRuleCreateBackPath';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLoadPolicyCategories from '@hooks/useLoadPolicyCategories';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useReviewWorkspaceSettingsTaskCompletion from '@hooks/useReviewWorkspaceSettingsTaskCompletion';
import useThemeStyles from '@hooks/useThemeStyles';

import Tab from '@libs/actions/Tab';
import {clearDraftFlagForReviewRule, setDraftFlagForReviewRule} from '@libs/actions/User';
import {getDecodedCategoryName} from '@libs/CategoryUtils';
import {convertToBackendAmount} from '@libs/CurrencyUtils';
import {
    deleteFlagForReviewRule,
    getCategoryFlagLimit,
    getFlagForReviewFormFromLimit,
    getFlagForReviewRuleAmountError,
    hasFlagForReviewRuleForLegacyWrite,
    qualifyCategoryFlagRulePath,
    saveFlagForReviewRule,
} from '@libs/FlagForReviewRulesUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import DescribeRuleButton from '@pages/workspace/rules/DescribeRuleButton';
import useRuleDeleteHeaderProps from '@pages/workspace/rules/useRuleDeleteHeaderProps';

import {callIfAuthenticated} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES, getFlagForReviewRuleAmountRoute, getFlagForReviewRuleCategoryRoute, getWorkspaceCategorySettingsRoute} from '@src/ROUTES';
import type {FlagForReviewRuleForm} from '@src/types/form/FlagForReviewRuleForm';
import INPUT_IDS from '@src/types/form/FlagForReviewRuleForm';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import {authTokenTypeSelector} from '@selectors/Session';
import React, {useEffect, useRef, useState} from 'react';
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
    categoryName: editCategoryName,
    initialCategoryName,
    isCategoryLocked: isCategoryLockedProp,
    isCategoryScopedFlow = false,
    testID,
}: FlagForReviewRulePageBaseProps) {
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policy = usePolicy(policyID);
    const getReviewWorkspaceSettingsTaskCompletion = useReviewWorkspaceSettingsTaskCompletion();
    const {convertToDisplayString, getCurrencyDecimals} = useCurrencyListActions();
    const {canWrite: canWriteRules} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.RULES);
    const icons = useMemoizedLazyExpensifyIcons(['Folder', 'CoinsButton']);
    const categorySettingsBackPath = useCategoryRuleCreateBackPath(DYNAMIC_ROUTES.WORKSPACE_CATEGORY_RULES_FLAG_FOR_REVIEW_NEW.path);
    const policyCurrency = policy?.outputCurrency ?? CONST.CURRENCY.USD;

    const [form] = useOnyx(ONYXKEYS.FORMS.FLAG_FOR_REVIEW_RULE_FORM);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const scopedCategoryName = editCategoryName ?? initialCategoryName;
    const category = scopedCategoryName ? policyCategories?.[scopedCategoryName] : undefined;
    const shouldLoadPolicyCategories = !!policy?.areCategoriesEnabled && (!policyCategories || (!!scopedCategoryName && !category));
    // A category read can fail without clearing its loading flag, so only wait on GetRules here.
    useLoadPolicyCategories(shouldLoadPolicyCategories ? policyID : undefined);
    const {categoryFlagLimits, areCategoryFlagLimitsLoading} = useCategoryFlagLimits(policyID);
    const [shouldShowError, setShouldShowError] = useState(false);
    const initializedDraftForRuleKeyRef = useRef<string | null>(null);
    const hasDraft = !isEmptyObject(form);

    const flagLimit = getCategoryFlagLimit(category, categoryFlagLimits, policyCurrency);
    // Category-scoped Create opens the existing rule because the legacy API stores one limit per category.
    const categoryName = editCategoryName ?? (flagLimit ? initialCategoryName : undefined);
    const isEditing = !!categoryName;
    const isCategoryLocked = isCategoryLockedProp ?? !!initialCategoryName;
    // The legacy write has no currency parameter, so it cannot save a cap in another currency.
    const hasCurrencyMismatch = !!flagLimit && flagLimit.currency !== policyCurrency;
    const isRuleBeingDeleted = category?.pendingFields?.maxExpenseAmount === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    const canSaveRule = canWriteRules && !hasCurrencyMismatch && !isRuleBeingDeleted && !!policyCategories;
    const canEditCategory = canSaveRule && !isCategoryLocked;
    const shouldShowDescribeRule = !isEditing && !isCategoryLocked;
    const selectedCategoryName = form?.[INPUT_IDS.CATEGORY];
    const categoryDisplayName = selectedCategoryName ? getDecodedCategoryName(selectedCategoryName) : undefined;

    const draftMaxExpenseAmount = form?.[INPUT_IDS.MAX_EXPENSE_AMOUNT];
    const parsedMaxAmount = Number.parseFloat(draftMaxExpenseAmount ?? '');
    const maxAmountMenuTitle = Number.isFinite(parsedMaxAmount) ? convertToDisplayString(convertToBackendAmount(parsedMaxAmount), flagLimit?.currency ?? policyCurrency) : '';
    const isDailyLimit = form?.[INPUT_IDS.EXPENSE_LIMIT_TYPE] === CONST.POLICY.EXPENSE_LIMIT_TYPES.DAILY;
    const dailyLimitDescription = isDailyLimit ? translate('workspace.rules.categoryRules.expenseLimitTypes.dailySubtitle') : undefined;

    useEffect(() => () => clearDraftFlagForReviewRule(), []);

    useEffect(() => {
        if (scopedCategoryName && !flagLimit && areCategoryFlagLimitsLoading) {
            return;
        }
        if (!categoryName) {
            if (initializedDraftForRuleKeyRef.current !== ROUTES.NEW) {
                initializedDraftForRuleKeyRef.current = ROUTES.NEW;
                if (!hasDraft) {
                    setDraftFlagForReviewRule(initialCategoryName ? {[INPUT_IDS.CATEGORY]: initialCategoryName} : {});
                }
            }
            return;
        }

        if (!flagLimit) {
            return;
        }

        if (initializedDraftForRuleKeyRef.current === categoryName) {
            return;
        }

        // A draft already holding this rule's amount is an in-progress edit, not the initial category seed.
        if (selectedCategoryName === categoryName && draftMaxExpenseAmount !== undefined) {
            initializedDraftForRuleKeyRef.current = categoryName;
            return;
        }

        initializedDraftForRuleKeyRef.current = categoryName;
        setDraftFlagForReviewRule(getFlagForReviewFormFromLimit(categoryName, flagLimit, getCurrencyDecimals));
    }, [areCategoryFlagLimitsLoading, categoryName, draftMaxExpenseAmount, flagLimit, getCurrencyDecimals, hasDraft, initialCategoryName, scopedCategoryName, selectedCategoryName]);
    const errorMessage =
        selectedCategoryName && selectedCategoryName !== categoryName && hasFlagForReviewRuleForLegacyWrite(policyCategories?.[selectedCategoryName], categoryFlagLimits)
            ? translate('workspace.rules.newRule.promptErrors.categoryHasRule')
            : getValidationError(form, translate);

    const handleSave = () => {
        if (!form) {
            return;
        }

        saveFlagForReviewRule(policyID, policyCategories, form, categoryName, getReviewWorkspaceSettingsTaskCompletion());

        // initialCategoryName is also set when the create screen is editing a category's existing rule, and in that
        // case going back one step would land on the New rule hub instead of the category we came from.
        if (!isEditing || !!initialCategoryName) {
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
        if (!canSaveRule) {
            return;
        }

        if (errorMessage) {
            setShouldShowError(true);
            return;
        }

        handleSave();
    };

    const navigateToAmount = () => {
        if (!isCategoryScopedFlow) {
            Navigation.navigate(getFlagForReviewRuleAmountRoute(policyID, categoryName, isCategoryLocked));
            return;
        }

        const path = qualifyCategoryFlagRulePath(policyID, Navigation.getActiveRoute());
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_CATEGORY_RULES_FLAG_FOR_REVIEW_AMOUNT.path, path));
    };

    const {deleteIconButtonProps} = useRuleDeleteHeaderProps({
        canDelete: canWriteRules && isEditing && !!flagLimit && !isRuleBeingDeleted,
        onDelete: () => {
            deleteFlagForReviewRule(policyID, categoryName ?? '', policyCategories, getReviewWorkspaceSettingsTaskCompletion());
            return true;
        },
        sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.RULES.FLAG_FOR_REVIEW_RULE_DELETE,
        // Category settings opens this rule itself, so going back a screen would land on the New rule hub the user
        // never passed through. Same route the save path picks, for the same reason.
        backTo: initialCategoryName ? (categorySettingsBackPath ?? getWorkspaceCategorySettingsRoute(policyID, initialCategoryName)) : undefined,
    });

    if (scopedCategoryName && !flagLimit && areCategoryFlagLimitsLoading) {
        return <FullScreenLoadingIndicator shouldUseGoBackButton />;
    }

    if (shouldLoadPolicyCategories || (!flagLimit && (isEditing || hasFlagForReviewRuleForLegacyWrite(category, categoryFlagLimits)))) {
        return (
            <ScreenWrapper
                testID={testID}
                includeSafeAreaPaddingBottom
            >
                <HeaderWithBackButtonAndTitle title={translate('workspace.rules.flagForReviewRule.title')} />
                <CategoryFlagLimitsLoadError missingCategoriesPolicyID={shouldLoadPolicyCategories ? policyID : undefined} />
            </ScreenWrapper>
        );
    }

    if (!isEditing && !!policy && !canWriteRules) {
        return <NotFoundPage />;
    }

    const footer = canSaveRule ? (
        <FormAlertWithSubmitButton
            buttonText={translate('workspace.rules.flagForReviewRule.saveRule')}
            containerStyles={[styles.m4, styles.mb5, styles.mh5]}
            isAlertVisible={shouldShowError && !!errorMessage}
            message={errorMessage}
            onSubmit={handleSubmit}
            shouldShowLoadingImmediatelyOnPress={false}
            enabledWhenOffline
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.FLAG_FOR_REVIEW_RULE_SAVE}
            buttonStyles={styles.flex1}
            buttonAndFooterContainerStyles={[styles.flexRow, styles.gap2]}
            shouldRenderFooterAboveSubmit
            footerContent={
                shouldShowDescribeRule && (
                    <DescribeRuleButton
                        policyID={policyID}
                        ruleType={CONST.GENERATED_RULE.RULE_TYPE.FLAG_FOR_REVIEW}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.FLAG_FOR_REVIEW_RULE_DESCRIBE}
                        onRuleGenerated={setDraftFlagForReviewRule}
                        isCategoryEligible={(generatedCategory) => !hasFlagForReviewRuleForLegacyWrite(generatedCategory, categoryFlagLimits)}
                    />
                )
            }
        />
    ) : null;

    const categoryError = canEditCategory && shouldShowError && !form?.[INPUT_IDS.CATEGORY] ? translate('common.error.fieldRequired') : '';
    const amountError = canWriteRules && shouldShowError ? getFlagForReviewRuleAmountError(form?.[INPUT_IDS.MAX_EXPENSE_AMOUNT], translate) : '';

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyFeature={CONST.POLICY.POLICY_FEATURE.RULES}
        >
            <ScreenWrapper
                testID={testID}
                offlineIndicatorStyle={styles.mtAuto}
                includeSafeAreaPaddingBottom
            >
                <HeaderWithBackButtonAndTitle title={translate('workspace.rules.flagForReviewRule.title')}>
                    {!!deleteIconButtonProps && <Header.IconButton {...deleteIconButtonProps} />}
                </HeaderWithBackButtonAndTitle>
                <ScrollView contentContainerStyle={[styles.flexGrow1]}>
                    <View style={[styles.ph5, styles.pv3, styles.gap6]}>
                        <Text style={[styles.textNormal, styles.textSupporting]}>{translate('workspace.rules.flagForReviewRule.subtitle')}</Text>
                        <Text style={[styles.textLabel, styles.textStrong, styles.lh16]}>{translate('workspace.rules.merchantRules.ifAnyExpenseMatches')}</Text>
                    </View>
                    <MenuItem.Root
                        onPress={canEditCategory ? callIfAuthenticated(() => Navigation.navigate(getFlagForReviewRuleCategoryRoute(policyID, categoryName)), session) : undefined}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.FLAG_FOR_REVIEW_RULE_CATEGORY}
                    >
                        <MenuItem.Row>
                            <MenuItem.Leading>
                                <MenuItem.IconNarrow src={icons.Folder} />
                            </MenuItem.Leading>
                            <MenuItemField.Content name={translate('common.category')}>
                                {!!categoryDisplayName && <MenuItem.FieldValue>{categoryDisplayName}</MenuItem.FieldValue>}
                            </MenuItemField.Content>
                            {canEditCategory && (
                                <MenuItem.Trailing>
                                    <MenuItem.Chevron />
                                </MenuItem.Trailing>
                            )}
                        </MenuItem.Row>
                        {!!categoryError && (
                            <MenuItem.HelpText
                                isError
                                message={categoryError}
                            />
                        )}
                    </MenuItem.Root>
                    <MenuItem.Root
                        onPress={canSaveRule ? callIfAuthenticated(navigateToAmount, session) : undefined}
                        accessibilityLabel={dailyLimitDescription ? `${translate('iou.amount')}, ${maxAmountMenuTitle}. ${dailyLimitDescription}` : undefined}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.FLAG_FOR_REVIEW_RULE_AMOUNT}
                    >
                        <MenuItem.Row>
                            <MenuItem.Leading>
                                <MenuItem.IconNarrow src={icons.CoinsButton} />
                            </MenuItem.Leading>
                            <MenuItemField.Content name={translate('iou.amount')}>
                                {!!maxAmountMenuTitle && <MenuItem.FieldValue>{translate('workspace.rules.spendRules.maxAmountAbove', {amount: maxAmountMenuTitle})}</MenuItem.FieldValue>}
                            </MenuItemField.Content>
                            {canSaveRule && (
                                <MenuItem.Trailing>
                                    <MenuItem.Chevron />
                                </MenuItem.Trailing>
                            )}
                        </MenuItem.Row>
                        {!!dailyLimitDescription && <MenuItem.HelpText message={dailyLimitDescription} />}
                        {!!amountError && (
                            <MenuItem.HelpText
                                isError
                                message={amountError}
                            />
                        )}
                    </MenuItem.Root>
                    <View style={[styles.sectionDividerLine, styles.mh5, styles.mv3]} />
                    <Text style={[styles.textLabel, styles.textStrong, styles.lh16, styles.ph5, styles.pv3]}>{translate('workspace.rules.flagForReviewRule.thenDoTheFollowing')}</Text>
                    <MenuItem.Root accessibilityLabel={`${translate('workspace.rules.flagForReviewRule.flagType')}, ${translate('workspace.rules.flagForReviewRule.flagTypeWarning')}`}>
                        <MenuItem.Row>
                            <MenuItemField.Content name={translate('workspace.rules.flagForReviewRule.flagType')}>
                                <MenuItem.FieldValue>{translate('workspace.rules.flagForReviewRule.flagTypeWarning')}</MenuItem.FieldValue>
                                <MenuItem.Description>{translate('workspace.rules.flagForReviewRule.flagTypeWarningDescription')}</MenuItem.Description>
                            </MenuItemField.Content>
                        </MenuItem.Row>
                    </MenuItem.Root>
                </ScrollView>
                {footer}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default FlagForReviewRulePageBase;
