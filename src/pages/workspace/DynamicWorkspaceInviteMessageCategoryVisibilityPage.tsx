/**
 * Lets a workspace admin choose which categories the members they're inviting can use, from the invite's "Confirm
 * details" screen. The choice is kept as a draft until the invite is sent.
 */
import ActivityIndicator from '@components/ActivityIndicator';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import ScreenWrapper from '@components/ScreenWrapper';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLoadPolicyCategories from '@hooks/useLoadPolicyCategories';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicyCategoryPickerCategories from '@hooks/usePolicyCategoryPickerCategories';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearWorkspaceInviteCategoryVisibilityDraft, setWorkspaceInviteCategoryVisibilityDraft} from '@libs/actions/Policy/Member';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {canSetInvitedMembersCategoryVisibility, goBackFromInvalidPolicy} from '@libs/PolicyUtils';
import {cancelSpan, endSpan} from '@libs/telemetry/activeSpans';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import React, {useEffect} from 'react';
import {View} from 'react-native';

import type {WithPolicyAndFullscreenLoadingProps} from './withPolicyAndFullscreenLoading';

import AccessOrNotFoundWrapper from './AccessOrNotFoundWrapper';
import CategoryVisibilitySelectionList from './members/CategoryVisibilitySelectionList';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';

type DynamicWorkspaceInviteMessageCategoryVisibilityPageProps = WithPolicyAndFullscreenLoadingProps &
    PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_INVITE_MESSAGE_CATEGORY_VISIBILITY>;

function DynamicWorkspaceInviteMessageCategoryVisibilityPage({policy, route}: DynamicWorkspaceInviteMessageCategoryVisibilityPageProps) {
    const policyID = route.params.policyID;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.WORKSPACE_INVITE_MESSAGE_CATEGORY_VISIBILITY.path);
    const [categoryVisibilityDraft] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_CATEGORY_VISIBILITY_DRAFT}${policyID}`);

    const {categories, isLoading: isLoadingPickerCategories} = usePolicyCategoryPickerCategories({policyID});
    const {isLoadingCompletePolicyCategories} = useLoadPolicyCategories(policyID);
    const isLoading = isLoadingPickerCategories || isLoadingCompletePolicyCategories;

    // Without a draft the members being invited can use every category, so every row starts checked.
    const initialSelectedCategoryNames = categoryVisibilityDraft ?? categories.map((category) => category.name);

    useEffect(() => {
        if (isLoading) {
            return;
        }
        endSpan(CONST.TELEMETRY.SPAN_OPEN_INVITE_CATEGORY_VISIBILITY);
    }, [isLoading]);

    // A no-op once the span has ended, so this only cancels it when the admin leaves before the list renders.
    useEffect(() => () => cancelSpan(CONST.TELEMETRY.SPAN_OPEN_INVITE_CATEGORY_VISIBILITY), []);

    const saveCategoryVisibility = (categoryNames: string[]) => {
        // Checking every category leaves the members unrestricted, which is what having no draft means.
        if (categoryNames.length === categories.length) {
            clearWorkspaceInviteCategoryVisibilityDraft(policyID);
        } else {
            setWorkspaceInviteCategoryVisibilityDraft(policyID, categoryNames);
        }
        Navigation.goBack(backPath);
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            policyFeature={CONST.POLICY.POLICY_FEATURE.MEMBERS}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
            shouldBeBlocked={!canSetInvitedMembersCategoryVisibility(policy)}
            fullPageNotFoundViewProps={{subtitleKey: isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized', onLinkPress: goBackFromInvalidPolicy}}
        >
            <ScreenWrapper
                testID="WorkspaceInviteMessageCategoryVisibilityPage"
                shouldEnableMaxHeight
                offlineIndicatorStyle={styles.mtAuto}
                includeSafeAreaPaddingBottom
            >
                <HeaderWithBackButtonAndTitle
                    title={translate('workspace.people.categoryVisibility')}
                    onBackButtonPress={() => Navigation.goBack(backPath)}
                />
                {isLoading ? (
                    <View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter]}>
                        <ActivityIndicator size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE} />
                    </View>
                ) : (
                    <CategoryVisibilitySelectionList
                        categories={categories}
                        initialSelectedCategoryNames={initialSelectedCategoryNames}
                        onSave={saveCategoryVisibility}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.MEMBERS.INVITE_MESSAGE_CATEGORY_VISIBILITY_SAVE}
                    />
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyAndFullscreenLoading(DynamicWorkspaceInviteMessageCategoryVisibilityPage);
