/**
 * Lets a workspace admin choose which members can use a category, from that category's settings page. Checked members
 * can use it and unchecked members can't. Unchecking every member disables the category.
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
import useOverridableSelection from '@hooks/useOverridableSelection';
import usePermissions from '@hooks/usePermissions';
import {usePersonalDetailsByLogins} from '@hooks/usePersonalDetailByLogin';
import usePolicyData from '@hooks/usePolicyData';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useSearchResults from '@hooks/useSearchResults';
import useThemeStyles from '@hooks/useThemeStyles';

import {setPolicyCategoryMemberVisibility} from '@libs/actions/Policy/Category';
import {getDecodedCategoryName, getMembersWithoutVisibleCategories, isCategoryVisibleToMember} from '@libs/CategoryUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {formatMemberForList, isDisablingOrDeletingLastEnabledCategory} from '@libs/OptionsListUtils';
import type {MemberForList} from '@libs/OptionsListUtils';
import moveInitialSelectionToTop from '@libs/SelectionListOrderUtils';
import {endSpan} from '@libs/telemetry/activeSpans';
import tokenizedSearch from '@libs/tokenizedSearch';

import type {SettingsNavigatorParamList} from '@navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React, {useEffect} from 'react';

type DynamicCategoryVisibleToPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_CATEGORY_VISIBLE_TO>;

type MemberListItem = MemberForList & {
    /** The member's accountID, which moveInitialSelectionToTop matches against the initial selection */
    value: number;
};

function DynamicCategoryVisibleToPage({
    route: {
        params: {policyID, categoryName},
    },
}: DynamicCategoryVisibleToPageProps) {
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
    const categorySettingsBackPath = useDynamicBackPath(DYNAMIC_ROUTES.WORKSPACE_CATEGORY_VISIBLE_TO.path);

    const policyCategory = policyCategories[categoryName];
    // The server rejects visibility changes on a disabled category. A pending enabled change means this page just disabled
    // the category by unchecking every member, so the page stays as it is while it closes instead of flashing not found.
    const isCategoryDisabled = !!policyCategory && !policyCategory.enabled && !policyCategory.pendingFields?.enabled;

    // A missing visibleTo means every member can use the category, so every row starts checked.
    const visibleAccountIDs = memberAccountIDs.filter((accountID) => isCategoryVisibleToMember(policyCategory, accountID));
    // Rows are keyed by the member's accountID as a string, which is what the list and the selection hook compare.
    const visibleMemberKeys = visibleAccountIDs.map((accountID) => String(accountID));
    const {selectedKeys, toggleKey, toggleVisibleKeys} = useOverridableSelection(visibleMemberKeys);
    const initialSelectedKeys = useInitialSelection(visibleMemberKeys, {resetOnFocus: true});

    useEffect(() => {
        endSpan(CONST.TELEMETRY.SPAN_OPEN_CATEGORY_VISIBLE_TO);
    }, []);

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
                isSelected: selectedKeys.includes(String(accountID)),
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
        const newSelectedAccountIDs = memberAccountIDs.filter((accountID) => selectedKeys.includes(String(accountID)));
        const deselectedAccountIDs = memberAccountIDs.filter((accountID) => !selectedKeys.includes(String(accountID)));
        const hasChanges = newSelectedAccountIDs.length !== visibleAccountIDs.length || newSelectedAccountIDs.some((accountID) => !visibleAccountIDs.includes(accountID));
        if (!hasChanges || !policyCategory) {
            Navigation.goBack(categorySettingsBackPath);
            return;
        }

        // Unchecking every member disables the category, so the workspace's last enabled category can't be left that way.
        const isDisablingCategory = newSelectedAccountIDs.length === 0;
        if (isDisablingCategory && isDisablingOrDeletingLastEnabledCategory(policy, policyCategories, [policyCategory])) {
            showConfirmModal({
                title: translate('workspace.categories.cannotDeleteOrDisableAllCategories.title'),
                prompt: translate('workspace.categories.cannotDeleteOrDisableAllCategories.description'),
                confirmText: translate('common.buttonConfirm'),
                shouldShowCancelButton: false,
            });
            return;
        }

        const membersWithoutVisibleCategories = getMembersWithoutVisibleCategories(policyCategories, [categoryName], deselectedAccountIDs);
        if (membersWithoutVisibleCategories.length > 0) {
            showMembersNeedCategoryModal(membersWithoutVisibleCategories, [categoryName], !isDisablingCategory);
            return;
        }

        setPolicyCategoryMemberVisibility(policyID, [categoryName], newSelectedAccountIDs, deselectedAccountIDs, policyData, isBetaEnabledOrUnknown(CONST.BETAS.VENDOR_MATCHING));
        Navigation.goBack(categorySettingsBackPath);
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}
            shouldBeBlocked={!canWriteCategories || !policyCategory || isCategoryDisabled}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={[styles.defaultModalContainer]}
                testID="DynamicCategoryVisibleToPage"
                shouldEnableMaxHeight
            >
                <HeaderWithBackButtonAndTitle
                    title={translate('workspace.categories.visibleTo')}
                    onBackButtonPress={() => Navigation.goBack(categorySettingsBackPath)}
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
                        <Text style={[styles.ph5, styles.pb3]}>{translate('workspace.categories.visibleToDescription', {categoryName: getDecodedCategoryName(categoryName)})}</Text>
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
