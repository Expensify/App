import React, {useState} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import Button from '@components/Button';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type TextInputPopupProps = {
    style?: StyleProp<ViewStyle>;
    defaultValue: string;
    placeholder?: string;
    closeOverlay: () => void;
    onChange: (value: string) => void;
};

function TextInputPopup({style, defaultValue, placeholder, closeOverlay, onChange}: TextInputPopupProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
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
        <View style={[!isSmallScreenWidth && styles.pv4, styles.ph5, styles.gap5, style]}>
            <TextInput
                placeholder={placeholder}
                value={value}
                onChangeText={setValue}
                accessibilityLabel={placeholder}
                role={CONST.ROLE.PRESENTATION}
                containerStyles={[styles.mt2]}
            />
            <View style={[styles.flexRow, styles.gap2]}>
                <Button
                    medium
                    style={[styles.flex1]}
                    text={translate('common.reset')}
                    onPress={resetChanges}
                    sentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_RESET_TEXT_INPUT}
                />
                <Button
                    success
                    medium
                    style={[styles.flex1]}
                    text={translate('common.apply')}
                    onPress={applyChanges}
                    sentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_APPLY_TEXT_INPUT}
                />
            </View>
        </View>
    );
}

export default TextInputPopup;
