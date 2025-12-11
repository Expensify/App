import React, {useCallback, useContext} from 'react';
import {View} from 'react-native';
import AttachmentPicker from '@components/AttachmentPicker';
import Button from '@components/Button';
import DragAndDropConsumer from '@components/DragAndDrop/Consumer';
import {DragAndDropContext} from '@components/DragAndDrop/Provider';
import DropZoneUI from '@components/DropZone/DropZoneUI';
import Icon from '@components/Icon';
import Text from '@components/Text';
import useFilesValidation from '@hooks/useFilesValidation';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {isMobile} from '@libs/Browser';
import Navigation from '@libs/Navigation/Navigation';
import StepScreenDragAndDropWrapper from '@pages/iou/request/step/StepScreenDragAndDropWrapper';
import withFullTransactionOrNotFound from '@pages/iou/request/step/withFullTransactionOrNotFound';
import type {WithFullTransactionOrNotFoundProps} from '@pages/iou/request/step/withFullTransactionOrNotFound';
import {setMoneyRequestOdometerImage} from '@userActions/IOU';
import {shouldUseTransactionDraft} from '@libs/IOUUtils';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import type {FileObject} from '@src/types/utils/Attachment';

type IOURequestStepOdometerImageProps = WithFullTransactionOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.ODOMETER_IMAGE>;

function IOURequestStepOdometerImage({route: {params: {transactionID, readingType, backTo}}}: IOURequestStepOdometerImageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {isDraggingOver} = useContext(DragAndDropContext);
    const lazyIllustrations = useMemoizedLazyIllustrations(['ReceiptUpload']);
    const lazyIcons = useMemoizedLazyExpensifyIcons(['ReceiptScan']);
    const isTransactionDraft = shouldUseTransactionDraft(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.REQUEST);

    const title = readingType === 'start' ? translate('distance.odometer.startTitle') : translate('distance.odometer.endTitle');
    const message = readingType === 'start' ? translate('distance.odometer.startMessage') : translate('distance.odometer.endMessage');

    const navigateBack = useCallback(() => {
        Navigation.goBack(backTo);
    }, [backTo]);

    const handleImageSelected = useCallback(
        (file: FileObject) => {
            setMoneyRequestOdometerImage(transactionID, readingType, file as File, isTransactionDraft);
            navigateBack();
        },
        [transactionID, readingType, isTransactionDraft, navigateBack],
    );

    const {validateFiles, ErrorModal} = useFilesValidation((files: FileObject[]) => {
        if (files.length === 0) {
            return;
        }
        const file = files.at(0);
        if (!file) {
            return;
        }
        // For file selection, source is the blob URL
        handleImageSelected(file);
    });

    const handleDrop = useCallback(
        (event: DragEvent) => {
            const files = Array.from(event.dataTransfer?.files ?? []);
            if (files.length > 0) {
                validateFiles(files as FileObject[]);
            }
        },
        [validateFiles],
    );

    const desktopUploadView = () => (
        <View
            style={[styles.alignItemsCenter, styles.justifyContentCenter, styles.flex1]}
        >
            <Icon
                src={lazyIllustrations.ReceiptUpload}
                width={CONST.RECEIPT.ICON_WIDTH}
                height={CONST.RECEIPT.ICON_HEIGHT}
                additionalStyles={[styles.mb5]}
            />
            <Text style={[styles.textFileUpload, styles.mb2]}>{translate('receipt.upload')}</Text>
            <Text style={[styles.textLabelSupporting, styles.textAlignCenter, styles.lineHeightLarge]}>
                {message}
            </Text>

            <AttachmentPicker>
                {({openPicker}) => (
                    <Button
                        success
                        text={translate('common.chooseFile')}
                        accessibilityLabel={translate('common.chooseFile')}
                        style={[styles.p5, styles.mt4]}
                        onPress={() => {
                            openPicker({
                                onPicked: (data) => validateFiles(data),
                            });
                        }}
                    />
                )}
            </AttachmentPicker>
        </View>
    );

    return (
        <StepScreenDragAndDropWrapper
            headerTitle={title}
            onBackButtonPress={navigateBack}
            shouldShowWrapper
            testID="IOURequestStepOdometerImage"
        >
            {(isDraggingOverWrapper) => (
                <View style={styles.flex1}>
                    {ErrorModal}
                    {isMobile() ? (
                        <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter]}>
                            <Text style={[styles.textFileUpload, styles.mb2]}>{message}</Text>
                            <AttachmentPicker>
                                {({openPicker}) => (
                                    <Button
                                        success
                                        text={translate('common.chooseFile')}
                                        accessibilityLabel={translate('common.chooseFile')}
                                        style={[styles.p5, styles.mt4]}
                                        onPress={() => {
                                            openPicker({
                                                onPicked: (data) => validateFiles(data),
                                            });
                                        }}
                                    />
                                )}
                            </AttachmentPicker>
                        </View>
                    ) : (
                        <>
                            <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter]}>
                                {!(isDraggingOver ?? isDraggingOverWrapper) && desktopUploadView()}
                            </View>
                            <DragAndDropConsumer onDrop={handleDrop}>
                                <DropZoneUI
                                    icon={lazyIcons.ReceiptScan}
                                    dropStyles={styles.receiptDropOverlay(true)}
                                    dropTitle={translate('receipt.upload')}
                                    dropTextStyles={styles.receiptDropText}
                                    dashedBorderStyles={[
                                        styles.dropzoneArea,
                                        styles.easeInOpacityTransition,
                                        styles.activeDropzoneDashedBorder(theme.receiptDropBorderColorActive, true),
                                    ]}
                                />
                            </DragAndDropConsumer>
                        </>
                    )}
                </View>
            )}
        </StepScreenDragAndDropWrapper>
    );
}

IOURequestStepOdometerImage.displayName = 'IOURequestStepOdometerImage';

// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepOdometerImageWithFullTransactionOrNotFound = withFullTransactionOrNotFound(
    IOURequestStepOdometerImage as React.ComponentType<WithFullTransactionOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.ODOMETER_IMAGE>>,
);

export default IOURequestStepOdometerImageWithFullTransactionOrNotFound;

