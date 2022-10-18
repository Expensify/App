import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import {withNetwork} from '../../../components/OnyxProvider';
import networkPropTypes from '../../../components/networkPropTypes';
import compose from '../../../libs/compose';
import ONYXKEYS from '../../../ONYXKEYS';
import styles from '../../../styles/styles';
import * as PersonalDetails from '../../../libs/actions/PersonalDetails';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import TextWithEllipsis from '../../../components/TextWithEllipsis';

const propTypes = {
    /** Key-value pairs of user logins and whether or not they are typing. Keys are logins. */
    userTypingStatuses: PropTypes.objectOf(PropTypes.bool),

    /** Information about the network */
    network: networkPropTypes.isRequired,

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

        // If we are offline, the user typing statuses are not up-to-date so do not show them
        // Or if there is no user typing, we do not show the indicator
        if (this.props.network.isOffline || numUsersTyping === 0) {
            return null;
        }

        // Decide on the Text element that will hold the display based on the number of users that are typing.

        let leadingText = '';
        let trailingText = '';

        if (numUsersTyping === 1) {
            leadingText = PersonalDetails.getDisplayName(this.state.usersTyping[0]);
            trailingText = ` ${this.props.translate('reportTypingIndicator.isTyping')}`;
        } else {
            leadingText = this.props.translate('reportTypingIndicator.multipleUsers');
            trailingText = ` ${this.props.translate('reportTypingIndicator.areTyping')}`;
        }

        return (
            <TextWithEllipsis
                leadingText={leadingText}
                trailingText={trailingText}
                textStyle={[styles.chatItemComposeSecondaryRowSubText]}
                wrapperStyle={[styles.chatItemComposeSecondaryRow]}
                leadingTextParentStyle={styles.chatItemComposeSecondaryRowOffset}
            />
        );
    }
}

ReportTypingIndicator.propTypes = propTypes;
ReportTypingIndicator.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withNetwork(),
    withOnyx({
        userTypingStatuses: {
            key: ({reportID}) => `${ONYXKEYS.COLLECTION.REPORT_USER_IS_TYPING}${reportID}`,
        },
    }),
)(ReportTypingIndicator);
