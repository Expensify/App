import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import RuleNotFoundPageWrapper from '@components/Rule/RuleNotFoundPageWrapper';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearDraftRule, setNameValuePair, updateDraftRule} from '@libs/actions/User';
import {getAvailableNonPersonalPolicyCategories, getDecodedCategoryName} from '@libs/CategoryUtils';
import {extractRuleFromForm, getKeyForRule} from '@libs/ExpenseRuleUtils';
import Navigation from '@libs/Navigation/Navigation';
import Parser from '@libs/Parser';
import {getAllTaxRatesNamesAndValues, getCleanedTagName, getTagNamesFromTagsLists} from '@libs/PolicyUtils';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ExpenseRuleForm} from '@src/types/form';
import type {ExpenseRule, PolicyCategories, PolicyTagLists} from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';

type RulePageBaseProps = {
    titleKey: TranslationPaths;
    testID: string;
    hash?: string;
};

type SectionItemType = {
    descriptionTranslationKey: TranslationPaths;
    required?: boolean;
    title?: string;
    onPress: () => void;
    shouldRenderAsHTML?: boolean;
};

type SectionType = {
    titleTranslationKey: TranslationPaths;
    items: Array<SectionItemType | undefined>;
};

const navigateTo = (field: ValueOf<typeof CONST.EXPENSE_RULES.FIELDS>, hash?: string) => {
    if (hash) {
        Navigation.navigate(ROUTES.SETTINGS_RULES_EDIT.getRoute(hash, field));
    } else {
        Navigation.navigate(ROUTES.SETTINGS_RULES_ADD.getRoute(field));
    }
};

const getErrorMessage = (translate: LocalizedTranslate, form?: ExpenseRuleForm) => {
    const hasAtLeastOneUpdate = Object.entries(form ?? {}).some(([key, value]) => key !== CONST.EXPENSE_RULES.FIELDS.MERCHANT && key !== CONST.EXPENSE_RULES.FIELDS.CREATE_REPORT && !!value);
    if (form?.merchantToMatch && hasAtLeastOneUpdate) {
        return '';
    }
    if (hasAtLeastOneUpdate) {
        return translate('expenseRulesPage.addRule.confirmErrorMerchant');
    }
    if (form?.merchantToMatch) {
        return translate('expenseRulesPage.addRule.confirmErrorUpdate');
    }
    return translate('expenseRulesPage.addRule.confirmError');
};

const tagsSelector = (allPolicyTagLists: OnyxCollection<PolicyTagLists>) => {
    const tagListsUnpacked = Object.values(allPolicyTagLists ?? {}).filter((item) => !!item);
    return tagListsUnpacked.map(getTagNamesFromTagsLists).flat().length > 0;
};

