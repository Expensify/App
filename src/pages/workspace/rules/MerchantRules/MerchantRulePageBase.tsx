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

import {openPolicyCategoriesPage, setPolicyCategoryTax} from '@libs/actions/Policy/Category';
import {deletePolicyCodingRule, setPolicyCodingRule} from '@libs/actions/Policy/Rules';
import {openPolicyTagsPage} from '@libs/actions/Policy/Tag';
import Tab from '@libs/actions/Tab';
import {clearDraftMerchantRule, setDraftMerchantRule} from '@libs/actions/User';
import {getCategoryTaxRuleTaxID} from '@libs/CategoryTaxRulesUtils';
import {getDecodedCategoryName} from '@libs/CategoryUtils';
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
import type {PolicyTagLists} from '@src/types/onyx';
import type {CodingRule} from '@src/types/onyx/Policy';
import getEmptyArray from '@src/types/utils/getEmptyArray';
import type IconAsset from '@src/types/utils/IconAsset';

import type {ValueOf} from 'type-fest';

import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';

type MerchantRulePageBaseProps = {
    policyID: string;
    ruleID?: string;
    /** Pre-scopes the category default when creating a rule (e.g. from the category details RHP). */
    initialCategoryName?: string;
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
    /** Renders the lock icon in place of the chevron. `onPress` then opens the explainer rather than a picker. */
    isLocked?: boolean;
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

/** A category rule matches on a category and can only set a tax, so both halves are required and nothing else counts. */
const getCategoryRuleErrorMessage = (translate: LocalizedTranslate, form?: MerchantRuleForm) => {
    if (!form?.categoryToMatch) {
        return translate('workspace.rules.merchantRules.confirmErrorCategory');
    }
    if (!form?.tax) {
        return translate('workspace.rules.merchantRules.confirmErrorCategoryTax');
    }
    return '';
};

const getErrorMessage = (translate: LocalizedTranslate, form?: MerchantRuleForm) => {
    const matchingCriteriaFields = new Set<string>([MERCHANT_RULE_INPUT_IDS.MERCHANT_TO_MATCH, MERCHANT_RULE_INPUT_IDS.MATCH_TYPE, MERCHANT_RULE_INPUT_IDS.CATEGORY_TO_MATCH]);
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
        return translate('workspace.rules.merchantRules.confirmErrorMerchant');
    }
    if (form?.merchantToMatch) {
        return translate('workspace.rules.merchantRules.confirmErrorUpdate');
    }
    return translate('workspace.rules.merchantRules.confirmError');
};

