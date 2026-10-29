import Button from '@components/Button';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Header from '@components/Header';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Switch from '@components/Switch';
import Text from '@components/Text';
import TextLink from '@components/TextLink';

import useConfirmModal from '@hooks/useConfirmModal';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import usePolicyConnectionsPrefetch from '@hooks/usePolicyConnectionsPrefetch';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import usePressLoading from '@hooks/usePressLoading';
import useRulesPrefetch from '@hooks/useRulesPrefetch';
import useThemeStyles from '@hooks/useThemeStyles';

import {openPolicyCategoriesPage} from '@libs/actions/Policy/Category';
import {deleteRule, setRule} from '@libs/actions/Policy/Rules';
import {openPolicyTagsPage} from '@libs/actions/Policy/Tag';
import Tab from '@libs/actions/Tab';
import {clearDraftMerchantRule, setDraftMerchantRule} from '@libs/actions/User';
import {getTaxRateDisplayName, hasUsableTaxRates} from '@libs/CategoryTaxRulesUtils';
import {getDecodedCategoryName} from '@libs/CategoryUtils';
import {
    buildExpenseDefaultRule,
    canEditExpenseDefaultRule,
    getExpenseDefaultFormValues,
    getPolicyExpenseDefaultRules,
    hasExpenseDefaultConditions,
    haveSameConditions,
} from '@libs/ExpenseDefaultRuleUtils';
import type {ExpenseDefaultFormValues} from '@libs/ExpenseDefaultRuleUtils';
import Navigation from '@libs/Navigation/Navigation';
import {hasEnabledOptions} from '@libs/OptionsListUtils';
import Parser from '@libs/Parser';
import {findPolicyTagAtLevel, getCleanedTagName, getTagLists, getTaxByID, getVendorRuleDisplayValue, hasVendorFeature} from '@libs/PolicyUtils';
import {getEnabledTags} from '@libs/TagsOptionsListUtils';
import {getTagArrayFromName} from '@libs/TransactionUtils';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import DescribeRuleButton from '@pages/workspace/rules/DescribeRuleButton';
import DescribeRuleModal from '@pages/workspace/rules/DescribeRuleModal';
import useRuleDeleteHeaderProps from '@pages/workspace/rules/useRuleDeleteHeaderProps';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {MerchantRuleForm} from '@src/types/form';
import MERCHANT_RULE_INPUT_IDS from '@src/types/form/MerchantRuleForm';
import type {PolicyTagLists} from '@src/types/onyx';
import type {GeneratedRuleValues} from '@src/types/onyx/GeneratedRule';
import getEmptyArray from '@src/types/utils/getEmptyArray';
import type IconAsset from '@src/types/utils/IconAsset';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {ValueOf} from 'type-fest';

import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

import useMerchantRuleRoute from './useMerchantRuleRoute';

type ExpenseDefaultRulePageBaseProps = {
    policyID: string;
    ruleID?: string;
    /** Pre-scopes the category default when creating a rule (e.g. from the category details RHP). */
    initialCategoryName?: string;
    /** Pre-scopes a new rule to this category, used by the category details RHP. */
    initialCategoryToMatch?: string;
    /** When true, the category field is non-interactive (category-scoped create/edit). */
    isCategoryLocked?: boolean;
    /** Where saving or deleting returns to when the rule was opened from category settings through the New rule hub. */
    categorySettingsBackPath?: Route;
    testID: string;
};

type SectionItemType = {
    key: string;
    description: string;
    required?: boolean;
    title?: string;
    onPress: () => void;
    isLocked?: boolean;
    shouldRenderAsHTML?: boolean;
    icon?: IconAsset;
};

type SectionType = {
    titleTranslationKey: 'workspace.rules.merchantRules.expensesWith' | 'workspace.rules.merchantRules.applyUpdates';
    items: Array<SectionItemType | undefined>;
};

const getBooleanTitle = (value: boolean | undefined, translate: LocalizedTranslate): string => {
    if (value === undefined) {
        return translate('common.dontChange');
    }
    return translate(value ? 'common.yes' : 'common.no');
};

