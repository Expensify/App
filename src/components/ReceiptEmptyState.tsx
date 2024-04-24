import React from 'react';
import useLocalize from '@hooks/useLocalize';
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
};

// Returns an SVG icon indicating that the user should attach a receipt
function ReceiptEmptyState({hasError = false, onPress = () => {}, disabled = false}: ReceiptEmptyStateProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <PressableWithoutFeedback
            accessibilityRole="imagebutton"
            accessibilityLabel={translate('receipt.upload')}
            onPress={onPress}
            disabled={disabled}
            disabledStyle={styles.cursorDefault}
            style={[styles.alignItemsCenter, styles.justifyContentCenter, styles.moneyRequestViewImage, styles.moneyRequestAttachReceipt, hasError && styles.borderColorDanger]}
        >
            <Icon
                src={Expensicons.EmptyStateAttachReceipt}
                width={variables.eReceiptEmptyIconWidth}
                height={variables.eReceiptIconHeight}
            />
        </PressableWithoutFeedback>
    );
}

ReceiptEmptyState.displayName = 'ReceiptEmptyState';

export default ReceiptEmptyState;
