import React, {useCallback, useMemo, useState} from 'react';
import FormHelpMessage from '@components/FormHelpMessage';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

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

    const sections = useMemo(() => {
        const data = CONST.DATE.MONTH_DAYS.reduce<CustomCloseDateListItem[]>((days, dayValue) => {
            const day = {
                value: dayValue,
                text: dayValue.toString(),
                keyForList: dayValue.toString(),
                isSelected: dayValue === selectedDay,
            };

            if (debouncedSearchValue) {
                if (day.text.includes(debouncedSearchValue)) {
                    days.push(day);
                }
            } else {
                days.push(day);
            }

            return days;
        }, []);

        return [{data, indexOffset: 0}];
    }, [selectedDay, debouncedSearchValue]);

    const selectDayAndClearError = useCallback((item: CustomCloseDateListItem) => {
        setSelectedDay(item.value);
        setError(undefined);
    }, []);

    const confirmSelectedDay = useCallback(() => {
        if (!selectedDay) {
            setError(translate('workspace.moreFeatures.companyCards.error.statementCloseDateRequired'));
            return;
        }

        onConfirmSelectedDay(selectedDay);
    }, [selectedDay, onConfirmSelectedDay, translate]);

    return (
        <SelectionList
            ListItem={SingleSelectListItem}
            onSelectRow={selectDayAndClearError}
            shouldShowListEmptyContent={false}
            sections={sections}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={initiallySelectedDay?.toString()}
            shouldUpdateFocusedIndex
            showConfirmButton
            confirmButtonText={translate('common.save')}
            onConfirm={confirmSelectedDay}
            confirmButtonStyles={styles.mt3}
            addBottomSafeAreaPadding
            shouldShowTextInput
            textInputLabel={translate('common.search')}
            textInputValue={searchValue}
            onChangeText={setSearchValue}
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

CustomCloseDateSelectionList.displayName = 'CustomCloseDateSelectionList';

export default CustomCloseDateSelectionList;
