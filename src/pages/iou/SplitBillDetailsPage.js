import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import MoneyRequestConfirmationList from '../../components/MoneyRequestConfirmationList';
import * as OptionsListUtils from '../../libs/OptionsListUtils';
import CONST from '../../CONST';
import ONYXKEYS from '../../ONYXKEYS';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    chatReport: PropTypes.objectOf(PropTypes.object),

    // eslint-disable-next-line react/forbid-prop-types
    reportActions: PropTypes.objectOf(PropTypes.object),
};

const defaultProps = {
    chatReport: {},
    reportActions: {},
};

function getReportID(route) {
    return route.params.reportID.toString();
}

const SplitBillDetailsPage = (props) => {
    const reportActionID = lodashGet(props, 'route.params.reportActionID', '');
    const reportAction = props.reportActions[reportActionID];
    const personalDetails = OptionsListUtils.getPersonalDetailsForLogins(reportAction.originalMessage.participants);
    const participants = OptionsListUtils.getParticipantsOptions(reportAction.originalMessage, personalDetails);

    return (
        <MoneyRequestConfirmationList
            hasMultipleParticipants
            participants={participants}
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
    chatReport: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${getReportID(route)}`,
    },
    reportActions: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getReportID(route)}`,
        canEvict: false,
    }
})(SplitBillDetailsPage);
