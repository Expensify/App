import React from 'react';
import _ from 'underscore';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import lodashGet from 'lodash/get';
import styles from '../styles/styles';
import ONYXKEYS from '../ONYXKEYS';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import Navigation from '../libs/Navigation/Navigation';
import ScreenWrapper from '../components/ScreenWrapper';
import MoneyRequestConfirmationList from '../components/MoneyRequestConfirmationList';
import personalDetailsPropType from './personalDetailsPropType';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import compose from '../libs/compose';
import * as ReportUtils from '../libs/ReportUtils';
import reportActionPropTypes from './home/report/reportActionPropTypes';
import reportPropTypes from './reportPropTypes';
import withReportOrNotFound from './home/report/withReportOrNotFound';
import FullPageNotFoundView from '../components/BlockingViews/FullPageNotFoundView';
import CONST from '../CONST';

const propTypes = {
    /* Onyx Props */

    /** The personal details of the person who is logged in */
    personalDetails: personalDetailsPropType,

    /** The active report */
    report: reportPropTypes.isRequired,

    /** The report action which we are displaying */
    action: PropTypes.shape(reportActionPropTypes),

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
    action: {},
};

/**
 * Get the reportID for the associated chatReport
 *
 * @param {Object} route
 * @param {Object} route.params
 * @param {String} route.params.chatReportID
 * @returns {String}
 */
function getChatReportID(route) {
    return route.params.reportID.toString();
}

/**
 * Returns all the participants in the active report
 *
 * @param {Object} report The active report object
 * @param {Object} personalDetails The personal details of the users
 * @return {Array}
 */
const getAllParticipants = (report, personalDetails) => {
    const {participants} = report;

    return _.chain(participants)
        .map((login) => {
            const userLogin = Str.removeSMSDomain(login);
            const userPersonalDetail = lodashGet(personalDetails, login, {displayName: userLogin, avatar: ''});

            return {
                alternateText: userLogin,
                displayName: userPersonalDetail.displayName,
                icons: [
                    {
                        source: ReportUtils.getAvatar(userPersonalDetail.avatar, login),
                        name: login,
                        type: CONST.ICON_TYPE_AVATAR,
                    },
                ],
                keyForList: userLogin,
                login,
                text: userPersonalDetail.displayName,
                tooltipText: userLogin,
                participantsList: [{login, displayName: userPersonalDetail.displayName}],
            };
        })
        .sortBy((participant) => participant.displayName.toLowerCase())
        .value();
};

const SplitDetailsPage = (props) => {
    const participants = getAllParticipants(props.report, props.personalDetails);
    const splitAmount = lodashGet(props.action, 'originalMessage.IOUDetails.amount', 0);

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            {(
                <FullPageNotFoundView shouldShow={_.isEmpty(props.report) || _.isEmpty(props.action)}>
                    <HeaderWithCloseButton
                        title={props.translate('common.details')}
                        onCloseButtonPress={Navigation.dismissModal}
                        onBackButtonPress={Navigation.goBack}
                        shouldShowBackButton={ReportUtils.isChatRoom(props.report) || ReportUtils.isPolicyExpenseChat(props.report) || ReportUtils.isThread(props.report)}
                    />
                    <View
                        pointerEvents="box-none"
                        style={[styles.containerWithSpaceBetween]}
                    >
                        {Boolean(participants.length) && (
                            <MoneyRequestConfirmationList
                                hasMultipleParticipants
                                participants={participants}
                                iouAmount={splitAmount}
                                iouType={CONST.IOU.MONEY_REQUEST_TYPE.SPLIT}
                                isReadOnly
                            />
                        )}
                    </View>
                </FullPageNotFoundView>
            )}
        </ScreenWrapper>
    );
};

SplitDetailsPage.propTypes = propTypes;
SplitDetailsPage.defaultProps = defaultProps;
SplitDetailsPage.displayName = 'SplitDetailsPage';

export default compose(
    withLocalize,
    withReportOrNotFound,
    withOnyx({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS,
        },
        reportActions: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getChatReportID(route)}`,
            canEvict: false,
        },
    }),
)(SplitDetailsPage);
