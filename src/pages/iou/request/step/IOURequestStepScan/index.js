import {View, Text, PanResponder, PixelRatio} from 'react-native';
import React, {useContext, useRef, useState} from 'react';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import ROUTES from '@src/ROUTES';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ReceiptUpload from '@assets/images/receipt-upload.svg';
import Button from '@components/Button';
import styles from '@pages/iou/request/step/@styles/styles';
import CopyTextToClipboard from '@components/CopyTextToClipboard';
import ReceiptDropUI from '@pages/iou/ReceiptDropUI';
import AttachmentPicker from '@components/AttachmentPicker';
import ConfirmModal from '@components/ConfirmModal';
import useWindowDimensions from '@hooks/useWindowDimensions';
import useLocalize from '@hooks/useLocalize';
import {DragAndDropContext} from '@components/DragAndDrop/Provider';
import * as FileUtils from '@libs/fileDownload/FileUtils';
import Navigation from '@libs/Navigation/Navigation';
import reportPropTypes from '@pages/reportPropTypes';
import ONYXKEYS from '@src/ONYXKEYS';
import IOURequestStepRoutePropTypes from '@pages/iou/request/step/IOURequestStepRoutePropTypes';
import StepScreenDragAndDropWrapper from '@pages/iou/request/step/StepScreenDragAndDropWrapper';

const propTypes = {
    /** Navigation route context info provided by react navigation */
    route: IOURequestStepRoutePropTypes.isRequired,

    /** Whether or not the receipt selector is in a tab navigator for tab animations */
    // eslint-disable-next-line react/no-unused-prop-types
    isInTabNavigator: PropTypes.bool,

    /* Onyx Props */
    /** The report that the transaction belongs to */
    report: reportPropTypes,
};

const defaultProps = {
    report: {},
    isInTabNavigator: true,
};

