/**
 * Lets a workspace admin choose which of the workspace's enabled categories a member can use, from that member's
 * details page. Saving replaces the member's allowed categories with the checked ones.
 */
import ActivityIndicator from '@components/ActivityIndicator';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import ScreenWrapper from '@components/ScreenWrapper';

import useCategoryVisibilityCategories from '@hooks/useCategoryVisibilityCategories';
import useLocalize from '@hooks/useLocalize';
import {usePersonalDetailsByLogins} from '@hooks/usePersonalDetailByLogin';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useThemeStyles from '@hooks/useThemeStyles';

import {setPolicyMemberCategoryVisibility} from '@libs/actions/Policy/Category';
import {getMemberVisibleCategoryNames} from '@libs/CategoryUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getMemberAccountIDsForWorkspace, isControlPolicy} from '@libs/PolicyUtils';
import {cancelSpan, endSpan} from '@libs/telemetry/activeSpans';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React, {useEffect} from 'react';
import {View} from 'react-native';

import CategoryVisibilitySelectionList from './CategoryVisibilitySelectionList';

type WorkspaceMemberCategoryVisibilityPageProps = Omit<WithPolicyAndFullscreenLoadingProps, 'route'> &
    PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.MEMBER_DETAILS_CATEGORY_VISIBILITY>;

function WorkspaceMemberCategoryVisibilityPage({policy, route}: WorkspaceMemberCategoryVisibilityPageProps) {
    const accountID = Number(route.params.accountID);
    const policyID = route.params.policyID;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {canWrite: canWriteCategories} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.CATEGORIES);
    const employeePersonalDetails = usePersonalDetailsByLogins(Object.keys(policy?.employeeList ?? {}));

    const memberLogin = Object.keys(policy?.employeeList ?? {}).find((login) => employeePersonalDetails[login]?.accountID === accountID);

    const {categories, policyCategories, areCategoriesEnabled, isLoading} = useCategoryVisibilityCategories(policyID);

    // An unrestricted member sees every enabled category, so every row starts checked.
    const memberVisibleCategories = getMemberVisibleCategoryNames(policyCategories, accountID);

    const backToRoute = ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, accountID);

    useEffect(() => {
        if (isLoading) {
            return;
        }
        endSpan(CONST.TELEMETRY.SPAN_OPEN_MEMBER_CATEGORY_VISIBILITY);
    }, [isLoading]);

    // A no-op once the span has ended, so this only cancels it when the admin leaves before the list renders.
    useEffect(() => () => cancelSpan(CONST.TELEMETRY.SPAN_OPEN_MEMBER_CATEGORY_VISIBILITY), []);

    const saveCategoryVisibility = (categoriesToSave: string[]) => {
        const hasChanges = categoriesToSave.length !== memberVisibleCategories.length || categoriesToSave.some((categoryName) => !memberVisibleCategories.includes(categoryName));
        if (hasChanges) {
            const policyMemberAccountIDs = Object.values(getMemberAccountIDsForWorkspace(policy?.employeeList, employeePersonalDetails, true, false));
            if (!memberLogin) {
                return;
            }
            setPolicyMemberCategoryVisibility(policyID, [accountID], categoriesToSave, policyCategories ?? {}, policyMemberAccountIDs, [memberLogin]);
        }
        Navigation.goBack(backToRoute, {shouldSkipFocusRestore: true});
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            policyFeature={CONST.POLICY.POLICY_FEATURE.MEMBERS}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
            shouldBeBlocked={!isControlPolicy(policy) || !areCategoriesEnabled || !canWriteCategories || !memberLogin}
        >
            <ScreenWrapper
                testID="WorkspaceMemberCategoryVisibilityPage"
                shouldEnableMaxHeight
                offlineIndicatorStyle={styles.mtAuto}
                includeSafeAreaPaddingBottom
            >
                <HeaderWithBackButtonAndTitle
                    title={translate('workspace.people.categoryVisibility')}
                    onBackButtonPress={() => Navigation.goBack(backToRoute)}
                />
                {isLoading ? (
                    <View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter]}>
                        <ActivityIndicator size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE} />
                    </View>
                ) : (
                    <CategoryVisibilitySelectionList
                        categories={categories}
                        initialSelectedCategoryNames={memberVisibleCategories}
                        onSave={saveCategoryVisibility}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.MEMBERS.CATEGORY_VISIBILITY_SAVE}
                    />
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyAndFullscreenLoading(WorkspaceMemberCategoryVisibilityPage);
