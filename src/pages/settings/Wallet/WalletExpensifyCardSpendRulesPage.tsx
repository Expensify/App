import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import SpendRulePageBase from '@pages/workspace/rules/SpendRules/SpendRulePageBase';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type WalletExpensifyCardSpendRulesPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.EXPENSIFY_CARD_SPEND_RULES>;

function WalletExpensifyCardSpendRulesPage({route}: WalletExpensifyCardSpendRulesPageProps) {
    const {policyID, ruleID} = route.params;
    const isNewRule = ruleID === ROUTES.NEW;

    return (
        <SpendRulePageBase
            policyID={policyID}
            ruleID={isNewRule ? undefined : ruleID}
            titleKey={isNewRule ? 'workspace.rules.merchantRules.addRuleTitle' : 'workspace.rules.spendRules.editRuleTitle'}
            testID="WalletExpensifyCardSpendRulesPage"
        />
    );
}

WalletExpensifyCardSpendRulesPage.displayName = 'WalletExpensifyCardSpendRulesPage';

export default WalletExpensifyCardSpendRulesPage;
