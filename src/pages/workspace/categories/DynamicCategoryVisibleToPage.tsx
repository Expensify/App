/**
 * Lets a workspace admin choose which members can use a category, from that category's settings page. Checked members
 * can use it and unchecked members can't. Unchecking every member disables the category.
 *
 * Opened from the Categories list's bulk menu, it sets the same members for every selected category instead. It then
 * starts with nothing checked, since those categories may have different members today, and saving replaces their
 * current visibility.
 */
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import UserListItem from '@components/SelectionList/ListItem/UserListItem';
import Text from '@components/Text';

import useConfirmModal from '@hooks/useConfirmModal';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useInitialSelection from '@hooks/useInitialSelection';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMembersNeedCategoryModal from '@hooks/useMembersNeedCategoryModal';
import useOnyx from '@hooks/useOnyx';
import useOverridableSelection from '@hooks/useOverridableSelection';
import usePermissions from '@hooks/usePermissions';
import {usePersonalDetailsByLogins} from '@hooks/usePersonalDetailByLogin';
import usePolicyData from '@hooks/usePolicyData';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useSearchResults from '@hooks/useSearchResults';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearWorkspaceCategoriesSelectedForBulkEdit, setPolicyCategoryMemberVisibility} from '@libs/actions/Policy/Category';
import {getDecodedCategoryName, getMembersWithoutVisibleCategories, isCategoryVisibleToMember} from '@libs/CategoryUtils';
import Growl from '@libs/Growl';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {formatMemberForList, isDisablingOrDeletingLastEnabledCategory} from '@libs/OptionsListUtils';
import type {MemberForList} from '@libs/OptionsListUtils';
import moveInitialSelectionToTop from '@libs/SelectionListOrderUtils';
import {cancelSpan, endSpan} from '@libs/telemetry/activeSpans';
import tokenizedSearch from '@libs/tokenizedSearch';

import type {SettingsNavigatorParamList} from '@navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import React, {useEffect} from 'react';

type DynamicCategoryVisibleToPageProps = PlatformStackScreenProps<
    SettingsNavigatorParamList,
    typeof SCREENS.WORKSPACE.DYNAMIC_CATEGORY_VISIBLE_TO | typeof SCREENS.WORKSPACE.DYNAMIC_CATEGORIES_BULK_VISIBLE_TO
>;

type MemberListItem = MemberForList & {
    /** The member's accountID, which moveInitialSelectionToTop matches against the initial selection */
    value: number;
};

