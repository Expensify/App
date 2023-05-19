import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import MoneyRequestConfirmationList from '../../components/MoneyRequestConfirmationList';
import * as OptionsListUtils from '../../libs/OptionsListUtils';
import CONST from '../../CONST';
import ONYXKEYS from '../../ONYXKEYS';
import ModalHeader from './ModalHeader';
import compose from '../../libs/compose';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    reportActions: PropTypes.objectOf(PropTypes.object),

    ...withLocalizePropTypes,
};

const defaultProps = {
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
        <>
            <ModalHeader
                title={props.translate('common.details')}
                shouldShowBackButton={false}
            />
            <MoneyRequestConfirmationList
                hasMultipleParticipants
                participants={participants}
                iouAmount={reportAction.originalMessage.amount}
                iouType={CONST.IOU.REPORT_ACTION_TYPE.SPLIT}
                canModifyParticipants={false}
                canEditDetails={false}
            />
        </>
    );
};

SplitBillDetailsPage.displayName = 'SplitBillDetailsPage';
SplitBillDetailsPage.propTypes = propTypes;
SplitBillDetailsPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        reportActions: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getReportID(route)}`,
            canEvict: false,
        },
    }),
)(SplitBillDetailsPage);
