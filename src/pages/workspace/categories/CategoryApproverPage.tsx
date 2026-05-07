import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import WorkspaceMembersSelectionList from '@components/WorkspaceMembersSelectionList';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {getCategoryApproverRule} from '@libs/CategoryUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {setPolicyCategoryApprover} from '@userActions/Policy/Category';
import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type EditCategoryPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.CATEGORY_APPROVER>;

function CategoryApproverPage({
    route: {
        params: {policyID, categoryName},
    },
}: EditCategoryPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policy = usePolicy(policyID);
    const backPath = createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_CATEGORY_SETTINGS.getRoute(categoryName), ROUTES.WORKSPACE_INITIAL.getRoute(policyID));

    const selectedApprover = getCategoryApproverRule(policy?.rules?.approvalRules ?? [], categoryName)?.approver ?? '';

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={[styles.defaultModalContainer]}
                testID="CategoryApproverPage"
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.rules.categoryRules.approver')}
                    onBackButtonPress={() => Navigation.goBack(backPath)}
                />
                <WorkspaceMembersSelectionList
                    policyID={policyID}
                    selectedApprover={selectedApprover}
                    setApprover={(email) => {
                        setPolicyCategoryApprover(policyID, categoryName, email, policy?.rules?.approvalRules ?? []);
                        Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.goBack(backPath));
                    }}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default CategoryApproverPage;
