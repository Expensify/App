import React from 'react';
import {Text} from 'react-native';
import CONST from '../../CONST';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import DropZone from '../../components/DragAndDrop/DropZone';
import styles from '../../styles/styles';
import ReceiptUpload from '../../../assets/images/receipt-upload.svg';

const propTypes = {
    ...withLocalizePropTypes,
};

function ReceiptDropUI() {
    return (
        <DropZone
            dropZoneViewHolderName={CONST.RECEIPT.DROP_HOST_NAME}
            dropZoneId={CONST.RECEIPT.ACTIVE_DROP_NATIVE_ID}
            dropZoneViewHolderStyle={[styles.receiptTransparentOverlay, styles.alignItemsCenter, styles.justifyContentCenter]}
            dropZoneViewStyle={styles.receiptDropZoneTopInvisibleOverlay}
        >
            <ReceiptUpload
                width={164}
                height={164}
            />
            <Text style={[styles.textReceiptUpload]}>Let it go</Text>
            <Text style={[styles.subTextReceiptUpload]}>Drop your file here</Text>
        </DropZone>
    );
}

ReceiptDropUI.displayName = 'ReportDropUI';
ReceiptDropUI.propTypes = propTypes;

export default withLocalize(ReceiptDropUI);
