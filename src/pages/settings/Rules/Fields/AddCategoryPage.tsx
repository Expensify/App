import React, {useCallback, useMemo} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import RuleSelectionBase from '@components/Rule/RuleSelectionBase';
import useOnyx from '@hooks/useOnyx';
import {updateDraftRule} from '@libs/actions/User';
import {getAvailableNonPersonalPolicyCategories, getDecodedCategoryName} from '@libs/CategoryUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PolicyCategories} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

type AddCategoryPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.RULES.EDIT_CATEGORY>;

function AddCategoryPage({route}: AddCategoryPageProps) {
    const [form] = useOnyx(ONYXKEYS.FORMS.EXPENSE_RULE_FORM, {canBeMissing: true});
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID, {canBeMissing: true});
    const availableNonPersonalPolicyCategoriesSelector = useCallback(
        (allPolicyCategories: OnyxCollection<PolicyCategories>) => getAvailableNonPersonalPolicyCategories(allPolicyCategories, personalPolicyID),
        [personalPolicyID],
    );
    const [allPolicyCategories = getEmptyObject<NonNullable<OnyxCollection<PolicyCategories>>>()] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES, {
        canBeMissing: true,
        selector: availableNonPersonalPolicyCategoriesSelector,
    });

    const selectedCategoryItem = form?.category ? {name: getDecodedCategoryName(form.category), value: form.category} : undefined;

    const categoryItems = useMemo(() => {
        const uniqueCategoryNames = new Set<string>();

        const categories = Object.values(allPolicyCategories ?? {}).flatMap((policyCategories) => Object.values(policyCategories ?? {}));
        for (const category of categories) {
            uniqueCategoryNames.add(category.name);
        }

        return Array.from(uniqueCategoryNames)
            .filter(Boolean)
            .map((categoryName) => {
                const decodedCategoryName = getDecodedCategoryName(categoryName);
                return {name: decodedCategoryName, value: categoryName};
            });
    }, [allPolicyCategories]);

    const hash = route.params?.hash;
    const backToRoute = hash ? ROUTES.SETTINGS_RULES_EDIT.getRoute(hash) : ROUTES.SETTINGS_RULES_ADD.getRoute();

    const onSave = (value?: string) => {
        updateDraftRule({category: value});
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
            hash={hash}
        />
    );
}

export default AddCategoryPage;
