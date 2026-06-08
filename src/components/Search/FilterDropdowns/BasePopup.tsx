import React from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Text from '@components/Text';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import ActionButtons from './ActionButtons';

type BasePopupProps = React.PropsWithChildren & {
    label?: string;
    applySentryLabel: string;
    resetSentryLabel: string;
    style?: StyleProp<ViewStyle>;
    onApply: () => void;
    onReset: () => void;
    onBackButtonPress?: () => void;
};

function BasePopup({children, label, applySentryLabel, resetSentryLabel, style, onApply, onReset, onBackButtonPress}: BasePopupProps) {
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const styles = useThemeStyles();

    return (
        <View style={[styles.pv4, style]}>
            {onBackButtonPress ? (
                <HeaderWithBackButton
                    shouldDisplayHelpButton={false}
                    style={[styles.h10, styles.pv1, styles.mb2]}
                    subtitle={label}
                    onBackButtonPress={onBackButtonPress}
                />
            ) : (
                isSmallScreenWidth && !!label && <Text style={[styles.textLabel, styles.textSupporting, styles.ph5, styles.pv1, styles.mb2]}>{label}</Text>
            )}
            {children}
            <ActionButtons
                containerStyle={[styles.flexRow, styles.gap2, styles.ph5, styles.mt2]}
                onReset={onReset}
                onApply={onApply}
                applySentryLabel={applySentryLabel}
                resetSentryLabel={resetSentryLabel}
            />
        </View>
    );
}

export default BasePopup;