function RulePageBase({titleKey, testID, hash}: RulePageBaseProps) {
    const {translate} = useLocalize();
    const [expenseRules = getEmptyArray<ExpenseRule>()] = useOnyx(ONYXKEYS.NVP_EXPENSE_RULES, {canBeMissing: true});
    const [form] = useOnyx(ONYXKEYS.FORMS.EXPENSE_RULE_FORM, {canBeMissing: true});
    // Cannot use useRef because react compiler fails
    const [isSaving, setIsSaving] = useState(false);
    const [shouldShowError, setShouldShowError] = useState(false);
    const styles = useThemeStyles();

    useEffect(() => () => clearDraftRule(), []);

    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID, {canBeMissing: true});
    const categoriesSelector = useCallback(
        (allPolicyCategories: OnyxCollection<PolicyCategories>) => {
            const categories = getAvailableNonPersonalPolicyCategories(allPolicyCategories, personalPolicyID);
            return Object.values(categories ?? {}).flatMap((policyCategories) => Object.values(policyCategories ?? {})).length > 0;
        },
        [personalPolicyID],
    );
    const [hasPolicyCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES, {
        canBeMissing: true,
        selector: categoriesSelector,
    });
    const [hasPolicyTags] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS, {
        canBeMissing: true,
        selector: tagsSelector,
    });

    const [allTaxRates] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        canBeMissing: true,
        selector: getAllTaxRatesNamesAndValues,
    });
    const hasTaxRates = Object.keys(allTaxRates ?? {}).length > 0;
    const selectedTaxRate = form?.tax ? allTaxRates?.[form.tax] : undefined;

    const errorMessage = getErrorMessage(translate, form);

    const handleSubmit = () => {
        if (errorMessage) {
            setShouldShowError(true);
            return;
        }
        if (!form) {
            return;
        }

        setIsSaving(true);

        const newRule = extractRuleFromForm(form, selectedTaxRate);
        let newRules;
        if (hash) {
            let isUpdated = false;
            newRules = expenseRules.map((rule) => {
                if (!isUpdated && getKeyForRule(rule) === hash) {
                    isUpdated = true;
                    return newRule;
                }
                return rule;
            });
        } else {
            newRules = [...expenseRules, newRule];
        }
        setNameValuePair(ONYXKEYS.NVP_EXPENSE_RULES, newRules, expenseRules);

        Navigation.goBack();
    };

    const sections: SectionType[] = [
        {
            titleTranslationKey: 'expenseRulesPage.addRule.expenseContains',
            items: [
                {
                    descriptionTranslationKey: 'common.merchant',
                    required: true,
                    title: form?.merchantToMatch,
                    onPress: () => navigateTo(CONST.EXPENSE_RULES.FIELDS.MERCHANT, hash),
                },
            ],
        },
        {
            titleTranslationKey: 'expenseRulesPage.addRule.applyUpdates',
            items: [
                {
                    descriptionTranslationKey: 'common.merchant',
                    title: form?.merchant,
                    onPress: () => navigateTo(CONST.EXPENSE_RULES.FIELDS.RENAME_MERCHANT, hash),
                },
                hasPolicyCategories
                    ? {
                          descriptionTranslationKey: 'common.category',
                          title: form?.category ? getDecodedCategoryName(form.category) : undefined,
                          onPress: () => navigateTo(CONST.EXPENSE_RULES.FIELDS.CATEGORY, hash),
                      }
                    : undefined,
                hasPolicyTags
                    ? {
                          descriptionTranslationKey: 'common.tag',
                          title: form?.tag ? getCleanedTagName(form.tag) : undefined,
                          onPress: () => navigateTo(CONST.EXPENSE_RULES.FIELDS.TAG, hash),
                      }
                    : undefined,
                hasTaxRates
                    ? {
                          descriptionTranslationKey: 'common.tax',
                          title: selectedTaxRate ? `${selectedTaxRate.name} (${selectedTaxRate.value})` : undefined,
                          onPress: () => navigateTo(CONST.EXPENSE_RULES.FIELDS.TAX, hash),
                      }
                    : undefined,
                {
                    descriptionTranslationKey: 'common.description',
                    // Convert markdown to HTML for display
                    title: form?.comment ? Parser.replace(form.comment) : undefined,
                    onPress: () => navigateTo(CONST.EXPENSE_RULES.FIELDS.DESCRIPTION, hash),
                    shouldRenderAsHTML: true,
                },
                {
                    descriptionTranslationKey: 'common.reimbursable',
                    title: form?.reimbursable ? translate(form.reimbursable === 'true' ? 'common.yes' : 'common.no') : '',
                    onPress: () => navigateTo(CONST.EXPENSE_RULES.FIELDS.REIMBURSABLE, hash),
                },
                {
                    descriptionTranslationKey: 'common.billable',
                    title: form?.billable ? translate(form.billable === 'true' ? 'common.yes' : 'common.no') : '',
                    onPress: () => navigateTo(CONST.EXPENSE_RULES.FIELDS.BILLABLE, hash),
                },
                {
                    descriptionTranslationKey: 'expenseRulesPage.addRule.addToReport',
                    title: form?.report,
                    onPress: () => navigateTo(CONST.EXPENSE_RULES.FIELDS.REPORT, hash),
                },
            ],
        },
    ];

    return (
        <RuleNotFoundPageWrapper
            hash={hash}
            shouldPreventShow={isSaving}
        >
            <ScreenWrapper
                testID={testID}
                shouldShowOfflineIndicatorInWideScreen
                offlineIndicatorStyle={styles.mtAuto}
                includeSafeAreaPaddingBottom
            >
                <HeaderWithBackButton title={translate(titleKey)} />
                <ScrollView contentContainerStyle={[styles.flexGrow1]}>
                    {sections.map((section) => (
                        <View key={section.titleTranslationKey}>
                            <Text style={[styles.textHeadlineH2, styles.reportHorizontalRule, styles.mt4, styles.mb2]}>{translate(section.titleTranslationKey)}</Text>
                            {section.items.map((item) => {
                                if (!item) {
                                    return null;
                                }
                                return (
                                    <MenuItemWithTopDescription
                                        key={item.descriptionTranslationKey}
                                        description={translate(item.descriptionTranslationKey)}
                                        errorText={shouldShowError && item.required && !item.title ? translate('common.error.fieldRequired') : ''}
                                        onPress={item.onPress}
                                        rightLabel={item.required ? translate('common.required') : undefined}
                                        shouldShowRightIcon
                                        title={item.title}
                                        titleStyle={styles.flex1}
                                        shouldRenderAsHTML={item.shouldRenderAsHTML}
                                    />
                                );
                            })}
                        </View>
                    ))}
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.ml5, styles.mr8, styles.optionRow]}>
                        <ToggleSettingOptionRow
                            isActive={form?.createReport ?? false}
                            onToggle={(isEnabled) => updateDraftRule({createReport: isEnabled})}
                            switchAccessibilityLabel={translate('expenseRulesPage.addRule.createReport')}
                            title={translate('expenseRulesPage.addRule.createReport')}
                            titleStyle={styles.pv2}
                            wrapperStyle={styles.flex1}
                        />
                    </View>
                </ScrollView>
                <FormAlertWithSubmitButton
                    buttonText={translate('expenseRulesPage.addRule.saveRule')}
                    containerStyles={[styles.m4, styles.mb5]}
                    isAlertVisible={shouldShowError && !!errorMessage}
                    message={errorMessage}
                    onSubmit={handleSubmit}
                    enabledWhenOffline
                />
            </ScreenWrapper>
        </RuleNotFoundPageWrapper>
    );
}

export default RulePageBase;
