import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

import MatchTypePage from './MatchTypePage';
import useRuleConditionDraft from './useRuleConditionDraft';
import withFlagRuleConditionAccess from './withFlagRuleConditionAccess';

type AddDateMatchTypePageProps = PlatformStackScreenProps<
    SettingsNavigatorParamList,
    typeof SCREENS.WORKSPACE.RULES_DATE_MATCH_TYPE | typeof SCREENS.WORKSPACE.DYNAMIC_RULES_DATE_MATCH_TYPE
>;

function AddDateMatchTypePage({route}: AddDateMatchTypePageProps) {
    const {policyID, ruleID} = route.params;
    // Sits above date-to-match, not the rule page, so each flow names it: the callout by dropping this suffix,
    // settings by the route passed here.
    const flagCondition = 'flagCondition' in route.params ? route.params.flagCondition : undefined;
    const {backToRoute, formID, form, updateDraft} = useRuleConditionDraft(
        DYNAMIC_ROUTES.RULES_DATE_MATCH_TYPE_FROM_EXPENSE.path,
        policyID,
        ruleID,
        flagCondition,
        ROUTES.RULES_DATE_TO_MATCH.getRoute(policyID, ruleID !== ROUTES.NEW ? ruleID : undefined, flagCondition),
    );

    return (
        <MatchTypePage
            field="dateMatchType"
            formID={formID}
            selectedMatchType={form?.dateMatchType ?? CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO}
            backToRoute={backToRoute}
            testID="AddDateMatchTypePage"
            onSelect={(dateMatchType) => updateDraft({dateMatchType})}
        />
    );
}

export default withFlagRuleConditionAccess(AddDateMatchTypePage);
