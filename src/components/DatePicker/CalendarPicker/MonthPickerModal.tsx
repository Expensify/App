import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import DateUtils from '@libs/DateUtils';

import CONST from '@src/CONST';

import {Str} from 'expensify-common';
import React, {useEffect, useState} from 'react';
import {Keyboard} from 'react-native';

import type CalendarPickerListItem from './types';

type MonthPickerModalProps = {
    isVisible: boolean;

    /** The month (0-indexed) the calendar shows, which the list marks as selected */
    currentMonth: number;

    /** The first month (0-indexed) of the shown year that can be picked; earlier months are greyed out */
    minMonth: number;

    /** The last month (0-indexed) of the shown year that can be picked; later months are greyed out */
    maxMonth: number;

    onMonthChange?: (month: number) => void;

    /** Function to call when the user closes the month picker */
    onClose?: () => void;

    /** Whether RIGHT_DOCKED modal should keep backdrop in narrow pane context */
    shouldEnableBackdropInNarrowPane?: boolean;
};

function MonthPickerModal({isVisible, currentMonth, minMonth, maxMonth, onMonthChange, onClose, shouldEnableBackdropInNarrowPane = false}: MonthPickerModalProps) {
    const styles = useThemeStyles();
    const {translate, dateFnsLocale} = useLocalize();
    const [searchText, setSearchText] = useState('');
    // The rows are built here from numbers, so the compiler can cache them across the calendar's re-renders.
    const months: CalendarPickerListItem[] = DateUtils.getMonthNames(dateFnsLocale).map((month, index) => ({
        text: Str.UCFirst(month),
        value: index,
        keyForList: index.toString(),
        isSelected: index === currentMonth,
        isDisabled: index < minMonth || index > maxMonth,
    }));

    const filteredMonths = searchText === '' ? months : months.filter((month) => month.text?.toLowerCase().includes(searchText.toLowerCase()));
    const headerMessage = !filteredMonths.length ? translate('common.noResultsFound') : '';
    const data = filteredMonths;

    useEffect(() => {
        if (isVisible) {
            return;
        }
        setSearchText('');
    }, [isVisible]);

    const textInputOptions = {
        label: translate('monthPickerPage.selectMonth'),
        value: searchText,
        onChangeText: setSearchText,
        headerMessage,
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
                testID="MonthPickerModal"
            >
                <HeaderWithBackButton
                    title={translate('monthPickerPage.month')}
                    onBackButtonPress={onClose}
                />
                <SelectionList
                    data={data}
                    ListItem={SingleSelectListItem}
                    onSelectRow={(option) => {
                        Keyboard.dismiss();
                        onMonthChange?.(option.value);
                    }}
                    textInputOptions={textInputOptions}
                    initiallyFocusedItemKey={currentMonth.toString()}
                    disableMaintainingScrollPosition
                    addBottomSafeAreaPadding
                    shouldStopPropagation
                    showScrollIndicator
                />
            </ScreenWrapper>
        </Modal>
    );
}

export default MonthPickerModal;
