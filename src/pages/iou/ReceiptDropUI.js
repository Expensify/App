import React from 'react';
import {View} from 'react-native';
import CONST from '../../CONST';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import Colors from '../../styles/colors';
import ReceiptDropZone from './ReceiptDropZone';

const propTypes = {
    ...withLocalizePropTypes,
};

function ReceiptDropUI() {
    return (
        <ReceiptDropZone
            dropZoneViewHolderName={CONST.RECEIPT.DROP_HOST_NAME}
            dropZoneId={CONST.RECEIPT.ACTIVE_DROP_NATIVE_ID}
        >
            <View style={{backgroundColor: Colors.green100}} />
        </ReceiptDropZone>
    );
}

ReceiptDropUI.displayName = 'ReportDropUI';
ReceiptDropUI.propTypes = propTypes;

export default withLocalize(ReceiptDropUI);
