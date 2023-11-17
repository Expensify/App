import PropTypes from 'prop-types';
import React, {useMemo} from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import Text from '@components/Text';
import TextWithEllipsis from '@components/TextWithEllipsis';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import useThemeStyles from '@styles/useThemeStyles';
import ONYXKEYS from '@src/ONYXKEYS';

const propTypes = {
    /** Key-value pairs of user accountIDs/logins and whether or not they are typing. Keys are accountIDs or logins. */
    userTypingStatuses: PropTypes.objectOf(PropTypes.bool),
};

const defaultProps = {
    userTypingStatuses: {},
};

function ReportTypingIndicator(props) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

    const styles = useThemeStyles();
    const usersTyping = useMemo(() => _.filter(_.keys(props.userTypingStatuses), (loginOrAccountID) => props.userTypingStatuses[loginOrAccountID]), [props.userTypingStatuses]);
    // If we are offline, the user typing statuses are not up-to-date so do not show them
    if (isOffline) {
        return null;
    }

    const firstUserTyping = usersTyping[0];
    const firstUserTypingID = Number.isNaN(firstUserTyping) ? PersonalDetailsUtils.getAccountIDsByLogins([firstUserTyping])[0] : firstUserTyping;
    const firstUserTypingDisplayName = ReportUtils.getDisplayNameForParticipant(firstUserTypingID, false, false);

    const numUsersTyping = _.size(usersTyping);

    // Decide on the Text element that will hold the display based on the number of users that are typing.
    switch (numUsersTyping) {
        case 0:
            return null;

        case 1:
            return (
                <TextWithEllipsis
                    leadingText={firstUserTypingDisplayName || translate('common.someone')}
                    trailingText={` ${translate('reportTypingIndicator.isTyping')}`}
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
                    {translate('reportTypingIndicator.multipleUsers')}
                    {` ${translate('reportTypingIndicator.areTyping')}`}
                </Text>
            );
    }
}

ReportTypingIndicator.propTypes = propTypes;
ReportTypingIndicator.defaultProps = defaultProps;
ReportTypingIndicator.displayName = 'ReportTypingIndicator';

export default withOnyx({
    userTypingStatuses: {
        key: ({reportID}) => `${ONYXKEYS.COLLECTION.REPORT_USER_IS_TYPING}${reportID}`,
        initialValue: {},
    },
})(ReportTypingIndicator);
