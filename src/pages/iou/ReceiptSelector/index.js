import {View, Text, PixelRatio} from 'react-native';
import React, {useContext, useRef, useState} from 'react';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import {compose} from 'underscore';
import * as IOU from '../../../libs/actions/IOU';
import reportPropTypes from '../../reportPropTypes';
import personalDetailsPropType from '../../personalDetailsPropType';
import CONST from '../../../CONST';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsDefaultProps} from '../../../components/withCurrentUserPersonalDetails';
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
import ReceiptUtils from '../../../libs/ReceiptUtils';
import withCurrentReportID from '../../../components/withCurrentReportID';
import {DragAndDropContext} from '../../../components/DragAndDrop/Provider';

const propTypes = {
    /** Information shown to the user when a receipt is not valid */
    receiptModal: PropTypes.shape({
        isAttachmentInvalid: PropTypes.bool,
        attachmentInvalidReasonTitle: PropTypes.string,
        attachmentInvalidReason: PropTypes.string,
    }),

    /** The report on which the request is initiated on */
    report: reportPropTypes,

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

    /** Current user personal details */
    currentUserPersonalDetails: personalDetailsPropType,
};

const defaultProps = {
    receiptModal: {
        isAttachmentInvalid: false,
        attachmentInvalidReasonTitle: '',
        attachmentInvalidReason: '',
    },
    route: {
        params: {
            iouType: '',
            reportID: '',
        },
    },
    report: {},
    iou: {
        id: '',
        amount: 0,
        currency: CONST.CURRENCY.USD,
        participants: [],
    },
    ...withCurrentUserPersonalDetailsDefaultProps,
};

function ReceiptSelector(props) {
    const reportID = useRef(lodashGet(props, 'currentReportID', ''));
    const isAttachmentInvalid = lodashGet(props.receiptModal, 'isAttachmentInvalid', false);
    const attachmentInvalidReasonTitle = lodashGet(props.receiptModal, 'attachmentInvalidReasonTitle', '');
    const attachmentInvalidReason = lodashGet(props.receiptModal, 'attachmentInvalidReason', '');
    const [receiptImageTopPosition, setReceiptImageTopPosition] = useState(0);
    const {isSmallScreenWidth} = useWindowDimensions();
    const {translate} = useLocalize();
    const {isDraggingOver} = useContext(DragAndDropContext);

    const defaultView = () => (
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
                        accessibilityRole="button"
                    >
                        <Button
                            medium
                            success
                            text={translate('receipt.chooseFile')}
                            style={[styles.p9]}
                            onPress={() => {
                                openPicker({
                                    onPicked: (file) => {
                                        IOU.onReceiptImageSelected(file, props.iou, reportID.current, props.report, props.currentUserPersonalDetails);
                                    },
                                });
                            }}
                        />
                    </PressableWithFeedback>
                )}
            </AttachmentPicker>
        </>
    );

    return (
        <View style={[styles.uploadReceiptView(isSmallScreenWidth)]}>
            {!isDraggingOver ? defaultView() : null}
            <ReceiptDropUI
                onDrop={(e) => {
                    const file = lodashGet(e, ['dataTransfer', 'files', 0]);
                    IOU.onReceiptImageSelected(file, props.iou, reportID.current, props.report, props.currentUserPersonalDetails);
                }}
                receiptImageTopPosition={receiptImageTopPosition}
            />
            <ConfirmModal
                title={attachmentInvalidReasonTitle}
                onConfirm={() => Receipt.clearUploadReceiptError()}
                onCancel={() => Receipt.clearUploadReceiptError()}
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

export default compose(
    withCurrentUserPersonalDetails,
    withCurrentReportID,
    withOnyx({
        iou: {key: ONYXKEYS.IOU},
        receiptModal: {key: ONYXKEYS.RECEIPT_MODAL},
        report: {
            key: ({currentReportID}) => `${ONYXKEYS.COLLECTION.REPORT}${currentReportID}`,
        },
    }),
)(ReceiptSelector);
