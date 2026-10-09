import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import {usePopoverActions} from '@components/PopoverProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import DateUtils from '@libs/DateUtils';

import CONST from '@src/CONST';

import type {View} from 'react-native';

import React, {useEffect, useRef, useState} from 'react';
import {Keyboard} from 'react-native';

type MonthPickerModalProps = {
    isVisible: boolean;

    /** Currently selected month (0-indexed) */
    currentMonth?: number;

    onMonthChange?: (month: number) => void;

    /** Function to call when the user closes the month picker */
    onClose?: () => void;

    /** Whether RIGHT_DOCKED modal should keep backdrop in narrow pane context */
    shouldEnableBackdropInNarrowPane?: boolean;
};

function MonthPickerModal({isVisible, currentMonth, onMonthChange, onClose, shouldEnableBackdropInNarrowPane = false}: MonthPickerModalProps) {
    const styles = useThemeStyles();
    const {translate, dateFnsLocale} = useLocalize();
    const {setActivePopoverExtraAnchorRef} = usePopoverActions();
    const contentRef = useRef<View>(null);
    const [searchText, setSearchText] = useState('');
    const resolvedCurrentMonth = currentMonth ?? new Date().getMonth();
    const monthNames = DateUtils.getMonthNames(dateFnsLocale);

    useEffect(() => {
        if (!isVisible) {
            return;
        }

        // This modal is rendered above the calendar rather than inside it, so a press on a month counts as a press
        // outside the calendar popover and would dismiss it. Registering the content keeps the calendar open.
        setActivePopoverExtraAnchorRef(contentRef);
    }, [isVisible, setActivePopoverExtraAnchorRef]);

    const allMonths = DateUtils.getFilteredMonthItems(monthNames, resolvedCurrentMonth);

    const filteredMonths = searchText === '' ? allMonths : allMonths.filter((month) => month.text.toLowerCase().includes(searchText.toLowerCase()));
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
                ref={contentRef}
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
                    initiallyFocusedItemKey={resolvedCurrentMonth.toString()}
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
