import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {isFieldRequirementsDirection} from '@libs/RequireFieldsRulesUtils';

import type SCREENS from '@src/SCREENS';

import React from 'react';

import RequireFieldsRuleCategoryPageBase from './RequireFieldsRuleCategoryPageBase';

type EditRequireFieldsRuleCategoryPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_REQUIRE_FIELDS_RULE_CATEGORY_EDIT>;

function EditRequireFieldsRuleCategoryPage({route}: EditRequireFieldsRuleCategoryPageProps) {
    const {policyID, categoryName, direction} = route.params;

    return (
        <RequireFieldsRuleCategoryPageBase
            policyID={policyID}
            categoryName={categoryName}
            direction={isFieldRequirementsDirection(direction) ? direction : undefined}
        />
    );
}

export default EditRequireFieldsRuleCategoryPage;
