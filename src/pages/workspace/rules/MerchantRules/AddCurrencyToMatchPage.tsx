import {useCurrencyListActions, useCurrencyListState} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getCurrencyOptions} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

import type {RuleConditionItem} from './RuleConditionMultiSelectPage';

import RuleConditionMultiSelectPage from './RuleConditionMultiSelectPage';
import useRuleConditionDraft from './useRuleConditionDraft';
import withFlagRuleConditionAccess from './withFlagRuleConditionAccess';

type AddCurrencyToMatchPageProps = PlatformStackScreenProps<
    SettingsNavigatorParamList,
    typeof SCREENS.WORKSPACE.RULES_CURRENCY_TO_MATCH | typeof SCREENS.WORKSPACE.DYNAMIC_RULES_CURRENCY_TO_MATCH
>;

function AddCurrencyToMatchPage({route}: AddCurrencyToMatchPageProps) {
    const {policyID, ruleID} = route.params;
    const {backToRoute, form, updateDraft} = useRuleConditionDraft(
        DYNAMIC_ROUTES.RULES_CURRENCY_TO_MATCH_FROM_EXPENSE.path,
        policyID,
        ruleID,
        'flagCondition' in route.params ? route.params.flagCondition : undefined,
    );
    const {translate} = useLocalize();
    const {currencyList} = useCurrencyListState();
    const {getCurrencySymbol} = useCurrencyListActions();

    // The same options the search filter lists, so a rule matches on exactly what an admin can search for. Matched
    // on the name as well as the code, so "pound" finds GBP.
    const currencyItems: RuleConditionItem[] = getCurrencyOptions(currencyList, getCurrencySymbol).map((option) => ({
        value: option.value,
        text: option.text,
        searchableText: option.searchableText,
    }));

    return (
        <RuleConditionMultiSelectPage
            draftValues={form?.currenciesToMatch}
            title={translate('common.currency')}
            testID="AddCurrencyToMatchPage"
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.MERCHANT_RULE_CURRENCY_TO_MATCH_SAVE}
            backToRoute={backToRoute}
            items={currencyItems}
            onSave={(currenciesToMatch) => updateDraft({currenciesToMatch})}
        />
    );
}

export default withFlagRuleConditionAccess(AddCurrencyToMatchPage);
