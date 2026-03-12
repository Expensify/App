import {endOfMonth, startOfMonth} from 'date-fns';
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

    /** A minimum date (oldest) allowed to select */
    minDate?: Date;

    /** A maximum date (earliest) allowed to select */
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

    const allMonths = useMemo(
        () =>
            monthNames
                .map((month, index) => {
                    const monthStart = startOfMonth(new Date(currentYear, index));
                    const monthEnd = endOfMonth(new Date(currentYear, index));
                    const isBeforeMin = minDate ? monthEnd < startOfMonth(new Date(minDate)) : false;
                    const isAfterMax = maxDate ? monthStart > endOfMonth(new Date(maxDate)) : false;
                    if (isBeforeMin || isAfterMax) {
                        return null;
                    }
                    return {
                        text: month.charAt(0).toUpperCase() + month.slice(1),
                        value: index,
                        keyForList: index.toString(),
                        isSelected: index === currentMonth,
                    };
                })
                .filter((item): item is NonNullable<typeof item> => item !== null),
        [monthNames, currentMonth, currentYear, minDate, maxDate],
    );

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