/** A rule needs something to match on and something to set. */
const getErrorMessage = (translate: LocalizedTranslate, form?: MerchantRuleForm) => {
    const matchingCriteriaFields = new Set<string>([
        MERCHANT_RULE_INPUT_IDS.MERCHANT_TO_MATCH,
        MERCHANT_RULE_INPUT_IDS.MATCH_TYPE,
        MERCHANT_RULE_INPUT_IDS.CATEGORIES_TO_MATCH,
        MERCHANT_RULE_INPUT_IDS.TAGS_TO_MATCH,
        MERCHANT_RULE_INPUT_IDS.CURRENCIES_TO_MATCH,
    ]);
    const hasAtLeastOneUpdate = Object.entries(form ?? {}).some(([key, value]) => {
        if (matchingCriteriaFields.has(key)) {
            return false;
        }
        if (typeof value === 'boolean') {
            return true;
        }
        return value !== undefined && value !== '';
    });
    const hasCondition = hasExpenseDefaultConditions(form ?? {});
    if (hasCondition && hasAtLeastOneUpdate) {
        return '';
    }
    if (hasAtLeastOneUpdate) {
        return translate('workspace.rules.merchantRules.confirmErrorCondition');
    }
    if (hasCondition) {
        return translate('workspace.rules.merchantRules.confirmErrorUpdate');
    }
    return translate('workspace.rules.merchantRules.confirmErrorConditionAndDefault');
};

