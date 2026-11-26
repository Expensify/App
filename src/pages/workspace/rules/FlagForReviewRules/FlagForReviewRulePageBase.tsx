import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Header from '@components/Header';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import Picker from '@components/Picker';
import CategoryFlagLimitsLoadError from '@components/Rule/CategoryFlagLimitsLoadError';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import useCategoryFlagLimits from '@hooks/useCategoryFlagLimits';
import useCategoryRuleCreateBackPath from '@hooks/useCategoryRuleCreateBackPath';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLoadPolicyCategories from '@hooks/useLoadPolicyCategories';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnboardingTaskInformation from '@hooks/useOnboardingTaskInformation';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useThemeStyles from '@hooks/useThemeStyles';

import {deleteRule, setRule} from '@libs/actions/Policy/Rules';
import Tab from '@libs/actions/Tab';
import {completeReviewWorkspaceSettingsTask} from '@libs/actions/Task';
import {clearDraftFlagForReviewRule, setDraftFlagForReviewRule, updateDraftFlagForReviewRule} from '@libs/actions/User';
import {getDecodedCategoryName} from '@libs/CategoryUtils';
import {convertToBackendAmount} from '@libs/CurrencyUtils';
import {
    buildFlagForReviewRule,
    canMatchFlagRuleCategory,
    getCategoryFlagLimit,
    getDescribedFlagForReviewDraft,
    getFlagForReviewConditions,
    getFlagForReviewDraft,
    getFlagForReviewDraftKey,
    getFlagForReviewRuleAmountError,
    getFlagForReviewRulePriority,
    getFlagRuleCategory,
    qualifyCategoryFlagRulePath,
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
import INPUT_IDS from '@src/types/form/FlagForReviewRuleForm';
import type IconAsset from '@src/types/utils/IconAsset';

import {authTokenTypeSelector} from '@selectors/Session';
import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

type FlagForReviewRulePageBaseProps = {
    policyID: string;
    ruleID?: string;
    categoryName?: string;
    /** Pre-scopes the category when creating a rule (e.g. from the category details RHP). */
    initialCategoryName?: string;
    /** When true, the category field is non-interactive (category-scoped create/edit). */
    isCategoryLocked?: boolean;
    /** When true, nested create pages use category dynamic routes (keeps Categories underlay). */
    isCategoryScopedFlow?: boolean;
    testID: string;
};

const LEGACY_ENFORCEMENT = 'legacy';
const {WARNING, BLOCK} = CONST.RULES.FLAG_FOR_REVIEW.ENFORCEMENT;

type FlagCategoryFieldProps = {
    categoryName?: string;
    icon: IconAsset;
    onPress?: () => void;
};

function FlagCategoryField({categoryName, icon, onPress}: FlagCategoryFieldProps) {
    const {translate} = useLocalize();
    const displayName = getDecodedCategoryName(categoryName ?? '');

    return (
        <MenuItem.Root
            onPress={onPress}
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.FLAG_FOR_REVIEW_RULE_CATEGORY}
        >
            <MenuItem.Row>
                <MenuItem.Leading>
                    <MenuItem.IconNarrow src={icon} />
                </MenuItem.Leading>
                <MenuItemField.Content name={translate('common.category')}>{!!displayName && <MenuItem.FieldValue>{displayName}</MenuItem.FieldValue>}</MenuItemField.Content>
                {!!onPress && (
                    <MenuItem.Trailing>
                        <MenuItem.Chevron />
                    </MenuItem.Trailing>
                )}
            </MenuItem.Row>
        </MenuItem.Root>
    );
}

