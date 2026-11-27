import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';

import {getTaxRateDisplayName, isSelectableTaxRate} from '@libs/CategoryTaxRulesUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

import type {RuleConditionItem} from './RuleConditionMultiSelectPage';

import RuleConditionMultiSelectPage from './RuleConditionMultiSelectPage';
import useRuleConditionDraft from './useRuleConditionDraft';
import withFlagRuleConditionAccess from './withFlagRuleConditionAccess';

type AddTaxRateToMatchPageProps = PlatformStackScreenProps<
    SettingsNavigatorParamList,
    typeof SCREENS.WORKSPACE.RULES_TAX_RATE_TO_MATCH | typeof SCREENS.WORKSPACE.DYNAMIC_RULES_TAX_RATE_TO_MATCH
>;

function AddTaxRateToMatchPage({route}: AddTaxRateToMatchPageProps) {
    const {policyID, ruleID} = route.params;
    const {backToRoute, form, updateDraft} = useRuleConditionDraft(
        DYNAMIC_ROUTES.RULES_TAX_RATE_TO_MATCH_FROM_EXPENSE.path,
        policyID,
        ruleID,
        'flagCondition' in route.params ? route.params.flagCondition : undefined,
    );
    const {translate} = useLocalize();
    const policy = usePolicy(policyID);

    const selectedTaxRates = form?.taxRatesToMatch ?? [];

    // Keyed the way the tax default and the search filter both key a rate, which is the `id_{NAME}` key of
    // `taxRates.taxes` rather than the rate's own code. A code is editable and is unset on a rate made in OldDot,
    // so a rule keyed by one would name a rate nothing else can resolve.
    const taxRateItems: RuleConditionItem[] = Object.entries(policy?.taxRates?.taxes ?? {})
        .filter(([taxRateKey, taxRate]) => selectedTaxRates.includes(taxRateKey) || isSelectableTaxRate(taxRate))
        .map(([taxRateKey]) => ({
            value: taxRateKey,
            text: getTaxRateDisplayName(policy, taxRateKey),
        }));

    return (
        <RuleConditionMultiSelectPage
            draftValues={form?.taxRatesToMatch}
            title={translate('workspace.taxes.taxRate')}
            testID="AddTaxRateToMatchPage"
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.MERCHANT_RULE_TAX_RATE_TO_MATCH_SAVE}
            backToRoute={backToRoute}
            items={taxRateItems}
            onSave={(taxRatesToMatch) => updateDraft({taxRatesToMatch})}
        />
    );
}

export default withFlagRuleConditionAccess(AddTaxRateToMatchPage);
