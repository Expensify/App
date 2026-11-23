import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import DateUtils from '@libs/DateUtils';

import {callIfAuthenticated} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {authTokenTypeSelector} from '@src/selectors/Session';

import type {ComponentRef, ForwardedRef} from 'react';
import type {View} from 'react-native';

import React, {useState} from 'react';

import HeaderWithBackButton from './HeaderWithBackButton';
import MenuItem from './MenuItem';
import MenuItemField from './MenuItem/presets/MenuItemField';
import Modal from './Modal';
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
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});
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
            <MenuItem.Root
                sentryLabel={CONST.SENTRY_LABEL.TIME_MODAL_PICKER.OPEN}
                onPress={callIfAuthenticated(() => setIsPickerVisible(true), session)}
                ref={ref}
            >
                <MenuItemField.Row
                    name={label}
                    value={currentTime}
                >
                    {!!errorText && <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />}
                    <MenuItem.Chevron />
                </MenuItemField.Row>
                {!!errorText && (
                    <MenuItem.HelpText
                        isError
                        message={errorText}
                    />
                )}
            </MenuItem.Root>
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
