import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import compose from '../../../libs/compose';
import ONYXKEYS from '../../../ONYXKEYS';
import styles from '../../../styles/styles';
import * as PersonalDetails from '../../../libs/actions/PersonalDetails';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import Text from '../../../components/Text';
import TextWithEllipsis from '../../../components/TextWithEllipsis';

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
            ? _.filter(_.keys(props.userTypingStatuses), login => props.userTypingStatuses[login])
            : [];
        this.state = {usersTyping};
    }

    componentDidUpdate(prevProps) {
        // Make sure we only update the state if there's been a change in who's typing.
        if (_.isEqual(prevProps.userTypingStatuses, this.props.userTypingStatuses)) {
            return;
        }

        const usersTyping = _.filter(_.keys(this.props.userTypingStatuses), login => this.props.userTypingStatuses[login]);

        // eslint-disable-next-line react/no-did-update-set-state
        this.setState({usersTyping});
    }

    render() {
        const numUsersTyping = _.size(this.state.usersTyping);

        // Decide on the Text element that will hold the display based on the number of users that are typing.
        switch (numUsersTyping) {
            case 0:
                return <View style={[styles.chatItemComposeSecondaryRow]} />;
            case 1:
                return (
                    <TextWithEllipsis
                        leadingText={PersonalDetails.getDisplayName(this.state.usersTyping[0])}
                        trailingText={` ${this.props.translate('reportTypingIndicator.isTyping')}`}
                        textStyle={[styles.chatItemComposeSecondaryRowSubText]}
                        wrapperStyle={styles.chatItemComposeSecondaryRow}
                        leadingTextParentStyle={styles.chatItemComposeSecondaryRowOffset}
                    />
                );
            default:
                return (
                    <View style={[styles.chatItemComposeSecondaryRow]}>
                        <Text
                            style={[
                                styles.chatItemComposeSecondaryRowSubText,
                                styles.chatItemComposeSecondaryRowOffset,
                            ]}
                            numberOfLines={1}
                        >
                            {this.props.translate('reportTypingIndicator.multipleUsers')}
                            {` ${this.props.translate('reportTypingIndicator.areTyping')}`}
                        </Text>
                    </View>
                );
        }
    }
}

ReportTypingIndicator.propTypes = propTypes;
ReportTypingIndicator.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        userTypingStatuses: {
            key: ({reportID}) => `${ONYXKEYS.COLLECTION.REPORT_USER_IS_TYPING}${reportID}`,
        },
    }),
)(ReportTypingIndicator);
