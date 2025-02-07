import React from 'react';
import {View} from 'react-native';
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

    disabled?: boolean;

    isThumbnail?: boolean;
};

// Returns an SVG icon indicating that the user should attach a receipt
function ReceiptEmptyState({hasError = false, onPress, disabled = false, isThumbnail = false}: ReceiptEmptyStateProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const theme = useTheme();

    const Wrapper = onPress ? PressableWithoutFeedback : View;

    return (
        <Wrapper
            accessibilityRole="imagebutton"
            accessibilityLabel={translate('receipt.upload')}
            onPress={onPress}
            disabled={disabled}
            disabledStyle={styles.cursorDefault}
            style={[
                styles.alignItemsCenter,
                styles.justifyContentCenter,
                styles.moneyRequestViewImage,
                isThumbnail ? styles.moneyRequestAttachReceiptThumbnail : styles.moneyRequestAttachReceipt,
                hasError && styles.borderColorDanger,
            ]}
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
