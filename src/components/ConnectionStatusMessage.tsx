import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import type {ComponentProps} from 'react';

import React from 'react';
import {View} from 'react-native';

import Button from './Button';
import Icon from './Icon';
import RenderHTML from './RenderHTML';

type ConnectionStatusMessageProps = {
    message?: string;
    actionText?: string;
    onActionPress?: () => void;
    isActionDisabled?: boolean;
    statusTone?: 'default' | 'success' | 'danger';
    onLinkPress?: ComponentProps<typeof RenderHTML>['onLinkPress'];
    shouldIncludeHorizontalPadding?: boolean;
};

function ConnectionStatusMessage({
    message,
    actionText,
    onActionPress,
    isActionDisabled = false,
    statusTone = 'default',
    onLinkPress,
    shouldIncludeHorizontalPadding = true,
}: ConnectionStatusMessageProps) {
    const icons = useMemoizedLazyExpensifyIcons(['DotIndicator']);
    const theme = useTheme();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    if (!message && !actionText) {
        return null;
    }

    let statusMessageRowPadding;
    if (shouldIncludeHorizontalPadding) {
        statusMessageRowPadding = shouldUseNarrowLayout ? styles.ph5 : styles.ph8;
    }
    const shouldShowActionButton = !!actionText && !!onActionPress;
    const isDangerStatus = statusTone === 'danger';
    const messageTag = isDangerStatus ? 'rbr' : 'muted-text-label';
    const messageHTML = `<${messageTag}>${message ?? ''}</${messageTag}>`;
    const messageContent = (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.flex1]}>
            {isDangerStatus && (
                <View style={[styles.offlineFeedbackErrorDot, styles.mr2]}>
                    <Icon
                        src={icons.DotIndicator}
                        fill={theme.danger}
                    />
                </View>
            )}
            <View style={styles.flex1}>
                <RenderHTML
                    html={messageHTML}
                    onLinkPress={onLinkPress}
                />
            </View>
        </View>
    );

    const actionButton = shouldShowActionButton ? (
        <Button
            small
            danger
            style={styles.alignSelfStart}
            text={actionText}
            onPress={onActionPress}
            isDisabled={isActionDisabled}
        />
    ) : null;

    return (
        <View style={[statusMessageRowPadding, styles.flexRow, styles.alignItemsCenter, styles.gap3]}>
            {messageContent}
            <View style={[styles.alignItemsCenter, styles.justifyContentCenter]}>{actionButton}</View>
        </View>
    );
}

export default ConnectionStatusMessage;
