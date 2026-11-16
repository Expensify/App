import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Text from '@components/Text';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import type {SentryLabel, WithSentryLabelWhenPressable} from '@src/types/utils/SentryLabel';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import ActionButtons from './ActionButtons';

type BasePopupProps = React.PropsWithChildren &
    WithSentryLabelWhenPressable<'onReset', 'resetSentryLabel'> & {
        label?: string;
        showLabel?: boolean;
        shouldShowActionButtons?: boolean;
        applySentryLabel: SentryLabel;
        style?: StyleProp<ViewStyle>;
        shouldSubmitOnEnter?: boolean;
        onApply: () => void;
        onReset?: () => void;
        onBackButtonPress?: () => void;
    };

function BasePopup({
    children,
    label,
    applySentryLabel,
    resetSentryLabel,
    showLabel,
    shouldShowActionButtons = true,
    shouldSubmitOnEnter,
    style,
    onApply,
    onReset,
    onBackButtonPress,
}: BasePopupProps) {
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const styles = useThemeStyles();
    // Built in one object so TypeScript keeps resetSentryLabel tied to onReset, which ActionButtons requires together.
    const resetProps = onReset ? {onReset, resetSentryLabel} : {};

    const shouldDisplayLabel = (showLabel ?? isSmallScreenWidth) && !!label;

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
                shouldDisplayLabel && <Text style={[styles.textLabel, styles.textSupporting, styles.ph5, styles.pv1, styles.mb2]}>{label}</Text>
            )}
            {children}
            {shouldShowActionButtons && (
                <ActionButtons
                    containerStyle={[styles.flexRow, styles.gap2, styles.ph5, styles.mt2]}
                    {...resetProps}
                    onApply={onApply}
                    applySentryLabel={applySentryLabel}
                    shouldSubmitOnEnter={shouldSubmitOnEnter}
                />
            )}
        </View>
    );
}

export default BasePopup;
