import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';

import useInitialSelection from '@hooks/useInitialSelection';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import moveInitialSelectionToTop from '@libs/SelectionListOrderUtils';

import CONST from '@src/CONST';

import React, {useEffect, useState} from 'react';
import {Keyboard} from 'react-native';

import type CalendarPickerListItem from './types';

type YearPickerModalProps = {
    isVisible: boolean;
    years: CalendarPickerListItem[];
    currentYear?: number;
    onYearChange?: (year: number) => void;

    /** Function to call when the user closes the year picker */
    onClose?: () => void;

    /** Whether RIGHT_DOCKED modal should keep backdrop in narrow pane context */
    shouldEnableBackdropInNarrowPane?: boolean;
};

function YearPickerModal({isVisible, years, currentYear, onYearChange, onClose, shouldEnableBackdropInNarrowPane = false}: YearPickerModalProps) {
    const resolvedCurrentYear = currentYear ?? new Date().getFullYear();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [searchText, setSearchText] = useState('');
    // Freeze the year selected when the picker opened so it stays pinned to the top for the whole open cycle, even as the live selection changes.
    const initialYear = useInitialSelection(resolvedCurrentYear, {isVisible});
    // Pin the frozen initial year to the top of the full sorted list before search filtering, so it stays pinned while searching.
    // Copy before sorting so we don't mutate the caller's `years` prop during render.
    const sortedYears = [...years].sort((a, b) => b.value - a.value);
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
