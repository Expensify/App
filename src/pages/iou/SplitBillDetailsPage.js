import React from 'react';
import _ from 'underscore';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
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
import withReportOrNotFound from '../home/report/withReportOrNotFound';
import FullPageNotFoundView from '../../components/BlockingViews/FullPageNotFoundView';
import CONST from '../../CONST';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';

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

/**
 * Get the reportID for the associated chatReport
 *
 * @param {Object} route
 * @param {Object} route.params
 * @param {String} route.params.reportID
 * @returns {String}
 */
function getReportID(route) {
    return route.params.reportID.toString();
}

const SplitBillDetailsPage = (props) => {
    const reportAction = props.reportActions[`${props.route.params.reportActionID.toString()}`];
    const personalDetails = OptionsListUtils.getPersonalDetailsForLogins(reportAction.originalMessage.participants, props.personalDetails);
    const participants = OptionsListUtils.getParticipantsOptions(reportAction.originalMessage, personalDetails);
    const payeePersonalDetails = _.filter(participants, (participant) => participant.login === reportAction.actorEmail)[0];
    const participantsExcludingPayee = _.filter(participants, (participant) => participant.login !== reportAction.actorEmail);
    const splitAmount = parseInt(lodashGet(reportAction, 'originalMessage.amount', 0), 10);
    const splitComment = lodashGet(reportAction, 'originalMessage.comment');
    const splitCurrency = lodashGet(reportAction, 'originalMessage.currency');

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
                            participants={participantsExcludingPayee}
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
};

SplitBillDetailsPage.propTypes = propTypes;
SplitBillDetailsPage.defaultProps = defaultProps;
SplitBillDetailsPage.displayName = 'SplitBillDetailsPage';

export default compose(
    withLocalize,
    withReportOrNotFound,
    withOnyx({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS,
        },
        reportActions: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getReportID(route)}`,
            canEvict: false,
        },
    }),
)(SplitBillDetailsPage);
