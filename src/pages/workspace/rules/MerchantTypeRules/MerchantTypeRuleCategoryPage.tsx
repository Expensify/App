import React from 'react';
import RuleSelectionBase from '@components/Rule/RuleSelectionBase';
import useOnyx from '@hooks/useOnyx';
import {updateDraftMerchantTypeRule} from '@libs/actions/User';
import {getDecodedCategoryName} from '@libs/CategoryUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type MerchantTypeRuleCategoryPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_MERCHANT_TYPE_CATEGORY>;

function MerchantTypeRuleCategoryPage({route}: MerchantTypeRuleCategoryPageProps) {
    const {policyID, groupID} = route.params;

    const [form] = useOnyx(ONYXKEYS.FORMS.MERCHANT_TYPE_RULE_FORM);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);

    const selectedCategoryItem = form?.category ? {name: getDecodedCategoryName(form.category), value: form.category} : undefined;

    const categoryItems = Object.values(policyCategories ?? {})
        .filter((category) => category.enabled && category.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE)
        .map((category) => {
            const decodedCategoryName = getDecodedCategoryName(category.name);
            return {name: decodedCategoryName, value: category.name};
        });

    const backToRoute = ROUTES.RULES_MERCHANT_TYPE_EDIT.getRoute(policyID, groupID);

    const onSave = (value?: string) => {
        updateDraftMerchantTypeRule({category: value});
    };

    return (
        <RuleSelectionBase
            titleKey="common.category"
            testID="MerchantTypeRuleCategoryPage"
            selectedItem={selectedCategoryItem}
            items={categoryItems}
            onSave={onSave}
            onBack={() => Navigation.goBack(backToRoute)}
            backToRoute={backToRoute}
        />
    );
}

export default MerchantTypeRuleCategoryPage;
