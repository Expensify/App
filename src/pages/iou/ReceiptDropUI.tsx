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
    /** Function to execute when an item is dropped in the drop zone. */
    onDrop: (event: DragEvent) => void;

    /** Pixels the receipt image should be shifted down to match the non-drag view UI */
    receiptImageTopPosition?: number;
};

function ReceiptDropUI({onDrop, receiptImageTopPosition}: ReceiptDropUIProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    return (
        <DragAndDropConsumer onDrop={onDrop}>
            <View style={[styles.fileDropOverlay, styles.w100, styles.h100, styles.justifyContentCenter, styles.alignItemsCenter]}>
                <View style={receiptImageTopPosition ? styles.fileUploadImageWrapper(receiptImageTopPosition) : undefined}>
                    <ImageSVG
                        src={ReceiptUpload}
                        contentFit="contain"
                        width={CONST.RECEIPT.ICON_SIZE}
                        height={CONST.RECEIPT.ICON_SIZE}
                    />
                    <Text style={[styles.textFileUpload]}>{translate('common.dropTitle')}</Text>
                    <Text style={[styles.subTextFileUpload]}>{translate('common.dropMessage')}</Text>
                </View>
            </View>
        </DragAndDropConsumer>
    );
}

ReceiptDropUI.displayName = 'ReceiptDropUI';

export default ReceiptDropUI;
