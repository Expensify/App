import React, {useCallback, useContext, useEffect, useRef} from 'react';
import {View} from 'react-native';
import AttachmentPicker from '@components/AttachmentPicker';
import Button from '@components/Button';
import DragAndDropConsumer from '@components/DragAndDrop/Consumer';
import {DragAndDropContext} from '@components/DragAndDrop/Provider';
import DropZoneUI from '@components/DropZone/DropZoneUI';
import Icon from '@components/Icon';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import useFilesValidation from '@hooks/useFilesValidation';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {shouldUseTransactionDraft} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import StepScreenDragAndDropWrapper from '@pages/iou/request/step/StepScreenDragAndDropWrapper';
import withFullTransactionOrNotFound from '@pages/iou/request/step/withFullTransactionOrNotFound';
import type {WithFullTransactionOrNotFoundProps} from '@pages/iou/request/step/withFullTransactionOrNotFound';
import variables from '@styles/variables';
import {setMoneyRequestOdometerImage} from '@userActions/IOU';
import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import type {FileObject} from '@src/types/utils/Attachment';

type IOURequestStepOdometerImageProps = WithFullTransactionOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.ODOMETER_IMAGE>;

function IOURequestStepOdometerImage({
    route: {
        params: {transactionID, readingType, action, iouType},
    },
}: IOURequestStepOdometerImageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {isDraggingOver} = useContext(DragAndDropContext);
    const lazyIcons = useMemoizedLazyExpensifyIcons(['OdometerStart', 'OdometerEnd']);
    const actionValue: IOUAction = action ?? CONST.IOU.ACTION.CREATE;
    const iouTypeValue: IOUType = iouType ?? CONST.IOU.TYPE.REQUEST;
    const isTransactionDraft = shouldUseTransactionDraft(actionValue, iouTypeValue);
    const dropBlobUrlsRef = useRef<string[]>([]);
    const shouldRevokeOnUnmountRef = useRef(true);
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout because drag and drop is not supported on mobile.
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    const title = readingType === CONST.IOU.ODOMETER_IMAGE_TYPE.START ? translate('distance.odometer.startTitle') : translate('distance.odometer.endTitle');
    const message = readingType === CONST.IOU.ODOMETER_IMAGE_TYPE.START ? translate('distance.odometer.startMessageWeb') : translate('distance.odometer.endMessageWeb');
    const icon = readingType === CONST.IOU.ODOMETER_IMAGE_TYPE.START ? lazyIcons.OdometerStart : lazyIcons.OdometerEnd;
    const messageHTML = `<centered-text><muted-text-label>${message}</muted-text-label></centered-text>`;

    const navigateBack = useCallback(() => {
        Navigation.goBack();
    }, []);

    const revokeDropBlobUrls = useCallback(() => {
        for (const url of dropBlobUrlsRef.current) {
            if (url.startsWith('blob:')) {
                URL.revokeObjectURL(url);
            }
        }
        dropBlobUrlsRef.current = [];
    }, []);

    const handleImageSelected = useCallback(
        (file: FileObject) => {
            setMoneyRequestOdometerImage(transactionID, readingType, file as File, isTransactionDraft);
            shouldRevokeOnUnmountRef.current = false;
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
            if (files.length === 0) {
                return;
            }
            revokeDropBlobUrls();
            const blobUrls: string[] = [];
            for (const file of files) {
                const blobUrl = URL.createObjectURL(file);
                blobUrls.push(blobUrl);
                // eslint-disable-next-line no-param-reassign
                file.uri = blobUrl;
            }
            dropBlobUrlsRef.current = blobUrls;
            validateFiles(files as FileObject[], Array.from(event.dataTransfer?.items ?? []));
        },
        [revokeDropBlobUrls, validateFiles],
    );

    useEffect(() => {
        return () => {
            if (!shouldRevokeOnUnmountRef.current) {
                return;
            }
            revokeDropBlobUrls();
        };
    }, [revokeDropBlobUrls]);

    const desktopUploadView = () => (
        <View style={[styles.alignItemsCenter, styles.justifyContentCenter, styles.flex1, styles.ph11]}>
            <Icon
                src={icon}
                width={variables.iconSection}
                height={variables.iconSection}
                additionalStyles={[styles.mb5]}
            />
            <Text style={[styles.textFileUpload, styles.mb2]}>{translate('receipt.upload')}</Text>
            <View style={styles.renderHTML}>
                <RenderHTML html={messageHTML} />
            </View>
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
                <View style={[styles.flex1, styles.chooseFilesView(isSmallScreenWidth)]}>
                    <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter]}>{!(isDraggingOver ?? isDraggingOverWrapper) && desktopUploadView()}</View>
                    <DragAndDropConsumer onDrop={handleDrop}>
                        <DropZoneUI
                            icon={icon}
                            iconWidth={variables.iconSection}
                            iconHeight={variables.iconSection}
                            dropStyles={styles.receiptDropOverlay(true)}
                            dropTitle={title}
                            dropTextStyles={styles.receiptDropText}
                            dashedBorderStyles={[styles.dropzoneArea, styles.easeInOpacityTransition, styles.activeDropzoneDashedBorder(theme.receiptDropBorderColorActive, true)]}
                        />
                    </DragAndDropConsumer>
                    {ErrorModal}
                </View>
            )}
        </StepScreenDragAndDropWrapper>
    );
}

IOURequestStepOdometerImage.displayName = 'IOURequestStepOdometerImage';

// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepOdometerImageWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepOdometerImage);

export default IOURequestStepOdometerImageWithFullTransactionOrNotFound;
