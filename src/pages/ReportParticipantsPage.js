import React from 'react';
import _ from 'underscore';
import {
    View,
} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import lodashGet from 'lodash/get';
import styles from '../styles/styles';
import ONYXKEYS from '../ONYXKEYS';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import Navigation from '../libs/Navigation/Navigation';
import ScreenWrapper from '../components/ScreenWrapper';
import OptionsList from '../components/OptionsList';
import ROUTES from '../ROUTES';
import personalDetailsPropType from './personalDetailsPropType';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import compose from '../libs/compose';
import * as ReportUtils from '../libs/ReportUtils';
import reportPropTypes from './reportPropTypes';
import withReportOrNavigateHome from './home/report/withReportOrNavigateHome';

const propTypes = {
    /* Onyx Props */

    /** The personal details of the person who is logged in */
    personalDetails: personalDetailsPropType.isRequired,

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

/**
 * Returns all the participants in the active report
 *
 * @param {Object} report The active report object
 * @param {Object} personalDetails The personal details of the users
 * @return {Array}
 */
const getAllParticipants = (report, personalDetails) => {
    const {participants} = report;

    return _.map(participants, (login) => {
        const userPersonalDetail = lodashGet(personalDetails, login, {displayName: login, avatar: ''});
        const userLogin = Str.removeSMSDomain(login);

        return ({
            alternateText: userLogin,
            displayName: userPersonalDetail.displayName,
            icons: userPersonalDetail.avatar ? [userPersonalDetail.avatar] : [ReportUtils.getDefaultAvatar()],
            keyForList: userLogin,
            login,
            text: userPersonalDetail.displayName,
            tooltipText: userLogin,
            participantsList: [{login: userLogin, displayName: userPersonalDetail.displayName}],
        });
    });
};

const ReportParticipantsPage = (props) => {
    const participants = getAllParticipants(props.report, props.personalDetails);

    return (
        <ScreenWrapper>
            <HeaderWithCloseButton
                title={props.translate((ReportUtils.isChatRoom(props.report) || ReportUtils.isPolicyExpenseChat(props.report)) ? 'common.members' : 'common.details')}
                onCloseButtonPress={Navigation.dismissModal}
                onBackButtonPress={Navigation.goBack}
                shouldShowBackButton={ReportUtils.isChatRoom(props.report) || ReportUtils.isPolicyExpenseChat(props.report)}
            />
            <View
                pointerEvents="box-none"
                style={[
                    styles.containerWithSpaceBetween,
                ]}
            >
                {Boolean(participants.length)
                    && (
                    <OptionsList
                        sections={[{
                            title: '', data: participants, shouldShow: true, indexOffset: 0,
                        }]}
                        onSelectRow={(option) => {
                            Navigation.navigate(ROUTES.getReportParticipantRoute(
                                props.route.params.reportID, option.login,
                            ));
                        }}
                        hideSectionHeaders
                        showTitleTooltip
                        disableFocusOptions
                        boldStyle
                        optionHoveredStyle={styles.hoveredComponentBG}
                    />
                    )}
            </View>
        </ScreenWrapper>
    );
};

ReportParticipantsPage.propTypes = propTypes;
ReportParticipantsPage.displayName = 'ReportParticipantsPage';

export default compose(
    withLocalize,
    withReportOrNavigateHome,
    withOnyx({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS,
        },
    }),
)(ReportParticipantsPage);
