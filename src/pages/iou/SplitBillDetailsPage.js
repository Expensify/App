import React from 'react';
import _ from 'underscore';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import styles from '../../styles/styles';
import ONYXKEYS from '../../ONYXKEYS';
import * as OptionsListUtils from '../../libs/OptionsListUtils';
import ScreenWrapper from '../../components/ScreenWrapper';
import MoneyRequestConfirmationList from '../../components/MoneyRequestConfirmationList';
import personalDetailsPropType from '../personalDetailsPropType';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import reportActionPropTypes from '../home/report/reportActionPropTypes';
import reportPropTypes from '../reportPropTypes';
import withReportAndReportActionOrNotFound from '../home/report/withReportAndReportActionOrNotFound';
import FullPageNotFoundView from '../../components/BlockingViews/FullPageNotFoundView';
import CONST from '../../CONST';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import * as TransactionUtils from '../../libs/TransactionUtils';
import * as ReportUtils from '../../libs/ReportUtils';

const propTypes = {
    /* Onyx Props */

    /** The personal details of the person who is logged in */
    personalDetails: personalDetailsPropType,

    /** The active report */
    report: reportPropTypes.isRequired,

    /** Array of report actions for this report */
    reportActions: PropTypes.shape(reportActionPropTypes),

    /** Route params */
    route: PropTypes.shape({
        params: PropTypes.shape({
            /** Report ID passed via route r/:reportID/split/details */
            reportID: PropTypes.string,

            /** ReportActionID passed via route r/split/:reportActionID */
            reportActionID: PropTypes.string,
        }),
    }).isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    personalDetails: {},
    reportActions: {},
};

function SplitBillDetailsPage(props) {
    const reportAction = props.reportActions[`${props.route.params.reportActionID.toString()}`];
    const transaction = TransactionUtils.getLinkedTransaction(reportAction);
    const participantAccountIDs = reportAction.originalMessage.participantAccountIDs;

    // In case this is workspace split bill, we manually add the workspace as the second participant of the split bill
    // because we don't save any accountID in the report action's originalMessage other than the payee's accountID
    let participants;
    if (ReportUtils.isPolicyExpenseChat(props.report)) {
        participants = [
            ...OptionsListUtils.getParticipantsOptions([{accountID: participantAccountIDs[0], selected: true}], props.personalDetails),
            ...OptionsListUtils.getPolicyExpenseReportOptions({...props.report, selected: true}),
        ];
    } else {
        participants = OptionsListUtils.getParticipantsOptions(
            _.map(participantAccountIDs, (accountID) => ({accountID, selected: true})),
            props.personalDetails,
        );
    }
    const payeePersonalDetails = props.personalDetails[reportAction.actorAccountID];
    const participantsExcludingPayee = _.filter(participants, (participant) => participant.accountID !== reportAction.actorAccountID);
    const {amount: splitAmount, currency: splitCurrency, comment: splitComment} = ReportUtils.getTransactionDetails(transaction);

    return (
        <ScreenWrapper>
            <FullPageNotFoundView shouldShow={_.isEmpty(props.report) || _.isEmpty(reportAction)}>
                <HeaderWithBackButton title={props.translate('common.details')} />
                <View
                    pointerEvents="box-none"
                    style={[styles.containerWithSpaceBetween]}
                >
                    {Boolean(participants.length) && (
                        <MoneyRequestConfirmationList
                            hasMultipleParticipants
                            payeePersonalDetails={payeePersonalDetails}
                            selectedParticipants={participantsExcludingPayee}
                            iouAmount={splitAmount}
                            iouComment={splitComment}
                            iouCurrencyCode={splitCurrency}
                            iouType={CONST.IOU.MONEY_REQUEST_TYPE.SPLIT}
                            isReadOnly
                            shouldShowFooter={false}
                        />
                    )}
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

SplitBillDetailsPage.propTypes = propTypes;
SplitBillDetailsPage.defaultProps = defaultProps;
SplitBillDetailsPage.displayName = 'SplitBillDetailsPage';

export default compose(
    withLocalize,
    withReportAndReportActionOrNotFound,
    withOnyx({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
    }),
)(SplitBillDetailsPage);
