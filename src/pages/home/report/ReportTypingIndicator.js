import React from 'react';
import {View, Text} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import compose from '../../../libs/compose';
import withIon from '../../../components/withIon';
import IONKEYS from '../../../IONKEYS';
import styles from '../../../styles/StyleSheet';
import {getDisplayName} from '../../../libs/actions/PersonalDetails';

const propTypes = {
    // Key-value pairs of user logins and whether or not they are typing. Keys are logins.
    userTypingStatuses: PropTypes.objectOf(PropTypes.bool),
};

const defaultProps = {
    userTypingStatuses: {},
};

const ReportTypingIndicator = ({userTypingStatuses}) => {
    // Get an array with the logins of the users that are currently typing.
    const usersTyping = Object.keys(userTypingStatuses || {})
        .filter(login => userTypingStatuses[login] === true);
    const numUsersTyping = _.size(usersTyping);

    // Return an empty view if no one is typing.
    if (numUsersTyping === 0) {
        return <View style={[styles.typingIndicator]} />;
    }

    // Decide on the Text element that will hold the display for the users that are typing.
    let usersTypingText;
    switch (numUsersTyping) {
        case 1:
            usersTypingText = <Text style={[styles.textStrong]}>{getDisplayName(usersTyping[0])}</Text>;
            break;
        case 2:
            usersTypingText = (
                <Text>
                    <Text style={[styles.textStrong]}>{getDisplayName(usersTyping[0])}</Text>
                    {' and '}
                    <Text style={[styles.textStrong]}>{getDisplayName(usersTyping[1])}</Text>
                </Text>
            );
            break;
        default:
            usersTypingText = <Text style={[styles.textStrong]}>Multiple users</Text>;
    }

    return (
        <View style={[styles.typingIndicator]}>
            <Text style={[styles.typingIndicatorSubText]}>
                {usersTypingText}
                {_.size(usersTyping) > 1 ? ' are ' : ' is '}
                typing...
            </Text>
        </View>
    );
};

ReportTypingIndicator.propTypes = propTypes;
ReportTypingIndicator.defaultProps = defaultProps;
ReportTypingIndicator.displayName = 'ReportTypingIndicator';

export default compose(
    withIon({
        userTypingStatuses: {
            key: ({reportID}) => `${IONKEYS.COLLECTION.REPORT_USER_IS_TYPING}${reportID}`,
        }
    }),
)(ReportTypingIndicator);
