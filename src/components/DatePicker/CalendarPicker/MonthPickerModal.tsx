import React, {useEffect, useMemo, useState} from 'react';
import {Keyboard} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import CONST from '@src/CONST';

type MonthPickerModalProps = {
    /** Whether the modal is visible */
    isVisible: boolean;

    /** Currently selected month (0-indexed) */
    currentMonth?: number;

    /** The year currently being viewed */
    currentYear?: number;

    /** A minimum date (earliest) allowed to select */
    minDate?: Date;

    /** A maximum date (latest) allowed to select */
    maxDate?: Date;

    /** Function to call when the user selects a month */
    onMonthChange?: (month: number) => void;

    /** Function to call when the user closes the month picker */
    onClose?: () => void;
};

function MonthPickerModal({isVisible, currentMonth = new Date().getMonth(), currentYear = new Date().getFullYear(), minDate, maxDate, onMonthChange, onClose}: MonthPickerModalProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [searchText, setSearchText] = useState('');
    const monthNames = DateUtils.getMonthNames();

    const allMonths = useMemo(() => DateUtils.getFilteredMonthItems(monthNames, currentYear, currentMonth, minDate, maxDate), [monthNames, currentMonth, currentYear, minDate, maxDate]);

    const {data, headerMessage} = useMemo(() => {
        const filteredMonths = searchText === '' ? allMonths : allMonths.filter((month) => month.text.toLowerCase().includes(searchText.toLowerCase()));
        return {
            headerMessage: !filteredMonths.length ? translate('common.noResultsFound') : '',
            data: filteredMonths,
        };
    }, [allMonths, searchText, translate]);

    useEffect(() => {
        if (isVisible) {
            return;
        }
        setSearchText('');
    }, [isVisible]);

    const textInputOptions = useMemo(
        () => ({
            label: translate('monthPickerPage.selectMonth'),
            value: searchText,
            onChangeText: setSearchText,
            headerMessage,
        }),
        [headerMessage, searchText, translate],
    );

    return (
        <Modal
            type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            isVisible={isVisible}
            onClose={() => onClose?.()}
            onModalHide={onClose}
            shouldHandleNavigationBack
            shouldUseCustomBackdrop
            onBackdropPress={onClose}
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
                    ListItem={RadioListItem}
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
