import React, {memo, useState} from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import Icon from '@components/Icon';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import CONST from '@src/CONST';

type ConciergeThinkingMessageProps = {
    reasoningHistory?: string[];
};

function ConciergeThinkingMessage({reasoningHistory = []}: ConciergeThinkingMessageProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const [isExpanded, setIsExpanded] = useState(false);
    const icons = useMemoizedLazyExpensifyIcons(['DownArrow', 'UpArrow']);

    const hasReasoningHistory = reasoningHistory.length > 0;
    const formattedTime = DateUtils.formatToLocalTime(new Date());

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <View style={styles.chatItem}>
            <View style={[styles.alignSelfStart, styles.mr3]}>
                <Avatar
                    source={CONST.CONCIERGE_ICON_URL}
                    size={CONST.AVATAR_SIZE.DEFAULT}
                    containerStyles={styles.actionAvatar}
                    type={CONST.ICON_TYPE_AVATAR}
                    name={CONST.CONCIERGE_DISPLAY_NAME}
                />
            </View>
            <View style={styles.chatItemRight}>
                <View style={styles.chatItemMessageHeader}>
                    <Text style={[styles.chatItemMessageHeaderSender, styles.mr1]}>{CONST.CONCIERGE_DISPLAY_NAME}</Text>
                    <Text style={styles.chatItemMessageHeaderTimestamp}>{formattedTime}</Text>
                </View>
                <View style={styles.chatItemMessage}>
                    {!hasReasoningHistory ? (
                        <Text>{translate('common.thinking')}</Text>
                    ) : (
                        <>
                            <PressableWithFeedback
                                onPress={toggleExpanded}
                                style={[styles.flexRow, styles.alignItemsCenter, styles.gap1]}
                                role={CONST.ROLE.BUTTON}
                                accessibilityLabel={translate('common.thinking')}
                                hoverDimmingValue={1}
                                pressDimmingValue={0.8}
                            >
                                <Text>{translate('common.thinking')}</Text>
                                <Icon
                                    src={isExpanded ? icons.UpArrow : icons.DownArrow}
                                    fill={theme.icon}
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
                                            <Text style={styles.textStrong}>{item.split('\n')[0]}</Text>
                                            {item.split('\n').length > 1 && <Text>{item.split('\n').slice(1).join('\n')}</Text>}
                                        </View>
                                    ))}
                                </View>
                            )}
                        </>
                    )}
                </View>
            </View>
        </View>
    );
}

export default memo(ConciergeThinkingMessage);