function ExpenseDefaultRulePageBase({
    policyID,
    ruleID,
    initialCategoryName,
    initialCategoryToMatch,
    isCategoryLocked = false,
    categorySettingsBackPath,
    testID,
}: ExpenseDefaultRulePageBaseProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {convertToDisplayString} = useCurrencyListActions();
    const policy = usePolicy(policyID);
    const {canWrite: canWriteRules} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.RULES);
    // The page is on its way out, so the rule it was editing no longer being there is expected rather than an
    // error worth showing.
    const [isClosing, setIsClosing] = useState(false);
    const {isLoading, startWithLoading} = usePressLoading();
    const isEditing = !!ruleID;
    const {isCreatedFromExpense, backToRoute, getRuleRoute} = useMerchantRuleRoute(DYNAMIC_ROUTES.RULES_MERCHANT_NEW_FROM_EXPENSE.path, policyID, ruleID);
    const isInLandscapeMode = useIsInLandscapeMode();
    const {isBetaEnabled} = usePermissions();
    const icons = useMemoizedLazyExpensifyIcons(['Basket', 'Cash', 'Folder', 'Pencil', 'InvoiceGeneric', 'Tag', 'Paycheck']);

    const [form] = useOnyx(ONYXKEYS.FORMS.MERCHANT_RULE_FORM);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const [policyTagsFromOnyx] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`);
    const policyTags = getTagLists(policyTagsFromOnyx) ?? getEmptyArray<ValueOf<PolicyTagLists>>();
    const [shouldShowError, setShouldShowError] = useState(false);
    const {showConfirmModal} = useConfirmModal();
    const [shouldUpdateMatchingTransactions, setShouldUpdateMatchingTransactions] = useState(false);
    // The footer remounts when it moves on rotation, so the page owns the modal to keep it open
    const [isDescribeRuleModalVisible, setIsDescribeRuleModalVisible] = useState(false);
    const didSeedInitialCategoryRef = useRef(false);

    // The "Set vendor to" row gate below reads policy.connections (via hasVendorFeature and
    // isMatchingVendorListLoaded), which is empty on a non-active workspace until a page requiring
    // connections is opened. This editor only fetches categories and tags, so prefetch connections
    // here unconditionally so the row appears and resolves the stored vendor once connections
    // hydrate. It can't be narrowed by hasVendorFeature, because that itself depends on the
    // connection data being fetched. The hook already skips the fetch when the app is offline, when
    // the workspace has no accounting connection, and when the data has already been fetched.
    usePolicyConnectionsPrefetch(policy, true);

    // This route is deep linkable, so it can be the first screen mounted. Nothing else on the way in fetches the
    // rules collection, which would leave the not-found guard below reading an empty collection for a valid rule.
    const {areRulesLoading: isRulesFetchPending} = useRulesPrefetch();

    const [rules, rulesResult] = useOnyx(ONYXKEYS.COLLECTION.RULE);
    const areRulesLoading = isLoadingOnyxValue(rulesResult) || isRulesFetchPending;
    // Get the existing rule from the rules collection (for edit mode)
    const existingRule = ruleID ? rules?.[`${ONYXKEYS.COLLECTION.RULE}${ruleID}`] : undefined;
    // Initialize the form with existing rule data (for edit mode)
    useEffect(() => {
        if (initialCategoryToMatch) {
            if (didSeedInitialCategoryRef.current) {
                return;
            }
            didSeedInitialCategoryRef.current = true;
            setDraftMerchantRule({categoriesToMatch: [initialCategoryToMatch]});
            return;
        }

        if (!isEditing) {
            // Seed once, or this overwrites whatever category the admin has since picked.
            if (!initialCategoryName || didSeedInitialCategoryRef.current) {
                return;
            }
            didSeedInitialCategoryRef.current = true;
            setDraftMerchantRule({category: initialCategoryName});
            return;
        }

        // An undefined result means the rule uses parts of the format this form can't show. Saving it back would
        // drop them, so the editor stays empty and the rules list keeps such rules read-only.
        const formValues = getExpenseDefaultFormValues(existingRule);
        if (!formValues) {
            return;
        }
        setDraftMerchantRule(formValues);
    }, [isEditing, existingRule, initialCategoryName, initialCategoryToMatch]);

    // Clear the form on unmount
    useEffect(() => () => clearDraftMerchantRule(), []);

    // Fetch categories and tags if they're not loaded (e.g. after cache clear)
    const fetchPolicyData = () => {
        if (policy?.areCategoriesEnabled && !policyCategories) {
            openPolicyCategoriesPage(policyID);
        }
        if (policy?.areTagsEnabled && !policyTagsFromOnyx) {
            openPolicyTagsPage(policyID);
        }
    };

    useNetwork({onReconnect: fetchPolicyData});

    useFocusEffect(
        useCallback(() => {
            fetchPolicyData();
        }, [fetchPolicyData]),
    );

    const hasCategories = () => {
        if (!policy?.areCategoriesEnabled) {
            return false;
        }
        return !!form?.category || hasEnabledOptions(policyCategories ?? {});
    };

    const hasTags = () => {
        if (!policy?.areTagsEnabled) {
            return false;
        }
        return policyTags.length > 0;
    };

    // `hasCategories` falls back to the category the rule sets, which says nothing about what it matches on, so the
    // condition row asks separately. A category the rule already matches on keeps the row even once the workspace has
    // none left to pick, otherwise the condition would be invisible and still saved.
    const hasCategoriesToMatch = () => {
        if (!policy?.areCategoriesEnabled) {
            return false;
        }
        return !!form?.categoriesToMatch?.length || hasEnabledOptions(policyCategories ?? {});
    };

    // Turning tags on creates a tag list whether or not it holds anything, so the condition row needs a tag to
    // actually match on. A tag the rule already matches on keeps the row, the same way.
    const hasTagsToMatch = () => {
        if (!policy?.areTagsEnabled) {
            return false;
        }
        return !!form?.tagsToMatch?.length || policyTags.some((tagList) => hasEnabledOptions(tagList.tags));
    };
    const formTags = getTagArrayFromName(form?.tag ?? '');

    const isBillableEnabled = policy?.disabledFields?.defaultBillable !== true;

    const isVendorMatchingBetaEnabled = isBetaEnabled(CONST.BETAS.VENDOR_MATCHING);
    const isVendorFeatureEnabled = hasVendorFeature(policy, isVendorMatchingBetaEnabled);
    const unavailableLabel = translate('workspace.rules.merchantRules.vendorUnavailable');
    const vendorDisplayName = form?.vendorID ? getVendorRuleDisplayValue(policy, form.vendorID, unavailableLabel) : undefined;

    // A rule matches on every condition it carries, so all three rows are offered together.
    const categoriesToMatch = form?.categoriesToMatch ?? [];
    const hasCategoryCondition = categoriesToMatch.length > 0;
    const hasMerchantCondition = !!form?.merchantToMatch;

    /** Clears every condition and every default. */
    const resetRule = () => {
        setDraftMerchantRule({});
        setShouldShowError(false);
        setShouldUpdateMatchingTransactions(false);
    };

    // A rule can match on several categories, so the condition row lists every one the admin picked.
    const categoriesToMatchDisplayName = hasCategoryCondition ? categoriesToMatch.map(getDecodedCategoryName).join(', ') : undefined;
    const tagsToMatch = form?.tagsToMatch ?? [];
    const hasTagCondition = tagsToMatch.length > 0;
    const tagsToMatchDisplayName = hasTagCondition ? tagsToMatch.map(getCleanedTagName).join(', ') : undefined;
    const currenciesToMatch = form?.currenciesToMatch ?? [];
    const currenciesToMatchDisplayName = currenciesToMatch.length > 0 ? currenciesToMatch.join(', ') : undefined;
    const amountDisplayName = form?.amount ? convertToDisplayString(Number(form.amount), policy?.outputCurrency) : undefined;
    const categoryDisplayName = form?.category ? getDecodedCategoryName(form.category) : undefined;
    // Blank rather than the raw ID once the rate is gone from the workspace.
    const taxDisplayName = (form?.tax && getTaxByID(policy, form.tax) ? getTaxRateDisplayName(policy, form.tax) : '') || undefined;

    /**
     * Checks if another rule already matches on the same conditions.
     * When editing, we exclude the current rule from the comparison.
     */
    const checkForDuplicateRule = (formValues: Partial<ExpenseDefaultFormValues>): boolean => {
        if (!hasExpenseDefaultConditions(formValues)) {
            return false;
        }

        // A rule deleted offline no longer applies to anything, so recreating it is not a duplicate.
        return getPolicyExpenseDefaultRules(rules, policyID, true).some(({ruleID: existingRuleID, rule}) => {
            // Skip the rule being edited
            if (isEditing && existingRuleID === ruleID) {
                return false;
            }

            // A rule this form can't represent can't be a duplicate of what this form is about to save.
            const existingFormValues = getExpenseDefaultFormValues(rule);
            if (!existingFormValues) {
                return false;
            }

            if (!haveSameConditions(existingFormValues, formValues)) {
                return false;
            }

            // When editing, if the rule being edited was created before the duplicate,
            // the edited rule already has priority — no warning needed
            if (isEditing && existingRule?.created && rule.created && existingRule.created <= rule.created) {
                return false;
            }

            return true;
        });
    };

    const errorMessage = getErrorMessage(translate, form);

    const goBackToExpenseDefaults = () => {
        Tab.setSelectedTab(CONST.TAB.RULES_TAB_TYPE, CONST.TAB.RULES.EXPENSE_DEFAULTS);
        Navigation.goBack(ROUTES.WORKSPACE_RULES.getRoute(policyID));
    };

    /**
     * Saves the rule to the backend and navigates back.
     */
    const saveRule = () => {
        if (!form) {
            return;
        }

        setRule(policyID, buildExpenseDefaultRule(form, policy, existingRule?.triggers), CONST.RULES.EXPENSE_DEFAULT.PRIORITY, ruleID, existingRule, shouldUpdateMatchingTransactions);
        if (categorySettingsBackPath) {
            // Category settings enters through its own dynamic route, so the way back is the category the rule was
            // opened from rather than anything in the workspace Rules flow.
            Navigation.goBack(categorySettingsBackPath);
        } else if (isCreatedFromExpense) {
            // Opened from the callout, so this page is a suffix on the expense's path. Dropping it returns to the
            // expense instead of the workspace Rules page.
            Navigation.goBack(backToRoute);
        } else if (!isEditing) {
            goBackToExpenseDefaults();
        } else {
            Navigation.goBack();
        }
    };

    const handleSubmit = () => {
        if (!canWriteRules) {
            return;
        }
        if (errorMessage) {
            setShouldShowError(true);
            return;
        }
        if (!form) {
            return;
        }

        // Check for duplicate rules
        const hasDuplicate = checkForDuplicateRule(form);
        if (hasDuplicate) {
            // A duplicate does not have to match on a merchant, so the prompt names the first condition the two share.
            const duplicateCondition = [form.merchantToMatch, categoriesToMatchDisplayName, tagsToMatchDisplayName, currenciesToMatchDisplayName].find(Boolean) ?? '';
            showConfirmModal({
                title: translate('workspace.rules.merchantRules.duplicateRuleTitle'),
                prompt: translate('workspace.rules.merchantRules.duplicateRulePrompt', duplicateCondition),
                confirmText: translate('workspace.rules.merchantRules.saveAnyway'),
                cancelText: translate('common.cancel'),
            }).then((result) => {
                if (result.action !== ModalActions.CONFIRM) {
                    return;
                }
                saveRule();
            });
            return;
        }

        startWithLoading(() => saveRule());
    };

    const handleDeleteRule = () => {
        if (!policy) {
            return false;
        }
        setIsClosing(true);
        if (ruleID) {
            deleteRule(ruleID, existingRule);
        }
        return true;
    };

    // Declared above the not-found returns below, since a hook can't run conditionally.
    const isRuleBeingDeleted = existingRule?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    const canDeleteRule = canWriteRules && !!policy && !isRuleBeingDeleted && isEditing;

    const {deleteIconButtonProps} = useRuleDeleteHeaderProps({
        canDelete: canDeleteRule,
        onDelete: handleDeleteRule,
        sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.RULES.MERCHANT_RULE_DELETE,
        backTo: categorySettingsBackPath,
    });

    const sections: SectionType[] = [
        {
            titleTranslationKey: 'workspace.rules.merchantRules.expensesWith',
            items: [
                {
                    key: 'merchantToMatch',
                    description: translate('common.merchant'),
                    title: form?.merchantToMatch,
                    onPress: () =>
                        Navigation.navigate(
                            getRuleRoute(DYNAMIC_ROUTES.RULES_MERCHANT_MERCHANT_TO_MATCH_FROM_EXPENSE.path, ROUTES.RULES_MERCHANT_MERCHANT_TO_MATCH.getRoute(policyID, ruleID)),
                        ),
                    icon: icons.Basket,
                },
                hasCategoriesToMatch()
                    ? {
                          key: 'categoriesToMatch',
                          description: translate('common.category'),
                          title: categoriesToMatchDisplayName,
                          onPress: () =>
                              Navigation.navigate(getRuleRoute(DYNAMIC_ROUTES.RULES_CATEGORY_TO_MATCH_FROM_EXPENSE.path, ROUTES.RULES_CATEGORY_TO_MATCH.getRoute(policyID, ruleID))),
                          isLocked: isCategoryLocked,
                          icon: icons.Folder,
                      }
                    : undefined,
                !hasTagsToMatch()
                    ? undefined
                    : {
                          key: 'tagsToMatch',
                          description: translate('common.tag'),
                          title: tagsToMatchDisplayName,
                          onPress: () => Navigation.navigate(getRuleRoute(DYNAMIC_ROUTES.RULES_TAG_TO_MATCH_FROM_EXPENSE.path, ROUTES.RULES_TAG_TO_MATCH.getRoute(policyID, ruleID))),
                          icon: icons.Tag,
                      },
                {
                    key: 'currenciesToMatch',
                    description: translate('common.currency'),
                    title: currenciesToMatchDisplayName,
                    onPress: () => Navigation.navigate(getRuleRoute(DYNAMIC_ROUTES.RULES_CURRENCY_TO_MATCH_FROM_EXPENSE.path, ROUTES.RULES_CURRENCY_TO_MATCH.getRoute(policyID, ruleID))),
                    icon: icons.Cash,
                },
            ],
        },
        {
            titleTranslationKey: 'workspace.rules.merchantRules.applyUpdates',
            items: [
                {
                    key: 'merchant',
                    description: translate('common.merchant'),
                    title: form?.merchant,
                    onPress: () => Navigation.navigate(getRuleRoute(DYNAMIC_ROUTES.RULES_MERCHANT_MERCHANT_FROM_EXPENSE.path, ROUTES.RULES_MERCHANT_MERCHANT.getRoute(policyID, ruleID))),
                    icon: icons.Basket,
                },
                hasCategories()
                    ? {
                          key: 'category',
                          description: translate('common.category'),
                          title: categoryDisplayName,
                          onPress: () =>
                              Navigation.navigate(getRuleRoute(DYNAMIC_ROUTES.RULES_MERCHANT_CATEGORY_FROM_EXPENSE.path, ROUTES.RULES_MERCHANT_CATEGORY.getRoute(policyID, ruleID))),
                          icon: icons.Folder,
                      }
                    : undefined,
                ...(hasTags()
                    ? policyTags
                          .filter(({orderWeight, tags}) => !!formTags.at(orderWeight) || getEnabledTags(tags, form?.tag ?? '', orderWeight).length > 0)
                          .map(({name, orderWeight, tags}) => {
                              const formTag = formTags.at(orderWeight);
                              const matchedTag = formTag ? findPolicyTagAtLevel(tags, formTag, formTags.slice(0, orderWeight).join(':')) : undefined;
                              const isTagAvailable = !!matchedTag && matchedTag.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
                              return {
                                  key: `tag-${name}-${orderWeight}`,
                                  description: name,
                                  title: isTagAvailable && formTag ? getCleanedTagName(formTag) : undefined,
                                  onPress: () =>
                                      Navigation.navigate(
                                          getRuleRoute(
                                              DYNAMIC_ROUTES.RULES_MERCHANT_TAG_FROM_EXPENSE.getRoute(orderWeight),
                                              ROUTES.RULES_MERCHANT_TAG.getRoute(policyID, ruleID, orderWeight),
                                          ),
                                      ),
                                  icon: icons.Tag,
                              };
                          })
                    : []),
                hasUsableTaxRates(policy)
                    ? {
                          key: 'tax',
                          description: translate('common.tax'),
                          title: taxDisplayName,
                          onPress: () => Navigation.navigate(getRuleRoute(DYNAMIC_ROUTES.RULES_MERCHANT_TAX_FROM_EXPENSE.path, ROUTES.RULES_MERCHANT_TAX.getRoute(policyID, ruleID))),
                          icon: icons.InvoiceGeneric,
                      }
                    : undefined,
                {
                    key: 'amount',
                    description: translate('iou.amount'),
                    title: amountDisplayName,
                    onPress: () => Navigation.navigate(getRuleRoute(DYNAMIC_ROUTES.RULES_MERCHANT_AMOUNT_FROM_EXPENSE.path, ROUTES.RULES_MERCHANT_AMOUNT.getRoute(policyID, ruleID))),
                    icon: icons.Cash,
                },
                isVendorFeatureEnabled
                    ? {
                          key: 'vendorID',
                          description: translate('common.vendor'),
                          title: vendorDisplayName,
                          onPress: () => Navigation.navigate(getRuleRoute(DYNAMIC_ROUTES.RULES_MERCHANT_VENDOR_FROM_EXPENSE.path, ROUTES.RULES_MERCHANT_VENDOR.getRoute(policyID, ruleID))),
                          icon: icons.Basket,
                      }
                    : undefined,
                {
                    key: 'description',
                    description: translate('common.description'),
                    title: form?.comment ? Parser.replace(form.comment) : undefined,
                    onPress: () =>
                        Navigation.navigate(getRuleRoute(DYNAMIC_ROUTES.RULES_MERCHANT_DESCRIPTION_FROM_EXPENSE.path, ROUTES.RULES_MERCHANT_DESCRIPTION.getRoute(policyID, ruleID))),
                    shouldRenderAsHTML: true,
                    icon: icons.Pencil,
                },
                {
                    key: 'reimbursable',
                    description: translate('common.reimbursable'),
                    title: getBooleanTitle(form?.reimbursable, translate),
                    onPress: () =>
                        Navigation.navigate(getRuleRoute(DYNAMIC_ROUTES.RULES_MERCHANT_REIMBURSABLE_FROM_EXPENSE.path, ROUTES.RULES_MERCHANT_REIMBURSABLE.getRoute(policyID, ruleID))),
                    icon: icons.Paycheck,
                },
                isBillableEnabled
                    ? {
                          key: 'billable',
                          description: translate('common.billable'),
                          title: getBooleanTitle(form?.billable, translate),
                          onPress: () =>
                              Navigation.navigate(getRuleRoute(DYNAMIC_ROUTES.RULES_MERCHANT_BILLABLE_FROM_EXPENSE.path, ROUTES.RULES_MERCHANT_BILLABLE.getRoute(policyID, ruleID))),
                          icon: icons.Paycheck,
                      }
                    : undefined,
            ],
        },
    ];

    const previewMatches = () => {
        if (!hasExpenseDefaultConditions(form ?? {})) {
            setShouldShowError(true);
            return;
        }

        Navigation.navigate(getRuleRoute(DYNAMIC_ROUTES.RULES_MERCHANT_PREVIEW_MATCHES_FROM_EXPENSE.path, ROUTES.RULES_MERCHANT_PREVIEW_MATCHES.getRoute(policyID, ruleID)));
    };

    // `areRulesLoading` keeps a deep link from rendering not-found before the collection has both hydrated and
    // been fetched. Onyx hydrates it as empty well before `GetRules` answers, so hydration alone is not enough.
    // The form has to wait too: filled in and saved during that window it would write only the fields typed into
    // it over the rule the link points at.
    if (ruleID && !existingRule && !isClosing && areRulesLoading) {
        return <FullScreenLoadingIndicator testID={`${testID}Loading`} />;
    }

    if (ruleID && !existingRule && !isClosing) {
        return <NotFoundPage />;
    }

    // The rules collection is shared across workspaces and rule kinds, so a stale link can resolve a ruleID that
    // this editor must not write to. Saving would replace it with a merchant rule and drop whatever it holds.
    if (ruleID && !!existingRule && !isClosing && !canEditExpenseDefaultRule(existingRule, policyID)) {
        return <NotFoundPage />;
    }

    // A saved rule stays readable without write access, so only creating one is gated.
    if (!isEditing && !!policy && !canWriteRules) {
        return <NotFoundPage />;
    }

    const shouldShowDescribeRule = !isEditing && !isCategoryLocked;
    const applyGeneratedRule = (values: GeneratedRuleValues) => {
        setDraftMerchantRule(values);
    };

    const footer = canWriteRules ? (
        <View style={[styles.m4, styles.mb5, styles.mh5]}>
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.gap3, styles.ph2, styles.mt2, styles.mb6]}>
                <Text style={[styles.textNormal, styles.textSupporting, styles.flex1]}>{translate('workspace.rules.merchantRules.previewMatchesDescription')}</Text>
                <Button
                    size={CONST.BUTTON_SIZE.SMALL}
                    onPress={previewMatches}
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.MERCHANT_RULE_PREVIEW_MATCHES}
                >
                    <Button.Text>{translate('workspace.rules.merchantRules.preview')}</Button.Text>
                </Button>
            </View>
            <FormAlertWithSubmitButton
                buttonText={translate('workspace.rules.merchantRules.saveRule')}
                isAlertVisible={shouldShowError && !!errorMessage}
                message={errorMessage}
                onSubmit={handleSubmit}
                isLoading={isLoading}
                shouldShowLoadingImmediatelyOnPress={false}
                enabledWhenOffline
                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.MERCHANT_RULE_SAVE}
                buttonStyles={styles.flex1}
                buttonAndFooterContainerStyles={[styles.flexRow, styles.gap2]}
                shouldRenderFooterAboveSubmit
                footerContent={
                    shouldShowDescribeRule && (
                        <DescribeRuleButton
                            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.MERCHANT_RULE_DESCRIBE}
                            onPress={() => setIsDescribeRuleModalVisible(true)}
                        />
                    )
                }
            />
        </View>
    ) : null;

    const renderSectionItem = (item: SectionItemType) => {
        const canEditItem = canWriteRules && !item.isLocked;
        return (
            <MenuItemWithTopDescription
                key={item.key}
                description={item.description}
                errorText={canEditItem && shouldShowError && item.required && !item.title ? translate('common.error.fieldRequired') : ''}
                onPress={canEditItem ? item.onPress : undefined}
                rightLabel={canEditItem && item.required ? translate('common.required') : undefined}
                shouldShowRightIcon={canEditItem}
                interactive={canEditItem}
                title={item.title}
                numberOfLinesTitle={2}
                titleStyle={styles.flex1}
                shouldRenderAsHTML={item.shouldRenderAsHTML}
                shouldApplyIconPaddingToHTMLTitle={!!item.icon && !!item.shouldRenderAsHTML}
                icon={item.icon}
                {...(item.icon && {
                    iconWidth: variables.iconSizeNormal,
                    iconHeight: variables.iconSizeNormal,
                    shouldIconUseAutoWidthStyle: true,
                })}
                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.MERCHANT_RULE_SECTION_ITEM}
            />
        );
    };

    const renderSections = () =>
        sections.map((section, sectionIndex) => (
            <View key={section.titleTranslationKey}>
                {sectionIndex > 0 && (
                    <>
                        <View style={[styles.sectionDividerLine, styles.mh5, styles.mv3]} />
                        <Text style={[styles.textLabel, styles.textStrong, styles.lh16, styles.ph5, styles.pv3]}>
                            {translate('workspace.rules.merchantRules.thenApplyFollowingDefaults')}
                        </Text>
                    </>
                )}
                {section.items.filter((item): item is SectionItemType => !!item).map(renderSectionItem)}
            </View>
        ));

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
                <HeaderWithBackButtonAndTitle title={translate('workspace.rules.merchantRules.expenseDefaultsTitle')}>
                    <Header.Actions>
                        {/* Only while a condition is set, and only on an unsaved rule, since clearing the conditions of
                        a saved rule would leave it matching everything. A locked category isn't the admin's to clear. */}
                        {canWriteRules && !isEditing && !isCategoryLocked && (hasMerchantCondition || hasCategoryCondition || hasTagCondition) && (
                            <TextLink onPress={resetRule}>{translate('common.reset')}</TextLink>
                        )}
                    </Header.Actions>
                    {!!deleteIconButtonProps && <Header.IconButton {...deleteIconButtonProps} />}
                </HeaderWithBackButtonAndTitle>
                <ScrollView contentContainerStyle={[styles.flexGrow1]}>
                    <View style={[styles.ph5, styles.pv3, styles.gap6]}>
                        <Text style={[styles.textNormal, styles.textSupporting]}>{translate('workspace.rules.merchantRules.expenseDefaultsSubtitle')}</Text>
                        <Text style={[styles.textLabel, styles.textStrong, styles.lh16]}>{translate('workspace.rules.merchantRules.ifAnyExpenseMatches')}</Text>
                    </View>
                    {renderSections()}
                    <View style={[styles.sectionDividerLine, styles.mh5, styles.mv3]} />
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.gap3, styles.ph5, styles.pv3]}>
                        <Text
                            style={[styles.textNormal, styles.flex1]}
                            accessible={false}
                            aria-hidden
                        >
                            {translate('workspace.rules.merchantRules.applyToExistingUnsubmittedExpenses')}
                        </Text>
                        <Switch
                            accessibilityLabel={translate('workspace.rules.merchantRules.applyToExistingUnsubmittedExpenses')}
                            isOn={shouldUpdateMatchingTransactions}
                            onToggle={setShouldUpdateMatchingTransactions}
                        />
                    </View>
                    {isInLandscapeMode && footer}
                </ScrollView>
                {!isInLandscapeMode && footer}
                {shouldShowDescribeRule && (
                    <DescribeRuleModal
                        isVisible={isDescribeRuleModalVisible}
                        onClose={() => setIsDescribeRuleModalVisible(false)}
                        policyID={policyID}
                        ruleType={CONST.GENERATED_RULE.RULE_TYPE.EXPENSE_DEFAULTS}
                        onRuleGenerated={applyGeneratedRule}
                    />
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

ExpenseDefaultRulePageBase.displayName = 'ExpenseDefaultRulePageBase';

export default ExpenseDefaultRulePageBase;
