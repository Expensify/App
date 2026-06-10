import React from 'react';
import SpendRulesCurrencyBase from '@components/SpendRules/configuration/SpendRulesCurrencyBase';
import useOnyx from '@hooks/useOnyx';
import {updateDraftSpendRule} from '@libs/actions/User';
import ONYXKEYS from '@src/ONYXKEYS';

export default function SpendRuleCurrenciesPage() {
    const [spendRuleForm] = useOnyx(ONYXKEYS.FORMS.SPEND_RULE_FORM);

    const onCurrenciesChange = (currencies: string[]) => {
        updateDraftSpendRule({currencies});
    };

    return (
        <SpendRulesCurrencyBase
            currencies={spendRuleForm?.currencies ?? []}
            onCurrenciesChange={onCurrenciesChange}
        />
    );
}
