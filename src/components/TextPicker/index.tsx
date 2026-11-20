import MenuItem from '@components/MenuItem';

import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {callIfAuthenticated} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {authTokenTypeSelector} from '@src/selectors/Session';
import KeyboardUtils from '@src/utils/keyboard';

import React, {useState} from 'react';
import {View} from 'react-native';

import type {TextPickerProps} from './types';

import TextSelectorModal from './TextSelectorModal';

function TextPicker({
    value,
    description,
    placeholder = '',
    errorText = '',
    onInputChange,
    onValueCommitted,
    rightLabel,
    disabled = false,
    interactive = true,
    required = false,
    customValidate,
    shouldUseStrictHtmlTagValidation,
    wrapperStyle,
    numberOfLinesTitle,
    titleStyle,
    descriptionTextStyle,
    ref,
    ...rest
}: TextPickerProps) {
    const styles = useThemeStyles();
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});
    const [isPickerVisible, setIsPickerVisible] = useState(false);
    const title = value ?? placeholder ?? '';

    const showPickerModal = () => {
        if (disabled) {
            return;
        }
        setIsPickerVisible(true);
    };

    const hidePickerModal = () => {
        // Fixes the issue where the keyboard would open and close again after dismissing the modal on Android
        KeyboardUtils.dismissKeyboardAndExecute(() => {
            setIsPickerVisible(false);
        });
    };

    const updateInput = (updatedValue: string) => {
        if (updatedValue !== value) {
            onInputChange?.(updatedValue);
        }
        onValueCommitted?.(updatedValue);
        hidePickerModal();
    };

    return (
        <View>
            <MenuItem.Root
                sentryLabel={CONST.SENTRY_LABEL.TEXT_PICKER.OPEN}
                ref={ref}
                onPress={interactive ? callIfAuthenticated(showPickerModal, session) : undefined}
                style={wrapperStyle}
            >
                <MenuItem.Row>
                    <MenuItem.Content>
                        {!!description &&
                            (title || descriptionTextStyle ? (
                                <MenuItem.FieldName style={[!title && styles.textNormal, descriptionTextStyle]}>{description}</MenuItem.FieldName>
                            ) : (
                                <MenuItem.FieldNamePlaceholder>{description}</MenuItem.FieldNamePlaceholder>
                            ))}
                        {!!title && (
                            <MenuItem.FieldValue
                                numberOfLines={numberOfLinesTitle}
                                style={titleStyle}
                            >
                                {title}
                            </MenuItem.FieldValue>
                        )}
                    </MenuItem.Content>
                    <MenuItem.Trailing>
                        {!title && !!rightLabel && !errorText && <MenuItem.RightLabel>{rightLabel}</MenuItem.RightLabel>}
                        {!!errorText && <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />}
                        {!disabled && <MenuItem.Chevron />}
                    </MenuItem.Trailing>
                </MenuItem.Row>
                {!!errorText && (
                    <MenuItem.HelpText
                        isError
                        message={errorText}
                    />
                )}
            </MenuItem.Root>
            <TextSelectorModal
                value={value}
                isVisible={isPickerVisible}
                description={description}
                onClose={hidePickerModal}
                onValueSelected={updateInput}
                disabled={disabled}
                required={required}
                customValidate={customValidate}
                shouldUseStrictHtmlTagValidation={shouldUseStrictHtmlTagValidation}
                {...rest}
            />
        </View>
    );
}

export default TextPicker;
