import React, {memo, useMemo} from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import ONYXKEYS from '@src/ONYXKEYS';

type AgentZeroProcessingRequestIndicatorProps = {
    reportID: string;
    label?: string;
    reasoningHistory?: string[];
};

function AgentZeroProcessingRequestIndicator({reportID, label, reasoningHistory = []}: AgentZeroProcessingRequestIndicatorProps) {
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const [userTypingStatuses] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_USER_IS_TYPING}${reportID}`, {canBeMissing: true});

    // Check if anyone is currently typing
    const usersTyping = useMemo(() => Object.keys(userTypingStatuses ?? {}).filter((loginOrAccountID) => userTypingStatuses?.[loginOrAccountID]), [userTypingStatuses]);
    const isAnyoneTyping = usersTyping.length > 0;

    // Don't show if offline, if anyone is typing (typing indicator takes precedence), or if no indicator/reasoning exists
    const hasContent = !!label || reasoningHistory.length > 0;
    if (isOffline || isAnyoneTyping || !hasContent) {
        return null;
    }

    // Show reasoning history if available, with the status label at the end
    const displayItems = [...reasoningHistory];
    if (label && !reasoningHistory.includes(label)) {
        displayItems.push(label);
    }

    // Only show the most recent reasoning (last item)
    const displayText = displayItems.at(-1);

    return (
        <View style={styles.chatItemComposeSecondaryRowOffset}>
            <Text
                style={styles.chatItemComposeSecondaryRowSubText}
                numberOfLines={2}
            >
                {displayText}
            </Text>
        </View>
    );
}

export default memo(AgentZeroProcessingRequestIndicator);
