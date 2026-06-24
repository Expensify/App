import React, {useState} from 'react';
import type {ForwardedRef} from 'react';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import useIsCenteredRHPModal from '@libs/Navigation/AppNavigator/useIsCenteredRHPModal';
import CONST from '@src/CONST';
import HeaderWithBackButton from './HeaderWithBackButton';
import MenuItemWithTopDescription from './MenuItemWithTopDescription';
import Modal from './Modal';
import ScreenWrapper from './ScreenWrapper';
import TimePicker from './TimePicker/TimePicker';

/** Configuration handed to the parent step so it can render the picker inline within the same modal. */
type InlineTimePickerConfig = {
    /** The currently selected value (ISO datetime string). */
    value?: string;

    /** Header label for the picker. */
    label: string;

    /** Called with the selected 12-hour time string when the user saves. */
    onSubmit: (time: string) => void;
};

type TimeModalPickerProps = {
    /** Current value of the selected item */
    value?: string;

    /** Callback when the list item is selected */
    onInputChange?: (value: string, key?: string) => void;

    /** Form Error description */
    errorText?: string;

    /** Label for the picker */
    label: string;

    /** When provided (centered RHP modal), tapping the row asks the parent step to render the picker inline instead of opening a separate modal. */
    onRequestOpenInline?: (config: InlineTimePickerConfig) => void;

    /** Reference to the outer element */
    ref?: ForwardedRef<View>;
};

function TimeModalPicker({value, errorText, label, onInputChange = () => {}, onRequestOpenInline, ref}: TimeModalPickerProps) {
    const styles = useThemeStyles();
    const isCenteredModal = useIsCenteredRHPModal();
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

    // Inside a centered RHP modal, render the picker inline via the parent step instead of opening a second modal.
    const shouldRenderInline = isCenteredModal && !!onRequestOpenInline;

    return (
        <>
            <MenuItemWithTopDescription
                shouldShowRightIcon
                title={currentTime}
                description={label}
                onPress={() => (shouldRenderInline ? onRequestOpenInline?.({value, label, onSubmit: updateInput}) : setIsPickerVisible(true))}
                brickRoadIndicator={errorText ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                errorText={errorText}
                ref={ref}
            />
            {!shouldRenderInline && (
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
                        <View style={styles.flex1}>
                            <TimePicker
                                defaultValue={value}
                                onSubmit={updateInput}
                                shouldValidateFutureTime={false}
                            />
                        </View>
                    </ScreenWrapper>
                </Modal>
            )}
        </>
    );
}

export default TimeModalPicker;
export type {InlineTimePickerConfig};
