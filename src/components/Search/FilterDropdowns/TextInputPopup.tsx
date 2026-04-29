import React, {useState} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import TextInput from '@components/TextInput';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import BasePopup from './BasePopup';

type TextInputPopupProps = {
    style?: StyleProp<ViewStyle>;
    defaultValue: string;
    label?: string;
    placeholder?: string;
    onBackButtonPress?: () => void;
    closeOverlay: () => void;
    onChange: (value: string) => void;
};

function TextInputPopup({style, defaultValue, label, placeholder, onBackButtonPress, closeOverlay, onChange}: TextInputPopupProps) {
    const styles = useThemeStyles();
    const [value, setValue] = useState(defaultValue);

    const applyChanges = () => {
        onChange(value);
        closeOverlay();
    };

    const resetChanges = () => {
        onChange('');
        closeOverlay();
    };

    return (
        <BasePopup
            label={label}
            onReset={resetChanges}
            onApply={applyChanges}
            onBackButtonPress={onBackButtonPress}
            resetSentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_RESET_TEXT_INPUT}
            applySentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_APPLY_TEXT_INPUT}
            style={style}
        >
            <TextInput
                placeholder={placeholder}
                value={value}
                onChangeText={setValue}
                accessibilityLabel={placeholder}
                role={CONST.ROLE.PRESENTATION}
                containerStyles={[styles.ph5, styles.mb2]}
            />
        </BasePopup>
    );
}

export default TextInputPopup;
