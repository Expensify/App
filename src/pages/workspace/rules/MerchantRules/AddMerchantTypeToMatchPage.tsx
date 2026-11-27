import useLocalize from '@hooks/useLocalize';

import {getMerchantTypeLabel, MERCHANT_TYPES} from '@libs/ExpenseDefaultRuleUtils';
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

type AddMerchantTypeToMatchPageProps = PlatformStackScreenProps<
    SettingsNavigatorParamList,
    typeof SCREENS.WORKSPACE.RULES_MERCHANT_TYPE_TO_MATCH | typeof SCREENS.WORKSPACE.DYNAMIC_RULES_MERCHANT_TYPE_TO_MATCH
>;

function AddMerchantTypeToMatchPage({route}: AddMerchantTypeToMatchPageProps) {
    const {policyID, ruleID} = route.params;
    const {backToRoute, form, updateDraft} = useRuleConditionDraft(
        DYNAMIC_ROUTES.RULES_MERCHANT_TYPE_TO_MATCH_FROM_EXPENSE.path,
        policyID,
        ruleID,
        'flagCondition' in route.params ? route.params.flagCondition : undefined,
    );
    const {translate} = useLocalize();

    const merchantTypeItems: RuleConditionItem[] = MERCHANT_TYPES.map((merchantType) => ({
        value: merchantType,
        text: getMerchantTypeLabel(merchantType, translate),
    }));

    return (
        <RuleConditionMultiSelectPage
            draftValues={form?.merchantTypesToMatch}
            title={translate('workspace.rules.merchantTypeRule.merchantType')}
            testID="AddMerchantTypeToMatchPage"
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.MERCHANT_RULE_MERCHANT_TYPE_TO_MATCH_SAVE}
            backToRoute={backToRoute}
            items={merchantTypeItems}
            onSave={(merchantTypesToMatch) => updateDraft({merchantTypesToMatch})}
            getFallbackText={(merchantType) => getMerchantTypeLabel(merchantType, translate)}
        />
    );
}

export default withFlagRuleConditionAccess(AddMerchantTypeToMatchPage);
