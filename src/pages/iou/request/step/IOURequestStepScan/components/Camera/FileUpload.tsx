import React, {useState} from 'react';
import {PanResponder, View} from 'react-native';
import AttachmentPicker from '@components/AttachmentPicker';
import Button from '@components/Button';
import DragAndDropConsumer from '@components/DragAndDrop/Consumer';
import {useDragAndDropState} from '@components/DragAndDrop/Provider';
import DropZoneUI from '@components/DropZone/DropZoneUI';
import Icon from '@components/Icon';
import ReceiptAlternativeMethods from '@components/ReceiptAlternativeMethods';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {FileObject} from '@src/types/utils/Attachment';
import type {CameraProps} from './types';

const panResponder = PanResponder.create({
    onPanResponderTerminationRequest: () => false,
});

/**
 * FileUpload — desktop web capture variant.
 * Renders a drag-and-drop zone + file picker button + receipt alternative methods.
 */
function FileUpload({onDrop, shouldAcceptMultipleFiles = false, onLayout, isReplacingReceipt = false, isDraggingOverWrapper}: CameraProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const lazyIllustrations = useMemoizedLazyIllustrations(['ReceiptStack']);
    const lazyIcons = useMemoizedLazyExpensifyIcons(['ReplaceReceipt', 'SmartScan']);

    const {isDraggingOver} = useDragAndDropState();

    // Height-based hiding for ReceiptAlternativeMethods
    const [containerHeight, setContainerHeight] = useState(0);
    const [uploadViewHeight, setUploadViewHeight] = useState(0);
    const [altMethodsHeight, setAltMethodsHeight] = useState(0);
    const chooseFilesPaddingVertical = Number(styles.chooseFilesView(false).paddingVertical);
    const shouldHideAlternativeMethods = altMethodsHeight + uploadViewHeight + chooseFilesPaddingVertical * 2 > containerHeight;

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

        if (onDrop) {
            onDrop(files, Array.from(e.dataTransfer?.items ?? []));
        }
    };

    return (
        <View
            onLayout={(event) => {
                setContainerHeight(event.nativeEvent.layout.height);
                onLayout?.();
            }}
            style={[styles.flex1, styles.chooseFilesView(false)]}
        >
            <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter]}>
                {!(isDraggingOver ?? isDraggingOverWrapper) && (
                    <View
                        style={[styles.alignItemsCenter, styles.justifyContentCenter]}
                        onLayout={(e) => setUploadViewHeight(e.nativeEvent.layout.height)}
                    >
                        <Icon
                            src={lazyIllustrations.ReceiptStack}
                            width={CONST.RECEIPT.ICON_SIZE}
                            height={CONST.RECEIPT.ICON_SIZE}
                        />
                        <View
                            style={[styles.uploadFileViewTextContainer, styles.userSelectNone]}
                            // PanResponder handlers must be spread onto the View for gesture recognition
                            // eslint-disable-next-line react/jsx-props-no-spreading
                            {...panResponder.panHandlers}
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
                                            onPicked: (data) => onDrop?.(data, []),
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
                    icon={isReplacingReceipt ? lazyIcons.ReplaceReceipt : lazyIcons.SmartScan}
                    dropStyles={styles.receiptDropOverlay(true)}
                    dropTitle={isReplacingReceipt ? translate('dropzone.replaceReceipt') : translate(shouldAcceptMultipleFiles ? 'dropzone.scanReceipts' : 'quickAction.scanReceipt')}
                    dropTextStyles={styles.receiptDropText}
                    dashedBorderStyles={[styles.dropzoneArea, styles.easeInOpacityTransition, styles.activeDropzoneDashedBorder(theme.receiptDropBorderColorActive, true)]}
                />
            </DragAndDropConsumer>
            {!shouldHideAlternativeMethods && <ReceiptAlternativeMethods onLayout={(e) => setAltMethodsHeight(e.nativeEvent.layout.height)} />}
        </View>
    );
}

FileUpload.displayName = 'FileUpload';

export default FileUpload;
