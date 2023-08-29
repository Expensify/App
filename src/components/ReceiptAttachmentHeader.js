import React, {useState, useCallback} from 'react';
import {withOnyx} from 'react-native-onyx';
import {View} from 'react-native';
import HeaderWithBackButton from './HeaderWithBackButton';
import iouReportPropTypes from '../pages/iouReportPropTypes';
import * as Expensicons from './Icon/Expensicons';
import styles from '../styles/styles';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import compose from '../libs/compose';
import ONYXKEYS from '../ONYXKEYS';
import ConfirmModal from './ConfirmModal';
import useLocalize from '../hooks/useLocalize';

const propTypes = {
    /** The report currently being looked at */
    report: iouReportPropTypes.isRequired,

    /** The expense report or iou report (only will have a value if this is a transaction thread) */
    parentReport: iouReportPropTypes,

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    parentReport: {},
};

function ReceiptAttachmentHeader(props) {
    const {translate} = useLocalize();
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

    const deleteReceipt = useCallback(() => {
        // IOU.deleteMoneyRequest(parentReportAction.originalMessage.IOUTransactionID, parentReportAction, true);
        setIsDeleteModalVisible(false);
    }, [props.parentReport, setIsDeleteModalVisible]);

    return (
        <>
            <View style={[styles.pl0]}>
                <HeaderWithBackButton
                    title={translate('common.receipt')}
                    shouldShowBorderBottom
                    shouldShowDownloadButton={false}
                    shouldShowCloseButton={!props.isSmallScreenWidth}
                    shouldShowBackButton={props.isSmallScreenWidth}
                    shouldShowThreeDotsButton
                    threeDotsMenuItems={[
                        {
                            icon: Expensicons.Trashcan,
                            text: translate('receipt.deleteReceipt'),
                            onSelected: () => setIsDeleteModalVisible(true),
                        },
                    ]}
                    threeDotsAnchorPosition={styles.threeDotsPopoverOffset(props.windowWidth, true)}
                    outerThreeDotsMenuStyle={styles.receiptAttachmentHeaderThreeDotsMenuStyles}
                    shouldShowBackButton={props.isSmallScreenWidth}
                    onBackButtonPress={props.onBackButtonPress}
                    onCloseButtonPress={props.onCloseButtonPress}
                />
            </View>
            <ConfirmModal
                title={translate('receipt.deleteReceipt')}
                isVisible={isDeleteModalVisible}
                onConfirm={deleteReceipt}
                onCancel={() => setIsDeleteModalVisible(false)}
                prompt={translate('receipt.deleteConfirmation')}
                confirmText={translate('common.delete')}
                cancelText={translate('common.cancel')}
                danger
            />
        </>
    );
}

ReceiptAttachmentHeader.displayName = 'ReceiptAttachmentHeader';
ReceiptAttachmentHeader.propTypes = propTypes;
ReceiptAttachmentHeader.defaultProps = defaultProps;

export default compose(
    withWindowDimensions,
    withOnyx({
        parentReport: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT}${report.parentReportID}`,
        },
    }),
)(ReceiptAttachmentHeader);
