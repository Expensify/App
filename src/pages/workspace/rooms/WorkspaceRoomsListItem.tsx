import React from 'react';
import {View} from 'react-native';
import Animated from 'react-native-reanimated';
import Avatar from '@components/Avatar';
import Icon from '@components/Icon';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import ReportActionAvatars from '@components/ReportActionAvatars';
import Text from '@components/Text';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {PersonalDetails, Report} from '@src/types/onyx';

const ROW_MIN_HEIGHT = 64;

type WorkspaceRoomsListItemProps = {
    report: Report;
    roomName: string;
    ownerDetails: PersonalDetails | undefined;
    ownerDisplayName: string;
    memberCount: number;
    onPress: () => void;
    shouldAnimateInHighlight?: boolean;
};

function WorkspaceRoomsListItem({report, roomName, ownerDetails, ownerDisplayName, memberCount, onPress, shouldAnimateInHighlight = false}: WorkspaceRoomsListItemProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight']);

    const animatedHighlightStyle = useAnimatedHighlightStyle({
        shouldHighlight: shouldAnimateInHighlight,
        highlightColor: theme.messageHighlightBG,
        backgroundColor: theme.highlightBG,
        borderRadius: styles.br2.borderRadius,
        skipInitialFade: true,
    });

    return (
        <Animated.View style={animatedHighlightStyle}>
            <PressableWithFeedback
                accessibilityLabel={roomName || report.reportID}
                accessibilityRole={CONST.ROLE.BUTTON}
                sentryLabel="workspaceRoomsPage-row"
                onPress={onPress}
                style={[styles.flexRow, styles.alignItemsCenter, styles.p4, styles.gap3, styles.br2, {minHeight: ROW_MIN_HEIGHT}]}
                hoverStyle={styles.hoveredComponentBG}
            >
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3, styles.flex3]}>
                    <ReportActionAvatars
                        reportID={report.reportID}
                        size={CONST.AVATAR_SIZE.DEFAULT}
                        shouldShowTooltip={false}
                    />
                    <Text
                        numberOfLines={1}
                        style={[styles.textStrong, styles.flexShrink1]}
                    >
                        {roomName}
                    </Text>
                </View>
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2, styles.flex2]}>
                    {!!ownerDetails && (
                        <>
                            <Avatar
                                source={ownerDetails.avatar}
                                avatarID={ownerDetails.accountID}
                                name={ownerDisplayName}
                                type={CONST.ICON_TYPE_AVATAR}
                                size={CONST.AVATAR_SIZE.SMALLER}
                            />
                            <Text
                                numberOfLines={1}
                                style={styles.flexShrink1}
                            >
                                {ownerDisplayName}
                            </Text>
                        </>
                    )}
                </View>
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.flex1]}>
                    <Text style={styles.flex1}>{memberCount}</Text>
                    <Icon
                        src={icons.ArrowRight}
                        fill={theme.icon}
                    />
                </View>
            </PressableWithFeedback>
        </Animated.View>
    );
}

WorkspaceRoomsListItem.displayName = 'WorkspaceRoomsListItem';

export default WorkspaceRoomsListItem;
