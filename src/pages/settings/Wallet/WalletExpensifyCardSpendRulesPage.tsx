import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import SpendRulePageBase from '@pages/workspace/rules/SpendRules/SpendRulePageBase';

import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

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
            // Come back here after upgrading rather than dropping the user on the workspace Rules page,
            // since this flow starts from the Wallet.
            upgradeBackTo={ROUTES.SETTINGS_WALLET_EXPENSIFY_CARD_SPEND_RULES.getRoute(policyID, isNewRule ? undefined : ruleID)}
        />
    );
}

WalletExpensifyCardSpendRulesPage.displayName = 'WalletExpensifyCardSpendRulesPage';

export default WalletExpensifyCardSpendRulesPage;
