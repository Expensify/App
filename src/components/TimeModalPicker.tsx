import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import DateUtils from '@libs/DateUtils';

import {callIfAuthenticated} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {authTokenTypeSelector} from '@src/selectors/Session';

import type {ComponentRef, ForwardedRef} from 'react';
import type {View} from 'react-native';

import React, {useState} from 'react';

import MenuItem from './MenuItem';
import MenuItemField from './MenuItem/presets/MenuItemField';
import TimePickerModal from './TimePickerModal';

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
    const {dateFnsLocale} = useLocalize();
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});
    const [isPickerVisible, setIsPickerVisible] = useState(false);
    // The row shows a localized time, while `TimePicker` still reads `value` through `extractTime12Hour` — that one is
    // the picker's English wire format, so rendering it here would put an AM/PM clock next to 24-hour times elsewhere.
    const currentTime = value ? DateUtils.formatToLocalTime(value, dateFnsLocale) : undefined;

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
            <TimePickerModal
                isVisible={isPickerVisible}
                label={label}
                value={value}
                onInputChange={onInputChange}
                onClose={() => setIsPickerVisible(false)}
            />
        </>
    );
}

export default TimeModalPicker;
