import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import type SCREENS from '@src/SCREENS';

import React from 'react';

import RequireFieldsRulePageBase from './RequireFieldsRulePageBase';

type AddRequireFieldsRulePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_REQUIRE_FIELDS_RULE_NEW>;

function AddRequireFieldsRulePage({route}: AddRequireFieldsRulePageProps) {
    const {policyID} = route.params;

    return (
        <RequireFieldsRulePageBase
            policyID={policyID}
            testID="AddRequireFieldsRulePage"
        />
    );
}

export default AddRequireFieldsRulePage;
