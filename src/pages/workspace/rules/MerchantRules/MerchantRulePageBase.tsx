import Button from '@components/ButtonComposed';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Switch from '@components/Switch';
import Text from '@components/Text';
import TextLink from '@components/TextLink';

import useConfirmModal from '@hooks/useConfirmModal';
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
import useThemeStyles from '@hooks/useThemeStyles';

import {deletePolicyCategoryTax, movePolicyCategoryTax, openPolicyCategoriesPage, setPolicyCategoryTaxes} from '@libs/actions/Policy/Category';
import {deleteMerchantRule, setMerchantRule} from '@libs/actions/Policy/Rules';
import {openPolicyTagsPage} from '@libs/actions/Policy/Tag';
import Tab from '@libs/actions/Tab';
import {clearDraftMerchantRule, setDraftMerchantRule} from '@libs/actions/User';
import {getCategoryTaxRuleTaxID, getTaxRateDisplayName, hasUsableTaxRates, isCategoryRuleDraft} from '@libs/CategoryTaxRulesUtils';
import {getDecodedCategoryName} from '@libs/CategoryUtils';
import {getMerchantRuleFormValues, getPolicyExpenseDefaultRules} from '@libs/ExpenseDefaultRuleUtils';
import Navigation from '@libs/Navigation/Navigation';
import {hasEnabledOptions} from '@libs/OptionsListUtils';
import Parser from '@libs/Parser';
import {getCleanedTagName, getTagLists, getVendorRuleDisplayValue, hasVendorFeature, isXeroActiveMatchingSource} from '@libs/PolicyUtils';
import {getEnabledTags} from '@libs/TagsOptionsListUtils';
import {getTagArrayFromName} from '@libs/TransactionUtils';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {MerchantRuleForm} from '@src/types/form';
import MERCHANT_RULE_INPUT_IDS from '@src/types/form/MerchantRuleForm';
import type {ExpenseDefaultRuleType} from '@src/types/form/MerchantRuleForm';
import type {PolicyTagLists} from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';
import type IconAsset from '@src/types/utils/IconAsset';

import type {ValueOf} from 'type-fest';

import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';

type MerchantRulePageBaseProps = {
    policyID: string;
    ruleID?: string;
    /**
     * Edits the existing category tax default for this category. Category rules live in `policy.rules.expenseRules`
     * keyed by category name rather than in `codingRules` keyed by a ruleID, so they arrive here by category instead
     * of through `ruleID`.
     */
    editCategoryTaxRuleFor?: string;
    titleKey: TranslationPaths;
    testID: string;
};

