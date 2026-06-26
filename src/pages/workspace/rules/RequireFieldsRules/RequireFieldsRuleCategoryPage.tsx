import React, {useMemo} from 'react';
import RuleSelectionBase from '@components/Rule/RuleSelectionBase';
import useOnyx from '@hooks/useOnyx';
import {updateDraftRequireFieldsRule} from '@libs/actions/User';
import {getDecodedCategoryName} from '@libs/CategoryUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type RequireFieldsRuleCategoryPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_REQUIRE_FIELDS_RULE_CATEGORY>;

function RequireFieldsRuleCategoryPage({route}: RequireFieldsRuleCategoryPageProps) {
    const {policyID, ruleKey} = route.params;
    const isEditing = ruleKey !== ROUTES.NEW;

    const [form] = useOnyx(ONYXKEYS.FORMS.REQUIRE_FIELDS_RULE_FORM);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);

    const selectedCategoryItem = form?.category ? {name: getDecodedCategoryName(form.category), value: form.category} : undefined;

    const categoryItems = useMemo(() => {
        return Object.values(policyCategories ?? {})
            .filter((category) => category.enabled && category.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE)
            .map((category) => {
                const decodedCategoryName = getDecodedCategoryName(category.name);
                return {name: decodedCategoryName, value: category.name};
            });
    }, [policyCategories]);

    const backToRoute = isEditing ? ROUTES.RULES_REQUIRE_FIELDS_RULE_EDIT.getRoute(policyID, ruleKey) : ROUTES.RULES_REQUIRE_FIELDS_RULE_NEW.getRoute(policyID);

    const onSave = (value?: string) => {
        updateDraftRequireFieldsRule({category: value});
    };

    return (
        <RuleSelectionBase
            titleKey="common.category"
            testID="RequireFieldsRuleCategoryPage"
            selectedItem={selectedCategoryItem}
            items={categoryItems}
            onSave={onSave}
            onBack={() => Navigation.goBack(backToRoute)}
            backToRoute={backToRoute}
        />
    );
}

export default RequireFieldsRuleCategoryPage;
