import React, {memo, useMemo} from 'react';
import Text from '@components/Text';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import ONYXKEYS from '@src/ONYXKEYS';

type AgentZeroProcessingRequestIndicatorProps = {
    reportID: string;
    label?: string;
};

function AgentZeroProcessingRequestIndicator({reportID, label}: AgentZeroProcessingRequestIndicatorProps) {
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const [userTypingStatuses] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_USER_IS_TYPING}${reportID}`, {canBeMissing: true});

    // Check if anyone is currently typing
    const usersTyping = useMemo(() => Object.keys(userTypingStatuses ?? {}).filter((loginOrAccountID) => userTypingStatuses?.[loginOrAccountID]), [userTypingStatuses]);
    const isAnyoneTyping = usersTyping.length > 0;

    // Don't show if offline, if anyone is typing (typing indicator takes precedence), or if the indicator doesn't exist
    if (isOffline || isAnyoneTyping || !label) {
        return null;
    }

    return (
        <Text
            style={[styles.chatItemComposeSecondaryRowSubText, styles.chatItemComposeSecondaryRowOffset]}
            numberOfLines={1}
        >
            {label}
        </Text>
    );
}

export default memo(AgentZeroProcessingRequestIndicator);
