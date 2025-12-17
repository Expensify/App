import React, {useCallback, useMemo, useState} from 'react';
import FormHelpMessage from '@components/FormHelpMessage';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
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

    const data = useMemo(() => {
        return CONST.DATE.MONTH_DAYS.reduce<CustomCloseDateListItem[]>((days, dayValue) => {
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

    const textInputOptions = useMemo(
        () => ({
            label: translate('common.search'),
            value: searchValue,
            onChangeText: setSearchValue,
            headerMessage: data.length === 0 ? translate('common.noResultsFound') : undefined,
        }),
        [translate, searchValue, data.length, setSearchValue],
    );

    const confirmButtonOptions = useMemo(
        () => ({
            showButton: true,
            text: translate('common.save'),
            onConfirm: confirmSelectedDay,
            style: styles.mt3,
        }),
        [translate, confirmSelectedDay, styles.mt3],
    );

    return (
        <SelectionList
            data={data}
            ListItem={SingleSelectListItem}
            onSelectRow={selectDayAndClearError}
            initiallyFocusedItemKey={initiallySelectedDay?.toString()}
            confirmButtonOptions={confirmButtonOptions}
            textInputOptions={textInputOptions}
            showListEmptyContent={false}
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
