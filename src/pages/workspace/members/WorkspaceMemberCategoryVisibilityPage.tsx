/**
 * Lets a workspace admin choose which of the workspace's enabled categories a member can use, from that member's
 * details page. Saving replaces the member's allowed categories with the checked ones.
 *
 * Opened from the Members list's bulk menu, it sets the same categories for every selected member instead. It then
 * starts with nothing checked, since those members may use different categories today.
 */
import ActivityIndicator from '@components/ActivityIndicator';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import ScreenWrapper from '@components/ScreenWrapper';

import useCategoryVisibilityCategories from '@hooks/useCategoryVisibilityCategories';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {usePersonalDetailsByLogins} from '@hooks/usePersonalDetailByLogin';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useRedirectToWorkspaceMembersWithoutSelection from '@hooks/useRedirectToWorkspaceMembersWithoutSelection';
import useThemeStyles from '@hooks/useThemeStyles';

import {setPolicyMemberCategoryVisibility} from '@libs/actions/Policy/Category';
import {clearWorkspaceMembersSelectedForBulkEdit} from '@libs/actions/Policy/Member';
import {getMemberVisibleCategoryNames} from '@libs/CategoryUtils';
import Growl from '@libs/Growl';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getMemberAccountIDsForWorkspace, isControlPolicy} from '@libs/PolicyUtils';
import {cancelSpan, endSpan} from '@libs/telemetry/activeSpans';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import getEmptyArray from '@src/types/utils/getEmptyArray';

import React, {useEffect} from 'react';
import {View} from 'react-native';

import CategoryVisibilitySelectionList from './CategoryVisibilitySelectionList';

type WorkspaceMemberCategoryVisibilityPageProps = Omit<WithPolicyAndFullscreenLoadingProps, 'route'> &
    PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.MEMBER_DETAILS_CATEGORY_VISIBILITY | typeof SCREENS.WORKSPACE.MEMBERS_BULK_CATEGORY_VISIBILITY>;

function WorkspaceMemberCategoryVisibilityPage({policy, route}: WorkspaceMemberCategoryVisibilityPageProps) {
    const isBulkEdit = route.name === SCREENS.WORKSPACE.MEMBERS_BULK_CATEGORY_VISIBILITY;
    const accountID = 'accountID' in route.params ? Number(route.params.accountID) : CONST.DEFAULT_NUMBER_ID;
    const policyID = route.params.policyID;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {canWrite: canWriteCategories} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.CATEGORIES);
    const employeeLogins = Object.keys(policy?.employeeList ?? {});
    const employeePersonalDetails = usePersonalDetailsByLogins(employeeLogins);
    const [bulkEditSelection] = useOnyx(ONYXKEYS.RAM_ONLY_WORKSPACE_MEMBERS_SELECTED_FOR_BULK_EDIT);

    // Members picked on another workspace's member list are left out, even when they also belong to this one
    const bulkEditAccountIDs = isBulkEdit && bulkEditSelection?.policyID === policyID ? bulkEditSelection.accountIDs : [];
    const accountIDs = isBulkEdit ? bulkEditAccountIDs : [accountID];
    const loginsByAccountID = new Map<number, string>();
    for (const login of employeeLogins) {
        const employeeAccountID = employeePersonalDetails[login]?.accountID;
        if (employeeAccountID !== undefined && !loginsByAccountID.has(employeeAccountID)) {
            loginsByAccountID.set(employeeAccountID, login);
        }
    }
    const memberLogins = accountIDs.map((memberAccountID) => loginsByAccountID.get(memberAccountID)).filter((login): login is string => !!login);
    const memberLogin = memberLogins.at(0);

    // The selection only lives in memory, so a bulk edit opened from a link or after a refresh goes back to the list
    useRedirectToWorkspaceMembersWithoutSelection({policyID, selectedMemberCount: isBulkEdit ? bulkEditAccountIDs.length : 1});

    const {categories, policyCategories, areCategoriesEnabled, isLoading} = useCategoryVisibilityCategories(policyID);

    // An unrestricted member sees every enabled category, so every row starts checked. A bulk edit starts with nothing
    // checked, since the selected members may use different categories.
    const memberVisibleCategories = isBulkEdit ? getEmptyArray<string>() : getMemberVisibleCategoryNames(policyCategories, accountID);

    const backToRoute = isBulkEdit ? ROUTES.WORKSPACE_MEMBERS.getRoute(policyID) : ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, accountID);

    useEffect(() => {
        if (isLoading) {
            return;
        }
        endSpan(CONST.TELEMETRY.SPAN_OPEN_MEMBER_CATEGORY_VISIBILITY);
    }, [isLoading]);

    // A no-op once the span has ended, so this only cancels it when the admin leaves before the list renders.
    useEffect(() => () => cancelSpan(CONST.TELEMETRY.SPAN_OPEN_MEMBER_CATEGORY_VISIBILITY), []);

    const saveCategoryVisibility = (categoriesToSave: string[]) => {
        const policyMemberAccountIDs = Object.values(getMemberAccountIDsForWorkspace(policy?.employeeList, employeePersonalDetails, true, false));

        if (isBulkEdit) {
            // Saving replaces every selected member's categories, even for members who already have exactly these
            setPolicyMemberCategoryVisibility(policyID, accountIDs, categoriesToSave, policyCategories ?? {}, policyMemberAccountIDs, memberLogins);
            Navigation.goBack(backToRoute, {afterTransition: clearWorkspaceMembersSelectedForBulkEdit});
            Growl.success({
                bodyText: translate('workspace.people.bulkCategoryVisibilitySaved', {
                    categoryCount: translate('workspace.people.categoriesCount', {count: categoriesToSave.length}),
                    memberCount: translate('workspace.categories.membersCount', {count: accountIDs.length}),
                }),
            });
            return;
        }

        const hasChanges = categoriesToSave.length !== memberVisibleCategories.length || categoriesToSave.some((categoryName) => !memberVisibleCategories.includes(categoryName));
        if (hasChanges) {
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
            shouldBeBlocked={!isControlPolicy(policy) || !areCategoriesEnabled || !canWriteCategories || (!isBulkEdit && !memberLogin)}
        >
            <ScreenWrapper
                testID="WorkspaceMemberCategoryVisibilityPage"
                shouldEnableMaxHeight
                offlineIndicatorStyle={styles.mtAuto}
                includeSafeAreaPaddingBottom
            >
                <HeaderWithBackButtonAndTitle
                    title={translate(isBulkEdit ? 'workspace.people.editCategoryVisibility' : 'workspace.people.categoryVisibility')}
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
