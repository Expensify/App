import PropTypes from 'prop-types';
import React from 'react';
import DecisionModal from '@components/DecisionModal';
import useLocalize from '@hooks/useLocalize';
import iouReportPropTypes from '@pages/iouReportPropTypes';
import reportPropTypes from '@pages/reportPropTypes';
import * as IOU from '@userActions/IOU';

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

    const onSubmitPayment = (full) => {
        IOU.payMoneyRequest(paymentType, chatReport, moneyRequestReport, full);
        onClose();
    };

    const onSubmitApproval = (full) => {
        IOU.approveMoneyRequest(moneyRequestReport, full);
        onClose();
    };

    return (
        <>
            {type === 'approve' ? (
                <DecisionModal
                    title={translate('iou.confirmApprove')}
                    onClose={onClose}
                    isVisible={isVisible}
                    prompt={translate('iou.confirmApprovalAmount')}
                    firstOptionText={`${translate('iou.approveOnly')} ${nonHeldAmount}`}
                    secondOptionText={`${translate('iou.approve')} ${fullAmount}`}
                    onFirstOptionSubmit={() => onSubmitApproval(false)}
                    onSecondOptionSubmit={() => onSubmitApproval(true)}
                    isSmallScreenWidth={isSmallScreenWidth}
                />
            ) : (
                <DecisionModal
                    title={translate('iou.confirmPay')}
                    isVisible={isVisible}
                    onClose={onClose}
                    prompt={translate('iou.confirmPayAmount')}
                    firstOptionText={`${translate('iou.payOnly')} ${nonHeldAmount}`}
                    secondOptionText={`${translate('iou.pay')} ${fullAmount}`}
                    onFirstOptionSubmit={() => onSubmitPayment(false)}
                    onSecondOptionSubmit={() => onSubmitPayment(true)}
                    isSmallScreenWidth={isSmallScreenWidth}
                />
            )}
        </>
    );
}

ProcessMoneyRequestHoldMenu.displayName = 'ProcessMoneyRequestHoldMenu';
ProcessMoneyRequestHoldMenu.propTypes = propTypes;
ProcessMoneyRequestHoldMenu.defaultProps = defaultProps;

export default ProcessMoneyRequestHoldMenu;
