import RuleSelectionBase from '@components/Rule/RuleSelectionBase';
import RuleTaxesDisabledEmptyState from '@components/Rule/RuleTaxesDisabledEmptyState';

import useOnyx from '@hooks/useOnyx';

import {updateDraftMerchantRule} from '@libs/actions/User';
import {hasUsableTaxRates, isCategoryRuleDraft, isSelectableTaxRate} from '@libs/CategoryTaxRulesUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

import useMerchantRuleRoute from './useMerchantRuleRoute';

type AddTaxPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_MERCHANT_TAX | typeof SCREENS.WORKSPACE.DYNAMIC_RULES_MERCHANT_TAX>;

function AddTaxPage({route}: AddTaxPageProps) {
    const {policyID, ruleID, categoryName} = route.params;
    // A category tax default carries no ruleID, so it routes back by category instead. Everything else follows the
    // flow this page was opened from, which the callout enters through dynamic routes.
    const {backToRoute} = useMerchantRuleRoute(
        DYNAMIC_ROUTES.RULES_MERCHANT_TAX_FROM_EXPENSE.path,
        policyID,
        ruleID,
        categoryName ? ROUTES.RULES_CATEGORY_TAX_EDIT.getRoute(policyID, categoryName) : undefined,
    );

    const [form] = useOnyx(ONYXKEYS.FORMS.MERCHANT_RULE_FORM);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);

    // Reachable with taxes off by opening a rule saved while they were on, so the page explains that rather than
    // showing an empty picker.
    const areTaxesEnabled = hasUsableTaxRates(policy);

    const isCategoryRule = isCategoryRuleDraft(form, categoryName);

    const taxes = policy?.taxRates?.taxes ?? {};
    const taxItems = Object.entries(taxes)
        // The rate the rule already holds always stays listed, whatever state it is in now. A rate can be disabled,
        // or become the workspace default, after a rule chose it, and dropping it here left the picker with nothing
        // marked selected, so the admin couldn't tell what the rule applies, only that it wasn't any of the options.
        .filter(([taxKey, tax]) => taxKey === form?.tax || isSelectableTaxRate(policy, taxKey, tax, isCategoryRule))
        .map(([taxKey, tax]) => ({
            name: `${tax.name} (${tax.value})`,
            value: taxKey,
        }));

    const selectedTaxItem = form?.tax ? taxItems.find(({value}) => value === form.tax) : undefined;

    const onSave = (value?: string) => {
        updateDraftMerchantRule({tax: value});
    };

    return (
        <RuleSelectionBase
            titleKey="common.tax"
            testID="AddTaxPage"
            onBack={() => Navigation.goBack(backToRoute)}
        >
            {areTaxesEnabled ? (
                <RuleSelectionBase.Picker
                    selectedItem={selectedTaxItem}
                    items={taxItems}
                    onSave={onSave}
                    backToRoute={backToRoute}
                    // A category rule exists to set a rate, so it has no "leave the tax alone" state to offer. Reading
                    // "None" as the current value is wrong too: without a rule the category falls back to the
                    // workspace default rate, which this list deliberately leaves out.
                    allowNoneOption={!isCategoryRule}
                />
            ) : (
                <RuleTaxesDisabledEmptyState policyID={policyID} />
            )}
        </RuleSelectionBase>
    );
}

export default AddTaxPage;
