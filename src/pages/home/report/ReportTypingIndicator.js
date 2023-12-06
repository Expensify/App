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

function ReportTypingIndicator({userTypingStatuses}) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

    const styles = useThemeStyles();
    const usersTyping = useMemo(() => _.filter(_.keys(userTypingStatuses), (loginOrAccountID) => userTypingStatuses[loginOrAccountID]), [userTypingStatuses]);
    const firstUserTyping = usersTyping[0];

    const firstUserTypingID = useMemo(
        () => (firstUserTyping && Number.isNaN(Number(firstUserTyping)) ? PersonalDetailsUtils.getAccountIDsByLogins([firstUserTyping])[0] : firstUserTyping),
        [firstUserTyping],
    );

    // If we are offline, the user typing statuses are not up-to-date so do not show them
    if (isOffline || !firstUserTyping) {
        return null;
    }

    // If the user is typing on OldDot, firstUserTyping will be a string (the user's displayName)
    const firstUserTypingDisplayName = ReportUtils.getDisplayNameForParticipant(firstUserTypingID, false, false) || firstUserTyping;

    if (usersTyping.length === 1) {
        return (
            <TextWithEllipsis
                leadingText={firstUserTypingDisplayName || translate('common.someone')}
                trailingText={` ${translate('reportTypingIndicator.isTyping')}`}
                textStyle={[styles.chatItemComposeSecondaryRowSubText]}
                wrapperStyle={[styles.chatItemComposeSecondaryRow, styles.flex1]}
                leadingTextParentStyle={styles.chatItemComposeSecondaryRowOffset}
            />
        );
    }
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

ReportTypingIndicator.propTypes = propTypes;
ReportTypingIndicator.defaultProps = defaultProps;
ReportTypingIndicator.displayName = 'ReportTypingIndicator';

export default withOnyx({
    userTypingStatuses: {
        key: ({reportID}) => `${ONYXKEYS.COLLECTION.REPORT_USER_IS_TYPING}${reportID}`,
        initialValue: {},
    },
})(ReportTypingIndicator);
