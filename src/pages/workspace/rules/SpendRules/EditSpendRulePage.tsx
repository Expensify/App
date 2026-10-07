import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

import SpendRulePageBase from './SpendRulePageBase';

type EditSpendRulePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_SPEND_EDIT>;

function EditSpendRulePage({route}: EditSpendRulePageProps) {
    const {policyID, ruleID} = route.params;

    return (
        <SpendRulePageBase
            policyID={policyID}
            ruleID={ruleID}
            testID="EditSpendRulePage"
            // Come back to this form after upgrading rather than dropping the user on the workspace Rules page.
            upgradeBackTo={ROUTES.RULES_SPEND_EDIT.getRoute(policyID, ruleID)}
        />
    );
}

EditSpendRulePage.displayName = 'EditSpendRulePage';

export default EditSpendRulePage;
