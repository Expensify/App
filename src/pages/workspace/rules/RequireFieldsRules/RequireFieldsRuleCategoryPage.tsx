import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';
import RequireFieldsRuleCategoryPageBase from './RequireFieldsRuleCategoryPageBase';

type RequireFieldsRuleCategoryPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_REQUIRE_FIELDS_RULE_CATEGORY>;

function RequireFieldsRuleCategoryPage({route}: RequireFieldsRuleCategoryPageProps) {
    return <RequireFieldsRuleCategoryPageBase policyID={route.params.policyID} />;
}

export default RequireFieldsRuleCategoryPage;
