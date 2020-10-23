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

class ReportTypingIndicator extends React.Component {
    constructor(props) {
        super(props);

        const usersTyping = Object.keys(props.userTypingStatuses || {})
            .filter(login => props.userTypingStatuses[login]);
        this.state = {usersTyping};
    }

    componentDidUpdate(prevProps) {
        // Make sure we only update the state if there's been a change in who's typing.
        if (!_.isEqual(prevProps.userTypingStatuses, this.props.userTypingStatuses)) {
            const usersTyping = Object.keys(this.props.userTypingStatuses || {})
                .filter(login => this.props.userTypingStatuses[login]);

            // Suppressing because this is within a conditional, and hence we won't run into an infinite loop
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({usersTyping});
        }
    }

    render() {
        const numUsersTyping = _.size(this.state.usersTyping);

        // Return an empty view if no one is typing.
        if (numUsersTyping === 0) {
            return <View style={[styles.typingIndicator]} />;
        }

        // Decide on the Text element that will hold the display for the users that are typing.
        let usersTypingText;
        switch (numUsersTyping) {
            case 1:
                usersTypingText = <Text style={[styles.textStrong]}>{getDisplayName(this.state.usersTyping[0])}</Text>;
                break;
            case 2:
                usersTypingText = (
                    <Text>
                        <Text style={[styles.textStrong]}>{getDisplayName(this.state.usersTyping[0])}</Text>
                        {' and '}
                        <Text style={[styles.textStrong]}>{getDisplayName(this.state.usersTyping[1])}</Text>
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
                    {numUsersTyping > 1 ? ' are ' : ' is '}
                    typing...
                </Text>
            </View>
        );
    }
}

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
