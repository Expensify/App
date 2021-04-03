import React from 'react';
import _ from 'underscore';
import {
    View,
} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import styles from '../styles/styles';
import ONYXKEYS from '../ONYXKEYS';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import Navigation from '../libs/Navigation/Navigation';
import ScreenWrapper from '../components/ScreenWrapper';
import OptionsList from '../components/OptionsList';
import ROUTES from '../ROUTES';

const propTypes = {
    /* Onyx Props */
    // The personal details of the person who is logged in
    personalDetails: PropTypes.shape({
        // Display name of the current user from their personal details
        displayName: PropTypes.string,

        // Avatar URL of the current user from their personal details
        avatar: PropTypes.string,

        // Login of the current user from their personal details
        login: PropTypes.string,
    }).isRequired,

    // The active report
    report: PropTypes.shape({
        // The list of icons
        icons: PropTypes.arrayOf(PropTypes.string),

        // The report name
        reportName: PropTypes.string,

        // Array of participants
        participants: PropTypes.arrayOf(PropTypes.string),
    }).isRequired,

    // Route params
    route: PropTypes.shape({
        params: PropTypes.shape({
            // Report ID passed via route /participants/:reportID
            reportID: PropTypes.string,
        }),
    }).isRequired,
};

/**
 * Returns all the participants in the active report
 *
 * @param {Object} report The active report object
 * @param {Array} personalDetails The personal details of the users
 * @return {Array}
 */
const getAllParticipants = (report, personalDetails) => {
    const {participants} = report;

    return _.map(participants, (login) => {
        const userPersonalDetail = personalDetails[login];

        return ({
            alternateText: login,
            displayName: userPersonalDetail.displayName,
            icons: [userPersonalDetail.avatar],
            keyForList: login,
            login,
            text: userPersonalDetail.displayName,
            tooltipText: login,
            participantsList: [{login, displayName: userPersonalDetail.displayName}],
        });
    });
};

const ParticipantsPage = ({personalDetails, report}) => {
    const participants = getAllParticipants(report, personalDetails);

    return (
        <ScreenWrapper>
            <HeaderWithCloseButton
                title="Details"
                onCloseButtonPress={Navigation.dismissModal}
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
                            Navigation.navigate(ROUTES.getDetailsRoute(option.login));
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

ParticipantsPage.propTypes = propTypes;
ParticipantsPage.displayName = 'ParticipantsPage';

export default withOnyx({
    personalDetails: {
        key: ONYXKEYS.PERSONAL_DETAILS,
    },
    report: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${route.params.reportID}`,
    },
})(ParticipantsPage);
