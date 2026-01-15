import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {setNameValuePair, updateDraftRule} from '@libs/actions/User';
import {extractRuleFromForm} from '@libs/ExpenseRuleUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getTagNamesFromTagsLists} from '@libs/PolicyUtils';
import {availableNonPersonalPolicyCategoriesSelector} from '@pages/Search/SearchAdvancedFiltersPage/SearchFiltersCategoryPage';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ExpenseRuleForm} from '@src/types/form';
import type {ExpenseRule, PolicyCategories, PolicyTagLists} from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';

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

function AddRule() {
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
        setNameValuePair(ONYXKEYS.NVP_EXPENSE_RULES, [...expenseRules, extractRuleFromForm(form)], expenseRules);

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
                    onPress: () => Navigation.navigate(ROUTES.SETTINGS_RULES_ADD.getRoute(CONST.EXPENSE_RULES.FIELDS.MERCHANT)),
                },
            ],
        },
        {
            titleTranslationKey: 'expenseRulesPage.addRule.applyUpdates',
            items: [
                {
                    descriptionTranslationKey: 'expenseRulesPage.addRule.renameMerchant',
                    title: form?.merchant,
                    onPress: () => Navigation.navigate(ROUTES.SETTINGS_RULES_ADD.getRoute(CONST.EXPENSE_RULES.FIELDS.RENAME_MERCHANT)),
                },
                hasPolicyCategories
                    ? {
                          descriptionTranslationKey: 'expenseRulesPage.addRule.updateCategory',
                          title: form?.category,
                          onPress: () => Navigation.navigate(ROUTES.SETTINGS_RULES_ADD.getRoute(CONST.EXPENSE_RULES.FIELDS.CATEGORY)),
                      }
                    : undefined,
                hasPolicyTags
                    ? {
                          descriptionTranslationKey: 'expenseRulesPage.addRule.updateTag',
                          title: form?.tag,
                          onPress: () => Navigation.navigate(ROUTES.SETTINGS_RULES_ADD.getRoute(CONST.EXPENSE_RULES.FIELDS.TAG)),
                      }
                    : undefined,
                {
                    descriptionTranslationKey: 'expenseRulesPage.addRule.changeDescription',
                    title: form?.category,
                    onPress: () => Navigation.navigate(ROUTES.SETTINGS_RULES_ADD.getRoute(CONST.EXPENSE_RULES.FIELDS.DESCRIPTION)),
                },
                {
                    descriptionTranslationKey: 'common.reimbursable',
                    title: form?.reimbursable ? translate(form.reimbursable === 'true' ? 'common.yes' : 'common.no') : '',
                    onPress: () => Navigation.navigate(ROUTES.SETTINGS_RULES_ADD.getRoute(CONST.EXPENSE_RULES.FIELDS.REIMBURSABLE)),
                },
                {
                    descriptionTranslationKey: 'common.billable',
                    title: form?.billable ? translate(form.billable === 'true' ? 'common.yes' : 'common.no') : '',
                    onPress: () => Navigation.navigate(ROUTES.SETTINGS_RULES_ADD.getRoute(CONST.EXPENSE_RULES.FIELDS.BILLABLE)),
                },
                {
                    descriptionTranslationKey: 'expenseRulesPage.addRule.addToReport',
                    title: form?.report,
                    onPress: () => Navigation.navigate(ROUTES.SETTINGS_RULES_ADD.getRoute(CONST.EXPENSE_RULES.FIELDS.REPORT)),
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
