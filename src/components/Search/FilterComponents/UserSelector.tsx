import isEmpty from 'lodash/isEmpty';
import React, {useRef, useState} from 'react';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import SelectionList from '@components/SelectionList';
import UserSelectionListItem from '@components/SelectionList/ListItem/UserSelectionListItem';
import type {ListItem, SelectionListHandle} from '@components/SelectionList/types';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSearchSelector from '@hooks/useSearchSelector';
import useThemeStyles from '@hooks/useThemeStyles';
import canFocusInputOnScreenFocus from '@libs/canFocusInputOnScreenFocus';
import {getParticipantsOption} from '@libs/OptionsListUtils';
import {doesPersonalDetailMatchSearchTerm} from '@libs/OptionsListUtils/searchMatchUtils';
import type {OptionData} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ListFilterWrapper from './ListFilterViewWrapper';

type UserSelectorProps = {
    value: string[] | undefined;
    onChange: (options: string[]) => void;
};

function UserSelector({value = [], onChange}: UserSelectorProps) {
    const selectionListRef = useRef<SelectionListHandle<ListItem> | null>(null);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const personalDetails = usePersonalDetails();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserAccountID = currentUserPersonalDetails.accountID;
    const shouldFocusInputOnScreenFocus = canFocusInputOnScreenFocus();
    const [isSearchingForReports] = useOnyx(ONYXKEYS.RAM_ONLY_IS_SEARCHING_FOR_REPORTS);
    const initialSelectedOptions = value.reduce<OptionData[]>((options, id) => {
        const participant = personalDetails?.[id];
        if (!participant) {
            return options;
        }

        const optionData = {
            ...getParticipantsOption(participant, personalDetails),
            isSelected: true,
        };

        if (optionData) {
            options.push(optionData as OptionData);
        }

        return options;
    }, []);

    const {searchTerm, debouncedSearchTerm, setSearchTerm, availableOptions, toggleSelection, areOptionsInitialized, selectedOptionsForDisplay, onListEndReached} = useSearchSelector({
        selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
        searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_GENERAL,
        initialSelected: initialSelectedOptions,
        excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
        maxRecentReportsToShow: CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
        includeUserToInvite: false,
        includeCurrentUser: true,
        onSelectionChange: (options) => onChange(options.flatMap((option) => (option.accountID ? [option.accountID.toString()] : []))),
    });

    const listData = (() => {
        const personalDetailsList = availableOptions.personalDetails.map((participant) => ({
            ...participant,
            keyForList: String(participant.accountID),
        }));
        const recentReports = availableOptions.recentReports.map((report) => ({
            ...report,
            keyForList: String(report.reportID),
        }));

        const isCurrentUserSelected = selectedOptionsForDisplay.some((option) => option.accountID === currentUserAccountID);

        // Extract the current user from available options to guarantee they appear at the top.
        // Falls back to creating from personal details to handle pagination edge cases.
        let currentUserOption: OptionData | undefined;
        if (!isCurrentUserSelected && currentUserAccountID) {
            const currentUserPersonalDetail = personalDetailsList.find((p) => p.accountID === currentUserAccountID) ?? recentReports.find((r) => r.accountID === currentUserAccountID);
            if (currentUserPersonalDetail) {
                currentUserOption = currentUserPersonalDetail;
            } else if (personalDetails?.[currentUserAccountID]) {
                const candidateOption = getParticipantsOption(personalDetails[currentUserAccountID], personalDetails) as OptionData;
                const trimmedSearchTerm = debouncedSearchTerm.trim().toLowerCase();
                if (!trimmedSearchTerm || doesPersonalDetailMatchSearchTerm(candidateOption, currentUserAccountID, trimmedSearchTerm)) {
                    currentUserOption = candidateOption;
                }
            }
        }

        // Filter current user from regular lists to avoid duplication
        const filteredPersonalDetails = currentUserOption ? personalDetailsList.filter((p) => p.accountID !== currentUserAccountID) : personalDetailsList;
        const filteredRecentReports = currentUserOption ? recentReports.filter((r) => r.accountID !== currentUserAccountID) : recentReports;

        // Place selected options first, then the current user, then the rest
        const combinedOptions = [...selectedOptionsForDisplay, ...(currentUserOption ? [currentUserOption] : []), ...filteredPersonalDetails, ...filteredRecentReports];

        // Sort so that selected items appear first; current user placement is handled explicitly above
        combinedOptions.sort((a, b) => {
            if (a.isSelected && !b.isSelected) {
                return -1;
            }
            if (!a.isSelected && b.isSelected) {
                return 1;
            }
            // Among selected items, prioritize the current user
            if (a.isSelected && b.isSelected) {
                if (a.accountID === currentUserAccountID) {
                    return -1;
                }
                if (b.accountID === currentUserAccountID) {
                    return 1;
                }
            }
            return 0;
        });

        const combinedOptionsWithKeyForList = combinedOptions.map((option) => ({
            ...option,
            keyForList: option.keyForList ?? option.login ?? '',
        }));
        return combinedOptionsWithKeyForList;
    })();

    const headerMessage = isEmpty(listData) ? translate('common.noResultsFound') : undefined;

    const selectUser = (option: OptionData) => {
        toggleSelection(option);
        selectionListRef?.current?.scrollToIndex(0);
    };

    const isLoadingNewOptions = !!isSearchingForReports;
    const totalOptions = selectedOptionsForDisplay.length + availableOptions.personalDetails.length + availableOptions.recentReports.length;
    const [totalOptionsCount, setTotalOptionsCount] = useState(totalOptions);

    if (totalOptions !== totalOptionsCount && !debouncedSearchTerm) {
        setTotalOptionsCount(selectedOptionsForDisplay.length + availableOptions.personalDetails.length + availableOptions.recentReports.length);
    }

    const shouldShowSearchInput = totalOptionsCount >= CONST.STANDARD_LIST_ITEM_LIMIT;

    const textInputOptions = shouldShowSearchInput
        ? {
              value: searchTerm,
              label: translate('selectionList.searchForSomeone'),
              onChangeText: setSearchTerm,
              headerMessage,
              disableAutoFocus: !shouldFocusInputOnScreenFocus,
          }
        : undefined;

    return (
        <ListFilterWrapper
            itemCount={listData.length}
            isSearchable={shouldShowSearchInput}
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
        </ListFilterWrapper>
    );
}

export default UserSelector;
