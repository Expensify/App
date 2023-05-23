import React from 'react';
import _ from 'underscore';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import lodashGet from 'lodash/get';
import styles from '../../styles/styles';
import ONYXKEYS from '../../ONYXKEYS';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import ScreenWrapper from '../../components/ScreenWrapper';
import MoneyRequestConfirmationList from '../../components/MoneyRequestConfirmationList';
import personalDetailsPropType from '../personalDetailsPropType';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import * as ReportUtils from '../../libs/ReportUtils';
import reportActionPropTypes from '../home/report/reportActionPropTypes';
import reportPropTypes from '../reportPropTypes';
import withReportOrNotFound from '../home/report/withReportOrNotFound';
import FullPageNotFoundView from '../../components/BlockingViews/FullPageNotFoundView';
import CONST from '../../CONST';

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

/**
 * Returns all the participants in the active report
 *
 * @param {Object} reportAction The IOU split reportAction, which contains the participants
 * @param {Object} personalDetails The personal details of the users
 * @return {Array}
 */
const getAllParticipants = (reportAction, personalDetails) => {
    const participants = lodashGet(reportAction, 'originalMessage.participants', []);
    const participantsExcludingOwner = _.filter(participants, (participant) => participant !== reportAction.actorEmail);

    return _.chain(participantsExcludingOwner)
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

const SplitBillDetailsPage = (props) => {
    const reportAction = props.reportActions[`${props.route.params.reportActionID.toString()}`];
    const participants = getAllParticipants(reportAction, props.personalDetails);
    const splitAmount = lodashGet(reportAction, 'originalMessage.amount', 0);

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            (
            <FullPageNotFoundView shouldShow={_.isEmpty(props.report) || _.isEmpty(reportAction)}>
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
            )
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
