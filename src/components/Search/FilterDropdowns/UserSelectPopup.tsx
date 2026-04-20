import isEmpty from 'lodash/isEmpty';
import React, {memo, useCallback, useMemo, useRef} from 'react';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import SelectionList from '@components/SelectionList';
import UserSelectionListItem from '@components/SelectionList/ListItem/UserSelectionListItem';
import type {ListItem, SelectionListHandle} from '@components/SelectionList/types';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchSelector from '@hooks/useSearchSelector';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import canFocusInputOnScreenFocus from '@libs/canFocusInputOnScreenFocus';
import {getParticipantsOption} from '@libs/OptionsListUtils';
import {getNonVisibleWorkspaceMemberExclusionLogins, getVisibleWorkspaceMemberLogins} from '@libs/PolicyUtils';
import type {OptionData} from '@libs/ReportUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList} from '@src/types/onyx';
import BasePopup from './BasePopup';

type UserSelectPopupProps = {
    /** The currently selected users */
    value: string[];

    /** The popup label */
    label?: string;

    /** Function to call to close the overlay when changes are applied */
    closeOverlay: () => void;

    /** Function to call when changes are applied */
    onChange: (value: string[]) => void;

    /**
     * Whether the search input should be displayed.
     * When undefined, defaults to showing search when user count >= CONST.STANDARD_LIST_ITEM_LIMIT (12 users).
     * Set to true to always show search, or false to never show search regardless of user count.
     */
    isSearchable?: boolean;

    /** Whether to scope suggestions to visible workspace members while preserving free-text entry */
    shouldScopeToVisibleWorkspaceMembers?: boolean;
};

function getFreeTextOption(identifier: string): OptionData {
    return {
        text: identifier,
        alternateText: identifier,
        login: identifier,
        displayName: identifier,
        accountID: CONST.DEFAULT_NUMBER_ID,
        // eslint-disable-next-line rulesdir/no-default-id-values
        reportID: '-1',
        keyForList: identifier,
        selected: true,
        isSelected: true,
        icons: [],
        searchText: identifier,
    };
}

function getOptionFromStoredValue(identifier: string, personalDetails: PersonalDetailsList | undefined, shouldAllowFreeText: boolean): OptionData | undefined {
    const participant = personalDetails?.[identifier] ?? Object.values(personalDetails ?? {}).find((personalDetail) => personalDetail?.login?.toLowerCase() === identifier.toLowerCase());
    if (participant) {
        return {
            ...getParticipantsOption(participant, personalDetails),
            isSelected: true,
        } as OptionData;
    }

    return shouldAllowFreeText ? getFreeTextOption(identifier) : undefined;
}

