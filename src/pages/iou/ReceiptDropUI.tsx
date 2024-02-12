import React from 'react';
import {View} from 'react-native';
import ReceiptUpload from '@assets/images/receipt-upload.svg';
import DragAndDropConsumer from '@components/DragAndDrop/Consumer';
import ImageSVG from '@components/ImageSVG';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type ReceiptDropUIProps = {
    onDrop: () => void;
    receiptImageTopPosition: number;
}

function ReceiptDropUI({
    onDrop, 
    receiptImageTopPosition=0,
}: ReceiptDropUIProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    return (
        <DragAndDropConsumer onDrop={onDrop}>
            <View style={[styles.receiptDropOverlay, styles.w100, styles.h100, styles.justifyContentCenter, styles.alignItemsCenter]}>
                <View style={styles.receiptImageWrapper(receiptImageTopPosition)}>
                    <ImageSVG
                        src={ReceiptUpload}
                        contentFit="contain"
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

export default ReceiptDropUI;
