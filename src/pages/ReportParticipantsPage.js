import React from 'react';
import _ from 'underscore';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import styles from '../styles/styles';
import ONYXKEYS from '../ONYXKEYS';
import HeaderWithBackButton from '../components/HeaderWithBackButton';
import Navigation from '../libs/Navigation/Navigation';
import ScreenWrapper from '../components/ScreenWrapper';
import OptionsList from '../components/OptionsList';
import ROUTES from '../ROUTES';
import personalDetailsPropType from './personalDetailsPropType';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import compose from '../libs/compose';
import * as ReportUtils from '../libs/ReportUtils';
import reportPropTypes from './reportPropTypes';
import withReportOrNotFound from './home/report/withReportOrNotFound';
import FullPageNotFoundView from '../components/BlockingViews/FullPageNotFoundView';
import CONST from '../CONST';
import * as UserUtils from '../libs/UserUtils';
import * as LocalePhoneNumber from '../libs/LocalePhoneNumber';

const propTypes = {
    /* Onyx Props */

    /** The personal details of the person who is logged in */
    personalDetails: PropTypes.objectOf(personalDetailsPropType),

    /** The active report */
    report: reportPropTypes.isRequired,

    /** Route params */
    route: PropTypes.shape({
        params: PropTypes.shape({
            /** Report ID passed via route r/:reportID/participants */
            reportID: PropTypes.string,
        }),
    }).isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    personalDetails: {},
};

/**
 * Returns all the participants in the active report
 *
 * @param {Object} report The active report object
 * @param {Object} personalDetails The personal details of the users
 * @param {Object} translate The localize
 * @return {Array}
 */
const getAllParticipants = (report, personalDetails, translate) => {
    let participantAccountIDs = report.participantAccountIDs;

    // Build participants list for IOU report - there is a possibility that participantAccountIDs may be undefined/empty
    if (ReportUtils.isIOUReport(report)) {
        const managerID = report.managerID || '';
        const ownerAccountID = report.ownerAccountID || '';
        participantAccountIDs = [managerID, ownerAccountID];
    }

    return _.chain(participantAccountIDs)
        .map((accountID, index) => {
            const userPersonalDetail = lodashGet(personalDetails, accountID, {displayName: personalDetails.displayName || translate('common.hidden'), avatar: ''});
            const userLogin = LocalePhoneNumber.formatPhoneNumber(userPersonalDetail.login || '') || translate('common.hidden');

            return {
                alternateText: userLogin,
                displayName: userPersonalDetail.displayName,
                accountID: userPersonalDetail.accountID,
                icons: [
                    {
                        id: accountID,
                        source: UserUtils.getAvatar(userPersonalDetail.avatar, accountID),
                        name: userLogin,
                        type: CONST.ICON_TYPE_AVATAR,
                    },
                ],
                keyForList: `${index}-${userLogin}`,
                login: userLogin,
                text: userPersonalDetail.displayName,
                tooltipText: userLogin,
                participantsList: [{accountID, displayName: userPersonalDetail.displayName}],
            };
        })
        .sortBy((participant) => participant.displayName.toLowerCase())
        .value();
};

function ReportParticipantsPage(props) {
    const participants = _.map(getAllParticipants(props.report, props.personalDetails, props.translate), (participant) => ({
        ...participant,
        isDisabled: ReportUtils.isOptimisticPersonalDetail(participant.accountID),
    }));

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            {({safeAreaPaddingBottomStyle}) => (
                <FullPageNotFoundView shouldShow={_.isEmpty(props.report) || ReportUtils.isArchivedRoom(props.report)}>
                    <HeaderWithBackButton
                        title={props.translate(
                            ReportUtils.isChatRoom(props.report) ||
                                ReportUtils.isPolicyExpenseChat(props.report) ||
                                ReportUtils.isChatThread(props.report) ||
                                ReportUtils.isTaskReport(props.report)
                                ? 'common.members'
                                : 'common.details',
                        )}
                    />
                    <View
                        pointerEvents="box-none"
                        style={[styles.containerWithSpaceBetween]}
                    >
                        {Boolean(participants.length) && (
                            <OptionsList
                                sections={[
                                    {
                                        title: '',
                                        data: participants,
                                        shouldShow: true,
                                        indexOffset: 0,
                                    },
                                ]}
                                onSelectRow={(option) => {
                                    Navigation.navigate(ROUTES.getProfileRoute(option.accountID));
                                }}
                                hideSectionHeaders
                                showTitleTooltip
                                showScrollIndicator
                                disableFocusOptions
                                boldStyle
                                optionHoveredStyle={styles.hoveredComponentBG}
                                contentContainerStyles={[safeAreaPaddingBottomStyle]}
                            />
                        )}
                    </View>
                </FullPageNotFoundView>
            )}
        </ScreenWrapper>
    );
}

ReportParticipantsPage.propTypes = propTypes;
ReportParticipantsPage.defaultProps = defaultProps;
ReportParticipantsPage.displayName = 'ReportParticipantsPage';

export default compose(
    withLocalize,
    withReportOrNotFound,
    withOnyx({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
    }),
)(ReportParticipantsPage);
