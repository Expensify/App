import PropTypes from 'prop-types';
import React from 'react';
import useLocalize from '@hooks/useLocalize';
import iouReportPropTypes from '@pages/iouReportPropTypes';
import reportPropTypes from '@pages/reportPropTypes';
import * as IOU from '@userActions/IOU';
import DecisionModal from './DecisionModal';

const propTypes = {
    /** Full amount of expense report to pay */
    fullAmount: PropTypes.string.isRequired,

    /** Not held amount of expense report */
    nonHeldAmount: PropTypes.string.isRequired,

    /** Type of action handled either 'pay' or 'approve' */
    type: PropTypes.string.isRequired,

    /** Is the window width narrow, like on a mobile device? */
    isSmallScreenWidth: PropTypes.bool,

    /** Callback for closing modal */
    onClose: PropTypes.func.isRequired,

    /** Whether modal is visible */
    isVisible: PropTypes.bool.isRequired,

    /** Type of payment */
    paymentType: PropTypes.string.isRequired,

    /** The chat report this report is linked to */
    chatReport: reportPropTypes,

    /** The report currently being looked at */
    moneyRequestReport: iouReportPropTypes,
};

const defaultProps = {
    chatReport: {},
    moneyRequestReport: {},
    isSmallScreenWidth: false,
};

function ProcessMoneyRequestHoldMenu({type, nonHeldAmount, fullAmount, isSmallScreenWidth, onClose, isVisible, paymentType, chatReport, moneyRequestReport}) {
    const {translate} = useLocalize();
    const isApprove = type === 'approve';

    const onSubmit = (full) => {
        if (isApprove) {
            IOU.approveMoneyRequest(moneyRequestReport, full);
        } else {
            IOU.payMoneyRequest(paymentType, chatReport, moneyRequestReport, full);
        }
        onClose();
    };

    return (
        <DecisionModal
            title={translate(isApprove ? 'iou.confirmApprove' : 'iou.confirmPay')}
            onClose={onClose}
            isVisible={isVisible}
            prompt={translate(isApprove ? 'iou.confirmApprovalAmount' : 'iou.confirmPayAmount')}
            firstOptionText={`${translate(isApprove ? 'iou.approveOnly' : 'iou.payOnly')} ${nonHeldAmount}`}
            secondOptionText={`${translate(isApprove ? 'iou.approve' : 'iou.pay')} ${fullAmount}`}
            onFirstOptionSubmit={() => onSubmit(false)}
            onSecondOptionSubmit={() => onSubmit(true)}
            isSmallScreenWidth={isSmallScreenWidth}
        />
    );
}

ProcessMoneyRequestHoldMenu.displayName = 'ProcessMoneyRequestHoldMenu';
ProcessMoneyRequestHoldMenu.propTypes = propTypes;
ProcessMoneyRequestHoldMenu.defaultProps = defaultProps;

export default ProcessMoneyRequestHoldMenu;
