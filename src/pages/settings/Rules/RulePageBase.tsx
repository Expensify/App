import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import RuleNotFoundPageWrapper from '@components/Rule/RuleNotFoundPageWrapper';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePressLoading from '@hooks/usePressLoading';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearDraftRule, saveExpenseRule, updateDraftRule} from '@libs/actions/User';
import {getAvailableNonPersonalPolicyCategories, getDecodedCategoryName} from '@libs/CategoryUtils';
import {extractRuleFromForm, getKeyForRule} from '@libs/ExpenseRuleUtils';
import Navigation from '@libs/Navigation/Navigation';
import {hasEnabledOptions} from '@libs/OptionsListUtils';
import Parser from '@libs/Parser';
import {getAllTaxRatesNamesAndValues, getCleanedTagName, getTagLists} from '@libs/PolicyUtils';
import {getEnabledTags} from '@libs/TagsOptionsListUtils';
import {getTagArrayFromName} from '@libs/TransactionUtils';

import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';

import {callFunctionIfActionIsAllowed} from '@userActions/Session';

import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ExpenseRuleForm, ExpenseRuleFormFieldID} from '@src/types/form/ExpenseRuleForm';
import EXPENSE_RULE_INPUT_IDS from '@src/types/form/ExpenseRuleForm';
import type {ExpenseRule, PolicyCategories, PolicyTagLists} from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';

import type {OnyxCollection} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';

type RulePageBaseProps = {
    titleKey: TranslationPaths;
    testID: string;
    hash?: string;
};

const navigateTo = (field: ExpenseRuleFormFieldID, hash?: string, index?: number) => {
    if (hash) {
        Navigation.navigate(ROUTES.SETTINGS_RULES_EDIT.getRoute(hash, field, index));
    } else {
        Navigation.navigate(ROUTES.SETTINGS_RULES_ADD.getRoute(field, index));
    }
};

