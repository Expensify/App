import TextInput from '@components/TextInput';

import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type {SentryLabel} from '@src/types/utils/SentryLabel';

import type {StyleProp, ViewStyle} from 'react-native';

import React, {useState} from 'react';

import BasePopup from './BasePopup';

type TextInputPopupProps = {
    style?: StyleProp<ViewStyle>;
    defaultValue: string;
    label?: string;
    placeholder?: string;
    onBackButtonPress?: () => void;
    closeOverlay: () => void;
    onChange: (value: string) => void;
    applySentryLabel: SentryLabel;
    resetSentryLabel: SentryLabel;
};

function TextInputPopup({style, defaultValue, label, placeholder, onBackButtonPress, closeOverlay, onChange, applySentryLabel, resetSentryLabel}: TextInputPopupProps) {
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
            resetSentryLabel={resetSentryLabel}
            applySentryLabel={applySentryLabel}
            shouldSubmitOnEnter
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
