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

const matchType = PropTypes.shape({
    params: PropTypes.shape({
        // reportID passed via route /participants/:reportID
        reportID: PropTypes.string,
    }),
});

const myPersonalDetailsType = PropTypes.shape({
    // Display name of the current user from their personal details
    displayName: PropTypes.string,

    // Avatar URL of the current user from their personal details
    avatar: PropTypes.string,

    // login of the current user from their personal details
    login: PropTypes.string,
});

const propTypes = {
    /* Onyx Props */
    // The personal details of the person who is logged in
    myPersonalDetails: myPersonalDetailsType.isRequired,

    // List of reports
    reports: PropTypes.shape({
        icons: PropTypes.arrayOf(PropTypes.string),
        reportName: PropTypes.string,
        participants: PropTypes.arrayOf(PropTypes.string),
    }).isRequired,

    // Route params
    route: matchType.isRequired,

    priorityMode: PropTypes.string.isRequired,
};

const getAllParticipants = (report, personalDetail) => {
    const {icons, participants, reportName} = report;
    const displayNames = reportName.split(', ');

    const otherMembers = participants.map((login, index) => (
        {
            alternateText: login,
            icons: [icons[index]],
            keyForList: `${index}`,
            tooltipText: login,
            text: displayNames[index],
            login,
            displayName: displayNames[index],
        }
    ));

    const final = [...otherMembers,
        {
            icons: [personalDetail.avatar],
            text: personalDetail.displayName,
            login: personalDetail.login,
            alternateText: personalDetail.login,
            keyForList: `${otherMembers.length}`,
            tooltipText: personalDetail.login,
            displayName: personalDetail.displayName,
        },
    ];

    return final.map(item => ({...item, participantsList: [item]}));
};

const getSections = participants => ([{
    title: '',
    data: participants,
    shouldShow: true,
    indexOffset: 0,
}]);

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
                { participants.length ? (

                    <OptionsList
                        sections={getSections(participants)}
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
                ) : null }
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
