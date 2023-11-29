import PropTypes from 'prop-types';
import React from 'react';
import useThemeStyles from '@styles/useThemeStyles';
import variables from '@styles/variables';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';

const propTypes = {
    /** Whether or not there is an error */
    hasError: PropTypes.bool,

    /** Callback to be called on onPress */
    onPress: PropTypes.func,
};

const defaultProps = {
    hasError: false,
    onPress: () => {},
};

// Returns an SVG icon indicating that the user should attach a receipt
function ReceiptEmptyState({hasError, onPress}) {
    const styles = useThemeStyles();
    return (
        <PressableWithoutFeedback
            accessibilityRole="imagebutton"
            onPress={onPress}
            style={[styles.alignItemsCenter, styles.justifyContentCenter, styles.moneyRequestViewImage, styles.moneyRequestAttachReceipt, hasError && styles.borderColorDanger]}
        >
            <Icon
                src={Expensicons.EmptyStateAttachReceipt}
                width={variables.eReceiptIconWidth}
                height={variables.eReceiptIconHeight}
                fill="transparent"
            />
        </PressableWithoutFeedback>
    );
}

ReceiptEmptyState.displayName = 'ReceiptEmptyState';
ReceiptEmptyState.propTypes = propTypes;
ReceiptEmptyState.defaultProps = defaultProps;

export default ReceiptEmptyState;
