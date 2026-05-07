import React, {useRef, useState} from 'react';
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
import StepScreenDragAndDropWrapper from '@pages/iou/request/step/StepScreenDragAndDropWrapper';
import CONST from '@src/CONST';
import type {FileObject} from '@src/types/utils/Attachment';

type DesktopWebUploadViewProps = {
    PDFValidationComponent: React.ReactNode;
    shouldAcceptMultipleFiles: boolean;
    isReplacingReceipt: boolean;
    validateFiles: (files: FileObject[], items?: DataTransferItem[]) => void;
    onBackButtonPress: () => void;
    shouldShowWrapper: boolean;
};

function DesktopWebUploadView({PDFValidationComponent, shouldAcceptMultipleFiles, isReplacingReceipt, validateFiles, onBackButtonPress, shouldShowWrapper}: DesktopWebUploadViewProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const lazyIllustrations = useMemoizedLazyIllustrations(['ReceiptStack']);
    const lazyIcons = useMemoizedLazyExpensifyIcons(['ReplaceReceipt', 'SmartScan']);
    const panResponder = useRef(
        PanResponder.create({
            onPanResponderTerminationRequest: () => false,
        }),
    ).current;

    const {isDraggingOver} = useDragAndDropState();
    const [containerHeight, setContainerHeight] = useState(0);
    const [desktopUploadViewHeight, setDesktopUploadViewHeight] = useState(0);
    const [alternativeMethodsHeight, setAlternativeMethodsHeight] = useState(0);
    const chooseFilesPaddingVertical = Number(styles.chooseFilesView(false).paddingVertical);
    const shouldHideAlternativeMethods = alternativeMethodsHeight + desktopUploadViewHeight + chooseFilesPaddingVertical * 2 > containerHeight;

    const handleDropReceipt = (e: DragEvent) => {
        const files = Array.from(e?.dataTransfer?.files ?? []);
        if (files.length === 0) {
            return;
        }
        for (const file of files) {
            file.uri = URL.createObjectURL(file);
        }

        validateFiles(files, Array.from(e.dataTransfer?.items ?? []));
    };

    return (
        <StepScreenDragAndDropWrapper
            headerTitle={translate('common.receipt')}
            onBackButtonPress={onBackButtonPress}
            shouldShowWrapper={shouldShowWrapper}
            testID="IOURequestStepScan"
        >
            {(isDraggingOverWrapper) => (
                <View
                    onLayout={(event) => {
                        setContainerHeight(event.nativeEvent.layout.height);
                    }}
                    style={[styles.flex1, styles.chooseFilesView(false)]}
                >
                    <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter]}>
                        {!(isDraggingOver ?? isDraggingOverWrapper) && (
                            <View
                                style={[styles.alignItemsCenter, styles.justifyContentCenter]}
                                onLayout={(e) => {
                                    setDesktopUploadViewHeight(e.nativeEvent.layout.height);
                                }}
                            >
                                {PDFValidationComponent}
                                <Icon
                                    src={lazyIllustrations.ReceiptStack}
                                    width={CONST.RECEIPT.ICON_SIZE}
                                    height={CONST.RECEIPT.ICON_SIZE}
                                />
                                <View
                                    style={[styles.uploadFileViewTextContainer, styles.userSelectNone]}
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
                                                    onPicked: (data) => validateFiles(data),
                                                });
                                            }}
                                            sentryLabel={CONST.SENTRY_LABEL.IOU_REQUEST_STEP.SCAN_SUBMIT_BUTTON}
                                        />
                                    )}
                                </AttachmentPicker>
                            </View>
                        )}
                    </View>
                    <DragAndDropConsumer onDrop={handleDropReceipt}>
                        <DropZoneUI
                            icon={isReplacingReceipt ? lazyIcons.ReplaceReceipt : lazyIcons.SmartScan}
                            dropStyles={styles.receiptDropOverlay(true)}
                            dropTitle={isReplacingReceipt ? translate('dropzone.replaceReceipt') : translate(shouldAcceptMultipleFiles ? 'dropzone.scanReceipts' : 'quickAction.scanReceipt')}
                            dropTextStyles={styles.receiptDropText}
                            dashedBorderStyles={[styles.dropzoneArea, styles.easeInOpacityTransition, styles.activeDropzoneDashedBorder(theme.receiptDropBorderColorActive, true)]}
                        />
                    </DragAndDropConsumer>
                    {!shouldHideAlternativeMethods && <ReceiptAlternativeMethods onLayout={(e) => setAlternativeMethodsHeight(e.nativeEvent.layout.height)} />}
                </View>
            )}
        </StepScreenDragAndDropWrapper>
    );
}

export default DesktopWebUploadView;
export type {DesktopWebUploadViewProps};
