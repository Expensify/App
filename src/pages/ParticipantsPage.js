import React from 'react';
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
import CONST from '../CONST';

const propTypes = {
    /* Onyx Props */
    // The personal details of the person who is logged in
    myPersonalDetails: PropTypes.shape({
        // Display name of the current user from their personal details
        displayName: PropTypes.string,

        // Avatar URL of the current user from their personal details
        avatar: PropTypes.string,

        // Login of the current user from their personal details
        login: PropTypes.string,
    }).isRequired,

    // List of reports
    reports: PropTypes.shape({
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

    // The chat priority mode
    priorityMode: PropTypes.string.isRequired,
};

/**
 * Returns all the participants in the active report
 *
 * @param {Object} report The active report object
 * @param {Object} personalDetail The personal detail of the logged user
 * @return {Array}
 */
const getAllParticipants = (report, personalDetail) => {
    const {icons, participants, reportName} = report;
    const displayNames = reportName.split(', ');

    const members = participants.reduce((list, login, idx) => {
        list.push({
            alternateText: login,
            displayName: displayNames[idx],
            icons: [icons[idx]],
            keyForList: `${idx}`,
            login,
            text: displayNames[idx],
            tooltipText: login,
        });
        return list;
    }, [{
        icons: [personalDetail.avatar],
        text: personalDetail.displayName,
        login: personalDetail.login,
        alternateText: personalDetail.login,
        keyForList: `${participants.length}`,
        tooltipText: personalDetail.login,
        displayName: personalDetail.displayName,
    }]);

    return members.map(item => ({...item, participantsList: [item]}));
};

const ParticipantsPage = ({
    myPersonalDetails, route, reports, priorityMode,
}) => {
    const participants = getAllParticipants(reports[`report_${route.params.reportID}`], myPersonalDetails);

    return (
        <ScreenWrapper>
            <HeaderWithCloseButton
                title="Participants"
                onCloseButtonPress={Navigation.dismissModal}
            />
            <View
                pointerEvents="box-none"
                style={[
                    styles.detailsPageContainer,
                ]}
            >
                { participants.length
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
                        optionMode={priorityMode === CONST.PRIORITY_MODE.GSD ? 'compact' : 'default'}
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
    myPersonalDetails: {
        key: ONYXKEYS.MY_PERSONAL_DETAILS,
    },
    reports: {
        key: ONYXKEYS.COLLECTION.REPORT,
    },
    priorityMode: {
        key: ONYXKEYS.NVP_PRIORITY_MODE,
    },
})(ParticipantsPage);
