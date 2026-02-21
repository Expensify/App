import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import Button from '@components/Button';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {deletePolicyCodingRule, setPolicyCodingRule} from '@libs/actions/Policy/Rules';
import {clearDraftMerchantRule, setDraftMerchantRule} from '@libs/actions/User';
import {getDecodedCategoryName} from '@libs/CategoryUtils';
import Navigation from '@libs/Navigation/Navigation';
import {hasEnabledOptions} from '@libs/OptionsListUtils';
import Parser from '@libs/Parser';
import {getCleanedTagName, getTagLists} from '@libs/PolicyUtils';
import {getEnabledTags} from '@libs/TagsOptionsListUtils';
import {getTagArrayFromName} from '@libs/TransactionUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {MerchantRuleForm} from '@src/types/form';
import type {PolicyTagLists} from '@src/types/onyx';
import type {CodingRule} from '@src/types/onyx/Policy';
import getEmptyArray from '@src/types/utils/getEmptyArray';

type MerchantRulePageBaseProps = {
    policyID: string;
    ruleID?: string;
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
};

type SectionType = {
    titleTranslationKey: 'workspace.rules.merchantRules.expensesWith' | 'workspace.rules.merchantRules.applyUpdates';
    items: Array<SectionItemType | undefined>;
};

const getBooleanTitle = (value: boolean | undefined, translate: LocalizedTranslate): string => {
    if (value === undefined) {
        return '';
    }
    return translate(value ? 'common.yes' : 'common.no');
};

