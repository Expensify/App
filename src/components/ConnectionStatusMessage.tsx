import type {KeyboardEvent as ReactKeyboardEvent} from 'react';
import React from 'react';
import type {GestureResponderEvent} from 'react-native';
import {View} from 'react-native';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import Button from './Button';
import Icon from './Icon';
import InlineTextWithOptionalLink from './InlineTextWithOptionalLink';

type ConnectionStatusMessageProps = {
    message?: string;
    actionText?: string;
    onActionPress?: () => void;
    isActionDisabled?: boolean;
    statusTone?: 'default' | 'success' | 'danger';
    linkText?: string;
    onLinkPress?: (event: GestureResponderEvent | ReactKeyboardEvent) => void;
    shouldIncludeHorizontalPadding?: boolean;
};

function ConnectionStatusMessage({
    message,
    actionText,
    onActionPress,
    isActionDisabled = false,
    statusTone = 'default',
    linkText,
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

    const statusMessageRowPadding = shouldIncludeHorizontalPadding ? {paddingLeft: 32, paddingRight: 32} : undefined;
    const shouldShowActionButton = !!actionText && !!onActionPress;
    const isDangerStatus = statusTone === 'danger';
    const dangerTextStyle = theme.colorScheme === CONST.THEME.DARK ? styles.textLabelError : styles.badgeDangerText;
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
            <InlineTextWithOptionalLink
                message={message ?? ''}
                linkText={linkText}
                onLinkPress={onLinkPress}
                textStyle={[isDangerStatus ? dangerTextStyle : styles.textLabelSupporting, styles.flex1]}
            />
        </View>
    );

    const actionButton = shouldShowActionButton ? (
        <Button
            small
            danger
            style={styles.alignSelfStart}
            text={actionText}
            onPress={isActionDisabled ? () => {} : onActionPress}
        />
    ) : null;

    if (shouldUseNarrowLayout) {
        return (
            <View style={[statusMessageRowPadding]}>
                {messageContent}
                {!!actionButton && <View style={styles.mt3}>{actionButton}</View>}
            </View>
        );
    }

    return (
        <View style={[statusMessageRowPadding, styles.flexRow, styles.alignItemsCenter]}>
            {messageContent}
            <View style={[styles.alignItemsCenter, styles.justifyContentCenter]}>{actionButton}</View>
        </View>
    );
}

export default ConnectionStatusMessage;
