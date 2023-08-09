import {View, Text, PixelRatio} from 'react-native';
import React, {useContext, useState} from 'react';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import * as IOU from '../../../libs/actions/IOU';
import reportPropTypes from '../../reportPropTypes';
import CONST from '../../../CONST';
import ReceiptUpload from '../../../../assets/images/receipt-upload.svg';
import PressableWithFeedback from '../../../components/Pressable/PressableWithFeedback';
import Button from '../../../components/Button';
import styles from '../../../styles/styles';
import CopyTextToClipboard from '../../../components/CopyTextToClipboard';
import ReceiptDropUI from '../ReceiptDropUI';
import AttachmentPicker from '../../../components/AttachmentPicker';
import ConfirmModal from '../../../components/ConfirmModal';
import ONYXKEYS from '../../../ONYXKEYS';
import Receipt from '../../../libs/actions/Receipt';
import useWindowDimensions from '../../../hooks/useWindowDimensions';
import useLocalize from '../../../hooks/useLocalize';
import {DragAndDropContext} from '../../../components/DragAndDrop/Provider';
import ReceiptUtils from '../../../libs/ReceiptUtils';

const propTypes = {
    /** Information shown to the user when a receipt is not valid */
    receiptModal: PropTypes.shape({
        isAttachmentInvalid: PropTypes.bool,
        attachmentInvalidReasonTitle: PropTypes.string,
        attachmentInvalidReason: PropTypes.string,
    }),

    /** The report on which the request is initiated on */
    report: reportPropTypes,

    route: PropTypes.shape({
        params: PropTypes.shape({
            iouType: PropTypes.string,
            reportID: PropTypes.string,
        }),
    }),

    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    iou: PropTypes.shape({
        id: PropTypes.string,
        amount: PropTypes.number,
        currency: PropTypes.string,
        participants: PropTypes.arrayOf(
            PropTypes.shape({
                accountID: PropTypes.number,
                login: PropTypes.string,
                isPolicyExpenseChat: PropTypes.bool,
                isOwnPolicyExpenseChat: PropTypes.bool,
                selected: PropTypes.bool,
            }),
        ),
    }),
};

const defaultProps = {
    receiptModal: {
        isAttachmentInvalid: false,
        attachmentInvalidReasonTitle: '',
        attachmentInvalidReason: '',
    },
    report: {},
    route: {
        params: {
            iouType: '',
            reportID: '',
        },
    },
    iou: {
        id: '',
        amount: 0,
        currency: CONST.CURRENCY.USD,
        participants: [],
    },
};

function ReceiptSelector(props) {
    const reportID = lodashGet(props.route, 'params.reportID', '');
    const iouType = lodashGet(props.route, 'params.iouType', '');
    const isAttachmentInvalid = lodashGet(props.receiptModal, 'isAttachmentInvalid', false);
    const attachmentInvalidReasonTitle = lodashGet(props.receiptModal, 'attachmentInvalidReasonTitle', '');
    const attachmentInvalidReason = lodashGet(props.receiptModal, 'attachmentInvalidReason', '');
    const [receiptImageTopPosition, setReceiptImageTopPosition] = useState(0);
    const {isSmallScreenWidth} = useWindowDimensions();
    const {translate} = useLocalize();
    const {isDraggingOver} = useContext(DragAndDropContext);

    /**
     * Sets the Receipt objects and navigates the user to the next page
     * @param {Object} file
     * @param {Object} iou
     * @param {Object} report
     */
    const setReceiptAndNavigate = (file, iou, report) => {
        if (!ReceiptUtils.validateReceipt(file)) {
            return;
        }

        const filePath = URL.createObjectURL(file);
        IOU.setMoneyRequestReceipt(filePath, file.name);
        IOU.navigateToNextPage(iou, iouType, reportID, report);
    };

    return (
        <View style={[styles.uploadReceiptView(isSmallScreenWidth)]}>
            {!isDraggingOver ? (
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
                    <Text style={[styles.textReceiptUpload]}>{translate('receipt.upload')}</Text>
                    <Text style={[styles.subTextReceiptUpload]}>
                        {isSmallScreenWidth ? translate('receipt.chooseReceipt') : translate('receipt.dragReceiptBeforeEmail')}
                        <CopyTextToClipboard
                            text={CONST.EMAIL.RECEIPTS}
                            textStyles={[styles.textBlue]}
                        />
                        {isSmallScreenWidth ? null : translate('receipt.dragReceiptAfterEmail')}
                    </Text>
                    <AttachmentPicker>
                        {({openPicker}) => (
                            <PressableWithFeedback
                                accessibilityLabel={translate('receipt.chooseFile')}
                                accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                            >
                                <Button
                                    medium
                                    success
                                    text={translate('receipt.chooseFile')}
                                    style={[styles.p9]}
                                    onPress={() => {
                                        openPicker({
                                            onPicked: (file) => {
                                                setReceiptAndNavigate(file, props.iou, props.report);
                                            },
                                        });
                                    }}
                                />
                            </PressableWithFeedback>
                        )}
                    </AttachmentPicker>
                </>
            ) : null}
            <ReceiptDropUI
                onDrop={(e) => {
                    const file = lodashGet(e, ['dataTransfer', 'files', 0]);
                    setReceiptAndNavigate(file, props.iou, props.report);
                }}
                receiptImageTopPosition={receiptImageTopPosition}
            />
            <ConfirmModal
                title={attachmentInvalidReasonTitle}
                onConfirm={Receipt.clearUploadReceiptError}
                onCancel={Receipt.clearUploadReceiptError}
                isVisible={isAttachmentInvalid}
                prompt={attachmentInvalidReason}
                confirmText={translate('common.close')}
                shouldShowCancelButton={false}
            />
        </View>
    );
}

ReceiptSelector.defaultProps = defaultProps;
ReceiptSelector.propTypes = propTypes;
ReceiptSelector.displayName = 'ReceiptSelector';

export default withOnyx({
    iou: {key: ONYXKEYS.IOU},
    receiptModal: {key: ONYXKEYS.RECEIPT_MODAL},
    report: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${lodashGet(route, 'params.reportID', '')}`,
    },
})(ReceiptSelector);
