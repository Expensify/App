import React from 'react';
import {Text, View} from 'react-native';
import PropTypes from 'prop-types';
import CONST from '../../CONST';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import DropZone from '../../components/DragAndDrop/DropZone';
import styles from '../../styles/styles';
import ReceiptUpload from '../../../assets/images/receipt-upload.svg';

const propTypes = {
    ...withLocalizePropTypes,

    receiptImageTopPosition: PropTypes.number,
};

const defaultProps = {
    receiptImageTopPosition: 0,
};

function ReceiptDropUI(props) {
    return (
        <DropZone
            dropZoneViewHolderName={CONST.RECEIPT.DROP_HOST_NAME}
            dropZoneId={CONST.RECEIPT.ACTIVE_DROP_NATIVE_ID}
            dropZoneViewHolderStyle={[styles.receiptTransparentOverlay, styles.alignItemsCenter, styles.justifyContentCenter]}
            dropZoneViewStyle={styles.receiptDropZoneTopInvisibleOverlay}
        >
            <View style={{position: 'absolute', top: props.receiptImageTopPosition}}>
                <ReceiptUpload
                    width={CONST.RECEIPT.ICON_SIZE}
                    height={CONST.RECEIPT.ICON_SIZE}
                />
            </View>
            <View style={{position: 'absolute', top: props.receiptImageTopPosition + CONST.RECEIPT.ICON_SIZE}}>
                <Text style={[styles.textReceiptUpload]}>Let it go</Text>
                <Text style={[styles.subTextReceiptUpload]}>Drop your file here</Text>
            </View>
        </DropZone>
    );
}

ReceiptDropUI.displayName = 'ReportDropUI';
ReceiptDropUI.propTypes = propTypes;
ReceiptDropUI.defaultProps = defaultProps;

export default withLocalize(ReceiptDropUI);
