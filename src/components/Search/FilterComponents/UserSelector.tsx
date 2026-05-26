import React, {useRef} from 'react';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import SelectionList from '@components/SelectionList';
import UserSelectionListItem from '@components/SelectionList/ListItem/UserSelectionListItem';
import type {ListItem, SelectionListHandle} from '@components/SelectionList/types';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePersonalDetailSearchSelector from '@hooks/usePersonalDetailSearchSelector';
import useThemeStyles from '@hooks/useThemeStyles';
import canFocusInputOnScreenFocus from '@libs/canFocusInputOnScreenFocus';
import type {OptionData} from '@libs/PersonalDetailOptionsListUtils';
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
    const shouldFocusInputOnScreenFocus = canFocusInputOnScreenFocus();
    const [isSearchingForReports] = useOnyx(ONYXKEYS.RAM_ONLY_IS_SEARCHING_FOR_REPORTS);
    const initialSelectedAccountIDs = value.reduce<Set<string>>((acc, id) => {
        const participant = personalDetails?.[id];
        if (!participant) {
            return acc;
        }

        acc.add(id);
        return acc;
    }, new Set<string>());

    const {searchTerm, setSearchTerm, availableOptions, totalOptionsCount, toggleSelection, areOptionsInitialized} = usePersonalDetailSearchSelector({
        selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
        initialSelected: initialSelectedAccountIDs,
        excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
        includeCurrentUser: false,
        includeRecentReports: false,
        onSelectionChange: onChange,
    });

    const listData = (() => {
        if (!availableOptions.currentUserOption) {
            return [...availableOptions.selectedOptions, ...availableOptions.personalDetails];
        }
        const isCurrentOptionSelected = availableOptions.currentUserOption.isSelected;
        if (isCurrentOptionSelected) {
            return [availableOptions.currentUserOption, ...availableOptions.selectedOptions, ...availableOptions.personalDetails];
        }
        return [...availableOptions.selectedOptions, availableOptions.currentUserOption, ...availableOptions.personalDetails];
    })();

    const headerMessage = listData.length === 0 ? translate('common.noResultsFound') : undefined;

    const selectUser = (option: OptionData) => {
        toggleSelection(option);
        selectionListRef?.current?.scrollToIndex(0);
    };

    const isLoadingNewOptions = !!isSearchingForReports;
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
                style={{contentContainerStyle: [styles.pb0]}}
            />
        </ListFilterWrapper>
    );
}

export default UserSelector;