function UserSelectPopup({value, label, closeOverlay, onChange, isSearchable, shouldScopeToVisibleWorkspaceMembers = false}: UserSelectPopupProps) {
    const selectionListRef = useRef<SelectionListHandle<ListItem> | null>(null);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const personalDetails = usePersonalDetails();
    const {windowHeight} = useWindowDimensions();
    const {shouldUseNarrowLayout, isInLandscapeMode} = useResponsiveLayout();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserAccountID = currentUserPersonalDetails.accountID;
    const currentUserLogin = currentUserPersonalDetails.login ?? currentUserPersonalDetails.email ?? '';
    const shouldFocusInputOnScreenFocus = canFocusInputOnScreenFocus();
    const [isSearchingForReports] = useOnyx(ONYXKEYS.RAM_ONLY_IS_SEARCHING_FOR_REPORTS);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const visibleWorkspaceMemberLogins = useMemo(
        () => (shouldScopeToVisibleWorkspaceMembers ? getVisibleWorkspaceMemberLogins(allPolicies, currentUserLogin) : CONST.EMPTY_OBJECT),
        [allPolicies, currentUserLogin, shouldScopeToVisibleWorkspaceMembers],
    );
    const excludeFromSuggestionsOnly = useMemo(
        () => (shouldScopeToVisibleWorkspaceMembers ? getNonVisibleWorkspaceMemberExclusionLogins(personalDetails, visibleWorkspaceMemberLogins) : CONST.EMPTY_OBJECT),
        [personalDetails, shouldScopeToVisibleWorkspaceMembers, visibleWorkspaceMemberLogins],
    );
    const initialSelectedOptions = useMemo(() => {
        return value.reduce<OptionData[]>((options, id) => {
            const optionData = getOptionFromStoredValue(id, personalDetails, shouldScopeToVisibleWorkspaceMembers);
            if (!optionData) {
                return options;
            }

            options.push(optionData);
            return options;
        }, []);
    }, [value, personalDetails, shouldScopeToVisibleWorkspaceMembers]);

    const {searchTerm, debouncedSearchTerm, setSearchTerm, availableOptions, selectedOptions, toggleSelection, areOptionsInitialized, selectedOptionsForDisplay, onListEndReached} =
        useSearchSelector({
            selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
            searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_GENERAL,
            initialSelected: initialSelectedOptions,
            excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
            excludeFromSuggestionsOnly,
            maxRecentReportsToShow: CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
            includeUserToInvite: shouldScopeToVisibleWorkspaceMembers,
            includeCurrentUser: true,
            includeRecentReports: !shouldScopeToVisibleWorkspaceMembers,
            shouldAllowNameOnlyOptions: shouldScopeToVisibleWorkspaceMembers,
        });

    const listData = useMemo(() => {
        const personalDetailsList = availableOptions.personalDetails.map((participant) => ({
            ...participant,
            keyForList: String(participant.accountID),
        }));
        const recentReports = shouldScopeToVisibleWorkspaceMembers
            ? []
            : availableOptions.recentReports.map((report) => ({
                  ...report,
                  keyForList: String(report.reportID),
              }));
        const userToInvite = availableOptions.userToInvite
            ? [{...availableOptions.userToInvite, keyForList: availableOptions.userToInvite.keyForList ?? availableOptions.userToInvite.login ?? ''}]
            : [];
        const combinedOptions = [...selectedOptionsForDisplay, ...userToInvite, ...personalDetailsList, ...recentReports];

        // Sort the options so that selected items appear first, and the current user appears right after that, followed by the rest of the options in their original order
        combinedOptions.sort((a, b) => {
            // selected items first
            if (a.isSelected && !b.isSelected) {
                return -1;
            }
            if (!a.isSelected && b.isSelected) {
                return 1;
            }

            // Put the current user at the top of the list
            if (a.accountID === currentUserAccountID) {
                return -1;
            }
            if (b.accountID === currentUserAccountID) {
                return 1;
            }
            return 0;
        });

        const combinedOptionsWithKeyForList = combinedOptions.map((option) => ({
            ...option,
            keyForList: option.keyForList ?? option.login ?? '',
        }));
        return combinedOptionsWithKeyForList;
    }, [
        availableOptions.personalDetails,
        availableOptions.recentReports,
        availableOptions.userToInvite,
        selectedOptionsForDisplay,
        currentUserAccountID,
        shouldScopeToVisibleWorkspaceMembers,
    ]);

    const headerMessage = useMemo(() => {
        const noResultsFound = isEmpty(listData);
        return noResultsFound ? translate('common.noResultsFound') : undefined;
    }, [listData, translate]);

    const selectUser = useCallback(
        (option: OptionData) => {
            toggleSelection(option);
            selectionListRef?.current?.scrollToIndex(0);
        },
        [toggleSelection],
    );

    const applyChanges = useCallback(() => {
        const selectedUsers = selectedOptions
            .map((option) => {
                if (!shouldScopeToVisibleWorkspaceMembers) {
                    return option.accountID ? option.accountID.toString() : undefined;
                }

                if (option.accountID && option.accountID !== CONST.DEFAULT_NUMBER_ID && personalDetails?.[option.accountID]) {
                    return option.accountID.toString();
                }

                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- need || to handle empty string
                return option.displayName || option.login || option.text;
            })
            .filter(Boolean) as string[];
        closeOverlay();
        onChange(selectedUsers);
    }, [closeOverlay, onChange, personalDetails, selectedOptions, shouldScopeToVisibleWorkspaceMembers]);

    const resetChanges = useCallback(() => {
        onChange([]);
        closeOverlay();
    }, [closeOverlay, onChange]);

    const isLoadingNewOptions = !!isSearchingForReports;
    const optionsCount = selectedOptionsForDisplay.length + availableOptions.personalDetails.length + availableOptions.recentReports.length + (availableOptions.userToInvite ? 1 : 0);

    const shouldShowSearchInput = shouldScopeToVisibleWorkspaceMembers || !!debouncedSearchTerm || (isSearchable ?? optionsCount >= CONST.STANDARD_LIST_ITEM_LIMIT);

    const textInputOptions = useMemo(
        () =>
            shouldShowSearchInput
                ? {
                      value: searchTerm,
                      label: translate('selectionList.searchForSomeone'),
                      onChangeText: setSearchTerm,
                      headerMessage,
                      disableAutoFocus: !shouldFocusInputOnScreenFocus,
                  }
                : undefined,
        [shouldShowSearchInput, searchTerm, translate, setSearchTerm, headerMessage, shouldFocusInputOnScreenFocus],
    );

    return (
        <BasePopup
            label={label}
            onReset={resetChanges}
            onApply={applyChanges}
            resetSentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_RESET_USER}
            applySentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_APPLY_USER}
            style={[
                styles.getCommonSelectionListPopoverHeight(
                    listData.length || 1,
                    variables.optionRowHeightCompact,
                    windowHeight,
                    shouldUseNarrowLayout,
                    isInLandscapeMode,
                    shouldShowSearchInput,
                ),
            ]}
        >
            <SelectionList
                data={listData}
                ref={selectionListRef}
                textInputOptions={textInputOptions}
                canSelectMultiple
                ListItem={UserSelectionListItem}
                onSelectRow={selectUser}
                isLoadingNewOptions={isLoadingNewOptions}
                shouldShowLoadingPlaceholder={!areOptionsInitialized}
                onEndReached={onListEndReached}
                style={{contentContainerStyle: [styles.pb0]}}
            />
        </BasePopup>
    );
}

export default memo(UserSelectPopup);
