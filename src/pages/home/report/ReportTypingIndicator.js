import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import compose from '../../../libs/compose';
import ONYXKEYS from '../../../ONYXKEYS';
import styles from '../../../styles/styles';
import {getDisplayName} from '../../../libs/actions/PersonalDetails';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import Text from '../../../components/Text';

const propTypes = {
    /** Key-value pairs of user logins and whether or not they are typing. Keys are logins. */
    userTypingStatuses: PropTypes.objectOf(PropTypes.bool),

    ...withLocalizePropTypes,
};

const defaultProps = {
    userTypingStatuses: {},
};

class ReportTypingIndicator extends React.Component {
    constructor(props) {
        super(props);

        const usersTyping = props.userTypingStatuses
            ? Object.keys(props.userTypingStatuses)
                .filter(login => props.userTypingStatuses[login])
            : [];
        this.state = {usersTyping};
    }

    componentDidUpdate(prevProps) {
        // Make sure we only update the state if there's been a change in who's typing.
        if (!_.isEqual(prevProps.userTypingStatuses, this.props.userTypingStatuses)) {
            const usersTyping = Object.keys(this.props.userTypingStatuses)
                .filter(login => this.props.userTypingStatuses[login]);

            // Suppressing because this is within a conditional, and hence we won't run into an infinite loop
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({usersTyping});
        }
    }

    render() {
        const numUsersTyping = _.size(this.state.usersTyping);

        // Decide on the Text element that will hold the display based on the number of users that are typing.
        switch (numUsersTyping) {
            case 0:
                return <View style={[styles.chatItemComposeSecondaryRow]} />;
            case 1:
                return (
                    <View style={[styles.chatItemComposeSecondaryRow]}>
                        <Text style={[
                            styles.chatItemComposeSecondaryRowSubText,
                            styles.chatItemComposeSecondaryRowOffset,
                        ]}
                        >
                            <Text style={[styles.textMicroSupportingBold]}>
                                {getDisplayName(this.state.usersTyping[0])}
                            </Text>
                            {` ${this.props.translate('reportTypingIndicator.isTyping')}`}
                        </Text>
                    </View>
                );
            case 2:
                return (
                    <View style={[styles.chatItemComposeSecondaryRow]}>
                        <Text style={[
                            styles.chatItemComposeSecondaryRowSubText,
                            styles.chatItemComposeSecondaryRowOffset,
                        ]}
                        >
                            <Text style={[styles.textMicroSupportingBold]}>
                                {getDisplayName(this.state.usersTyping[0])}
                            </Text>
                            {` ${this.props.translate('common.and')} `}
                            <Text style={[styles.textMicroSupportingBold]}>
                                {getDisplayName(this.state.usersTyping[1])}
                            </Text>
                            {` ${this.props.translate('reportTypingIndicator.areTyping')}`}
                        </Text>
                    </View>
                );
            default:
                return (
                    <View style={[styles.chatItemComposeSecondaryRow]}>
                        <Text style={[
                            styles.chatItemComposeSecondaryRowSubText,
                            styles.chatItemComposeSecondaryRowOffset,
                        ]}
                        >
                            <Text style={[styles.textMicroSupportingBold]}>
                                {this.props.translate('reportTypingIndicator.multipleUsers')}
                            </Text>
                            {` ${this.props.translate('reportTypingIndicator.areTyping')}`}
                        </Text>
                    </View>
                );
        }
    }
}

ReportTypingIndicator.propTypes = propTypes;
ReportTypingIndicator.defaultProps = defaultProps;
ReportTypingIndicator.displayName = 'ReportTypingIndicator';

export default compose(
    withLocalize,
    withOnyx({
        userTypingStatuses: {
            key: ({reportID}) => `${ONYXKEYS.COLLECTION.REPORT_USER_IS_TYPING}${reportID}`,
        },
    }),
)(ReportTypingIndicator);
