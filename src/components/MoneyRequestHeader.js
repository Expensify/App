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
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import compose from '../libs/compose';
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';
import ONYXKEYS from '../ONYXKEYS';
import * as IOU from '../libs/actions/IOU';
import ConfirmModal from './ConfirmModal';
import useLocalize from '../hooks/useLocalize';
import MoneyRequestHeaderStatusBar from './MoneyRequestHeaderStatusBar';
import * as TransactionUtils from '../libs/TransactionUtils';
import reportActionPropTypes from '../pages/home/report/reportActionPropTypes';

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

    /** Onyx Props */
    /** Session info for the currently logged in user. */
    session: PropTypes.shape({
        /** Currently logged in user email */
        email: PropTypes.string,
    }),

    /** The expense report or iou report (only will have a value if this is a transaction thread) */
    parentReport: iouReportPropTypes,

    /** The report action the transaction is tied to from the parent report */
    parentReportAction: PropTypes.shape(reportActionPropTypes),

    /** The transaction from the parent report action */
    transaction: PropTypes.shape({
        /** The ID of the transaction */
        transactionID: PropTypes.string,
    }),

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    session: {
        email: null,
    },
    parentReport: {},
    parentReportAction: {},
    transaction: {},
};

function MoneyRequestHeader(props) {
    const {translate} = useLocalize();
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const moneyRequestReport = props.parentReport;
    const isSettled = ReportUtils.isSettled(moneyRequestReport.reportID);

    // Only the requestor can take delete the request, admins can only edit it.
    const isActionOwner = props.parentReportAction.actorAccountID === lodashGet(props.session, 'accountID', null);
    const report = props.report;
    report.ownerAccountID = lodashGet(props, ['parentReport', 'ownerAccountID'], null);
    report.ownerEmail = lodashGet(props, ['parentReport', 'ownerEmail'], '');

    const deleteTransaction = useCallback(() => {
        IOU.deleteMoneyRequest(props.parentReportAction.originalMessage.IOUTransactionID, props.parentReportAction, true);
        setIsDeleteModalVisible(false);
    }, [props.parentReportAction, setIsDeleteModalVisible]);

    const isScanning = TransactionUtils.hasReceipt(props.transaction) && TransactionUtils.isReceiptBeingScanned(props.transaction);

    return (
        <>
            <View style={[styles.pl0]}>
                <HeaderWithBackButton
                    shouldShowAvatarWithDisplay
                    shouldShowPinButton={false}
                    shouldShowThreeDotsButton={isActionOwner && !isSettled}
                    threeDotsMenuItems={[
                        {
                            icon: Expensicons.Trashcan,
                            text: translate('reportActionContextMenu.deleteAction', {action: props.parentReportAction}),
                            onSelected: () => setIsDeleteModalVisible(true),
                        },
                    ]}
                    threeDotsAnchorPosition={styles.threeDotsPopoverOffsetNoCloseButton(props.windowWidth)}
                    report={report}
                    policy={props.policy}
                    personalDetails={props.personalDetails}
                    shouldShowBackButton={props.isSmallScreenWidth}
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

export default compose(
    withWindowDimensions,
    withOnyx({
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
            key: ({report, parentReportActions}) =>
                `${ONYXKEYS.COLLECTION.TRANSACTION}${lodashGet(parentReportActions, [report.parentReportActionID, 'originalMessage', 'IOUTransactionID'], '')}`,
        },
    }),
)(MoneyRequestHeader);
