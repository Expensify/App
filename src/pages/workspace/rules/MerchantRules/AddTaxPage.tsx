import RuleSelectionBase from '@components/Rule/RuleSelectionBase';
import RuleTaxesDisabledEmptyState from '@components/Rule/RuleTaxesDisabledEmptyState';

import useOnyx from '@hooks/useOnyx';

import {updateDraftMerchantRule} from '@libs/actions/User';
import {hasUsableTaxRates, isCategoryRuleDraft} from '@libs/CategoryTaxRulesUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

type AddTaxPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_MERCHANT_TAX>;

function AddTaxPage({route}: AddTaxPageProps) {
    const {policyID, ruleID, categoryName} = route.params;
    const isEditing = ruleID !== ROUTES.NEW;

    const [form] = useOnyx(ONYXKEYS.FORMS.MERCHANT_RULE_FORM);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);

    // Reachable with taxes off by opening a rule saved while they were on, so the page explains that rather than
    // showing an empty picker.
    const areTaxesEnabled = hasUsableTaxRates(policy);

    // Writing the workspace default rate deletes the rule, so offering it here would remove rather than save.
    const isCategoryRule = isCategoryRuleDraft(form, categoryName);
    const defaultExternalID = policy?.taxRates?.defaultExternalID;
    const shouldHideTax = (taxKey: string) => isCategoryRule && taxKey === defaultExternalID;

    const taxes = policy?.taxRates?.taxes ?? {};
    const taxItems = Object.entries(taxes)
        .filter(([taxKey, tax]) => !tax.isDisabled && tax.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && !shouldHideTax(taxKey))
        .map(([taxKey, tax]) => ({
            name: `${tax.name} (${tax.value})`,
            value: taxKey,
        }));

    const selectedTaxItem = form?.tax ? taxItems.find(({value}) => value === form.tax) : undefined;

    // A category tax default carries no ruleID, so it routes back by category instead.
    const getBackToRoute = () => {
        if (categoryName) {
            return ROUTES.RULES_CATEGORY_TAX_EDIT.getRoute(policyID, categoryName);
        }
        return isEditing ? ROUTES.RULES_MERCHANT_EDIT.getRoute(policyID, ruleID) : ROUTES.RULES_MERCHANT_NEW.getRoute(policyID);
    };
    const backToRoute = getBackToRoute();

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
