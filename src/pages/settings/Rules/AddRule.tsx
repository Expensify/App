import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {setNameValuePair, updateDraftRule} from '@libs/actions/User';
import {extractRuleFromForm, getKeyForRule} from '@libs/ExpenseRuleUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getAllTaxRatesNamesAndValues, getTagNamesFromTagsLists} from '@libs/PolicyUtils';
import {availableNonPersonalPolicyCategoriesSelector} from '@pages/Search/SearchAdvancedFiltersPage/SearchFiltersCategoryPage';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ExpenseRuleForm} from '@src/types/form';
import type {ExpenseRule, PolicyCategories, PolicyTagLists} from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';

type AddRuleProps = {
    hash?: string;
};

type SectionType = {
    titleTranslationKey: TranslationPaths;
    items: Array<
        | {
              descriptionTranslationKey: TranslationPaths;
              required?: boolean;
              title?: string;
              onPress: () => void;
          }
        | undefined
    >;
};

const navigateTo = (field: ValueOf<typeof CONST.EXPENSE_RULES.FIELDS>, hash?: string) => {
    if (hash) {
        Navigation.navigate(ROUTES.SETTINGS_RULES_EDIT.getRoute(hash, field));
    } else {
        Navigation.navigate(ROUTES.SETTINGS_RULES_ADD.getRoute(field));
    }
};

const getErrorMessage = (translate: LocalizedTranslate, form?: ExpenseRuleForm) => {
    let message;
    const hasAtLeastOneUpdate = Object.entries(form ?? {}).some(([key, value]) => key !== CONST.EXPENSE_RULES.FIELDS.MERCHANT && key !== CONST.EXPENSE_RULES.FIELDS.CREATE_REPORT && !!value);
    if (form?.merchantToMatch && hasAtLeastOneUpdate) {
        message = '';
    } else if (hasAtLeastOneUpdate) {
        message = translate('expenseRulesPage.addRule.confirmErrorMerchant');
    } else if (form?.merchantToMatch) {
        message = translate('expenseRulesPage.addRule.confirmErrorUpdate');
    } else {
        message = translate('expenseRulesPage.addRule.confirmError');
    }
    return message;
};

const categoriesSelector = (allPolicyCategories: OnyxCollection<PolicyCategories>) => {
    const categories = availableNonPersonalPolicyCategoriesSelector(allPolicyCategories);
    return Object.values(categories ?? {}).flatMap((policyCategories) => Object.values(policyCategories ?? {})).length > 0;
};

const tagsSelector = (allPolicyTagLists: OnyxCollection<PolicyTagLists>) => {
    const tagListsUnpacked = Object.values(allPolicyTagLists ?? {}).filter((item) => !!item);
    return tagListsUnpacked.map(getTagNamesFromTagsLists).flat().length > 0;
};

function AddRule({hash}: AddRuleProps) {
    const {translate} = useLocalize();
    const [expenseRules = getEmptyArray<ExpenseRule>()] = useOnyx(ONYXKEYS.NVP_EXPENSE_RULES, {canBeMissing: true});
    const [form] = useOnyx(ONYXKEYS.FORMS.EXPENSE_RULE_FORM, {canBeMissing: true});
    const [shouldShowError, setShouldShowError] = useState(false);
    const styles = useThemeStyles();

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

    useEffect(() => {
        if (errorMessage) {
            return;
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setShouldShowError(false);
    }, [errorMessage]);

    const handleSubmit = () => {
        if (errorMessage) {
            setShouldShowError(true);
            return;
        }
        if (!form) {
            return;
        }

        const newRule = extractRuleFromForm(form, selectedTaxRate);
        let newRules;
        if (hash) {
            newRules = expenseRules.map((rule) => (getKeyForRule(rule) === hash ? newRule : rule));
        } else {
            newRules = [...expenseRules, newRule];
        }
        setNameValuePair(ONYXKEYS.NVP_EXPENSE_RULES, newRules, expenseRules, true, true);

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
                    descriptionTranslationKey: 'expenseRulesPage.addRule.renameMerchant',
                    title: form?.merchant,
                    onPress: () => navigateTo(CONST.EXPENSE_RULES.FIELDS.RENAME_MERCHANT, hash),
                },
                hasPolicyCategories
                    ? {
                          descriptionTranslationKey: 'expenseRulesPage.addRule.updateCategory',
                          title: form?.category,
                          onPress: () => navigateTo(CONST.EXPENSE_RULES.FIELDS.CATEGORY, hash),
                      }
                    : undefined,
                hasPolicyTags
                    ? {
                          descriptionTranslationKey: 'expenseRulesPage.addRule.updateTag',
                          title: form?.tag,
                          onPress: () => navigateTo(CONST.EXPENSE_RULES.FIELDS.TAG, hash),
                      }
                    : undefined,
                hasTaxRates
                    ? {
                          descriptionTranslationKey: 'expenseRulesPage.addRule.updateTaxRate',
                          title: selectedTaxRate ? `${selectedTaxRate.name} (${selectedTaxRate.value})` : undefined,
                          onPress: () => navigateTo(CONST.EXPENSE_RULES.FIELDS.TAX, hash),
                      }
                    : undefined,
                {
                    descriptionTranslationKey: 'expenseRulesPage.addRule.changeDescription',
                    title: form?.category,
                    onPress: () => navigateTo(CONST.EXPENSE_RULES.FIELDS.DESCRIPTION, hash),
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
        <>
            <ScrollView contentContainerStyle={[styles.flexGrow1]}>
                {sections.map((section) => (
                    <View key={section.titleTranslationKey}>
                        <Text style={[styles.headerText, styles.reportHorizontalRule, styles.mt4, styles.mb2]}>{translate(section.titleTranslationKey)}</Text>
                        {section.items.map((item) => {
                            if (!item) {
                                return;
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
                isAlertVisible={shouldShowError}
                message={errorMessage}
                onSubmit={handleSubmit}
                enabledWhenOffline
            />
        </>
    );
}

export default AddRule;
