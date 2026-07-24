import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import type SCREENS from '@src/SCREENS';

import React from 'react';

import RequireFieldsRulePageBase from './RequireFieldsRulePageBase';

type EditRequireFieldsRulePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_REQUIRE_FIELDS_RULE_EDIT>;

function EditRequireFieldsRulePage({route}: EditRequireFieldsRulePageProps) {
    const {policyID, categoryName, isCategoryLocked} = route.params;

    return (
        <RequireFieldsRulePageBase
            policyID={policyID}
            categoryName={categoryName}
            isCategoryLocked={isCategoryLocked === 'true'}
            testID="EditRequireFieldsRulePage"
        />
    );
}

export default EditRequireFieldsRulePage;
