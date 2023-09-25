import React, {useState, useCallback} from 'react';
import {withOnyx} from 'react-native-onyx';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import HeaderWithBackButton from './HeaderWithBackButton';
import iouReportPropTypes from '../pages/iouReportPropTypes';
import * as ReportUtils from '../libs/ReportUtils';
import * as Expensicons from './Icon/Expensicons';
import participantPropTypes from './participantPropTypes';
import styles from '../styles/styles';
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';
import CONST from '../CONST';
import ONYXKEYS from '../ONYXKEYS';
import * as IOU from '../libs/actions/IOU';
import ConfirmModal from './ConfirmModal';
import useLocalize from '../hooks/useLocalize';
import MoneyRequestHeaderStatusBar from './MoneyRequestHeaderStatusBar';
import * as TransactionUtils from '../libs/TransactionUtils';
import reportActionPropTypes from '../pages/home/report/reportActionPropTypes';
import transactionPropTypes from './transactionPropTypes';
import useWindowDimensions from '../hooks/useWindowDimensions';

const propTypes = {
    /** The report currently being looked at */
    report: iouReportPropTypes.isRequired,

    /** The policy which the report is tied to */
    policy: PropTypes.shape({
        /** Name of the policy */
        name: PropTypes.string,
    }).isRequired,

    /** Personal details so we can get the ones for the report participants */
    personalDetails: PropTypes.objectOf(participantPropTypes).isRequired,

    /* Onyx Props */
    /** Session info for the currently logged in user. */
    session: PropTypes.shape({
        /** Currently logged in user email */
        email: PropTypes.string,
    }),

    /** The expense report or iou report (only will have a value if this is a transaction thread) */
    parentReport: iouReportPropTypes,

    /** The report action the transaction is tied to from the parent report */
    parentReportAction: PropTypes.shape(reportActionPropTypes),

    /** All the data for the transaction */
    transaction: transactionPropTypes,
};

const defaultProps = {
    session: {
        email: null,
    },
    parentReport: {},
    parentReportAction: {},
    transaction: {},
};

function MoneyRequestHeader({session, parentReport, report, parentReportAction, transaction, policy, personalDetails}) {
    const {translate} = useLocalize();
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const moneyRequestReport = parentReport;
    const isSettled = ReportUtils.isSettled(moneyRequestReport.reportID);
    const {isSmallScreenWidth, windowWidth} = useWindowDimensions();

    // Only the requestor can take delete the request, admins can only edit it.
    const isActionOwner = lodashGet(parentReportAction, 'actorAccountID') === lodashGet(session, 'accountID', null);

    const deleteTransaction = useCallback(() => {
        IOU.deleteMoneyRequest(lodashGet(parentReportAction, 'originalMessage.IOUTransactionID'), parentReportAction, true);
        setIsDeleteModalVisible(false);
    }, [parentReportAction, setIsDeleteModalVisible]);

    const isScanning = TransactionUtils.hasReceipt(transaction) && TransactionUtils.isReceiptBeingScanned(transaction);

    return (
        <>
            <View style={[styles.pl0]}>
                <HeaderWithBackButton
                    shouldShowAvatarWithDisplay
                    shouldShowPinButton={false}
                    shouldShowThreeDotsButton={isActionOwner && !isSettled}
                    threeDotsMenuItems={[
                        ...(TransactionUtils.hasReceipt(transaction)
                            ? []
                            : [
                                  {
                                      icon: Expensicons.Receipt,
                                      text: translate('receipt.addReceipt'),
                                      onSelected: () => Navigation.navigate(ROUTES.EDIT_REQUEST.getRoute(report.reportID, CONST.EDIT_REQUEST_FIELD.RECEIPT)),
                                  },
                              ]),
                        {
                            icon: Expensicons.Trashcan,
                            text: translate('reportActionContextMenu.deleteAction', {action: parentReportAction}),
                            onSelected: () => setIsDeleteModalVisible(true),
                        },
                    ]}
                    threeDotsAnchorPosition={styles.threeDotsPopoverOffsetNoCloseButton(windowWidth)}
                    report={{
                        ...report,
                        ownerAccountID: lodashGet(parentReport, 'ownerAccountID', null),
                        ownerEmail: lodashGet(parentReport, 'ownerEmail', null),
                    }}
                    policy={policy}
                    personalDetails={personalDetails}
                    shouldShowBackButton={isSmallScreenWidth}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.HOME, false, true)}
                />
                {isScanning && <MoneyRequestHeaderStatusBar />}
            </View>
            <ConfirmModal
                title={translate('iou.deleteRequest')}
                isVisible={isDeleteModalVisible}
                onConfirm={deleteTransaction}
                onCancel={() => setIsDeleteModalVisible(false)}
                prompt={translate('iou.deleteConfirmation')}
                confirmText={translate('common.delete')}
                cancelText={translate('common.cancel')}
                danger
            />
        </>
    );
}

MoneyRequestHeader.displayName = 'MoneyRequestHeader';
MoneyRequestHeader.propTypes = propTypes;
MoneyRequestHeader.defaultProps = defaultProps;

export default withOnyx({
    session: {
        key: ONYXKEYS.SESSION,
    },
    parentReport: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT}${report.parentReportID}`,
    },
    parentReportAction: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${(report.parentReportID, report.parentReportActionID)}`,
        selector: (reportActions, props) => props && props.parentReport && reportActions && reportActions[props.parentReport.parentReportActionID],
        canEvict: false,
    },
    transaction: {
        key: ({parentReportAction}) => `${ONYXKEYS.COLLECTION.TRANSACTION}${lodashGet(parentReportAction, 'originalMessage.IOUTransactionID', 0)}`,
    },
})(MoneyRequestHeader);
