import PropTypes from 'prop-types';
import React from 'react';
import {Text, View} from 'react-native';
import ReceiptUpload from '@assets/images/receipt-upload.svg';
import DragAndDropConsumer from '@components/DragAndDrop/Consumer';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';

const propTypes = {
    /** Callback to execute when a file is dropped. */
    onDrop: PropTypes.func.isRequired,

    /** Pixels the receipt image should be shifted down to match the non-drag view UI */
    receiptImageTopPosition: PropTypes.number,
};

const defaultProps = {
    receiptImageTopPosition: 0,
};

function ReceiptDropUI({onDrop, receiptImageTopPosition}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    return (
        <DragAndDropConsumer onDrop={onDrop}>
            <View style={[styles.receiptDropOverlay, styles.w100, styles.h100, styles.justifyContentCenter, styles.alignItemsCenter]}>
                <View style={styles.receiptImageWrapper(receiptImageTopPosition)}>
                    <ReceiptUpload
                        width={CONST.RECEIPT.ICON_SIZE}
                        height={CONST.RECEIPT.ICON_SIZE}
                    />
                    <Text style={[styles.textReceiptUpload]}>{translate('receipt.dropTitle')}</Text>
                    <Text style={[styles.subTextReceiptUpload]}>{translate('receipt.dropMessage')}</Text>
                </View>
            </View>
        </DragAndDropConsumer>
    );
}

ReceiptDropUI.displayName = 'ReceiptDropUI';
ReceiptDropUI.propTypes = propTypes;
ReceiptDropUI.defaultProps = defaultProps;

export default ReceiptDropUI;
