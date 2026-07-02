import React from 'react';
import RuleSelectionBase from '@components/Rule/RuleSelectionBase';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import {updateDraftMerchantTypeRule} from '@libs/actions/User';
import {getDecodedCategoryName} from '@libs/CategoryUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/MerchantTypeRuleForm';

type MerchantTypeRuleCategoryPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_MERCHANT_TYPE_CATEGORY>;

function MerchantTypeRuleCategoryPage({route}: MerchantTypeRuleCategoryPageProps) {
    const {policyID, groupID} = route.params;
    const policy = usePolicy(policyID);
    const {canWrite: canWriteRules} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.RULES);
    const {isBetaEnabled} = usePermissions();
    const isRulesRevampEnabled = isBetaEnabled(CONST.BETAS.RULES_REVAMP);

    const [form] = useOnyx(ONYXKEYS.FORMS.MERCHANT_TYPE_RULE_FORM);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);

    const selectedCategoryName = form?.[INPUT_IDS.CATEGORY];
    const selectedCategoryItem = selectedCategoryName ? {name: getDecodedCategoryName(selectedCategoryName), value: selectedCategoryName} : undefined;

    const categoryItems = Object.values(policyCategories ?? {})
        .filter((category) => category.enabled && category.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE)
        .map((category) => {
            const decodedCategoryName = getDecodedCategoryName(category.name);
            return {name: decodedCategoryName, value: category.name};
        });

    const backToRoute = ROUTES.RULES_MERCHANT_TYPE_EDIT.getRoute(policyID, groupID);

    const onSave = (value?: string) => {
        updateDraftMerchantTypeRule({[INPUT_IDS.CATEGORY]: value});
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyFeature={CONST.POLICY.POLICY_FEATURE.RULES}
            shouldBeBlocked={!isRulesRevampEnabled || !canWriteRules}
        >
            <RuleSelectionBase
                titleKey="common.category"
                testID="MerchantTypeRuleCategoryPage"
                selectedItem={selectedCategoryItem}
                items={categoryItems}
                onSave={onSave}
                onBack={() => Navigation.goBack(backToRoute)}
                backToRoute={backToRoute}
            />
        </AccessOrNotFoundWrapper>
    );
}

export default MerchantTypeRuleCategoryPage;