function IOURequestStepScan({
    report,
    route: {
        params: {iouType, reportID, step, transactionID},
    },
}) {
    const [isAttachmentInvalid, setIsAttachmentInvalid] = useState(false);
    const [attachmentInvalidReasonTitle, setAttachmentInvalidReasonTitle] = useState('');
    const [attachmentInvalidReason, setAttachmentValidReason] = useState('');
    const [receiptImageTopPosition, setReceiptImageTopPosition] = useState(0);
    const {isSmallScreenWidth} = useWindowDimensions();
    const {translate} = useLocalize();
    const {isDraggingOver} = useContext(DragAndDropContext);

    // When this screen is accessed from the "start request flow" (ie. the manual/scan/distance tab selector) it is already embedded in a screen wrapper.
    // When this screen is navigated to from the "confirmation step" it won't be embedded in a screen wrapper, so the StepScreenWrapper should be shown.
    // In the "start request flow", the "step" param does not exist, but it does exist in the "confirmation step" flow.
    const isUserComingFromConfirmationStep = !_.isUndefined(step);

    const hideReciptModal = () => {
        setIsAttachmentInvalid(false);
    };

    /**
     * Sets the upload receipt error modal content when an invalid receipt is uploaded
     * @param {*} isInvalid
     * @param {*} title
     * @param {*} reason
     */
    const setUploadReceiptError = (isInvalid, title, reason) => {
        setIsAttachmentInvalid(isInvalid);
        setAttachmentInvalidReasonTitle(title);
        setAttachmentValidReason(reason);
    };

    function validateReceipt(file) {
        const {fileExtension} = FileUtils.splitExtensionFromFileName(lodashGet(file, 'name', ''));
        if (_.contains(CONST.API_ATTACHMENT_VALIDATIONS.UNALLOWED_EXTENSIONS, fileExtension.toLowerCase())) {
            setUploadReceiptError(true, 'attachmentPicker.wrongFileType', 'attachmentPicker.notAllowedExtension');
            return false;
        }

        if (lodashGet(file, 'size', 0) > CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE) {
            setUploadReceiptError(true, 'attachmentPicker.attachmentTooLarge', 'attachmentPicker.sizeExceeded');
            return false;
        }

        if (lodashGet(file, 'size', 0) < CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE) {
            setUploadReceiptError(true, 'attachmentPicker.attachmentTooSmall', 'attachmentPicker.sizeNotMet');
            return false;
        }

        return true;
    }

    const navigateBack = () => {
        Navigation.goBack(ROUTES.MONEE_REQUEST_STEP.getRoute(iouType, CONST.IOU.REQUEST_STEPS.CONFIRMATION, transactionID, reportID), true);
    };

    /**
     * Sets the Receipt objects and navigates the user to the next page
     * @param {Object} file
     */
    const setReceiptAndNavigate = (file) => {
        if (!validateReceipt(file)) {
            return;
        }

        const filePath = URL.createObjectURL(file);
        IOU.setMoneeRequestReceipt_temporaryForRefactor(transactionID, filePath, file.name);

        // When an existing transaction is being edited (eg. not the create transaction flow)
        if (transactionID !== CONST.IOU.OPTIMISTIC_TRANSACTION_ID) {
            IOU.replaceReceipt(transactionID, file, filePath);
            Navigation.dismissModal();
            return;
        }

        // If a reportID exists in the report object, it's because the user started this flow from using the + button in the composer
        // inside a report. In this case, the participants can be automatically assigned from the report and the user can skip the participants step and go straight
        // to the confirm step.
        if (report.reportID) {
            IOU.autoAssignParticipants(transactionID, report);
            Navigation.navigate(ROUTES.MONEE_REQUEST_STEP.getRoute(iouType, CONST.IOU.REQUEST_STEPS.CONFIRMATION, transactionID, reportID));
            return;
        }

        Navigation.navigate(ROUTES.MONEE_REQUEST_STEP.getRoute(iouType, CONST.IOU.REQUEST_STEPS.PARTICIPANTS, transactionID, reportID));
    };

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: () => true,
            onPanResponderTerminationRequest: () => false,
        }),
    ).current;

    return (
        <StepScreenDragAndDropWrapper
            headerTitle={translate('common.receipt')}
            onBackButtonPress={navigateBack}
            shouldShowWrapper={isUserComingFromConfirmationStep}
            testID={IOURequestStepScan.displayName}
        >
            <View style={[styles.uploadReceiptView(isSmallScreenWidth)]}>
                {!isDraggingOver && (
                    <>
                        <View
                            onLayout={({nativeEvent}) => {
                                setReceiptImageTopPosition(PixelRatio.roundToNearestPixel(nativeEvent.layout.top));
                            }}
                        >
                            <ReceiptUpload
                                width={CONST.RECEIPT.ICON_SIZE}
                                height={CONST.RECEIPT.ICON_SIZE}
                            />
                        </View>
                        <View
                            style={styles.receiptViewTextContainer}
                            // eslint-disable-next-line react/jsx-props-no-spreading
                            {...panResponder.panHandlers}
                        >
                            <Text style={[styles.textReceiptUpload]}>{translate('receipt.upload')}</Text>
                            <Text style={[styles.subTextReceiptUpload]}>
                                {isSmallScreenWidth ? translate('receipt.chooseReceipt') : translate('receipt.dragReceiptBeforeEmail')}
                                <CopyTextToClipboard
                                    text={CONST.EMAIL.RECEIPTS}
                                    textStyles={[styles.textBlue]}
                                />
                                {isSmallScreenWidth ? null : translate('receipt.dragReceiptAfterEmail')}
                            </Text>
                        </View>
                        <AttachmentPicker>
                            {({openPicker}) => (
                                <Button
                                    medium
                                    success
                                    text={translate('receipt.chooseFile')}
                                    accessibilityLabel={translate('receipt.chooseFile')}
                                    style={[styles.p9]}
                                    onPress={() => {
                                        openPicker({
                                            onPicked: setReceiptAndNavigate,
                                        });
                                    }}
                                />
                            )}
                        </AttachmentPicker>
                    </>
                )}
                <ReceiptDropUI
                    onDrop={(e) => {
                        const file = lodashGet(e, ['dataTransfer', 'files', 0]);
                        setReceiptAndNavigate(file);
                    }}
                    receiptImageTopPosition={receiptImageTopPosition}
                />
                <ConfirmModal
                    title={attachmentInvalidReasonTitle ? translate(attachmentInvalidReasonTitle) : ''}
                    onConfirm={hideReciptModal}
                    onCancel={hideReciptModal}
                    isVisible={isAttachmentInvalid}
                    prompt={attachmentInvalidReason ? translate(attachmentInvalidReason) : ''}
                    confirmText={translate('common.close')}
                    shouldShowCancelButton={false}
                />
            </View>
        </StepScreenDragAndDropWrapper>
    );
}

IOURequestStepScan.defaultProps = defaultProps;
IOURequestStepScan.propTypes = propTypes;
IOURequestStepScan.displayName = 'IOURequestStepScan';

export default withOnyx({
    report: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${lodashGet(route, 'params.reportID', '0')}`,
    },
})(IOURequestStepScan);
