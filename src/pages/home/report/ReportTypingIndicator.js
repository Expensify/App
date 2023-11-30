import PropTypes from 'prop-types';
import React, {useMemo} from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import networkPropTypes from '@components/networkPropTypes';
import {withNetwork} from '@components/OnyxProvider';
import Text from '@components/Text';
import TextWithEllipsis from '@components/TextWithEllipsis';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import compose from '@libs/compose';
import useThemeStyles from '@styles/useThemeStyles';
import * as PersonalDetails from '@userActions/PersonalDetails';
import ONYXKEYS from '@src/ONYXKEYS';

const propTypes = {
    /** Key-value pairs of user accountIDs/logins and whether or not they are typing. Keys are accountIDs or logins. */
    userTypingStatuses: PropTypes.objectOf(PropTypes.bool),

    /** Information about the network */
    network: networkPropTypes.isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    userTypingStatuses: {},
};

function ReportTypingIndicator(props) {
    const styles = useThemeStyles();
    const usersTyping = useMemo(() => _.filter(_.keys(props.userTypingStatuses), (loginOrAccountID) => props.userTypingStatuses[loginOrAccountID]), [props.userTypingStatuses]);
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
                    leadingText={PersonalDetails.getDisplayNameForTypingIndicator(usersTyping[0], props.translate('common.someone'))}
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
            initialValue: {},
        },
    }),
)(ReportTypingIndicator);
