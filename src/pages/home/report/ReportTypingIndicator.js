import React, {useMemo} from 'react';
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
import Text from '../../../components/Text';
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

function ReportTypingIndicator(props) {
    const usersTyping = useMemo(() => _.filter(_.keys(props.userTypingStatuses), (login) => props.userTypingStatuses[login]), [props.userTypingStatuses]);
    // If we are offline, the user typing statuses are not up-to-date so do not show them
    if (props.network.isOffline) {
        return null;
    }

    const numUsersTyping = _.size(usersTyping);

    // Decide on the Text element that will hold the display based on the number of users that are typing.
    switch (numUsersTyping) {
        case 0:
            return null;

        case 1:
            return (
                <TextWithEllipsis
                    leadingText={PersonalDetails.getDisplayName(usersTyping[0])}
                    trailingText={` ${props.translate('reportTypingIndicator.isTyping')}`}
                    textStyle={[styles.chatItemComposeSecondaryRowSubText]}
                    wrapperStyle={[styles.chatItemComposeSecondaryRow, styles.flex1]}
                    leadingTextParentStyle={styles.chatItemComposeSecondaryRowOffset}
                />
            );

        default:
            return (
                <Text
                    style={[styles.chatItemComposeSecondaryRowSubText, styles.chatItemComposeSecondaryRowOffset]}
                    numberOfLines={1}
                >
                    {props.translate('reportTypingIndicator.multipleUsers')}
                    {` ${props.translate('reportTypingIndicator.areTyping')}`}
                </Text>
            );
    }
}

ReportTypingIndicator.propTypes = propTypes;
ReportTypingIndicator.defaultProps = defaultProps;
ReportTypingIndicator.displayName = 'ReportTypingIndicator';

export default compose(
    withLocalize,
    withNetwork(),
    withOnyx({
        userTypingStatuses: {
            key: ({reportID}) => `${ONYXKEYS.COLLECTION.REPORT_USER_IS_TYPING}${reportID}`,
        },
    }),
)(ReportTypingIndicator);
