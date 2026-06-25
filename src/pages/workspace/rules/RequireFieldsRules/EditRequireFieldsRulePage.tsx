import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';
import RequireFieldsRulePageBase from './RequireFieldsRulePageBase';

type EditRequireFieldsRulePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_REQUIRE_FIELDS_RULE_EDIT>;

function EditRequireFieldsRulePage({route}: EditRequireFieldsRulePageProps) {
    const {policyID, categoryName} = route.params;

    return (
        <RequireFieldsRulePageBase
            policyID={policyID}
            categoryName={categoryName}
            testID="EditRequireFieldsRulePage"
        />
    );
}

export default EditRequireFieldsRulePage;
