import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import DateUtils from '@libs/DateUtils';

import CONST from '@src/CONST';

import type {ComponentRef, ForwardedRef} from 'react';

import React, {useState} from 'react';
import {View} from 'react-native';

import HeaderWithBackButton from './HeaderWithBackButton';
import Modal from './Modal';
import ExpenseFieldRow from './MoneyRequestConfirmationList/sections/ExpenseFieldRow';
import ScreenWrapper from './ScreenWrapper';
import ScrollView from './ScrollView';
import TimePicker from './TimePicker/TimePicker';

type TimeModalPickerProps = {
    value?: string;

    /** Callback when the list item is selected */
    onInputChange?: (value: string, key?: string) => void;

    /** Form Error description */
    errorText?: string;

    label: string;
    ref?: ForwardedRef<ComponentRef<typeof View>>;
};

function TimeModalPicker({value, errorText, label, onInputChange = () => {}, ref}: TimeModalPickerProps) {
    const styles = useThemeStyles();
    const {dateFnsLocale} = useLocalize();
    const [isPickerVisible, setIsPickerVisible] = useState(false);
    // The row shows a localized time, while `TimePicker` still reads `value` through `extractTime12Hour` — that one is
    // the picker's English wire format, so rendering it here would put an AM/PM clock next to 24-hour times elsewhere.
    const currentTime = value ? DateUtils.formatToLocalTime(value, dateFnsLocale) : undefined;

    const hidePickerModal = () => {
        setIsPickerVisible(false);
    };

    const updateInput = (time: string) => {
        const newTime = DateUtils.combineDateAndTime(time, value ?? '');
        onInputChange?.(newTime);
        hidePickerModal();
    };

    return (
        <>
            {/* Drawn as a bordered field so it lines up with the date inputs it sits between on the per diem time page. */}
            <View ref={ref}>
                <ExpenseFieldRow
                    name={label}
                    value={currentTime}
                    onPress={() => setIsPickerVisible(true)}
                    errorText={errorText}
                />
            </View>
            <Modal
                type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
                isVisible={isPickerVisible}
                onClose={hidePickerModal}
                onModalHide={hidePickerModal}
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <ScreenWrapper
                    style={styles.pb0}
                    includePaddingTop={false}
                    includeSafeAreaPaddingBottom
                    testID="TimeModalPicker"
                >
                    <HeaderWithBackButton
                        title={label}
                        onBackButtonPress={hidePickerModal}
                    />
                    <ScrollView
                        style={styles.flex1}
                        contentContainerStyle={styles.flexGrow1}
                    >
                        <TimePicker
                            defaultValue={value}
                            onSubmit={updateInput}
                            shouldValidateFutureTime={false}
                        />
                    </ScrollView>
                </ScreenWrapper>
            </Modal>
        </>
    );
}

export default TimeModalPicker;