const getErrorMessage = (translate: LocalizedTranslate, form?: ExpenseRuleForm) => {
    const hasAtLeastOneUpdate = Object.entries(form ?? {}).some(
        ([key, value]) =>
            (
                [
                    EXPENSE_RULE_INPUT_IDS.BILLABLE,
                    EXPENSE_RULE_INPUT_IDS.CATEGORY,
                    EXPENSE_RULE_INPUT_IDS.DESCRIPTION,
                    EXPENSE_RULE_INPUT_IDS.RENAME_MERCHANT,
                    EXPENSE_RULE_INPUT_IDS.REIMBURSABLE,
                    EXPENSE_RULE_INPUT_IDS.REPORT,
                    EXPENSE_RULE_INPUT_IDS.TAG,
                    EXPENSE_RULE_INPUT_IDS.TAX,
                ] as string[]
            ).includes(key) && !!value,
    );
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

function RulePageBase({titleKey, testID, hash}: RulePageBaseProps) {
    const {translate} = useLocalize();
    const [expenseRules = getEmptyArray<ExpenseRule>()] = useOnyx(ONYXKEYS.NVP_EXPENSE_RULES);
    const [form] = useOnyx(ONYXKEYS.FORMS.EXPENSE_RULE_FORM);
    // Cannot use useRef because react compiler fails
    const [isSaving, setIsSaving] = useState(false);
    const [shouldShowError, setShouldShowError] = useState(false);
    const [shouldUpdateMatchingTransactions, setShouldUpdateMatchingTransactions] = useState(false);
    const {isLoading, startWithLoading} = usePressLoading({isLoading: isSaving});
    const styles = useThemeStyles();

    useEffect(() => () => clearDraftRule(), []);

    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID);
    const categoriesSelector = useCallback(
        (allPolicyCategories: OnyxCollection<PolicyCategories>) => {
            const categories = getAvailableNonPersonalPolicyCategories(allPolicyCategories, personalPolicyID);
            return (
                Object.values(categories ?? {})
                    .filter((policyCategories) => hasEnabledOptions(policyCategories ?? {}))
                    .flatMap((policyCategories) => Object.values(policyCategories ?? {})).length > 0
            );
        },
        [personalPolicyID],
    );
    const [hasPolicyCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES, {
        selector: categoriesSelector,
    });

    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [policyTags = getEmptyArray<ValueOf<PolicyTagLists>>()] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${activePolicyID}`, {
        selector: getTagLists,
    });
    const formTags = getTagArrayFromName(form?.tag ?? '');

    const [allTaxRates] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
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

        startWithLoading(() => {
            setIsSaving(true);

            const newRule = extractRuleFromForm(form, selectedTaxRate);
            saveExpenseRule(expenseRules, newRule, hash, getKeyForRule, shouldUpdateMatchingTransactions);

            Navigation.goBack();
        });
    };

    const hasMerchantToMatchError = shouldShowError && !form?.merchantToMatch;
    const tagsToShow = policyTags.filter(({orderWeight, tags}) => !!formTags.at(orderWeight) || getEnabledTags(tags, form?.tag ?? '', orderWeight).length > 0);

    return (
        <RuleNotFoundPageWrapper
            hash={hash}
            shouldPreventShow={isSaving}
        >
            <ScreenWrapper
                testID={testID}
                offlineIndicatorStyle={styles.mtAuto}
                includeSafeAreaPaddingBottom
            >
                <HeaderWithBackButton title={translate(titleKey)} />
                <ScrollView contentContainerStyle={[styles.flexGrow1]}>
                    <Text style={[styles.textHeadlineH2, styles.reportHorizontalRule, styles.mt4, styles.mb2]}>{translate('expenseRulesPage.addRule.expenseContains')}</Text>
                    <MenuItem.Root onPress={callFunctionIfActionIsAllowed(() => navigateTo(EXPENSE_RULE_INPUT_IDS.MERCHANT, hash))}>
                        <MenuItemField.Row
                            name={translate('common.merchant')}
                            value={form?.merchantToMatch}
                        >
                            {!form?.merchantToMatch && !hasMerchantToMatchError && <MenuItem.RightLabel>{translate('common.required')}</MenuItem.RightLabel>}
                            <MenuItem.Chevron />
                        </MenuItemField.Row>
                        {hasMerchantToMatchError && (
                            <MenuItem.HelpText
                                isError
                                message={translate('common.error.fieldRequired')}
                            />
                        )}
                    </MenuItem.Root>
                    <Text style={[styles.textHeadlineH2, styles.reportHorizontalRule, styles.mt4, styles.mb2]}>{translate('expenseRulesPage.addRule.applyUpdates')}</Text>
                    <MenuItemField
                        name={translate('common.merchant')}
                        value={form?.merchant}
                        onPress={() => navigateTo(EXPENSE_RULE_INPUT_IDS.RENAME_MERCHANT, hash)}
                    />
                    {(!!form?.category || !!hasPolicyCategories) && (
                        <MenuItemField
                            name={translate('common.category')}
                            value={form?.category ? getDecodedCategoryName(form.category) : undefined}
                            onPress={() => navigateTo(EXPENSE_RULE_INPUT_IDS.CATEGORY, hash)}
                        />
                    )}
                    {tagsToShow.map(({name, orderWeight}) => {
                        const formTag = formTags.at(orderWeight);
                        return (
                            <MenuItemField
                                key={`tag-${name}-${orderWeight}`}
                                name={name}
                                value={formTag ? getCleanedTagName(formTag) : undefined}
                                onPress={() => navigateTo(EXPENSE_RULE_INPUT_IDS.TAG, hash, orderWeight)}
                            />
                        );
                    })}
                    {hasTaxRates && (
                        <MenuItemField
                            name={translate('common.tax')}
                            value={selectedTaxRate ? `${selectedTaxRate.name} (${selectedTaxRate.value})` : undefined}
                            onPress={() => navigateTo(EXPENSE_RULE_INPUT_IDS.TAX, hash)}
                        />
                    )}
                    <MenuItem.Root onPress={callFunctionIfActionIsAllowed(() => navigateTo(EXPENSE_RULE_INPUT_IDS.DESCRIPTION, hash))}>
                        <MenuItem.Row>
                            <MenuItemField.Content name={translate('common.description')}>
                                {!!form?.comment && <MenuItem.FieldValueHTML>{Parser.replace(form.comment)}</MenuItem.FieldValueHTML>}
                            </MenuItemField.Content>
                            <MenuItem.Trailing>
                                <MenuItem.Chevron />
                            </MenuItem.Trailing>
                        </MenuItem.Row>
                    </MenuItem.Root>
                    <MenuItemField
                        name={translate('common.reimbursable')}
                        value={form?.reimbursable ? translate(form.reimbursable === 'true' ? 'common.yes' : 'common.no') : translate('common.dontChange')}
                        onPress={() => navigateTo(EXPENSE_RULE_INPUT_IDS.REIMBURSABLE, hash)}
                    />
                    <MenuItemField
                        name={translate('common.billable')}
                        value={form?.billable ? translate(form.billable === 'true' ? 'common.yes' : 'common.no') : translate('common.dontChange')}
                        onPress={() => navigateTo(EXPENSE_RULE_INPUT_IDS.BILLABLE, hash)}
                    />
                    <MenuItemField
                        name={translate('expenseRulesPage.addRule.addToReport')}
                        value={form?.report}
                        onPress={() => navigateTo(EXPENSE_RULE_INPUT_IDS.REPORT, hash)}
                    />
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.ml5, styles.mr8, styles.optionRow]}>
                        <ToggleSettingOptionRow
                            isActive={form?.createReport ?? false}
                            onToggle={(isEnabled) => {
                                updateDraftRule({createReport: isEnabled});
                            }}
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
                    isLoading={isLoading}
                    shouldShowLoadingImmediatelyOnPress={false}
                    enabledWhenOffline
                    shouldRenderFooterAboveSubmit
                    footerContent={
                        <ToggleSettingOptionRow
                            isActive={shouldUpdateMatchingTransactions}
                            onToggle={setShouldUpdateMatchingTransactions}
                            switchAccessibilityLabel={translate('expenseRulesPage.addRule.applyToExistingExpenses')}
                            title={translate('expenseRulesPage.addRule.applyToExistingExpenses')}
                            wrapperStyle={styles.mb4}
                        />
                    }
                />
            </ScreenWrapper>
        </RuleNotFoundPageWrapper>
    );
}

export default RulePageBase;
