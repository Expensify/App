import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';

import useInitialSelection from '@hooks/useInitialSelection';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import moveInitialSelectionToTop, {shouldMoveInitialSelectionToTop} from '@libs/SelectionListOrderUtils';

import CONST from '@src/CONST';

import React, {useEffect, useState} from 'react';
import {Keyboard} from 'react-native';

import type CalendarPickerListItem from './types';

type YearPickerModalProps = {
    isVisible: boolean;

    /** The first year in the list */
    minYear: number;

    /** The last year in the list */
    maxYear: number;

    /** The year the calendar shows, which the list marks as selected */
    currentYear: number;

    onYearChange?: (year: number) => void;

    /** Function to call when the user closes the year picker */
    onClose?: () => void;

    /** Whether RIGHT_DOCKED modal should keep backdrop in narrow pane context */
    shouldEnableBackdropInNarrowPane?: boolean;
};

function YearPickerModal({isVisible, minYear, maxYear, currentYear, onYearChange, onClose, shouldEnableBackdropInNarrowPane = false}: YearPickerModalProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [searchText, setSearchText] = useState('');
    // Freeze the year selected when the picker opened so it stays pinned to the top for the whole open cycle, even as the live selection changes.
    const initialYear = useInitialSelection(currentYear, {isVisible});
    // The rows are built here from numbers, so the compiler can cache them and the sort below across the calendar's re-renders.
    const years: CalendarPickerListItem[] = Array.from({length: maxYear - minYear + 1}, (v, i) => minYear + i).map((year) => ({
        text: year.toString(),
        value: year,
        keyForList: year.toString(),
        isSelected: year === currentYear,
    }));
    // Pin the frozen initial year to the top of the full sorted list before search filtering, so it stays pinned while searching.
    // Long lists (where the pin applies) show upcoming years ascending, then past years nearest first, so the row after the pinned year is the next year.
    // Short lists aren't pinned, so they keep the newest-first order.
    const compareNewestFirst = (a: CalendarPickerListItem, b: CalendarPickerListItem) => b.value - a.value;
    const compareAroundInitialYear = (a: CalendarPickerListItem, b: CalendarPickerListItem) => {
        const isAUpcoming = a.value > initialYear;
        const isBUpcoming = b.value > initialYear;
        if (isAUpcoming !== isBUpcoming) {
            return isAUpcoming ? -1 : 1;
        }
        return isAUpcoming ? a.value - b.value : b.value - a.value;
    };
    const sortedYears = years.sort(shouldMoveInitialSelectionToTop(years.length) ? compareAroundInitialYear : compareNewestFirst);
    const orderedYears = moveInitialSelectionToTop(sortedYears, [String(initialYear)]);
    const data = searchText === '' ? orderedYears : orderedYears.filter((year) => year.text?.includes(searchText));
    const headerMessage = !data.length ? translate('common.noResultsFound') : '';

    useEffect(() => {
        if (isVisible) {
            return;
        }
        setSearchText('');
    }, [isVisible]);

    const textInputOptions = {
        label: translate('yearPickerPage.selectYear'),
        value: searchText,
        onChangeText: (text: string) => setSearchText(text.replaceAll(CONST.REGEX.NON_NUMERIC, '').trim()),
        headerMessage,
        maxLength: 4,
        inputMode: CONST.INPUT_MODE.NUMERIC,
    };

    return (
        <Modal
            type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            isVisible={isVisible}
            onClose={() => onClose?.()}
            onModalHide={onClose}
            shouldHandleNavigationBack
            shouldUseCustomBackdrop
            onBackdropPress={onClose}
            shouldKeepRightDockedBackdropInNarrowPane={shouldEnableBackdropInNarrowPane}
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <ScreenWrapper
                style={[styles.pb0]}
                includePaddingTop={false}
                enableEdgeToEdgeBottomSafeAreaPadding
                testID="YearPickerModal"
            >
                <HeaderWithBackButton
                    title={translate('yearPickerPage.year')}
                    onBackButtonPress={onClose}
                />
                <SelectionList
                    data={data}
                    ListItem={SingleSelectListItem}
                    onSelectRow={(option) => {
                        Keyboard.dismiss();
                        onYearChange?.(option.value);
                    }}
                    textInputOptions={textInputOptions}
                    initiallyFocusedItemKey={initialYear.toString()}
                    shouldScrollToFocusedIndexOnMount={false}
                    shouldUpdateFocusedIndex
                    disableMaintainingScrollPosition
                    addBottomSafeAreaPadding
                    shouldStopPropagation
                    showScrollIndicator
                />
            </ScreenWrapper>
        </Modal>
    );
}

export default YearPickerModal;