function DynamicCategoryVisibleToPage({route}: DynamicCategoryVisibleToPageProps) {
    const policyID = route.params.policyID;
    const isBulkEdit = route.name === SCREENS.WORKSPACE.DYNAMIC_CATEGORIES_BULK_VISIBLE_TO;
    const categoryName = 'categoryName' in route.params ? route.params.categoryName : '';
    const styles = useThemeStyles();
    const {translate, localeCompare, formatPhoneNumber} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar']);
    const {isBetaEnabledOrUnknown} = usePermissions();
    const policyData = usePolicyData(policyID);
    const {policy, categories: policyCategories} = policyData;
    const {canWrite: canWriteCategories} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.CATEGORIES);
    const {showConfirmModal} = useConfirmModal();
    // The modal hook decides who counts as a current member, so the rows here match the members it checks.
    const {policyMemberAccountIDs: memberAccountIDs, policyMemberAccountIDsByLogin: memberAccountIDsByLogin, showMembersNeedCategoryModal} = useMembersNeedCategoryModal(policyID);
    const employeePersonalDetails = usePersonalDetailsByLogins(Object.keys(policy?.employeeList ?? {}));
    const backPath = useDynamicBackPath(isBulkEdit ? DYNAMIC_ROUTES.WORKSPACE_CATEGORIES_BULK_VISIBLE_TO.path : DYNAMIC_ROUTES.WORKSPACE_CATEGORY_VISIBLE_TO.path);
    const [bulkEditSelection] = useOnyx(ONYXKEYS.RAM_ONLY_WORKSPACE_CATEGORIES_SELECTED_FOR_BULK_EDIT);

    // Categories picked on another workspace's list are left out. The selection only lives in memory, so a bulk edit
    // opened from a link or after a refresh has none and shows not found.
    const bulkEditCategoryNames = bulkEditSelection?.policyID === policyID ? bulkEditSelection.categoryNames : [];
    // The server rejects visibility changes on a disabled category. A pending enabled change means this page just disabled
    // the category by unchecking every member, so the page stays as it is while it closes instead of flashing not found.
    const targetCategoryNames = (isBulkEdit ? bulkEditCategoryNames : [categoryName]).filter((name) => {
        const category = policyCategories[name];
        return !!category && (category.enabled || !!category.pendingFields?.enabled);
    });

    const policyCategory = policyCategories[categoryName];
    // A missing visibleTo means every member can use the category, so every row starts checked. A bulk edit starts with
    // nothing checked, since the selected categories may have different members today.
    const visibleAccountIDs = isBulkEdit ? [] : memberAccountIDs.filter((accountID) => isCategoryVisibleToMember(policyCategory, accountID));
    // Rows are keyed by the member's accountID as a string, which is what the list and the selection hook compare.
    const visibleMemberKeys = visibleAccountIDs.map((accountID) => String(accountID));
    const {selectedKeys, toggleKey, toggleVisibleKeys} = useOverridableSelection(visibleMemberKeys);
    const initialSelectedKeys = useInitialSelection(visibleMemberKeys, {resetOnFocus: true});

    // Every row and the save check look members up by key, so a Set keeps large workspaces from scanning the whole selection per member.
    const selectedKeySet = new Set(selectedKeys);

    // The admin is always a member, so an empty list means the policy and its members haven't loaded yet.
    const hasMembers = memberAccountIDs.length > 0;
    useEffect(() => {
        if (!hasMembers) {
            return;
        }
        endSpan(CONST.TELEMETRY.SPAN_OPEN_CATEGORY_VISIBLE_TO);
    }, [hasMembers]);

    // A no-op once the span has ended, so this only cancels it when the admin leaves before the list renders.
    useEffect(() => () => cancelSpan(CONST.TELEMETRY.SPAN_OPEN_CATEGORY_VISIBLE_TO), []);

    const memberItems: MemberListItem[] = Object.entries(memberAccountIDsByLogin).map(([login, accountID]) => {
        const personalDetail = employeePersonalDetails[login];
        const formattedLogin = formatPhoneNumber(login);
        return {
            ...formatMemberForList({
                text: personalDetail?.displayName || formattedLogin,
                alternateText: formattedLogin,
                login,
                accountID,
                icons: [
                    {
                        source: personalDetail?.avatar ?? icons.FallbackAvatar,
                        name: formattedLogin,
                        type: CONST.ICON_TYPE_AVATAR,
                        id: accountID,
                    },
                ],
                reportID: '',
                keyForList: String(accountID),
                isSelected: selectedKeySet.has(String(accountID)),
            }),
            value: accountID,
        };
    });

    const filterMember = (item: MemberListItem, searchInput: string) => tokenizedSearch([item], searchInput, (member) => [member.text, member.alternateText]).length > 0;

    const sortedMemberItems = moveInitialSelectionToTop(
        [...memberItems].sort((a, b) => localeCompare(a.text, b.text)),
        initialSelectedKeys,
    );

    const [inputValue, setInputValue, filteredMemberItems, searchQuery] = useSearchResults(sortedMemberItems, filterMember);

    const toggleMember = (item: MemberListItem) => toggleKey(item.keyForList);

    const toggleSelectAll = () => toggleVisibleKeys(filteredMemberItems.map((item) => item.keyForList));

    const saveVisibility = () => {
        // Only current members count, so one removed since the page opened isn't sent.
        const newSelectedAccountIDs = memberAccountIDs.filter((accountID) => selectedKeySet.has(String(accountID)));
        const deselectedAccountIDs = memberAccountIDs.filter((accountID) => !selectedKeySet.has(String(accountID)));
        const visibleAccountIDSet = new Set(visibleAccountIDs);
        // Saving a bulk edit replaces every selected category's members, even for categories that already have exactly these
        const hasChanges = isBulkEdit || newSelectedAccountIDs.length !== visibleAccountIDs.length || newSelectedAccountIDs.some((accountID) => !visibleAccountIDSet.has(accountID));
        if (!hasChanges || targetCategoryNames.length === 0) {
            Navigation.goBack(backPath);
            return;
        }

        // Unchecking every member disables the categories, so the workspace's last enabled category can't be left that way.
        const isDisablingCategory = newSelectedAccountIDs.length === 0;
        if (
            isDisablingCategory &&
            isDisablingOrDeletingLastEnabledCategory(
                policy,
                policyCategories,
                targetCategoryNames.map((name) => policyCategories[name]),
            )
        ) {
            showConfirmModal({
                title: translate('workspace.categories.cannotDeleteOrDisableAllCategories.title'),
                prompt: translate('workspace.categories.cannotDeleteOrDisableAllCategories.description'),
                confirmText: translate('common.buttonConfirm'),
                shouldShowCancelButton: false,
            });
            return;
        }

        const membersWithoutVisibleCategories = getMembersWithoutVisibleCategories(policyCategories, targetCategoryNames, deselectedAccountIDs);
        if (membersWithoutVisibleCategories.length > 0) {
            showMembersNeedCategoryModal(membersWithoutVisibleCategories, targetCategoryNames, !isDisablingCategory);
            return;
        }

        setPolicyCategoryMemberVisibility(policyID, targetCategoryNames, newSelectedAccountIDs, deselectedAccountIDs, policyData, isBetaEnabledOrUnknown(CONST.BETAS.VENDOR_MATCHING));
        if (!isBulkEdit) {
            Navigation.goBack(backPath);
            return;
        }

        // Clearing the selection right away would leave this page with no categories, so it would show not found while it closes
        Navigation.goBack(backPath, {afterTransition: clearWorkspaceCategoriesSelectedForBulkEdit});
        // Disabled categories go back to everyone if they're enabled again, so no member's visibility was set
        if (!isDisablingCategory) {
            // Checking every member opens the categories to everyone, members who join later included, so the toast says everyone
            const isOpeningToEveryone = newSelectedAccountIDs.length === memberAccountIDs.length;
            Growl.success({
                bodyText: translate('workspace.people.bulkCategoryVisibilitySaved', {
                    categoryCount: translate('workspace.people.categoriesCount', {count: targetCategoryNames.length}),
                    memberCount: isOpeningToEveryone ? translate('workspaceActions.everyone') : translate('workspace.categories.membersCount', {count: newSelectedAccountIDs.length}),
                }),
                duration: CONST.GROWL.DURATION_LONG,
            });
        }
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}
            shouldBeBlocked={!canWriteCategories || targetCategoryNames.length === 0}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={[styles.defaultModalContainer]}
                testID="DynamicCategoryVisibleToPage"
                shouldEnableMaxHeight
            >
                <HeaderWithBackButtonAndTitle
                    title={translate(isBulkEdit ? 'workspace.categories.editVisibility' : 'workspace.categories.visibleTo')}
                    onBackButtonPress={() => Navigation.goBack(backPath)}
                />
                <SelectionList
                    canSelectMultiple
                    shouldUpdateFocusedIndex
                    ListItem={UserListItem}
                    data={filteredMemberItems}
                    selectedItems={selectedKeys}
                    onSelectRow={toggleMember}
                    onSelectAll={filteredMemberItems.length > 0 ? toggleSelectAll : undefined}
                    customListHeaderContent={
                        <Text style={[styles.ph5, styles.pb3]}>
                            {isBulkEdit
                                ? translate('workspace.categories.bulkVisibleToDescription')
                                : translate('workspace.categories.visibleToDescription', {categoryName: getDecodedCategoryName(categoryName)})}
                        </Text>
                    }
                    textInputOptions={{
                        value: inputValue,
                        label: translate('common.search'),
                        onChangeText: setInputValue,
                        headerMessage: searchQuery.trim() && filteredMemberItems.length === 0 ? translate('common.noResultsFound') : '',
                        shouldBeInsideList: true,
                    }}
                    shouldHeaderBeInsideList
                    // The search input lives inside the list, so the empty state would replace it. The header message says there are no results instead.
                    shouldShowListEmptyContent={false}
                    style={{
                        listHeaderWrapperStyle: [styles.pt5, styles.pb2],
                        listHeaderSelectAllTextStyle: [styles.textLabelSupporting],
                    }}
                    footerContent={
                        <FormAlertWithSubmitButton
                            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.CATEGORIES.VISIBLE_TO_SAVE}
                            buttonText={translate('common.save')}
                            isAlertVisible={false}
                            onSubmit={saveVisibility}
                            // Saving before the members load would read as unchecking every member, which disables the categories in a bulk edit
                            isDisabled={!hasMembers}
                            enabledWhenOffline
                            containerStyles={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
                        />
                    }
                    addBottomSafeAreaPadding
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default DynamicCategoryVisibleToPage;
