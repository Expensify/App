import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import styles from '@styles/styles';
import variables from '@styles/variables';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';

const propTypes = {
    /** Whether or not there is a violation error */
    hasError: PropTypes.bool,

    /** Callback to be called on onPress */
    onPress: PropTypes.func,
};

const defaultProps = {
    hasError: false,
    onPress: undefined,
};

// Create a component with the above instructions:

function ReceiptEmptyState({hasError, onPress}) {
    return (
        <PressableWithoutFeedback
            accessibilityRole="button"
            onPress={onPress}
        >
            <View style={[styles.alignItemsCenter, styles.justifyContentCenter, styles.moneyRequestViewImage, styles.moneyRequestAttachReceipt, hasError && styles.borderColorDanger]}>
                <Icon
                    src={Expensicons.EmptyStateAttachReceipt}
                    width={variables.iconSizeUltraLarge}
                    height={variables.iconSizeUltraLarge}
                    fill="#DC80E4"
                />
                <Expensicons.EmptyStateAttachReceipt />
            </View>
        </PressableWithoutFeedback>
    );
}

ReceiptEmptyState.displayName = 'ReceiptEmptyState';
ReceiptEmptyState.propTypes = propTypes;
ReceiptEmptyState.defaultProps = defaultProps;

export default ReceiptEmptyState;
