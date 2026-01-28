import React, {useMemo} from 'react';
import RuleSelectionBase from '@components/Rule/RuleSelectionBase';
import useOnyx from '@hooks/useOnyx';
import {updateDraftMerchantRule} from '@libs/actions/User';
import {getDecodedCategoryName} from '@libs/CategoryUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type AddCategoryPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_MERCHANT_CATEGORY>;

function AddCategoryPage({route}: AddCategoryPageProps) {
    const {policyID, ruleID} = route.params;
    const isEditing = ruleID !== ROUTES.NEW;

    const [form] = useOnyx(ONYXKEYS.FORMS.MERCHANT_RULE_FORM, {canBeMissing: true});
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`, {canBeMissing: true});

    const selectedCategoryItem = form?.category ? {name: getDecodedCategoryName(form.category), value: form.category} : undefined;

    const categoryItems = useMemo(() => {
        return Object.values(policyCategories ?? {})
            .filter((category) => category.enabled)
            .map((category) => {
                const decodedCategoryName = getDecodedCategoryName(category.name);
                return {name: decodedCategoryName, value: category.name};
            });
    }, [policyCategories]);

    const backToRoute = isEditing ? ROUTES.RULES_MERCHANT_EDIT.getRoute(policyID, ruleID) : ROUTES.RULES_MERCHANT_NEW.getRoute(policyID);

    const onSave = (value?: string) => {
        updateDraftMerchantRule({category: value});
    };

    return (
        <RuleSelectionBase
            titleKey="common.category"
            testID="AddCategoryPage"
            selectedItem={selectedCategoryItem}
            items={categoryItems}
            onSave={onSave}
            onBack={() => Navigation.goBack(backToRoute)}
            backToRoute={backToRoute}
        />
    );
}

AddCategoryPage.displayName = 'AddCategoryPage';

export default AddCategoryPage;
