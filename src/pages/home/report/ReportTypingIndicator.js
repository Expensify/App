import React from 'react';
import {Text} from 'react-native';
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
    /**
     * Get an array with the logins of the users that are currently typing.
     *
     * @returns {string[]}
     */
    function getUsersTyping() {
        return Object.keys(userTypingStatuses || {})
            .filter(login => userTypingStatuses[login] === true);
    }

    /**
     * Get the Text element that will hold the display for the users that are typing.
     *
     * @returns {JSX.Element}
     */
    function getUsersTypingText() {
        const usersTyping = getUsersTyping();

        if (_.size(usersTyping) === 1) {
            return <Text style={[styles.textStrong]}>{getDisplayName(usersTyping[0])}</Text>;
        }

        if (_.size(usersTyping) === 2) {
            return (
                <Text>
                    <Text style={[styles.textStrong]}>{getDisplayName(usersTyping[0])}</Text>
                    {' and '}
                    <Text style={[styles.textStrong]}>{getDisplayName(usersTyping[1])}</Text>
                </Text>
            );
        }

        if (_.size(usersTyping) > 2) {
            return <Text style={[styles.textStrong]}>Multiple users</Text>;
        }
    }

    const usersTyping = getUsersTyping();
    const usersTypingText = getUsersTypingText();
    return (
        <Text style={[styles.typingIndicator]}>
            {!_.isEmpty(usersTyping) && (
                <Text style={[styles.typingIndicatorSubText]}>
                    {usersTypingText}
                    {_.size(usersTyping) > 1 ? ' are ' : ' is '}
                    typing...
                </Text>
            )}
        </Text>
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
