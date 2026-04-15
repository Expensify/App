import React from 'react';
import {View} from 'react-native';
import GenericEmptyStateComponent from '@components/EmptyStateComponent/GenericEmptyStateComponent';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchBar from '@components/SearchBar';
import TableListItem from '@components/SelectionList/ListItem/TableListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionListWithModal from '@components/SelectionListWithModal';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchResults from '@hooks/useSearchResults';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLatestError} from '@libs/ErrorUtils';
import {sortAlphabetically} from '@libs/OptionsListUtils';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import type {BrickRoad} from '@libs/WorkspacesSettingsUtils';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Errors, PendingAction} from '@src/types/onyx/OnyxCommon';
import type IconAsset from '@src/types/utils/IconAsset';
import DomainNotFoundPageWrapper from './DomainNotFoundPageWrapper';

type MemberOption = Omit<ListItem, 'accountID' | 'login'> & {
    /** Member accountID */
    accountID: number;
    /** Member login */
    login: string;
};

type BaseDomainMembersPageProps = {
    /** The ID of the domain used for the not found wrapper */
    domainAccountID: number;

    /** The list of accountIDs to display */
    accountIDs: number[];

    /** The title of the header */
    headerTitle: string;

    /** Function to render a custom list header row. */
    getCustomListHeader: () => React.ReactNode;

    /** Placeholder text for the search bar */
    searchPlaceholder: string;

    /** Content to display in the header (e.g., Add/Settings buttons) */
    headerContent?: React.ReactNode;

    /** Callback fired when a row is selected */
    onSelectRow: (item: MemberOption) => void;

    /** Icon displayed in the header of the tab */
    headerIcon?: IconAsset;

    /** Function to render a custom right element for a row */
    getCustomRightElement?: (accountID: number) => React.ReactNode;

    /** Function to return additional row-specific properties like errors or pending actions */
    getCustomRowProps?: (accountID: number, accountEmail?: string) => {errors?: Errors; pendingAction?: PendingAction; brickRoadIndicator?: BrickRoad};

    /** Callback fired when the user dismisses an error message for a specific row */
    onDismissError?: (item: MemberOption) => void;

    /** Allow multiple members to be selected at the same time. Defaults to false. */
    canSelectMultiple?: boolean;

    /** Stores list of selected members. Only works with canSelectMultiple === true. */
    selectedMembers?: string[];

    /** Setter for a list of selected members. Only works with canSelectMultiple === true. */
    setSelectedMembers?: React.Dispatch<React.SetStateAction<string[]>>;

    /** Whether the selection mode header should be shown (changes title and hides icon) */
    useSelectionModeHeader?: boolean;

    /** Custom back button press handler */
    onBackButtonPress?: () => void;

    /** Weather long press should enable selection mode on mobile */
    turnOnSelectionModeOnLongPress?: boolean;

    /** Optional accessory element to display next to the search bar (e.g., filter dropdown) */
    searchBarAccessory?: React.ReactNode;

    /** Optional filter applied unconditionally before text search (e.g. group filter). */
    preFilter?: (item: MemberOption) => boolean;

    /** Title to show in the empty state when the list has no items */
    emptyStateTitle?: string;

    /** Subtitle to show in the empty state when the list has no items */
    emptyStateSubtitle?: string;
};

