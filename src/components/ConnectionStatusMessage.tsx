import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {ComponentProps} from 'react';

import React from 'react';
import {View} from 'react-native';

import Button from './ButtonComposed';
import Icon from './Icon';
import RenderHTML from './RenderHTML';
import Text from './Text';

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
    const icons = useMemoizedLazyExpensifyIcons(['DotIndicator', 'Exclamation']);
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
    const isSuccessStatus = statusTone === 'success';
    const messageTag = isDangerStatus ? 'rbr' : 'muted-text-label';
    const messageHTML = `<${messageTag}>${message ?? ''}</${messageTag}>`;
    const messageContent = (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.flex1]}>
            {(isDangerStatus || isSuccessStatus) && (
                <View style={[styles.offlineFeedbackErrorDot, styles.mr2]}>
                    <Icon
                        src={icons.DotIndicator}
                        fill={isDangerStatus ? theme.danger : theme.iconSuccessFill}
                    />
                </View>
            )}
            <View style={[styles.flex1, styles.flexRow]}>
                {isSuccessStatus ? (
                    <Text style={[styles.textLabelError, styles.textSuccess]}>{message}</Text>
                ) : (
                    <RenderHTML
                        html={messageHTML}
                        onLinkPress={onLinkPress}
                    />
                )}
            </View>
        </View>
    );

    const actionButton = shouldShowActionButton ? (
        <Button
            variant={statusTone === 'success' ? CONST.BUTTON_VARIANT.SUCCESS : CONST.BUTTON_VARIANT.DANGER}
            size={CONST.BUTTON_SIZE.SMALL}
            style={styles.alignSelfStart}
            onPress={onActionPress}
            isDisabled={isActionDisabled}
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
