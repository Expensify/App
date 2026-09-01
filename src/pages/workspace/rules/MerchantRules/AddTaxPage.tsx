import RuleSelectionBase from '@components/Rule/RuleSelectionBase';

import useOnyx from '@hooks/useOnyx';

import {updateDraftMerchantRule} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

import useMerchantRuleRoute from './useMerchantRuleRoute';

type AddTaxPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_MERCHANT_TAX | typeof SCREENS.WORKSPACE.DYNAMIC_RULES_MERCHANT_TAX>;

function AddTaxPage({route}: AddTaxPageProps) {
    const {policyID, ruleID} = route.params;
    const {backToRoute} = useMerchantRuleRoute(DYNAMIC_ROUTES.RULES_MERCHANT_TAX_FROM_EXPENSE.path, policyID, ruleID);

    const [form] = useOnyx(ONYXKEYS.FORMS.MERCHANT_RULE_FORM);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);

    const taxes = policy?.taxRates?.taxes ?? {};
    const taxItems = Object.entries(taxes)
        .filter(([, tax]) => !tax.isDisabled && tax.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE)
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
