import React, {useRef} from 'react';
import {PanResponder, View} from 'react-native';
import AttachmentPicker from '@components/AttachmentPicker';
import Button from '@components/Button';
import DragAndDropConsumer from '@components/DragAndDrop/Consumer';
import {useDragAndDropState} from '@components/DragAndDrop/Provider';
import DropZoneUI from '@components/DropZone/DropZoneUI';
import Icon from '@components/Icon';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {FileObject} from '@src/types/utils/Attachment';
import type {CameraProps} from './types';

/**
 * FileUpload — desktop web capture variant.
 * Renders a drag-and-drop zone + file picker button.
 * Calls `onCapture(file, source)` for each file dropped or picked.
 */
function FileUpload({onCapture, shouldAcceptMultipleFiles = false, onLayout}: CameraProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const lazyIllustrations = useMemoizedLazyIllustrations(['ReceiptStack']);
    const lazyIcons = useMemoizedLazyExpensifyIcons(['SmartScan']);
    const panResponderRef = useRef(
        PanResponder.create({
            onPanResponderTerminationRequest: () => false,
        }),
    );

    const {isDraggingOver} = useDragAndDropState();

    const emitFiles = (files: FileObject[]) => {
        for (const file of files) {
            const source = file.uri ?? URL.createObjectURL(file as Blob);
            onCapture(file, source);
        }
    };

    const handleDrop = (e: DragEvent) => {
        const rawFiles = Array.from(e?.dataTransfer?.files ?? []);
        if (rawFiles.length === 0) {
            return;
        }
        const files: FileObject[] = rawFiles.map((file) => {
            // eslint-disable-next-line no-param-reassign
            file.uri = URL.createObjectURL(file);
            return file;
        });
        emitFiles(files);
    };

    return (
        <View
            onLayout={() => onLayout?.()}
            style={[styles.flex1, styles.chooseFilesView(false)]}
        >
            <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter]}>
                {!isDraggingOver && (
                    <View style={[styles.alignItemsCenter, styles.justifyContentCenter]}>
                        <Icon
                            src={lazyIllustrations.ReceiptStack}
                            width={CONST.RECEIPT.ICON_SIZE}
                            height={CONST.RECEIPT.ICON_SIZE}
                        />
                        <View
                            style={[styles.uploadFileViewTextContainer, styles.userSelectNone]}
                            // eslint-disable-next-line react/jsx-props-no-spreading, react-hooks/refs
                            {...panResponderRef.current.panHandlers}
                        >
                            <Text style={[styles.textFileUpload, styles.mb2]}>{translate(shouldAcceptMultipleFiles ? 'receipt.uploadMultiple' : 'receipt.upload')}</Text>
                            <Text style={[styles.textLabelSupporting, styles.textAlignCenter, styles.lineHeightLarge]}>
                                {translate(shouldAcceptMultipleFiles ? 'receipt.desktopSubtitleMultiple' : 'receipt.desktopSubtitleSingle')}
                            </Text>
                        </View>

                        <AttachmentPicker allowMultiple={shouldAcceptMultipleFiles}>
                            {({openPicker}) => (
                                <Button
                                    success
                                    text={translate(shouldAcceptMultipleFiles ? 'common.chooseFiles' : 'common.chooseFile')}
                                    accessibilityLabel={translate(shouldAcceptMultipleFiles ? 'common.chooseFiles' : 'common.chooseFile')}
                                    style={[styles.p5]}
                                    onPress={() => {
                                        openPicker({
                                            onPicked: (data) => emitFiles(data),
                                        });
                                    }}
                                    sentryLabel={CONST.SENTRY_LABEL.IOU_REQUEST_STEP.SCAN_SUBMIT_BUTTON}
                                />
                            )}
                        </AttachmentPicker>
                    </View>
                )}
            </View>
            <DragAndDropConsumer onDrop={handleDrop}>
                <DropZoneUI
                    icon={lazyIcons.SmartScan}
                    dropStyles={styles.receiptDropOverlay(true)}
                    dropTitle={translate(shouldAcceptMultipleFiles ? 'dropzone.scanReceipts' : 'quickAction.scanReceipt')}
                    dropTextStyles={styles.receiptDropText}
                    dashedBorderStyles={[styles.dropzoneArea, styles.easeInOpacityTransition, styles.activeDropzoneDashedBorder(theme.receiptDropBorderColorActive, true)]}
                />
            </DragAndDropConsumer>
        </View>
    );
}

FileUpload.displayName = 'FileUpload';

export default FileUpload;
