import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {isFieldRequirementsDirection} from '@libs/RequireFieldsRulesUtils';

import type SCREENS from '@src/SCREENS';

import React from 'react';

import RequireFieldsRulePageBase from './RequireFieldsRulePageBase';

type EditRequireFieldsRulePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_REQUIRE_FIELDS_RULE_EDIT>;

function EditRequireFieldsRulePage({route}: EditRequireFieldsRulePageProps) {
    const {policyID, categoryName, direction} = route.params;

    return (
        <RequireFieldsRulePageBase
            policyID={policyID}
            categoryName={categoryName}
            direction={isFieldRequirementsDirection(direction) ? direction : undefined}
            testID="EditRequireFieldsRulePage"
        />
    );
}

export default EditRequireFieldsRulePage;