const getErrorMessage = (translate: LocalizedTranslate, form?: MerchantRuleForm) => {
    const matchingCriteriaFields = new Set<string>([CONST.MERCHANT_RULES.FIELDS.MERCHANT_TO_MATCH, CONST.MERCHANT_RULES.FIELDS.MATCH_TYPE]);
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

function MerchantRulePageBase({policyID, ruleID, titleKey, testID}: MerchantRulePageBaseProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policy = usePolicy(policyID);
    const [isDeleting, setIsDeleting] = useState(false);
    const isEditing = !!ruleID;

    const [form] = useOnyx(ONYXKEYS.FORMS.MERCHANT_RULE_FORM, {canBeMissing: true});
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`, {canBeMissing: true});
    const [policyTags = getEmptyArray<ValueOf<PolicyTagLists>>()] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, {
        canBeMissing: true,
        selector: getTagLists,
    });
    const [shouldShowError, setShouldShowError] = useState(false);
    const {showConfirmModal} = useConfirmModal();
    const [shouldUpdateMatchingTransactions, setShouldUpdateMatchingTransactions] = useState(false);

    // Get the existing rule from the policy (for edit mode)
    const existingRule = ruleID ? policy?.rules?.codingRules?.[ruleID] : undefined;

    // Initialize the form with existing rule data (for edit mode)
    useEffect(() => {
        if (!isEditing || !existingRule) {
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
            comment: commentMarkdown,
            reimbursable: existingRule.reimbursable,
            billable: existingRule.billable,
        });
    }, [isEditing, existingRule]);

    // Clear the form on unmount
    useEffect(() => () => clearDraftMerchantRule(), []);

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

            return existingMerchant === normalizedMerchant && existingMatchType === currentMatchType;
        });
    };

    const errorMessage = getErrorMessage(translate, form);

    /**
     * Saves the rule to the backend and navigates back.
     */
    const saveRule = () => {
        if (!form) {
            return;
        }
        setPolicyCodingRule(policyID, form, policy, ruleID, shouldUpdateMatchingTransactions);
        Navigation.goBack();
    };

    const handleSubmit = () => {
        if (errorMessage) {
            setShouldShowError(true);
            return;
        }
        if (!form) {
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

        saveRule();
    };

    const handleDelete = () => {
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

    const sections: SectionType[] = [
        {
            titleTranslationKey: 'workspace.rules.merchantRules.expensesWith',
            items: [
                {
                    key: 'merchantToMatch',
                    description: translate('common.merchant'),
                    required: true,
                    title: form?.merchantToMatch,
                    onPress: () => Navigation.navigate(ROUTES.RULES_MERCHANT_MERCHANT_TO_MATCH.getRoute(policyID, ruleID)),
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
                    onPress: () => Navigation.navigate(ROUTES.RULES_MERCHANT_MERCHANT.getRoute(policyID, ruleID)),
                },
                hasCategories()
                    ? {
                          key: 'category',
                          description: translate('common.category'),
                          title: categoryDisplayName,
                          onPress: () => Navigation.navigate(ROUTES.RULES_MERCHANT_CATEGORY.getRoute(policyID, ruleID)),
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
                              };
                          })
                    : []),
                hasTaxes()
                    ? {
                          key: 'tax',
                          description: translate('common.tax'),
                          title: taxDisplayName(),
                          onPress: () => Navigation.navigate(ROUTES.RULES_MERCHANT_TAX.getRoute(policyID, ruleID)),
                      }
                    : undefined,
                {
                    key: 'description',
                    description: translate('common.description'),
                    title: form?.comment ? Parser.replace(form.comment) : undefined,
                    onPress: () => Navigation.navigate(ROUTES.RULES_MERCHANT_DESCRIPTION.getRoute(policyID, ruleID)),
                    shouldRenderAsHTML: true,
                },
                {
                    key: 'reimbursable',
                    description: translate('common.reimbursable'),
                    title: getBooleanTitle(form?.reimbursable, translate),
                    onPress: () => Navigation.navigate(ROUTES.RULES_MERCHANT_REIMBURSABLE.getRoute(policyID, ruleID)),
                },
                isBillableEnabled
                    ? {
                          key: 'billable',
                          description: translate('common.billable'),
                          title: getBooleanTitle(form?.billable, translate),
                          onPress: () => Navigation.navigate(ROUTES.RULES_MERCHANT_BILLABLE.getRoute(policyID, ruleID)),
                      }
                    : undefined,
            ],
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

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
        >
            <ScreenWrapper
                testID={testID}
                offlineIndicatorStyle={styles.mtAuto}
                includeSafeAreaPaddingBottom
            >
                <HeaderWithBackButton title={translate(titleKey)} />
                <ScrollView contentContainerStyle={[styles.flexGrow1]}>
                    {sections.map((section) => (
                        <View key={section.titleTranslationKey}>
                            <Text style={[styles.textHeadlineH2, styles.reportHorizontalRule, styles.mt4, styles.mb2]}>{translate(section.titleTranslationKey)}</Text>
                            {section.items
                                .filter((item): item is SectionItemType => !!item)
                                .map((item) => (
                                    <MenuItemWithTopDescription
                                        key={item.key}
                                        description={item.description}
                                        errorText={shouldShowError && item.required && !item.title ? translate('common.error.fieldRequired') : ''}
                                        onPress={item.onPress}
                                        rightLabel={item.required ? translate('common.required') : undefined}
                                        shouldShowRightIcon
                                        title={item.title}
                                        titleStyle={styles.flex1}
                                        shouldRenderAsHTML={item.shouldRenderAsHTML}
                                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.MERCHANT_RULE_SECTION_ITEM}
                                    />
                                ))}
                        </View>
                    ))}
                </ScrollView>
                <FormAlertWithSubmitButton
                    buttonText={translate('workspace.rules.merchantRules.saveRule')}
                    containerStyles={[styles.m4, styles.mb5]}
                    isAlertVisible={shouldShowError && !!errorMessage}
                    message={errorMessage}
                    onSubmit={handleSubmit}
                    enabledWhenOffline
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.MERCHANT_RULE_SAVE}
                    shouldRenderFooterAboveSubmit
                    footerContent={
                        <>
                            <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.mb4]}>
                                <Text style={[styles.textNormal]}>{translate('workspace.rules.merchantRules.applyToExistingUnsubmittedExpenses')}</Text>
                                <Switch
                                    accessibilityLabel={translate('workspace.rules.merchantRules.applyToExistingUnsubmittedExpenses')}
                                    isOn={shouldUpdateMatchingTransactions}
                                    onToggle={setShouldUpdateMatchingTransactions}
                                />
                            </View>
                            <Button
                                text={translate('workspace.rules.merchantRules.previewMatches')}
                                onPress={previewMatches}
                                style={[styles.mb4]}
                                large
                                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.MERCHANT_RULE_PREVIEW_MATCHES}
                            />
                            {isEditing && (
                                <Button
                                    text={translate('workspace.rules.merchantRules.deleteRule')}
                                    onPress={handleDelete}
                                    style={[styles.mb4]}
                                    large
                                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.MERCHANT_RULE_DELETE}
                                />
                            )}
                        </>
                    }
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

MerchantRulePageBase.displayName = 'MerchantRulePageBase';

export default MerchantRulePageBase;
