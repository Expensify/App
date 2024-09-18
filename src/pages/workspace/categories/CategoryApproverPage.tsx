import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import WorkspaceMembersSelectionList from '@components/WorkspaceMembersSelectionList';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CategoryUtils from '@libs/CategoryUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import * as Category from '@userActions/Policy/Category';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type EditCategoryPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.CATEGORY_APPROVER>;

function CategoryApproverPage({
    route: {
        params: {policyID, categoryName},
    },
}: EditCategoryPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policy = usePolicy(policyID);

    const selectedApprover = CategoryUtils.getCategoryApprover(policy?.rules?.approvalRules ?? [], categoryName) ?? '';

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                style={[styles.defaultModalContainer]}
                testID={CategoryApproverPage.displayName}
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.rules.categoryRules.approver')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_CATEGORY_SETTINGS.getRoute(policyID, categoryName))}
                />
                <WorkspaceMembersSelectionList
                    policyID={policyID}
                    selectedApprover={selectedApprover}
                    setApprover={(email) => {
                        Category.setPolicyCategoryApprover(policyID, categoryName, email);
                        Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.goBack(ROUTES.WORKSPACE_CATEGORY_SETTINGS.getRoute(policyID, categoryName)));
                    }}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

CategoryApproverPage.displayName = 'CategoryApproverPage';

export default CategoryApproverPage;
