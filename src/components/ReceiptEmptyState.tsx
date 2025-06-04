import React from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';

type ReceiptEmptyStateProps = {
    /** Whether or not there is an error */
    hasError?: boolean;

    /** Callback to be called on onPress */
    onPress?: () => void;

    /** Whether the receipt action is disabled */
    disabled?: boolean;

    /** Whether the receipt is a thumbnail */
    isThumbnail?: boolean;

    /** Whether the receipt is in the money request view */
    isInMoneyRequestView?: boolean;

    /** Whether the receipt empty state should extend to the full height of the container. */
    shouldUseFullHeight?: boolean;

    style?: StyleProp<ViewStyle>;
};

// Returns an SVG icon indicating that the user should attach a receipt
function ReceiptEmptyState({hasError = false, onPress, disabled = false, isThumbnail = false, isInMoneyRequestView = false, shouldUseFullHeight = false, style}: ReceiptEmptyStateProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const theme = useTheme();

    const Wrapper = onPress ? PressableWithoutFeedback : View;
    const containerStyle = [
        styles.alignItemsCenter,
        styles.justifyContentCenter,
        styles.moneyRequestViewImage,
        isThumbnail && !isInMoneyRequestView ? styles.moneyRequestAttachReceiptThumbnail : styles.moneyRequestAttachReceipt,
        hasError && styles.borderColorDanger,
        shouldUseFullHeight && styles.receiptEmptyStateFullHeight,
        style,
    ];

    return (
        <Wrapper
            accessibilityRole="imagebutton"
            accessibilityLabel={translate('receipt.upload')}
            onPress={onPress}
            disabled={disabled}
            disabledStyle={styles.cursorDefault}
            style={containerStyle}
        >
            <View>
                <Icon
                    fill={theme.border}
                    src={Expensicons.Receipt}
                    width={variables.eReceiptEmptyIconWidth}
                    height={variables.eReceiptEmptyIconWidth}
                />
                {!isThumbnail && (
                    <Icon
                        src={Expensicons.ReceiptPlaceholderPlus}
                        width={variables.avatarSizeSmall}
                        height={variables.avatarSizeSmall}
                        additionalStyles={styles.moneyRequestAttachReceiptThumbnailIcon}
                    />
                )}
            </View>
        </Wrapper>
    );
}

ReceiptEmptyState.displayName = 'ReceiptEmptyState';

export default ReceiptEmptyState;
