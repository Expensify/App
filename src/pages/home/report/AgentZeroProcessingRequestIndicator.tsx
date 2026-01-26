import React, {memo, useMemo, useState} from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type AgentZeroProcessingRequestIndicatorProps = {
    reportID: string;
    isProcessing: boolean;
    reasoningHistory?: string[];
};

function AgentZeroProcessingRequestIndicator({reportID, isProcessing, reasoningHistory = []}: AgentZeroProcessingRequestIndicatorProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const [userTypingStatuses] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_USER_IS_TYPING}${reportID}`, {canBeMissing: true});
    const [isExpanded, setIsExpanded] = useState(false);
    const icons = useMemoizedLazyExpensifyIcons(['DownArrow', 'UpArrow']);

    const usersTyping = useMemo(() => Object.keys(userTypingStatuses ?? {}).filter((loginOrAccountID) => userTypingStatuses?.[loginOrAccountID]), [userTypingStatuses]);
    const isAnyoneTyping = usersTyping.length > 0;

    const hasReasoningHistory = reasoningHistory.length > 0;

    if (isOffline || isAnyoneTyping || !isProcessing) {
        return null;
    }

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    if (!hasReasoningHistory) {
        return (
            <View style={styles.chatItemComposeSecondaryRowOffset}>
                <Text
                    style={styles.chatItemComposeSecondaryRowSubText}
                    numberOfLines={1}
                >
                    {translate('common.thinking')}
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.chatItemComposeSecondaryRowOffset}>
            <PressableWithFeedback
                onPress={toggleExpanded}
                style={[styles.flexRow, styles.alignItemsCenter, styles.gap1]}
                role={CONST.ROLE.BUTTON}
                accessibilityLabel={translate('common.thinking')}
                hoverDimmingValue={1}
                pressDimmingValue={0.8}
            >
                <Text style={styles.chatItemComposeSecondaryRowSubText}>{translate('common.thinking')}</Text>
                <Icon
                    src={isExpanded ? icons.UpArrow : icons.DownArrow}
                    fill={theme.textSupporting}
                    width={12}
                    height={12}
                />
            </PressableWithFeedback>
            {isExpanded && (
                <View style={[styles.mt2, styles.ml2, styles.pl3, styles.borderLeft]}>
                    {reasoningHistory.map((item, index) => (
                        <View
                            key={`reasoning-${index}`}
                            style={styles.mb2}
                        >
                            <Text style={[styles.chatItemComposeSecondaryRowSubText, styles.textStrong]}>{item.split('\n')[0]}</Text>
                            {item.split('\n').length > 1 && <Text style={styles.chatItemComposeSecondaryRowSubText}>{item.split('\n').slice(1).join('\n')}</Text>}
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
}

export default memo(AgentZeroProcessingRequestIndicator);
