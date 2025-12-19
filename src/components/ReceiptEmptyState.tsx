import React, {useEffect, useRef} from 'react';
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

    /** Callback to be called when the image loads */
    onLoad?: () => void;
};

// Returns an SVG icon indicating that the user should attach a receipt
function ReceiptEmptyState({onPress, disabled = false, isThumbnail = false, isInMoneyRequestView = false, shouldUseFullHeight = false, style, onLoad}: ReceiptEmptyStateProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const theme = useTheme();
    const isLoadedRef = useRef(false);

    const Wrapper = onPress ? PressableWithoutFeedback : View;
    const containerStyle = [
        styles.alignItemsCenter,
        styles.justifyContentCenter,
        styles.moneyRequestViewImage,
        isThumbnail && !isInMoneyRequestView ? styles.moneyRequestAttachReceiptThumbnail : styles.moneyRequestAttachReceipt,
        shouldUseFullHeight && styles.receiptEmptyStateFullHeight,
        style,
    ];

    useEffect(() => {
        if (isLoadedRef.current) {
            return;
        }
        isLoadedRef.current = true;
        onLoad?.();
    }, [onLoad]);

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

export default ReceiptEmptyState;
