import React from 'react';
import _ from 'underscore';
import {
    View,
} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
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
import {isDefaultRoom} from '../libs/reportUtils';

const propTypes = {
    /* Onyx Props */

    /** The personal details of the person who is logged in */
    personalDetails: personalDetailsPropType.isRequired,

    /** The active report */
    report: PropTypes.shape({
        /** The list of icons */
        icons: PropTypes.arrayOf(PropTypes.string),

        /** The report name */
        reportName: PropTypes.string,

        /** Array of participants */
        participants: PropTypes.arrayOf(PropTypes.string),
    }).isRequired,

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
        const userPersonalDetail = personalDetails[login];
        const userLogin = Str.removeSMSDomain(login);

        return ({
            alternateText: userLogin,
            displayName: userPersonalDetail.displayName,
            icons: [userPersonalDetail.avatar],
            keyForList: userLogin,
            login,
            text: userPersonalDetail.displayName,
            tooltipText: userLogin,
            participantsList: [{login: userLogin, displayName: userPersonalDetail.displayName}],
        });
    });
};

const ReportParticipantsPage = ({
    personalDetails,
    report,
    route,
    translate,
}) => {
    const participants = getAllParticipants(report, personalDetails);

    return (
        <ScreenWrapper>
            <HeaderWithCloseButton
                title={translate(isDefaultRoom(report) ? 'reportDetailsPage.members' : 'common.details')}
                onCloseButtonPress={Navigation.dismissModal}
                onBackButtonPress={Navigation.dismissModal}
                shouldShowBackButton={isDefaultRoom(report)}
            />
            <View
                pointerEvents="box-none"
                style={[
                    styles.containerWithSpaceBetween,
                ]}
            >
                {participants.length
                    && (
                    <OptionsList
                        sections={[{
                            title: '', data: participants, shouldShow: true, indexOffset: 0,
                        }]}
                        onSelectRow={(option) => {
                            Navigation.navigate(ROUTES.getReportParticipantRoute(
                                route.params.reportID, option.login,
                            ));
                        }}
                        hideSectionHeaders
                        showTitleTooltip
                        disableFocusOptions
                        optionMode="default"
                        forceTextUnreadStyle
                        optionHoveredStyle={styles.hoveredComponentBG}
                    />
                    )}
            </View>
        </ScreenWrapper>
    );
};

ReportParticipantsPage.propTypes = propTypes;
ReportParticipantsPage.displayName = 'ParticipantsPage';

export default compose(
    withLocalize,
    withOnyx({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS,
        },
        report: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${route.params.reportID}`,
        },
    }),
)(ReportParticipantsPage);
