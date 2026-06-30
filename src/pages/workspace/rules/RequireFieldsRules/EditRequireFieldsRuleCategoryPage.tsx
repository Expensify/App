import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';
import RequireFieldsRuleCategoryPageBase from './RequireFieldsRuleCategoryPageBase';

type EditRequireFieldsRuleCategoryPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_REQUIRE_FIELDS_RULE_CATEGORY_EDIT>;

function EditRequireFieldsRuleCategoryPage({route}: EditRequireFieldsRuleCategoryPageProps) {
    const {policyID, categoryName} = route.params;

    return (
        <RequireFieldsRuleCategoryPageBase
            policyID={policyID}
            categoryName={categoryName}
        />
    );
}

export default EditRequireFieldsRuleCategoryPage;
