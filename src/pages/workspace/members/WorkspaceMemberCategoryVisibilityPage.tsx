/**
 * Lets a workspace admin choose which of the workspace's enabled categories a member can use, from that member's
 * details page. Saving replaces the member's allowed categories with the checked ones.
 *
 * Opened from the Members list's bulk menu, it sets the same categories for every selected member instead. It then
 * starts with nothing checked, since those members may use different categories today.
 */
import ActivityIndicator from '@components/ActivityIndicator';
import BlockingView from '@components/BlockingViews/BlockingView';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SelectionList from '@components/SelectionList';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import type {ListItem} from '@components/SelectionList/types';

import useConfirmModal from '@hooks/useConfirmModal';
import useInitialSelection from '@hooks/useInitialSelection';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLoadPolicyCategories from '@hooks/useLoadPolicyCategories';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useOverridableSelection from '@hooks/useOverridableSelection';
import {usePersonalDetailsByLogins} from '@hooks/usePersonalDetailByLogin';
import usePolicyCategoryPickerCategories from '@hooks/usePolicyCategoryPickerCategories';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useRedirectToWorkspaceMembersWithoutSelection from '@hooks/useRedirectToWorkspaceMembersWithoutSelection';
import useSearchResults from '@hooks/useSearchResults';
import useThemeStyles from '@hooks/useThemeStyles';

import {setPolicyMemberCategoryVisibility} from '@libs/actions/Policy/Category';
import {clearWorkspaceMembersSelectedForBulkEdit} from '@libs/actions/Policy/Member';
import {getDecodedCategoryName, getMemberVisibleCategoryNames} from '@libs/CategoryUtils';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import Growl from '@libs/Growl';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getMemberAccountIDsForWorkspace, isControlPolicy} from '@libs/PolicyUtils';
import moveInitialSelectionToTop from '@libs/SelectionListOrderUtils';
import {cancelSpan, endSpan} from '@libs/telemetry/activeSpans';
import tokenizedSearch from '@libs/tokenizedSearch';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import getEmptyArray from '@src/types/utils/getEmptyArray';

import React, {useEffect} from 'react';
import {View} from 'react-native';

type WorkspaceMemberCategoryVisibilityPageProps = Omit<WithPolicyAndFullscreenLoadingProps, 'route'> &
    PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.MEMBER_DETAILS_CATEGORY_VISIBILITY | typeof SCREENS.WORKSPACE.MEMBERS_BULK_CATEGORY_VISIBILITY>;

type CategoryListItem = ListItem & {
    value: string;
};

function WorkspaceMemberCategoryVisibilityPage({policy, route}: WorkspaceMemberCategoryVisibilityPageProps) {
    const isBulkEdit = route.name === SCREENS.WORKSPACE.MEMBERS_BULK_CATEGORY_VISIBILITY;
    const accountID = 'accountID' in route.params ? Number(route.params.accountID) : CONST.DEFAULT_NUMBER_ID;
    const policyID = route.params.policyID;
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);
    const {canWrite: canWriteCategories} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.CATEGORIES);
    const {showConfirmModal} = useConfirmModal();
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

    const {categories, policyCategories, areCategoriesEnabled, isLoading: isLoadingPickerCategories} = usePolicyCategoryPickerCategories({policyID});
    const {isLoadingCompletePolicyCategories} = useLoadPolicyCategories(policyID);
    const isLoading = isLoadingPickerCategories || isLoadingCompletePolicyCategories;

    // An unrestricted member sees every enabled category, so every row starts checked. A bulk edit starts with nothing
    // checked, since the selected members may use different categories.
    const memberVisibleCategories = isBulkEdit ? getEmptyArray<string>() : getMemberVisibleCategoryNames(policyCategories, accountID);
    const {selectedKeys: selectedCategories, toggleKey: toggleCategoryName, toggleVisibleKeys} = useOverridableSelection(memberVisibleCategories);
    const initialSelectedCategories = useInitialSelection(memberVisibleCategories, {resetOnFocus: true});

    const backToRoute = isBulkEdit ? ROUTES.WORKSPACE_MEMBERS.getRoute(policyID) : ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, accountID);

    useEffect(() => {
        if (isLoading) {
            return;
        }
        endSpan(CONST.TELEMETRY.SPAN_OPEN_MEMBER_CATEGORY_VISIBILITY);
    }, [isLoading]);

    // A no-op once the span has ended, so this only cancels it when the admin leaves before the list renders.
    useEffect(() => () => cancelSpan(CONST.TELEMETRY.SPAN_OPEN_MEMBER_CATEGORY_VISIBILITY), []);

    const categoryItems: CategoryListItem[] = categories.map((category) => ({
        keyForList: category.name,
        text: getDecodedCategoryName(category.name),
        value: category.name,
        isSelected: selectedCategories.includes(category.name),
    }));

    const filterCategory = (item: CategoryListItem, searchInput: string) => tokenizedSearch([item], searchInput, (category) => [category.text ?? '']).length > 0;

    const sortedCategoryItems = moveInitialSelectionToTop(
        [...categoryItems].sort((a, b) => localeCompare(a.text ?? '', b.text ?? '')),
        initialSelectedCategories,
    );

    const [inputValue, setInputValue, filteredCategoryItems] = useSearchResults(sortedCategoryItems, filterCategory);

    const toggleCategory = (item: CategoryListItem) => toggleCategoryName(item.value);

    const toggleSelectAll = () => toggleVisibleKeys(filteredCategoryItems.map((item) => item.value));

    const handleSave = () => {
        // Only categories still on the list count, so one deleted or disabled since the page opened isn't saved.
        const categoriesToSave = categories.filter((category) => selectedCategories.includes(category.name)).map((category) => category.name);
        if (categoriesToSave.length === 0) {
            showConfirmModal({
                title: translate('workspace.people.categoryVisibilityRequiredModal.title'),
                prompt: translate('workspace.people.categoryVisibilityRequiredModal.description'),
                confirmText: translate('common.buttonConfirm'),
                shouldShowCancelButton: false,
            });
            return;
        }

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
                    <SelectionList
                        canSelectMultiple
                        shouldUpdateFocusedIndex
                        ListItem={MultiSelectListItem}
                        data={filteredCategoryItems}
                        selectedItems={selectedCategories}
                        shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                        onSelectRow={toggleCategory}
                        onSelectionButtonPress={toggleCategory}
                        onSelectAll={filteredCategoryItems.length > 0 ? toggleSelectAll : undefined}
                        textInputOptions={{
                            value: inputValue,
                            label: translate('common.search'),
                            onChangeText: setInputValue,
                        }}
                        style={{
                            listHeaderWrapperStyle: [styles.pt5, styles.pb2],
                            listHeaderSelectAllTextStyle: [styles.textLabelSupporting],
                        }}
                        listEmptyContent={
                            <ScrollView contentContainerStyle={[styles.flexGrow1]}>
                                <BlockingView
                                    icon={illustrations.Telescope}
                                    iconWidth={variables.emptyListIconWidth}
                                    iconHeight={variables.emptyListIconHeight}
                                    title={translate('common.noResultsFound')}
                                />
                            </ScrollView>
                        }
                        footerContent={
                            <FormAlertWithSubmitButton
                                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.MEMBERS.CATEGORY_VISIBILITY_SAVE}
                                buttonText={translate('common.save')}
                                isAlertVisible={false}
                                onSubmit={handleSave}
                                enabledWhenOffline
                                containerStyles={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
                            />
                        }
                    />
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyAndFullscreenLoading(WorkspaceMemberCategoryVisibilityPage);
