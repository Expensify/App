import React from 'react';
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

    /** Function to call when the user selects a month */
    onMonthChange?: (month: number) => void;

    /** Function to call when the user closes the month picker */
    onClose?: () => void;
};

function MonthPickerModal({isVisible, currentMonth = new Date().getMonth(), onMonthChange, onClose}: MonthPickerModalProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const monthNames = DateUtils.getMonthNames();

    const data = monthNames.map((month, index) => ({
        text: month.charAt(0).toUpperCase() + month.slice(1),
        value: index,
        keyForList: index.toString(),
        isSelected: index === currentMonth,
    }));

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
                    initiallyFocusedItemKey={currentMonth.toString()}
                    addBottomSafeAreaPadding
                    shouldStopPropagation
                    showScrollIndicator
                />
            </ScreenWrapper>
        </Modal>
    );
}

export default MonthPickerModal;
