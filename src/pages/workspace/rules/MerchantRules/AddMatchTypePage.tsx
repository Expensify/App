import {updateDraftMerchantRule} from '@libs/actions/User';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

import MatchTypePage from './MatchTypePage';
import useMerchantRuleRoute from './useMerchantRuleRoute';

type AddMatchTypePageProps = PlatformStackScreenProps<
    SettingsNavigatorParamList,
    typeof SCREENS.WORKSPACE.RULES_MERCHANT_MATCH_TYPE | typeof SCREENS.WORKSPACE.DYNAMIC_RULES_MERCHANT_MATCH_TYPE
>;

function AddMatchTypePage({route}: AddMatchTypePageProps) {
    const {policyID, ruleID} = route.params;
    // Sits above merchant-to-match, not the rule page, so each flow names it: the callout by dropping this suffix,
    // settings by the route passed here.
    const {backToRoute} = useMerchantRuleRoute(
        DYNAMIC_ROUTES.RULES_MERCHANT_MATCH_TYPE_FROM_EXPENSE.path,
        policyID,
        ruleID,
        ROUTES.RULES_MERCHANT_MERCHANT_TO_MATCH.getRoute(policyID, ruleID !== ROUTES.NEW ? ruleID : undefined),
    );

    return (
        <MatchTypePage
            field="matchType"
            backToRoute={backToRoute}
            testID="AddMatchTypePage"
            onSelect={(matchType) => updateDraftMerchantRule({matchType})}
        />
    );
}

export default AddMatchTypePage;