function FlagForReviewRulePageBase({
    policyID,
    ruleID: editRuleID,
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
    const {accountID} = useCurrentUserPersonalDetails();
    const taskInformation = useOnboardingTaskInformation(CONST.ONBOARDING_TASK_TYPE.REVIEW_WORKSPACE_SETTINGS);
    const {convertToDisplayString, getCurrencyDecimals} = useCurrencyListActions();
    const {canWrite: canWriteRules} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.RULES);
    const icons = useMemoizedLazyExpensifyIcons(['Basket', 'Folder', 'CoinsButton']);
    const {isOffline} = useNetwork();
    const categorySettingsBackPath = useCategoryRuleCreateBackPath(DYNAMIC_ROUTES.WORKSPACE_CATEGORY_RULES_FLAG_FOR_REVIEW_NEW.path);
    const policyCurrency = policy?.outputCurrency ?? CONST.CURRENCY.USD;

    const [storedDraft] = useOnyx(ONYXKEYS.FORMS.FLAG_FOR_REVIEW_RULE_FORM);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const scopedCategoryName = editCategoryName ?? initialCategoryName;
    const category = scopedCategoryName
        ? (policyCategories?.[scopedCategoryName] ?? Object.values(policyCategories ?? {}).find((entry) => entry.previousCategoryName === scopedCategoryName))
        : undefined;
    const shouldLoadPolicyCategories = !!policy?.areCategoriesEnabled && (!policyCategories || (!!scopedCategoryName && !category));
    // A category read can fail without clearing its loading flag, so only wait on GetRules here.
    useLoadPolicyCategories(shouldLoadPolicyCategories ? policyID : undefined);
    const {categoryFlagLimits, areCategoryFlagLimitsLoading, haveCategoryFlagLimitsLoaded} = useCategoryFlagLimits(policyID);
    const scopedLimit = getCategoryFlagLimit(category, categoryFlagLimits);
    const ruleID = editRuleID ?? scopedLimit?.ruleID;
    const draftKey = getFlagForReviewDraftKey(policyID, ruleID, initialCategoryName);
    const form = storedDraft?.draftKey === draftKey ? storedDraft : undefined;
    const [rule] = useOnyx(`${ONYXKEYS.COLLECTION.RULE}${ruleID}`);
    const existingRule = rule?.scope === CONST.RULES.SCOPE.POLICY && rule.scopeID === policyID ? rule : undefined;
    const conditions = getFlagForReviewConditions(existingRule);
    const [shouldShowError, setShouldShowError] = useState(false);
    const initializedDraftForRuleKeyRef = useRef<string | null>(null);

    const isEditing = !!ruleID || !!editCategoryName;
    const isCategoryLocked = isCategoryLockedProp ?? !!initialCategoryName;
    const currency = conditions?.limit?.currency ?? policyCurrency;
    const isRuleWritePending = !!existingRule?.pendingAction && !existingRule.errors;
    const canSaveRule = canWriteRules && !isRuleWritePending && (!conditions?.categoryName || !!policyCategories);
    const canEditCategory = canSaveRule && !isCategoryLocked && !!policy?.areCategoriesEnabled;
    const shouldShowDescribeRule = !isEditing && !isCategoryLocked;
    const originalCategoryName = (ruleID && getFlagRuleCategory(policyCategories, conditions?.categoryName, ruleID)?.name) || conditions?.categoryName || category?.name;
    const selectedCategoryName = isCategoryLocked ? originalCategoryName : (form?.[INPUT_IDS.CATEGORY] ?? originalCategoryName);
    const merchant = form?.[INPUT_IDS.MERCHANT]?.trim();
    const enforcement = form?.enforcement ?? conditions?.enforcement ?? (isEditing ? LEGACY_ENFORCEMENT : WARNING);

    const draftMaxExpenseAmount = form?.[INPUT_IDS.MAX_EXPENSE_AMOUNT];
    const maxAmountMenuTitle = draftMaxExpenseAmount ? convertToDisplayString(convertToBackendAmount(Number(draftMaxExpenseAmount)), currency) : '';
    const expenseLimitType = form?.[INPUT_IDS.EXPENSE_LIMIT_TYPE];
    const isDailyLimit = expenseLimitType === CONST.POLICY.EXPENSE_LIMIT_TYPES.DAILY;
    const dailyLimitDescription = isDailyLimit ? translate('workspace.rules.categoryRules.expenseLimitTypes.dailySubtitle') : undefined;

    useEffect(() => () => clearDraftFlagForReviewRule(), []);

    useEffect(() => {
        if ((scopedCategoryName && (!category || areCategoryFlagLimitsLoading)) || (isEditing && (!ruleID || !conditions))) {
            return;
        }
        if (initializedDraftForRuleKeyRef.current === draftKey) {
            return;
        }

        const seededDraft = conditions ? getFlagForReviewDraft({...conditions, categoryName: originalCategoryName}, getCurrencyDecimals) : {[INPUT_IDS.CATEGORY]: originalCategoryName};
        // A direct link to a subpage can return an edited field before this screen has mounted.
        setDraftFlagForReviewRule({...seededDraft, ...form, draftKey});
        initializedDraftForRuleKeyRef.current = draftKey;
    }, [areCategoryFlagLimitsLoading, category, conditions, draftKey, form, getCurrencyDecimals, isEditing, originalCategoryName, ruleID, scopedCategoryName]);

    const selectedCategory = selectedCategoryName ? policyCategories?.[selectedCategoryName] : undefined;
    const otherCategoryLimit = getCategoryFlagLimit(selectedCategory, categoryFlagLimits);
    const amountError = !merchant || draftMaxExpenseAmount ? getFlagForReviewRuleAmountError(draftMaxExpenseAmount, translate, expenseLimitType) : undefined;
    let errorMessage: string | undefined;
    if (!merchant && !selectedCategoryName) {
        errorMessage = translate('workspace.rules.flagForReviewRule.confirmErrorCategory');
    } else if (selectedCategoryName && !canMatchFlagRuleCategory(selectedCategory)) {
        errorMessage = translate('common.genericErrorMessage');
    } else if (!merchant && !haveCategoryFlagLimitsLoaded && (!existingRule || !!conditions?.merchant || selectedCategoryName !== originalCategoryName)) {
        errorMessage = translate('common.genericErrorMessage');
    } else if (!merchant && otherCategoryLimit && otherCategoryLimit.ruleID !== ruleID) {
        errorMessage = translate('workspace.rules.newRule.promptErrors.categoryHasRule');
    } else {
        errorMessage = amountError;
    }

    const saveRule = () => {
        if (!canSaveRule || !form) {
            return;
        }
        const ruleBody = buildFlagForReviewRule({...form, category: selectedCategoryName}, currency, enforcement === LEGACY_ENFORCEMENT ? undefined : enforcement);
        if (errorMessage || !ruleBody) {
            setShouldShowError(true);
            return;
        }
        setRule(policyID, ruleBody, getFlagForReviewRulePriority(ruleID, policyCategories), ruleID, existingRule);
        completeReviewWorkspaceSettingsTask(taskInformation, accountID);

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

    const navigateToAmount = () => {
        if (!isCategoryScopedFlow) {
            Navigation.navigate(getFlagForReviewRuleAmountRoute(policyID, editRuleID, isCategoryLocked, initialCategoryName));
            return;
        }

        const path = qualifyCategoryFlagRulePath(policyID, Navigation.getActiveRoute());
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_CATEGORY_RULES_FLAG_FOR_REVIEW_AMOUNT.path, path));
    };

    const {deleteIconButtonProps} = useRuleDeleteHeaderProps({
        canDelete: canSaveRule && !!existingRule,
        onDelete: () => {
            if (!ruleID || !existingRule) {
                return false;
            }
            deleteRule(ruleID, existingRule);
            if (existingRule.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
                completeReviewWorkspaceSettingsTask(taskInformation, accountID);
            }
            return true;
        },
        sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.RULES.FLAG_FOR_REVIEW_RULE_DELETE,
        // Category settings opens this rule itself, so going back a screen would land on the New rule hub the user
        // never passed through. Same route the save path picks, for the same reason.
        backTo: initialCategoryName ? (categorySettingsBackPath ?? getWorkspaceCategorySettingsRoute(policyID, initialCategoryName)) : undefined,
    });

    if (!conditions && areCategoryFlagLimitsLoading) {
        return <FullScreenLoadingIndicator shouldUseGoBackButton />;
    }

    if (((scopedCategoryName || conditions?.categoryName) && shouldLoadPolicyCategories) || (!conditions && !haveCategoryFlagLimitsLoaded && (!isOffline || isEditing))) {
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

    if ((isEditing && !conditions) || (!isEditing && !!policy && !canWriteRules)) {
        return <NotFoundPage />;
    }

    const footer = canSaveRule ? (
        <FormAlertWithSubmitButton
            buttonText={translate('workspace.rules.flagForReviewRule.saveRule')}
            containerStyles={[styles.m4, styles.mb5, styles.mh5]}
            isAlertVisible={shouldShowError && !!errorMessage}
            message={errorMessage ?? ''}
            onSubmit={saveRule}
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
                        onRuleGenerated={(values) => setDraftFlagForReviewRule(getDescribedFlagForReviewDraft(policyID, values))}
                        isCategoryEligible={(generatedCategory) => !getCategoryFlagLimit(generatedCategory, categoryFlagLimits)}
                    />
                )
            }
        />
    ) : null;

    const flagTypeItems = [
        {label: translate('workspace.rules.flagForReviewRule.flagTypeWarning'), value: WARNING},
        {label: translate('workspace.rules.spendRules.block'), value: BLOCK},
    ];
    const legacyFlagType = {label: translate('common.default'), value: LEGACY_ENFORCEMENT} as const;

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
                    {!isCategoryLocked && !isDailyLimit && (
                        <MenuItem.Root
                            onPress={
                                canSaveRule ? callIfAuthenticated(() => Navigation.navigate(ROUTES.RULES_FLAG_FOR_REVIEW_RULE_MERCHANT.getRoute(policyID, editRuleID)), session) : undefined
                            }
                            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.FLAG_FOR_REVIEW_RULE_MERCHANT}
                        >
                            <MenuItem.Row>
                                <MenuItem.Leading>
                                    <MenuItem.IconNarrow src={icons.Basket} />
                                </MenuItem.Leading>
                                <MenuItemField.Content name={translate('common.merchant')}>{!!merchant && <MenuItem.FieldValue>{merchant}</MenuItem.FieldValue>}</MenuItemField.Content>
                                {canSaveRule && (
                                    <MenuItem.Trailing>
                                        <MenuItem.Chevron />
                                    </MenuItem.Trailing>
                                )}
                            </MenuItem.Row>
                        </MenuItem.Root>
                    )}
                    <FlagCategoryField
                        categoryName={selectedCategoryName}
                        icon={icons.Folder}
                        onPress={canEditCategory ? callIfAuthenticated(() => Navigation.navigate(getFlagForReviewRuleCategoryRoute(policyID, editRuleID)), session) : undefined}
                    />
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
                        {canSaveRule && shouldShowError && !!amountError && (
                            <MenuItem.HelpText
                                isError
                                message={amountError}
                            />
                        )}
                    </MenuItem.Root>
                    <View style={[styles.sectionDividerLine, styles.mh5, styles.mv3]} />
                    <Text style={[styles.textLabel, styles.textStrong, styles.lh16, styles.ph5, styles.pv3]}>{translate('workspace.rules.flagForReviewRule.thenDoTheFollowing')}</Text>
                    <Picker
                        label={translate('workspace.rules.flagForReviewRule.flagType')}
                        containerStyles={styles.mh5}
                        value={enforcement}
                        items={conditions && !conditions.enforcement ? [legacyFlagType, ...flagTypeItems] : flagTypeItems}
                        isDisabled={!canSaveRule}
                        shouldShowOnlyTextWhenDisabled={false}
                        onInputChange={(value) => {
                            if (enforcement === value || (value !== WARNING && value !== BLOCK && value !== LEGACY_ENFORCEMENT)) {
                                return;
                            }
                            updateDraftFlagForReviewRule({enforcement: value});
                        }}
                        hintText={enforcement === WARNING ? translate('workspace.rules.flagForReviewRule.flagTypeWarningDescription') : undefined}
                    />
                </ScrollView>
                {footer}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default FlagForReviewRulePageBase;
