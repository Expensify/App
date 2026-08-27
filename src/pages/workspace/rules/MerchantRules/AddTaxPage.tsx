import RuleSelectionBase from '@components/Rule/RuleSelectionBase';

import useOnyx from '@hooks/useOnyx';

import {updateDraftMerchantRule} from '@libs/actions/User';
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

    // A category tax default is deleted by writing the workspace default tax rate, so offering that rate here would
    // silently remove the rule instead of saving one. Hide it, unless a rule already points at it and we'd otherwise
    // have nothing to show as selected.
    const isCategoryRule = !!categoryName || !!form?.categoriesToMatch?.length;
    const defaultExternalID = policy?.taxRates?.defaultExternalID;
    const shouldHideTax = (taxKey: string) => isCategoryRule && taxKey === defaultExternalID && form?.tax !== taxKey;

    const taxes = policy?.taxRates?.taxes ?? {};
    const taxItems = Object.entries(taxes)
        .filter(([taxKey, tax]) => !tax.isDisabled && tax.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && !shouldHideTax(taxKey))
        .map(([taxKey, tax]) => ({
            name: `${tax.name} (${tax.value})`,
            value: taxKey,
        }));

    const selectedTaxItem = form?.tax ? taxItems.find(({value}) => value === form.tax) : undefined;

    // A category tax default carries no ruleID, so it has to route back by category or the picker would return to the
    // create page and drop the edit context.
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
            <RuleSelectionBase.Picker
                selectedItem={selectedTaxItem}
                items={taxItems}
                onSave={onSave}
                backToRoute={backToRoute}
            />
        </RuleSelectionBase>
    );
}

export default AddTaxPage;
