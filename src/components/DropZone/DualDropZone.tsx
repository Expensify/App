import React from 'react';
import {View} from 'react-native';
import DragAndDropConsumer from '@components/DragAndDrop/Consumer';
import * as Expensicons from '@components/Icon/Expensicons';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import DropZoneUI from './DropZoneUI';
import DropZoneWrapper from './DropZoneWrapper';

type DropZoneProps = {
    /** Whether the user is editing */
    isEditing: boolean;

    /** Callback to execute when a file is dropped */
    onAttachmentDrop: (event: DragEvent) => void;

    /** Callback to execute when a file is dropped */
    onReceiptDrop: (event: DragEvent) => void;
};

function DualDropZone({isEditing, onAttachmentDrop, onReceiptDrop}: DropZoneProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();

    const shouldStackVertically = shouldUseNarrowLayout || isMediumScreenWidth;

    return (
        <DragAndDropConsumer>
            <View style={[shouldStackVertically ? styles.flexColumn : styles.flexRow, styles.w100, styles.h100]}>
                <DropZoneWrapper onDrop={onAttachmentDrop}>
                    {({isDraggingOver}) => (
                        <DropZoneUI
                            icon={Expensicons.MessageInABottle}
                            dropTitle={translate('dropzone.addAttachments')}
                            dropStyles={styles.attachmentDropOverlay(isDraggingOver)}
                            dropTextStyles={styles.attachmentDropText}
                            dropInnerWrapperStyles={styles.attachmentDropInnerWrapper(isDraggingOver)}
                            dropWrapperStyles={shouldStackVertically ? styles.pb0 : styles.pr0}
                        />
                    )}
                </DropZoneWrapper>
                <DropZoneWrapper onDrop={onReceiptDrop}>
                    {({isDraggingOver}) => (
                        <DropZoneUI
                            icon={isEditing ? Expensicons.ReplaceReceipt : Expensicons.SmartScan}
                            dropTitle={translate(isEditing ? 'dropzone.replaceReceipt' : 'dropzone.scanReceipts')}
                            dropStyles={styles.receiptDropOverlay(isDraggingOver)}
                            dropTextStyles={styles.receiptDropText}
                            dropInnerWrapperStyles={styles.receiptDropInnerWrapper(isDraggingOver)}
                        />
                    )}
                </DropZoneWrapper>
            </View>
        </DragAndDropConsumer>
    );
}

export default DualDropZone;
