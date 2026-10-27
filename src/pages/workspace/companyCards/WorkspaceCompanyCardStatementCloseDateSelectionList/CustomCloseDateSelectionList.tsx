import FormHelpMessage from '@components/FormHelpMessage';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';

import useDebouncedState from '@hooks/useDebouncedState';
import useInitialSelection from '@hooks/useInitialSelection';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import moveInitialSelectionToTop from '@libs/SelectionListOrderUtils';

import CONST from '@src/CONST';

import React, {useState} from 'react';

type CustomCloseDateListItem = ListItem & {
    value: number;
};

type CustomCloseDateSelectionListProps = {
    initiallySelectedDay: number | undefined;
    onConfirmSelectedDay: (day: number) => void;
};

function CustomCloseDateSelectionList({initiallySelectedDay, onConfirmSelectedDay}: CustomCloseDateSelectionListProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [selectedDay, setSelectedDay] = useState(initiallySelectedDay);
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');
    const [error, setError] = useState<string | undefined>(undefined);
    // Freeze the day that was selected when this list opened so the pre-selected day stays pinned to the top for the whole open/focus cycle, even as the live selection changes.
    const initialSelectedDay = useInitialSelection(selectedDay, {resetOnFocus: true});

    let data;
    const allDays = CONST.DATE.MONTH_DAYS.map<CustomCloseDateListItem>((dayValue) => ({
        value: dayValue,
        text: dayValue.toString(),
        keyForList: dayValue.toString(),
        isSelected: dayValue === selectedDay,
    }));

    // Pin the frozen initial day to the top of the full list before search filtering, so it stays pinned while searching (search filters the already-pinned list rather than reordering it).
    const orderedDays = moveInitialSelectionToTop(allDays, initialSelectedDay ? [initialSelectedDay.toString()] : []);
    if (!debouncedSearchValue) {
        data = orderedDays;
    } else {
        data = orderedDays.filter((day) => day?.text?.includes(debouncedSearchValue));
    }

    const selectDayAndClearError = (item: CustomCloseDateListItem) => {
        setSelectedDay(item.value);
        setError(undefined);
    };

    const confirmSelectedDay = () => {
        if (!selectedDay) {
            setError(translate('workspace.moreFeatures.companyCards.error.statementCloseDateRequired'));
            return;
        }

        onConfirmSelectedDay(selectedDay);
    };

    const textInputOptions = {
        label: translate('common.search'),
        value: searchValue,
        onChangeText: setSearchValue,
        headerMessage: data.length === 0 ? translate('common.noResultsFound') : undefined,
    };

    const confirmButtonOptions = {
        showButton: true,
        text: translate('common.save'),
        onConfirm: confirmSelectedDay,
        style: styles.mt3,
    };

    return (
        <SelectionList
            data={data}
            ListItem={SingleSelectListItem}
            onSelectRow={selectDayAndClearError}
            initiallyFocusedItemKey={initialSelectedDay?.toString()}
            shouldScrollToFocusedIndexOnMount={false}
            confirmButtonOptions={confirmButtonOptions}
            textInputOptions={textInputOptions}
            shouldShowListEmptyContent={false}
            disableMaintainingScrollPosition
            shouldSingleExecuteRowSelect
            shouldUpdateFocusedIndex
            addBottomSafeAreaPadding
        >
            {!!error && (
                <FormHelpMessage
                    style={[styles.ph5]}
                    isError
                    message={error}
                />
            )}
        </SelectionList>
    );
}

export default CustomCloseDateSelectionList;
