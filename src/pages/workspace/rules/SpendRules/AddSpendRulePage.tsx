import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

import SpendRulePageBase from './SpendRulePageBase';

type AddSpendRulePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_SPEND_NEW>;

function AddSpendRulePage({route}: AddSpendRulePageProps) {
    const {policyID} = route.params;

    return (
        <SpendRulePageBase
            policyID={policyID}
            testID="AddSpendRulePage"
            // Come back to this form after upgrading rather than dropping the user on the workspace Rules page.
            upgradeBackTo={ROUTES.RULES_SPEND_NEW.getRoute(policyID)}
        />
    );
}

AddSpendRulePage.displayName = 'AddSpendRulePage';

export default AddSpendRulePage;