type SectionItemType = {
    key: string;
    description: string;
    required?: boolean;
    title?: string;
    onPress: () => void;
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

/** A category rule matches on categories and can only set a tax, so both halves are required and nothing else counts. */
const getCategoryRuleErrorMessage = (translate: LocalizedTranslate, taxID: string | undefined, form?: MerchantRuleForm) => {
    if (!form?.categoriesToMatch?.length) {
        return translate('workspace.rules.merchantRules.confirmErrorCategory');
    }
    if (!taxID) {
        return translate('workspace.rules.merchantRules.confirmErrorCategoryTax');
    }
    return '';
};

/**
 * Only ever a merchant rule: a category rule is scoped before this page opens and validates through
 * `getCategoryRuleErrorMessage`. `isRulesRevampEnabled` picks the copy only because the revamp calls the fields it
 * applies "defaults" where the legacy page calls them "updates".
 */
const getErrorMessage = (translate: LocalizedTranslate, isRulesRevampEnabled: boolean, form?: MerchantRuleForm) => {
    const matchingCriteriaFields = new Set<string>([
        MERCHANT_RULE_INPUT_IDS.MERCHANT_TO_MATCH,
        MERCHANT_RULE_INPUT_IDS.MATCH_TYPE,
        MERCHANT_RULE_INPUT_IDS.CATEGORIES_TO_MATCH,
        // Scoping, not a default the admin set.
        MERCHANT_RULE_INPUT_IDS.RULE_TYPE,
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
    if (form?.merchantToMatch && hasAtLeastOneUpdate) {
        return '';
    }
    if (hasAtLeastOneUpdate) {
        return translate(isRulesRevampEnabled ? 'workspace.rules.merchantRules.confirmErrorCondition' : 'workspace.rules.merchantRules.confirmErrorMerchant');
    }
    if (form?.merchantToMatch) {
        return translate('workspace.rules.merchantRules.confirmErrorUpdate');
    }
    return translate(isRulesRevampEnabled ? 'workspace.rules.merchantRules.confirmErrorConditionAndDefault' : 'workspace.rules.merchantRules.confirmError');
};

function MerchantRulePageBase({policyID, ruleID, editCategoryTaxRuleFor, titleKey, testID}: MerchantRulePageBaseProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policy = usePolicy(policyID);
    const {canWrite: canWriteRules} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.RULES);
    // The page is on its way out, so the rule it was editing no longer being there is expected. A category rule is
    // keyed by its category, so moving it to another category makes the one this page opened with disappear.
    const [isClosing, setIsClosing] = useState(false);
    const {isLoading, startWithLoading} = usePressLoading();
    const isEditing = !!ruleID;
    const isEditingCategoryTaxRule = !!editCategoryTaxRuleFor;
    // A category tax default has no ruleID, so neither flag alone means "saved".
    const isEditingSavedRule = isEditing || isEditingCategoryTaxRule;
    const isInLandscapeMode = useIsInLandscapeMode();
    const {isBetaEnabled} = usePermissions();
    const isRulesRevampEnabled = isBetaEnabled(CONST.BETAS.RULES_REVAMP);
    const icons = useMemoizedLazyExpensifyIcons(['Basket', 'Folder', 'Pencil', 'InvoiceGeneric', 'Tag', 'Paycheck']);
    const getItemIcon = (icon: IconAsset) => (isRulesRevampEnabled ? icon : undefined);

    const [form] = useOnyx(ONYXKEYS.FORMS.MERCHANT_RULE_FORM);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const [policyTagsFromOnyx] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`);
    const policyTags = useMemo(() => getTagLists(policyTagsFromOnyx) ?? getEmptyArray<ValueOf<PolicyTagLists>>(), [policyTagsFromOnyx]);
    const [shouldShowError, setShouldShowError] = useState(false);
    const {showConfirmModal} = useConfirmModal();
    const [shouldUpdateMatchingTransactions, setShouldUpdateMatchingTransactions] = useState(false);
    const seededCategoryTaxRuleRef = useRef<string | undefined>(undefined);

    // The "Set vendor to" row gate below reads policy.connections (via hasVendorFeature and
    // isMatchingVendorListLoaded), which is empty on a non-active workspace until a page requiring
    // connections is opened. This editor only fetches categories and tags, so prefetch connections
    // here unconditionally so the row appears and resolves the stored vendor once connections
    // hydrate. It can't be narrowed by hasVendorFeature, because that itself depends on the
    // connection data being fetched. The hook already skips the fetch when the app is offline, when
    // the workspace has no accounting connection, and when the data has already been fetched.
    usePolicyConnectionsPrefetch(policy, true);

    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);
    // Get the existing rule from the rules collection (for edit mode)
    const existingRule = ruleID ? rules?.[`${ONYXKEYS.COLLECTION.RULE}${ruleID}`] : undefined;
    const existingCategoryTaxID = editCategoryTaxRuleFor ? getCategoryTaxRuleTaxID(policy?.rules?.expenseRules, editCategoryTaxRuleFor) : undefined;

    // Initialize the form with existing rule data (for edit mode)
    useEffect(() => {
        if (isEditingCategoryTaxRule) {
            // Seed once per rule, or this overwrites the category picked in the picker.
            if (!existingCategoryTaxID || seededCategoryTaxRuleRef.current === editCategoryTaxRuleFor) {
                return;
            }
            seededCategoryTaxRuleRef.current = editCategoryTaxRuleFor;
            setDraftMerchantRule({categoriesToMatch: [editCategoryTaxRuleFor], tax: existingCategoryTaxID});
            return;
        }

        if (isEditing) {
            // An undefined result means the rule uses parts of the format this form can't show. Saving it back would
            // drop them, so the editor stays empty and the rules list keeps such rules read-only.
            const formValues = getMerchantRuleFormValues(existingRule);
            if (!formValues) {
                return;
            }
            setDraftMerchantRule(formValues);
        }
    }, [isEditing, existingRule, isEditingCategoryTaxRule, editCategoryTaxRuleFor, existingCategoryTaxID]);

    // Clear the form on unmount
    useEffect(() => () => clearDraftMerchantRule(), []);

    // Fetch categories and tags if they're not loaded (e.g. after cache clear)
    const fetchPolicyData = useCallback(() => {
        if (policy?.areCategoriesEnabled && !policyCategories) {
            openPolicyCategoriesPage(policyID);
        }
        if (policy?.areTagsEnabled && !policyTagsFromOnyx) {
            openPolicyTagsPage(policyID);
        }
    }, [policyID, policy?.areCategoriesEnabled, policy?.areTagsEnabled, policyCategories, policyTagsFromOnyx]);

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
    const formTags = getTagArrayFromName(form?.tag ?? '');

    const isBillableEnabled = policy?.disabledFields?.defaultBillable !== true;

    const isVendorFeatureEnabled = hasVendorFeature(policy, isBetaEnabled(CONST.BETAS.VENDOR_MATCHING));
    const isOnXero = isXeroActiveMatchingSource(policy);
    const vendorFieldLabel = translate(isOnXero ? 'common.supplier' : 'common.vendor');
    const unavailableLabel = translate(isOnXero ? 'workspace.rules.merchantRules.supplierUnavailable' : 'workspace.rules.merchantRules.vendorUnavailable');
    const vendorDisplayName = form?.vendorID ? getVendorRuleDisplayValue(policy, form.vendorID, unavailableLabel) : undefined;

    // `Expense defaults` has not been migrated to the new rules system, so a rule can only carry one condition. The
    // type is chosen before this page opens, so the condition and the defaults the type can't carry are simply absent.
    const categoriesToMatch = form?.categoriesToMatch ?? [];
    const hasCategoryCondition = categoriesToMatch.length > 0;
    const hasMerchantCondition = !!form?.merchantToMatch;
    // A saved rule already is one kind or the other, so editing is scoped the same way creating is. Creating reads the
    // draft rather than the route, so scoping survives a trip to any picker and every picker routes back to one URL.
    // Three branches, and `no-nested-ternary` rules out folding them into one expression.
    const getScopedRuleType = (): ExpenseDefaultRuleType | undefined => {
        if (isEditingCategoryTaxRule) {
            return CONST.POLICY.EXPENSE_DEFAULT_RULE_TYPE.CATEGORY;
        }
        if (isEditing) {
            return CONST.POLICY.EXPENSE_DEFAULT_RULE_TYPE.MERCHANT;
        }
        return form?.ruleType;
    };
    const scopedRuleType = getScopedRuleType();
    const isScopedToCategory = scopedRuleType === CONST.POLICY.EXPENSE_DEFAULT_RULE_TYPE.CATEGORY;
    const isCategoryRule = isCategoryRuleDraft(form, editCategoryTaxRuleFor);
    // Deleting means writing the workspace default rate back, so without one there is nothing to write.
    const canDeleteCategoryTaxRule = isEditingCategoryTaxRule && !!policy?.taxRates?.defaultExternalID;
    // Writing the workspace default rate deletes the rule, so a draft tax equal to it means "no rule". A merchant
    // draft can carry it in before a category condition is added, so ignore it rather than let a save delete.
    const categoryTaxID = isCategoryRule && form?.tax === policy?.taxRates?.defaultExternalID ? undefined : form?.tax;
    const showCategoryRulesApplyGoingForwardExplainer = () => {
        showConfirmModal({
            title: translate('workspace.rules.merchantRules.categoryRulesApplyGoingForwardTitle'),
            prompt: translate('workspace.rules.merchantRules.categoryRulesApplyGoingForwardPrompt'),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
        });
    };

    /** Clears the condition and every default, keeping the type the rule was scoped to. */
    const resetRule = () => {
        setDraftMerchantRule(scopedRuleType ? {ruleType: scopedRuleType} : {});
        setShouldShowError(false);
        setShouldUpdateMatchingTransactions(false);
    };

    // One rule per category is saved, so the condition row lists every category the admin picked.
    const categoriesToMatchDisplayName = hasCategoryCondition ? categoriesToMatch.map(getDecodedCategoryName).join(', ') : undefined;
    const categoryDisplayName = form?.category ? getDecodedCategoryName(form.category) : undefined;
    // Only a rate the workspace still has. A rule keeps the ID of a deleted rate, and `getTaxRateDisplayName` falls
    // back to it so the table can hold the ID until the tax list hydrates. Here that would print the raw ID at the
    // admin, so the row reads as unset instead and they can pick a rate that exists.
    const taxRateID = isCategoryRule ? categoryTaxID : form?.tax;
    const isTaxRateStillOnPolicy = !!taxRateID && !!policy?.taxRates?.taxes?.[taxRateID];
    const taxDisplayName = (isTaxRateStillOnPolicy ? getTaxRateDisplayName(policy, taxRateID) : '') || undefined;

    /**
     * Checks if there's a duplicate rule with the same merchant name and match type.
     * A duplicate is a rule that has the same merchant to match AND the same match type (contains/exact).
     * When editing, we exclude the current rule from the comparison.
     */
    const checkForDuplicateRule = (merchantToMatch: string | undefined, matchType: string | undefined): boolean => {
        if (!merchantToMatch) {
            return false;
        }

        const normalizedMerchant = merchantToMatch.toLowerCase();
        const currentMatchType = matchType ?? CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS;

        return getPolicyExpenseDefaultRules(rules, policyID).some(({ruleID: existingRuleID, rule}) => {
            // Skip the rule being edited
            if (isEditing && existingRuleID === ruleID) {
                return false;
            }

            // A rule this form can't represent can't be a duplicate of what this form is about to save.
            const existingFormValues = getMerchantRuleFormValues(rule);
            if (!existingFormValues) {
                return false;
            }

            if (existingFormValues.merchantToMatch.toLowerCase() !== normalizedMerchant || existingFormValues.matchType !== currentMatchType) {
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

    const errorMessage = isCategoryRule ? getCategoryRuleErrorMessage(translate, categoryTaxID, form) : getErrorMessage(translate, isRulesRevampEnabled, form);

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

        // Category rules are stored as `policy.rules.expenseRules`, the same objects Expensify Classic reads, so that a
        // default tax rate set here is the one Classic already understands.
        if (isCategoryRule) {
            if (!hasCategoryCondition || !categoryTaxID) {
                return;
            }
            // Editing is single-select, so a move has exactly one destination. It clears the old category and sets the
            // new one as a pair, sharing one rollback so a failed move can't drop both rules.
            const movedToCategory = editCategoryTaxRuleFor && !categoriesToMatch.includes(editCategoryTaxRuleFor) ? categoriesToMatch.at(0) : undefined;
            setIsClosing(true);
            if (editCategoryTaxRuleFor && movedToCategory) {
                movePolicyCategoryTax(policy, editCategoryTaxRuleFor, movedToCategory, categoryTaxID);
            } else {
                // The command is per-category, so a bulk selection saves one rule for each category picked.
                setPolicyCategoryTaxes(policy, categoriesToMatch, categoryTaxID);
            }
            if (isEditingCategoryTaxRule) {
                Navigation.goBack();
            } else {
                goBackToExpenseDefaults();
            }
            return;
        }

        setMerchantRule(policyID, form, policy, ruleID, existingRule, shouldUpdateMatchingTransactions);
        if (!isEditing && isRulesRevampEnabled) {
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

        // A category rule matches on a category that the picker already excluded if it had a rule, so there is no
        // duplicate to warn about.
        if (isCategoryRule) {
            startWithLoading(() => saveRule());
            return;
        }

        // Check for duplicate rules
        const hasDuplicate = checkForDuplicateRule(form.merchantToMatch, form.matchType);
        if (hasDuplicate) {
            showConfirmModal({
                title: translate('workspace.rules.merchantRules.duplicateRuleTitle'),
                prompt: translate('workspace.rules.merchantRules.duplicateRulePrompt', form.merchantToMatch ?? ''),
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

    const handleDelete = () => {
        if (!canWriteRules) {
            return;
        }
        if (!policy) {
            return;
        }
        if (!ruleID && !editCategoryTaxRuleFor) {
            return;
        }

        showConfirmModal({
            title: translate('workspace.rules.merchantRules.deleteRule'),
            prompt: translate('workspace.rules.merchantRules.deleteRuleConfirmation'),
            confirmText: translate('common.delete'),
            cancelText: translate('common.cancel'),
            buttonVariant: CONST.BUTTON_VARIANT.DANGER,
        }).then((result) => {
            if (result.action !== ModalActions.CONFIRM) {
                return;
            }
            setIsClosing(true);
            if (editCategoryTaxRuleFor) {
                deletePolicyCategoryTax(policy, editCategoryTaxRuleFor);
            } else if (ruleID) {
                deleteMerchantRule(ruleID, existingRule);
            }
            Navigation.goBack();
        });
    };

    const sections: SectionType[] = [
        {
            titleTranslationKey: 'workspace.rules.merchantRules.expensesWith',
            items: [
                isScopedToCategory
                    ? undefined
                    : {
                          key: 'merchantToMatch',
                          description: translate('common.merchant'),
                          // The rule's only condition, since the type is chosen before this page opens.
                          required: true,
                          title: form?.merchantToMatch,
                          onPress: () => Navigation.navigate(ROUTES.RULES_MERCHANT_MERCHANT_TO_MATCH.getRoute(policyID, ruleID)),
                          icon: getItemIcon(icons.Basket),
                      },
                isRulesRevampEnabled && isScopedToCategory
                    ? {
                          key: 'categoriesToMatch',
                          description: translate('common.category'),
                          required: true,
                          title: categoriesToMatchDisplayName,
                          onPress: () => Navigation.navigate(ROUTES.RULES_CATEGORY_TO_MATCH.getRoute(policyID, ruleID, editCategoryTaxRuleFor)),
                          icon: getItemIcon(icons.Folder),
                      }
                    : undefined,
            ],
        },
        {
            titleTranslationKey: 'workspace.rules.merchantRules.applyUpdates',
            items: [
                {
                    key: 'merchant',
                    description: translate('common.merchant'),
                    title: form?.merchant,
                    onPress: () => Navigation.navigate(ROUTES.RULES_MERCHANT_MERCHANT.getRoute(policyID, ruleID)),
                    icon: getItemIcon(icons.Basket),
                },
                hasCategories()
                    ? {
                          key: 'category',
                          description: translate('common.category'),
                          title: categoryDisplayName,
                          onPress: () => Navigation.navigate(ROUTES.RULES_MERCHANT_CATEGORY.getRoute(policyID, ruleID)),
                          icon: getItemIcon(icons.Folder),
                      }
                    : undefined,
                ...(hasTags()
                    ? policyTags
                          .filter(({orderWeight, tags}) => !!formTags.at(orderWeight) || getEnabledTags(tags, form?.tag ?? '', orderWeight).length > 0)
                          .map(({name, orderWeight}) => {
                              const formTag = formTags.at(orderWeight);
                              return {
                                  key: `tag-${name}-${orderWeight}`,
                                  description: name,
                                  title: formTag ? getCleanedTagName(formTag) : undefined,
                                  onPress: () => Navigation.navigate(ROUTES.RULES_MERCHANT_TAG.getRoute(policyID, ruleID, orderWeight)),
                                  icon: getItemIcon(icons.Tag),
                              };
                          })
                    : []),
                // Tax is a category rule's only default, so the row stays with taxes off rather than leaving the
                // section blank. The picker then explains that taxes are disabled.
                hasUsableTaxRates(policy) || isCategoryRule
                    ? {
                          key: 'tax',
                          description: translate('common.tax'),
                          title: taxDisplayName,
                          onPress: () => Navigation.navigate(ROUTES.RULES_MERCHANT_TAX.getRoute(policyID, ruleID, editCategoryTaxRuleFor)),
                          icon: getItemIcon(icons.InvoiceGeneric),
                      }
                    : undefined,
                isVendorFeatureEnabled
                    ? {
                          key: 'vendorID',
                          description: vendorFieldLabel,
                          title: vendorDisplayName,
                          onPress: () => Navigation.navigate(ROUTES.RULES_MERCHANT_VENDOR.getRoute(policyID, ruleID)),
                          icon: getItemIcon(icons.Basket),
                      }
                    : undefined,
                {
                    key: 'description',
                    description: translate('common.description'),
                    title: form?.comment ? Parser.replace(form.comment) : undefined,
                    onPress: () => Navigation.navigate(ROUTES.RULES_MERCHANT_DESCRIPTION.getRoute(policyID, ruleID)),
                    shouldRenderAsHTML: true,
                    icon: getItemIcon(icons.Pencil),
                },
                {
                    key: 'reimbursable',
                    description: translate('common.reimbursable'),
                    title: getBooleanTitle(form?.reimbursable, translate),
                    onPress: () => Navigation.navigate(ROUTES.RULES_MERCHANT_REIMBURSABLE.getRoute(policyID, ruleID)),
                    icon: getItemIcon(icons.Paycheck),
                },
                isBillableEnabled
                    ? {
                          key: 'billable',
                          description: translate('common.billable'),
                          title: getBooleanTitle(form?.billable, translate),
                          onPress: () => Navigation.navigate(ROUTES.RULES_MERCHANT_BILLABLE.getRoute(policyID, ruleID)),
                          icon: getItemIcon(icons.Paycheck),
                      }
                    : undefined,
                // Tax is the only default a category rule can set, so the other rows are dropped rather than shown.
            ].filter((item) => !isCategoryRule || item?.key === 'tax'),
        },
    ];

    const previewMatches = () => {
        if (!form?.merchantToMatch?.trim()) {
            setShouldShowError(true);
            return;
        }

        Navigation.navigate(ROUTES.RULES_MERCHANT_PREVIEW_MATCHES.getRoute(policyID, ruleID));
    };

    if (ruleID && !existingRule && !isClosing) {
        return <NotFoundPage />;
    }

    if (isEditingCategoryTaxRule && !existingCategoryTaxID && !isClosing) {
        return <NotFoundPage />;
    }

    // A saved rule stays readable without write access, so only creating one is gated. `isEditing` alone would miss a
    // category rule, which is keyed by its category and so carries no ruleID, and send auditors to a not-found page.
    if (!isEditingSavedRule && !!policy && !canWriteRules) {
        return <NotFoundPage />;
    }

    const footer = canWriteRules ? (
        <FormAlertWithSubmitButton
            buttonText={translate('workspace.rules.merchantRules.saveRule')}
            containerStyles={[styles.m4, styles.mb5, isRulesRevampEnabled && styles.mh5]}
            isAlertVisible={shouldShowError && !!errorMessage}
            message={errorMessage}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            shouldShowLoadingImmediatelyOnPress={false}
            enabledWhenOffline
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.MERCHANT_RULE_SAVE}
            shouldRenderFooterAboveSubmit
            footerContent={
                <>
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.mb4]}>
                        <Text
                            style={[styles.textNormal]}
                            accessible={false}
                            aria-hidden
                        >
                            {translate('workspace.rules.merchantRules.applyToExistingUnsubmittedExpenses')}
                        </Text>
                        {/* A category tax default only applies to expenses created after the rule is saved, so the switch
                            is locked off. `disabled` draws the lock inside the thumb and routes the press to the explainer. */}
                        <Switch
                            accessibilityLabel={translate('workspace.rules.merchantRules.applyToExistingUnsubmittedExpenses')}
                            isOn={!isCategoryRule && shouldUpdateMatchingTransactions}
                            onToggle={setShouldUpdateMatchingTransactions}
                            disabled={isCategoryRule}
                            disabledAction={isCategoryRule ? showCategoryRulesApplyGoingForwardExplainer : undefined}
                        />
                    </View>
                    {/* There is no set of existing expenses for a category rule to preview, so the button is hidden rather than locked. */}
                    {!isCategoryRule && (
                        <Button
                            size={CONST.BUTTON_SIZE.LARGE}
                            onPress={previewMatches}
                            style={[styles.mb4]}
                            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.MERCHANT_RULE_PREVIEW_MATCHES}
                        >
                            <Button.Text>{translate('workspace.rules.merchantRules.previewMatches')}</Button.Text>
                        </Button>
                    )}
                    {(isEditing || canDeleteCategoryTaxRule) && (
                        <Button
                            size={CONST.BUTTON_SIZE.LARGE}
                            onPress={handleDelete}
                            style={[styles.mb4]}
                            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.MERCHANT_RULE_DELETE}
                        >
                            <Button.Text>{translate('workspace.rules.merchantRules.deleteRule')}</Button.Text>
                        </Button>
                    )}
                </>
            }
        />
    ) : null;

    const renderSectionItem = (item: SectionItemType) => (
        <MenuItemWithTopDescription
            key={item.key}
            description={item.description}
            errorText={canWriteRules && shouldShowError && item.required && !item.title ? translate('common.error.fieldRequired') : ''}
            onPress={canWriteRules ? item.onPress : undefined}
            rightLabel={canWriteRules && item.required ? translate('common.required') : undefined}
            shouldShowRightIcon={canWriteRules}
            interactive={canWriteRules}
            title={item.title}
            numberOfLinesTitle={isRulesRevampEnabled ? 2 : undefined}
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

    const renderSections = () =>
        sections.map((section, sectionIndex) => (
            <View key={section.titleTranslationKey}>
                {isRulesRevampEnabled ? (
                    sectionIndex > 0 && (
                        <>
                            <View style={[styles.sectionDividerLine, styles.mh5, styles.mv3]} />
                            <Text style={[styles.textLabel, styles.textStrong, styles.lh16, styles.ph5, styles.pv3]}>
                                {translate('workspace.rules.merchantRules.thenApplyFollowingDefaults')}
                            </Text>
                        </>
                    )
                ) : (
                    <Text style={[styles.textHeadlineH2, styles.reportHorizontalRule, styles.mt4, styles.mb2]}>{translate(section.titleTranslationKey)}</Text>
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
                <HeaderWithBackButton title={translate(isRulesRevampEnabled ? 'workspace.rules.merchantRules.expenseDefaultsTitle' : titleKey)}>
                    {/* Only while a condition is set, and only on an unsaved rule: resetting a saved one would let it
                        switch condition type, which the two storage shapes can't express as one edit. */}
                    {canWriteRules && isRulesRevampEnabled && !isEditingSavedRule && (hasMerchantCondition || hasCategoryCondition) && (
                        <TextLink onPress={resetRule}>{translate('common.reset')}</TextLink>
                    )}
                </HeaderWithBackButton>
                <ScrollView contentContainerStyle={[styles.flexGrow1]}>
                    {isRulesRevampEnabled && (
                        <View style={[styles.ph5, styles.pv3, styles.gap6]}>
                            <Text style={[styles.textNormal, styles.textSupporting]}>{translate('workspace.rules.merchantRules.expenseDefaultsSubtitle')}</Text>
                            <Text style={[styles.textLabel, styles.textStrong, styles.lh16]}>{translate('workspace.rules.merchantRules.ifAnyExpenseMatches')}</Text>
                        </View>
                    )}
                    {renderSections()}
                    {isInLandscapeMode && footer}
                </ScrollView>
                {!isInLandscapeMode && footer}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

MerchantRulePageBase.displayName = 'MerchantRulePageBase';

export default MerchantRulePageBase;
