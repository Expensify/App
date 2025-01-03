import React, {useState} from 'react';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import CONST from '@src/CONST';
import HeaderWithBackButton from './HeaderWithBackButton';
import MenuItemWithTopDescription from './MenuItemWithTopDescription';
import Modal from './Modal';
import ScreenWrapper from './ScreenWrapper';
import TimePicker from './TimePicker/TimePicker';

type TimeModalPickerProps = {
    /** Current value of the selected item */
    value?: string;

    /** Callback when the list item is selected */
    onInputChange?: (value: string, key?: string) => void;

    /** Form Error description */
    errorText?: string;

    /** Label for the picker */
    label: string;
};

function TimeModalPicker({value, errorText, label, onInputChange = () => {}}: TimeModalPickerProps) {
    const styles = useThemeStyles();
    const [isPickerVisible, setIsPickerVisible] = useState(false);
    const currentTime = value ? DateUtils.extractTime12Hour(value) : undefined;

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
            <MenuItemWithTopDescription
                shouldShowRightIcon
                title={currentTime}
                description={label}
                onPress={() => setIsPickerVisible(true)}
                brickRoadIndicator={errorText ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                errorText={errorText}
            />
            <Modal
                type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
                isVisible={isPickerVisible}
                onClose={hidePickerModal}
                onModalHide={hidePickerModal}
                hideModalContentWhileAnimating
                useNativeDriver
            >
                <ScreenWrapper
                    style={styles.pb0}
                    includePaddingTop={false}
                    includeSafeAreaPaddingBottom
                    testID={TimeModalPicker.displayName}
                >
                    <HeaderWithBackButton
                        title={label}
                        onBackButtonPress={hidePickerModal}
                    />
                    <View style={styles.flex1}>
                        <TimePicker
                            defaultValue={value}
                            onSubmit={updateInput}
                            shouldValidate={false}
                        />
                    </View>
                </ScreenWrapper>
            </Modal>
        </>
    );
}

TimeModalPicker.displayName = 'TimeModalPicker';
export default TimeModalPicker;
