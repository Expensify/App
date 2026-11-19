import useLayoutSpacing from '@hooks/useLayoutSpacing';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type {WithSentryLabelWhenPressable} from '@src/types/utils/SentryLabel';

import type {ComponentProps} from 'react';

import React from 'react';
import {View} from 'react-native';

import Button from './Button';
import Icon from './Icon';
import RenderHTML from './RenderHTML';

type ConnectionStatusMessageProps = WithSentryLabelWhenPressable<'onActionPress', 'actionSentryLabel'> & {
    message?: string;
    actionText?: string;
    onActionPress?: () => void;
    isActionDisabled?: boolean;
    /** `pending` marks something still in progress, with an hourglass and a regular action button */
    statusTone?: 'default' | 'success' | 'danger' | 'pending';
    onLinkPress?: ComponentProps<typeof RenderHTML>['onLinkPress'];
    shouldIncludeHorizontalPadding?: boolean;

    /**
     * Accessible name for the action button
     */
    actionAccessibilityLabel?: string;
};

function ConnectionStatusMessage({
    message,
    actionText,
    onActionPress,
    isActionDisabled = false,
    statusTone = 'default',
    onLinkPress,
    shouldIncludeHorizontalPadding = true,
    actionAccessibilityLabel,
    actionSentryLabel,
}: ConnectionStatusMessageProps) {
    const icons = useMemoizedLazyExpensifyIcons(['DotIndicator', 'Hourglass']);
    const theme = useTheme();
    const styles = useThemeStyles();
    const {cardPaddingHorizontal} = useLayoutSpacing();

    if (!message && !actionText) {
        return null;
    }

    let statusMessageRowPadding;
    if (shouldIncludeHorizontalPadding) {
        statusMessageRowPadding = cardPaddingHorizontal;
    }
    const shouldShowActionButton = !!actionText && !!onActionPress;
    const isDangerStatus = statusTone === 'danger';
    const isSuccessStatus = statusTone === 'success';
    const isPendingStatus = statusTone === 'pending';
    let messageTag;
    if (isDangerStatus) {
        messageTag = 'rbr';
    } else if (isSuccessStatus) {
        messageTag = 'gbr';
    } else {
        messageTag = 'muted-text-label';
    }
    const messageHTML = `<${messageTag}>${message ?? ''}</${messageTag}>`;
    let statusIcon;
    if (isPendingStatus) {
        statusIcon = {src: icons.Hourglass, fill: theme.textSupporting};
    } else if (isDangerStatus || isSuccessStatus) {
        statusIcon = {src: icons.DotIndicator, fill: isDangerStatus ? theme.danger : theme.iconSuccessFill};
    }
    const messageContent = (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.flex1]}>
            {!!statusIcon && (
                <View style={[styles.offlineFeedbackErrorDot, styles.mr2]}>
                    <Icon
                        src={statusIcon.src}
                        fill={statusIcon.fill}
                    />
                </View>
            )}
            <View style={[styles.flex1, styles.flexRow]}>
                <RenderHTML
                    html={messageHTML}
                    onLinkPress={onLinkPress}
                />
            </View>
        </View>
    );

    let actionButtonVariant;
    if (isSuccessStatus) {
        actionButtonVariant = CONST.BUTTON_VARIANT.SUCCESS;
    } else if (!isPendingStatus) {
        actionButtonVariant = CONST.BUTTON_VARIANT.DANGER;
    }
    const actionButton = shouldShowActionButton ? (
        <Button
            variant={actionButtonVariant}
            size={CONST.BUTTON_SIZE.SMALL}
            style={styles.alignSelfStart}
            onPress={onActionPress}
            isDisabled={isActionDisabled}
            accessibilityLabel={actionAccessibilityLabel}
            sentryLabel={actionSentryLabel}
        >
            <Button.Text>{actionText}</Button.Text>
        </Button>
    ) : null;

    return (
        <View style={[statusMessageRowPadding, styles.flexRow, styles.alignItemsCenter, styles.gap3]}>
            {messageContent}
            <View style={[styles.alignItemsCenter, styles.justifyContentCenter]}>{actionButton}</View>
        </View>
    );
}

export default ConnectionStatusMessage;
