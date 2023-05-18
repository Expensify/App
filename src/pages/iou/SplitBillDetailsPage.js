import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import MoneyRequestConfirmationList from '../../components/MoneyRequestConfirmationList';
import CONST from '../../CONST';

const propTypes = {
    /** Callback to inform parent modal of success */
    // eslint-disable-next-line react/forbid-prop-types
    reportActions: PropTypes.objectOf(PropTypes.object),
};

const defaultProps = {
    reportActions: {},
};

const SplitBillDetailsPage = (props) => {
    const reportActionID = lodashGet(props, 'route.params.reportActionID', '');
    const reportAction = props.reportActions[reportActionID];

    return (
        <MoneyRequestConfirmationList
            hasMultipleParticipants
            participants={reportAction.originalMessage.participants}
            iouAmount={reportAction.originalMessage.amount}
            onConfirm={() => {}}
            onSendMoney={() => {}}
            iouType={CONST.IOU.REPORT_ACTION_TYPE.SPLIT}
            canModifyParticipants={false}
            navigateToStep={() => {}}
        />
    );
};

SplitBillDetailsPage.displayName = 'SplitBillDetailsPage';
SplitBillDetailsPage.propTypes = propTypes;
SplitBillDetailsPage.defaultProps = defaultProps;

export default withOnyx({
    reportActions: {
        key: ({chatReportID}) => `ONYXKEYS.COLLECTION.REPORT_ACTIONS${chatReportID}`,
    }
})(SplitBillDetailsPage);
