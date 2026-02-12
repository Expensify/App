import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchBar from '@components/SearchBar';
import TableListItem from '@components/SelectionList/ListItem/TableListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionListWithModal from '@components/SelectionListWithModal';
import CustomListHeader from '@components/SelectionListWithModal/CustomListHeader';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchResults from '@hooks/useSearchResults';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLatestError} from '@libs/ErrorUtils';
import {sortAlphabetically} from '@libs/OptionsListUtils';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
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
    getCustomRowProps?: (accountID: number, accountEmail?: string) => {errors?: Errors; pendingAction?: PendingAction};

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
};

function BaseDomainMembersPage({
    domainAccountID,
    accountIDs,
    headerTitle,
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
}: BaseDomainMembersPageProps) {
    const {formatPhoneNumber, localeCompare, translate} = useLocalize();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: true});
    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar']);

    const data: MemberOption[] = accountIDs.map((accountID) => {
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
        };
    });

    const filterMember = (memberOption: MemberOption, searchQuery: string) => {
        const results = tokenizedSearch([memberOption], searchQuery, (option) => [option.text ?? '', option.alternateText ?? '']);
        return results.length > 0;
    };

    const sortMembers = (options: MemberOption[]) => sortAlphabetically(options, 'text', localeCompare);

    const [inputValue, setInputValue, filteredData] = useSearchResults(data, filterMember, sortMembers);

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

    const getCustomListHeader = () => {
        if (filteredData.length === 0) {
            return null;
        }
        return (
            <CustomListHeader
                canSelectMultiple={canSelectMultiple}
                leftHeaderText={headerTitle}
            />
        );
    };

    const listHeaderContent =
        data.length > CONST.SEARCH_ITEM_LIMIT ? (
            <SearchBar
                inputValue={inputValue}
                onChangeText={setInputValue}
                label={searchPlaceholder}
                shouldShowEmptyState={!filteredData.length}
            />
        ) : null;

    return (
        <DomainNotFoundPageWrapper domainAccountID={domainAccountID}>
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                shouldShowOfflineIndicatorInWideScreen
                testID={BaseDomainMembersPage.displayName}
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

                {shouldUseNarrowLayout && !!headerContent && <View style={[styles.pl5, styles.pr5, styles.flexRow, styles.gap2]}>{headerContent}</View>}

                <SelectionListWithModal
                    data={filteredData}
                    shouldShowRightCaret
                    style={{
                        containerStyle: styles.flex1,
                        listHeaderWrapperStyle: styles.baseListHeaderWrapperStyle,
                        listItemTitleContainerStyles: shouldUseNarrowLayout ? undefined : styles.pr3,
                        listItemErrorRowStyles: [styles.ph4, styles.pb2],
                    }}
                    ListItem={TableListItem}
                    onSelectRow={onSelectRow}
                    onDismissError={onDismissError}
                    showListEmptyContent={false}
                    showScrollIndicator={false}
                    shouldHeaderBeInsideList
                    customListHeader={getCustomListHeader()}
                    customListHeaderContent={listHeaderContent}
                    canSelectMultiple={canSelectMultiple}
                    onSelectAll={toggleAllUsers}
                    onCheckboxPress={toggleUser}
                    selectedItems={selectedMembers}
                    turnOnSelectionModeOnLongPress={turnOnSelectionModeOnLongPress}
                    onTurnOnSelectionMode={(item) => item && toggleUser?.(item)}
                />
            </ScreenWrapper>
        </DomainNotFoundPageWrapper>
    );
}

BaseDomainMembersPage.displayName = 'BaseDomainMembersPage';
export type {MemberOption};
export default BaseDomainMembersPage;