function MerchantRulePageBase({policyID, ruleID, initialCategoryName, editCategoryTaxRuleFor, titleKey, testID}: MerchantRulePageBaseProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policy = usePolicy(policyID);
    const {canWrite: canWriteRules} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.RULES);
    const [isDeleting, setIsDeleting] = useState(false);
    const {isLoading, startWithLoading} = usePressLoading();
    const isEditing = !!ruleID;
    const isEditingCategoryTaxRule = !!editCategoryTaxRuleFor;
    const isInLandscapeMode = useIsInLandscapeMode();
    const {isBetaEnabled} = usePermissions();
    const isRulesRevampEnabled = isBetaEnabled(CONST.BETAS.RULES_REVAMP);
    const icons = useMemoizedLazyExpensifyIcons(['Basket', 'Folder', 'Pencil', 'InvoiceGeneric', 'Tag', 'Paycheck', 'Lock']);
    const getItemIcon = (icon: IconAsset) => (isRulesRevampEnabled ? icon : undefined);

    const [form] = useOnyx(ONYXKEYS.FORMS.MERCHANT_RULE_FORM);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const [policyTagsFromOnyx] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`);
    const policyTags = useMemo(() => getTagLists(policyTagsFromOnyx) ?? getEmptyArray<ValueOf<PolicyTagLists>>(), [policyTagsFromOnyx]);
    const [shouldShowError, setShouldShowError] = useState(false);
    const {showConfirmModal} = useConfirmModal();
    const [shouldUpdateMatchingTransactions, setShouldUpdateMatchingTransactions] = useState(false);
    const didInitializeCreateDraftRef = useRef(false);

    // The "Set vendor to" row gate below reads policy.connections (via hasVendorFeature and
    // isMatchingVendorListLoaded), which is empty on a non-active workspace until a page requiring
    // connections is opened. This editor only fetches categories and tags, so prefetch connections
    // here unconditionally so the row appears and resolves the stored vendor once connections
    // hydrate. It can't be narrowed by hasVendorFeature, because that itself depends on the
    // connection data being fetched. The hook already skips the fetch when the app is offline, when
    // the workspace has no accounting connection, and when the data has already been fetched.
    usePolicyConnectionsPrefetch(policy, true);

    // Get the existing rule from the policy (for edit mode)
    const existingRule = ruleID ? policy?.rules?.codingRules?.[ruleID] : undefined;
    const existingCategoryTaxID = editCategoryTaxRuleFor ? getCategoryTaxRuleTaxID(policy?.rules?.expenseRules, editCategoryTaxRuleFor) : undefined;

    // Initialize the form with existing rule data (for edit mode), or a pre-scoped category for create
    useEffect(() => {
        if (isEditingCategoryTaxRule) {
            if (!existingCategoryTaxID) {
                return;
            }
            setDraftMerchantRule({categoryToMatch: editCategoryTaxRuleFor, tax: existingCategoryTaxID});
            return;
        }

        if (isEditing) {
            if (!existingRule) {
                return;
            }
            // Convert the operator to matchType for the form
            // 'eq' = exact match, 'contains' = contains match
            const matchType = existingRule.filters?.operator;
            // Convert HTML comment back to markdown for editing
            const commentMarkdown = existingRule.comment ? Parser.htmlToMarkdown(existingRule.comment) : undefined;
            setDraftMerchantRule({
                merchantToMatch: existingRule.filters?.right,
                matchType,
                merchant: existingRule.merchant,
                category: existingRule.category,
                tag: existingRule.tag,
                tax: existingRule.tax?.field_id_TAX?.externalID,
                vendorID: existingRule.vendorID,
                comment: commentMarkdown,
                reimbursable: existingRule.reimbursable,
                billable: existingRule.billable,
            });
            return;
        }

        if (!initialCategoryName || didInitializeCreateDraftRef.current) {
            return;
        }

        didInitializeCreateDraftRef.current = true;
        setDraftMerchantRule({category: initialCategoryName});
    }, [isEditing, existingRule, initialCategoryName, isEditingCategoryTaxRule, editCategoryTaxRuleFor, existingCategoryTaxID]);

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

    const hasTaxes = () => {
        if (!policy?.tax?.trackingEnabled) {
            return false;
        }
        return Object.keys(policy?.taxRates?.taxes ?? {}).length > 0;
    };

    const isBillableEnabled = policy?.disabledFields?.defaultBillable !== true;

    const isVendorFeatureEnabled = hasVendorFeature(policy, isBetaEnabled(CONST.BETAS.VENDOR_MATCHING));
    const isOnXero = isXeroActiveMatchingSource(policy);
    const vendorFieldLabel = translate(isOnXero ? 'common.supplier' : 'common.vendor');
    const unavailableLabel = translate(isOnXero ? 'workspace.rules.merchantRules.supplierUnavailable' : 'workspace.rules.merchantRules.vendorUnavailable');
    const vendorDisplayName = form?.vendorID ? getVendorRuleDisplayValue(policy, form.vendorID, unavailableLabel) : undefined;

    // `Expense defaults` has not been migrated to the new rules system, so a rule can only carry one condition.
    // Setting either condition locks the other, and a category condition also narrows the defaults down to tax alone.
    const areTaxesEnabled = hasTaxes();
    const hasCategoryCondition = !!form?.categoryToMatch;
    const hasMerchantCondition = !!form?.merchantToMatch;
    const isCategoryRule = hasCategoryCondition || isEditingCategoryTaxRule;
    const isMerchantConditionLocked = hasCategoryCondition;
    // A category rule sets a tax rate, so with taxes off there is nothing for it to configure.
    const isCategoryConditionLocked = isEditingCategoryTaxRule || hasMerchantCondition || !areTaxesEnabled;

    const showExplainer = (explainerTitleKey: TranslationPaths, explainerPromptKey: TranslationPaths) => {
        showConfirmModal({
            title: translate(explainerTitleKey),
            prompt: translate(explainerPromptKey),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
        });
    };

    const showCategoryConditionExplainer = () => {
        if (!areTaxesEnabled) {
            showExplainer('workspace.rules.merchantRules.turnOnTaxesFirstTitle', 'workspace.rules.merchantRules.turnOnTaxesFirstPrompt');
            return;
        }
        showExplainer('workspace.rules.merchantRules.oneConditionPerRuleTitle', 'workspace.rules.merchantRules.alreadyMatchesMerchantPrompt');
    };

    const showMerchantConditionExplainer = () => showExplainer('workspace.rules.merchantRules.oneConditionPerRuleTitle', 'workspace.rules.merchantRules.alreadyMatchesCategoryPrompt');

    const showCategoryOnlyTaxExplainer = () => showExplainer('workspace.rules.merchantRules.onlyTaxForCategoryRulesTitle', 'workspace.rules.merchantRules.onlyTaxForCategoryRulesPrompt');

    const showCategoryRulesApplyGoingForwardExplainer = () =>
        showExplainer('workspace.rules.merchantRules.categoryRulesApplyGoingForwardTitle', 'workspace.rules.merchantRules.categoryRulesApplyGoingForwardPrompt');

    /** Clears both conditions and every default, unlocking every row. */
    const resetRule = () => {
        setDraftMerchantRule({});
        setShouldShowError(false);
        setShouldUpdateMatchingTransactions(false);
    };

    const categoryToMatchDisplayName = form?.categoryToMatch ? getDecodedCategoryName(form.categoryToMatch) : undefined;
    const categoryDisplayName = form?.category ? getDecodedCategoryName(form.category) : undefined;
    const taxDisplayName = () => {
        if (!form?.tax || !policy?.taxRates?.taxes) {
            return undefined;
        }
        const tax = policy.taxRates.taxes[form.tax];
        return tax ? `${tax.name} (${tax.value})` : undefined;
    };

    /**
     * Checks if there's a duplicate rule with the same merchant name and match type.
     * A duplicate is a rule that has the same merchant to match AND the same match type (contains/exact).
     * When editing, we exclude the current rule from the comparison.
     */
    const checkForDuplicateRule = (codingRules: Record<string, CodingRule> | undefined, merchantToMatch: string | undefined, matchType: string | undefined): boolean => {
        if (!codingRules || !merchantToMatch) {
            return false;
        }

        const normalizedMerchant = merchantToMatch.toLowerCase();
        const currentMatchType = matchType ?? CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS;
        const defaultMatchType = CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS;

        return Object.entries(codingRules).some(([existingRuleID, rule]) => {
            // Skip the rule being edited
            if (isEditing && existingRuleID === ruleID) {
                return false;
            }

            if (!rule?.filters?.right) {
                return false;
            }

            const existingMerchant = rule.filters.right.toLowerCase();
            const existingMatchType = rule.filters.operator ?? defaultMatchType;

            if (existingMerchant !== normalizedMerchant || existingMatchType !== currentMatchType) {
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

    const errorMessage = isCategoryRule ? getCategoryRuleErrorMessage(translate, form) : getErrorMessage(translate, form);

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
            if (!form.categoryToMatch || !form.tax) {
                return;
            }
            setPolicyCategoryTax(policy, form.categoryToMatch, form.tax);
            if (isEditingCategoryTaxRule) {
                Navigation.goBack();
            } else {
                goBackToExpenseDefaults();
            }
            return;
        }

        setPolicyCodingRule(policyID, form, policy, ruleID, shouldUpdateMatchingTransactions);
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
        const hasDuplicate = checkForDuplicateRule(policy?.rules?.codingRules, form.merchantToMatch, form.matchType);
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
        if (!ruleID || !policy) {
            return;
        }

        showConfirmModal({
            title: translate('workspace.rules.merchantRules.deleteRule'),
            prompt: translate('workspace.rules.merchantRules.deleteRuleConfirmation'),
            confirmText: translate('common.delete'),
            cancelText: translate('common.cancel'),
            danger: true,
        }).then((result) => {
            if (result.action !== ModalActions.CONFIRM) {
                return;
            }
            setIsDeleting(true);
            deletePolicyCodingRule(policy, ruleID);
            Navigation.goBack();
        });
    };

    /** Locks a default row that a category rule can't set, so selecting it explains why instead of opening a picker. */
    const withCategoryRuleLock = (item: SectionItemType): SectionItemType => {
        if (!isCategoryRule) {
            return item;
        }
        return {...item, title: undefined, isLocked: true, onPress: showCategoryOnlyTaxExplainer};
    };

    const sections: SectionType[] = [
        {
            titleTranslationKey: 'workspace.rules.merchantRules.expensesWith',
            items: [
                {
                    key: 'merchantToMatch',
                    description: translate('common.merchant'),
                    // Exactly one condition is required, so neither row can be marked required on its own.
                    required: !isRulesRevampEnabled,
                    title: form?.merchantToMatch,
                    isLocked: isMerchantConditionLocked,
                    onPress: isMerchantConditionLocked ? showMerchantConditionExplainer : () => Navigation.navigate(ROUTES.RULES_MERCHANT_MERCHANT_TO_MATCH.getRoute(policyID, ruleID)),
                    icon: getItemIcon(icons.Basket),
                },
                isRulesRevampEnabled
                    ? {
                          key: 'categoryToMatch',
                          description: translate('common.category'),
                          title: categoryToMatchDisplayName,
                          isLocked: isCategoryConditionLocked,
                          onPress: isCategoryConditionLocked ? showCategoryConditionExplainer : () => Navigation.navigate(ROUTES.RULES_CATEGORY_TO_MATCH.getRoute(policyID, ruleID)),
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
                hasTaxes()
                    ? {
                          key: 'tax',
                          description: translate('common.tax'),
                          title: taxDisplayName(),
                          onPress: () => Navigation.navigate(ROUTES.RULES_MERCHANT_TAX.getRoute(policyID, ruleID)),
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
                // Tax is the only default a category rule can set, so every other row locks behind the explainer.
            ].map((item) => (!item || item.key === 'tax' ? item : withCategoryRuleLock(item))),
        },
    ];

    const previewMatches = () => {
        if (!form?.merchantToMatch?.trim()) {
            setShouldShowError(true);
            return;
        }

        Navigation.navigate(ROUTES.RULES_MERCHANT_PREVIEW_MATCHES.getRoute(policyID, ruleID));
    };

    if (ruleID && !existingRule && !isDeleting) {
        return <NotFoundPage />;
    }

    if (isEditingCategoryTaxRule && !existingCategoryTaxID) {
        return <NotFoundPage />;
    }

    if (!isEditing && !!policy && !canWriteRules) {
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
                    {isEditing && (
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
            iconRight={item.isLocked ? icons.Lock : undefined}
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
                            <Text style={[styles.textLabel, styles.textSupporting, styles.lh16, styles.ph5, styles.pv3]}>
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
                    {/* Reset only makes sense while a condition is set, and only on a rule that isn't already saved
                        against a category — an existing category rule is identified by its category. */}
                    {canWriteRules && isRulesRevampEnabled && !isEditingCategoryTaxRule && (hasMerchantCondition || hasCategoryCondition) && (
                        <TextLink onPress={resetRule}>{translate('common.reset')}</TextLink>
                    )}
                </HeaderWithBackButton>
                <ScrollView contentContainerStyle={[styles.flexGrow1]}>
                    {isRulesRevampEnabled && (
                        <View style={[styles.ph5, styles.pv3, styles.gap6]}>
                            <Text style={[styles.textNormal, styles.textSupporting]}>{translate('workspace.rules.merchantRules.expenseDefaultsSubtitle')}</Text>
                            <Text style={[styles.textLabel, styles.textSupporting, styles.lh16]}>{translate('workspace.rules.merchantRules.ifAnyExpenseMatches')}</Text>
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