function BaseDomainMembersPage({
    domainAccountID,
    accountIDs,
    headerTitle,
    getCustomListHeader,
    searchPlaceholder,
    headerContent,
    onSelectRow,
    headerIcon,
    getCustomRightElement,
    getCustomRowProps,
    onDismissError,
    selectedMembers,
    setSelectedMembers,
    canSelectMultiple = false,
    useSelectionModeHeader,
    turnOnSelectionModeOnLongPress = false,
    onBackButtonPress,
    searchBarAccessory,
    preFilter,
    emptyStateTitle,
    emptyStateSubtitle,
}: BaseDomainMembersPageProps) {
    const {formatPhoneNumber, localeCompare, translate} = useLocalize();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar']);
    const illustrations = useMemoizedLazyIllustrations(['EmptyShelves']);

    const data: MemberOption[] = accountIDs
        .filter((accountID) => {
            const details = personalDetails?.[accountID];
            return !!details?.login || !!details?.displayName;
        })
        .map((accountID) => {
            const details = personalDetails?.[accountID];
            const login = details?.login ?? '';
            const customProps = getCustomRowProps?.(accountID, login);
            const isPendingActionDelete = customProps?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

            return {
                keyForList: String(accountID),
                accountID,
                login,
                text: formatPhoneNumber(getDisplayNameOrDefault(details)),
                alternateText: formatPhoneNumber(login),
                icons: [
                    {
                        source: details?.avatar ?? icons.FallbackAvatar,
                        name: formatPhoneNumber(login),
                        type: CONST.ICON_TYPE_AVATAR,
                        id: accountID,
                    },
                ],
                rightElement: getCustomRightElement?.(accountID),
                errors: getLatestError(customProps?.errors),
                pendingAction: customProps?.pendingAction,
                isInteractive: !isPendingActionDelete && !details?.isOptimisticPersonalDetail,
                isDisabled: isPendingActionDelete,
                isDisabledCheckbox: isPendingActionDelete || !!details?.isOptimisticPersonalDetail,
                brickRoadIndicator: customProps?.brickRoadIndicator,
            };
        });

    const filterMember = (memberOption: MemberOption, searchQuery: string) => {
        const results = tokenizedSearch([memberOption], searchQuery, (option) => [option.text ?? '', option.alternateText ?? '']);
        return results.length > 0;
    };

    const sortMembers = (options: MemberOption[]) => sortAlphabetically(options, 'text', localeCompare);

    const [inputValue, setInputValue, filteredData] = useSearchResults(data, filterMember, sortMembers, preFilter);

    const isUserToggleEnabled = setSelectedMembers && filteredData.length > 0;

    const toggleAllUsers = isUserToggleEnabled
        ? () => {
              const enabledAccounts = filteredData.filter((member) => !member.isDisabled && !member.isDisabledCheckbox);
              const enabledAccountIDs = enabledAccounts.map((member) => member.keyForList);
              const everySelected = enabledAccountIDs.every((accountID) => selectedMembers?.includes(accountID));

              if (everySelected) {
                  setSelectedMembers((prevSelected) => prevSelected.filter((accountID) => !enabledAccountIDs.includes(accountID)));
              } else {
                  setSelectedMembers((prevSelected) => {
                      const newSelected = new Set([...prevSelected, ...enabledAccountIDs]);
                      return Array.from(newSelected);
                  });
              }
          }
        : undefined;

    const toggleUser = isUserToggleEnabled
        ? (member: MemberOption) => {
              if (selectedMembers?.includes(member.keyForList)) {
                  setSelectedMembers((prevSelected) => prevSelected.filter((accountID) => accountID !== member.keyForList));
              } else {
                  setSelectedMembers((prevSelected) => [...prevSelected, member.keyForList]);
              }
          }
        : undefined;

    const getFilteredListHeader = () => {
        if (filteredData.length === 0) {
            return null;
        }
        return getCustomListHeader();
    };

    const shouldShowSearchBar = data.length > CONST.SEARCH_ITEM_LIMIT;
    const shouldShowEmptySearchMessage = !!shouldShowSearchBar && inputValue.length !== 0 && filteredData.length === 0;
    // Show empty pre filter state only if we have data, filtered data is empty, but the search have not been used.
    const shouldShowEmptyPreFilterState = filteredData.length === 0 && data.length !== 0 && !!emptyStateTitle && inputValue.length === 0;
    const listHeaderContent =
        searchBarAccessory || shouldShowSearchBar ? (
            <View style={styles.flexColumn}>
                <View style={[styles.mh5, styles.gap3, styles.mb5, shouldUseNarrowLayout ? styles.flexColumn : styles.flexRow]}>
                    {!!searchBarAccessory && (
                        <View
                            style={[
                                shouldUseNarrowLayout && styles.w100,
                                shouldShowSearchBar && !shouldUseNarrowLayout && styles.h13,
                                shouldShowSearchBar && !shouldUseNarrowLayout && styles.justifyContentCenter,
                            ]}
                        >
                            {searchBarAccessory}
                        </View>
                    )}
                    {shouldShowSearchBar && (
                        <View style={[shouldUseNarrowLayout && styles.w100]}>
                            <SearchBar
                                inputValue={inputValue}
                                onChangeText={setInputValue}
                                label={searchPlaceholder}
                                shouldShowEmptyState={false}
                                style={[styles.flex1, styles.mh0, styles.mb0]}
                            />
                        </View>
                    )}
                </View>
                {shouldShowEmptySearchMessage && (
                    <View style={[styles.ph5, styles.pb5]}>
                        <Text style={[styles.textNormal, styles.colorMuted]}>{translate('common.noResultsFoundMatching', inputValue)}</Text>
                    </View>
                )}
            </View>
        ) : null;

    const listFooterContent = shouldShowEmptyPreFilterState ? (
        <GenericEmptyStateComponent
            headerMedia={illustrations.EmptyShelves}
            headerContentStyles={styles.emptyShelvesIllustration}
            title={emptyStateTitle ?? ''}
            subtitle={emptyStateSubtitle}
            headerStyles={styles.emptyStateCardIllustrationContainer}
        />
    ) : undefined;
    return (
        <DomainNotFoundPageWrapper domainAccountID={domainAccountID}>
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                shouldShowOfflineIndicatorInWideScreen
                testID="BaseDomainMembersPage"
            >
                <HeaderWithBackButton
                    title={useSelectionModeHeader ? translate('common.selectMultiple') : headerTitle}
                    onBackButtonPress={onBackButtonPress ?? Navigation.goBack}
                    icon={!useSelectionModeHeader ? headerIcon : undefined}
                    shouldShowBackButton={shouldUseNarrowLayout}
                    shouldUseHeadlineHeader={!useSelectionModeHeader}
                >
                    {!shouldUseNarrowLayout && !!headerContent && <View style={[styles.flexRow, styles.gap2]}>{headerContent}</View>}
                </HeaderWithBackButton>
                {shouldUseNarrowLayout && !!headerContent && <View style={[styles.ph5, styles.flexRow, styles.gap2]}>{headerContent}</View>}
                <SelectionListWithModal
                    data={filteredData}
                    shouldShowRightCaret
                    style={{
                        containerStyle: styles.flex1,
                        listHeaderWrapperStyle: styles.baseListHeaderWrapperStyle,
                        listItemTitleContainerStyles: shouldUseNarrowLayout ? undefined : styles.pr3,
                        listItemErrorRowStyles: [styles.ph4, styles.pb2],
                        contentContainerStyle: shouldShowEmptyPreFilterState ? [styles.flex1, styles.mh100] : undefined,
                        listFooterContentStyle: shouldShowEmptyPreFilterState ? styles.flex1 : undefined,
                    }}
                    ListItem={TableListItem}
                    onSelectRow={onSelectRow}
                    onDismissError={onDismissError}
                    shouldShowListEmptyContent={false}
                    showScrollIndicator={false}
                    customListHeader={getFilteredListHeader()}
                    shouldHeaderBeInsideList
                    canSelectMultiple={canSelectMultiple}
                    customListHeaderContent={listHeaderContent}
                    onSelectAll={toggleAllUsers}
                    onCheckboxPress={toggleUser}
                    selectedItems={selectedMembers}
                    turnOnSelectionModeOnLongPress={turnOnSelectionModeOnLongPress}
                    onTurnOnSelectionMode={(item) => item && toggleUser?.(item)}
                    listFooterContent={listFooterContent}
                />
            </ScreenWrapper>
        </DomainNotFoundPageWrapper>
    );
}

export type {MemberOption};
export default BaseDomainMembersPage;
