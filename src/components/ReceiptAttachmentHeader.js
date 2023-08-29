import React, {useState, useCallback} from 'react';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import HeaderWithBackButton from './HeaderWithBackButton';
import * as Expensicons from './Icon/Expensicons';
import styles from '../styles/styles';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import compose from '../libs/compose';
import ConfirmModal from './ConfirmModal';
import useLocalize from '../hooks/useLocalize';
import ReceiptActions from '../libs/actions/Receipt';
import * as ReportActionsUtils from '../libs/ReportActionsUtils';

const propTypes = {
    /** The report currently being looked at */
    report: PropTypes.shape({
        parentReportID: PropTypes.string.isRequired,
        parentReportActionID: PropTypes.string.isRequired,
    }).isRequired,

    ...windowDimensionsPropTypes,
};

function ReceiptAttachmentHeader(props) {
    const {translate} = useLocalize();
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

    const deleteReceipt = useCallback(() => {
        // Get receipt attachment transaction ID
        const parentReportAction = ReportActionsUtils.getParentReportAction(props.report);
        const transactionID = lodashGet(parentReportAction, ['originalMessage', 'IOUTransactionID'], 0);

        // Detatch receipt & clear modal open state
        ReceiptActions.detachReceipt(transactionID);
        setIsDeleteModalVisible(false);
    }, [props.report, setIsDeleteModalVisible]);

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

export default withWindowDimensions(ReceiptAttachmentHeader);
