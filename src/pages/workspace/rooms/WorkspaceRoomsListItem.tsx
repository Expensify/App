import React from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import Icon from '@components/Icon';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import ReportActionAvatars from '@components/ReportActionAvatars';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getReportName} from '@libs/ReportNameUtils';
import {getDisplayNameForParticipant} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

type WorkspaceRoomsListItemProps = {
    report: Report;
    onPress: () => void;
};

function WorkspaceRoomsListItem({report, onPress}: WorkspaceRoomsListItemProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {formatPhoneNumber} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight']);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);

    const ownerAccountID = report.ownerAccountID;
    const ownerDetail = ownerAccountID ? personalDetails?.[ownerAccountID] : undefined;
    const ownerDisplayName = ownerAccountID ? getDisplayNameForParticipant({accountID: ownerAccountID, formatPhoneNumber, personalDetailsData: personalDetails ?? undefined}) : '';

    const memberCount = Object.keys(report.participants ?? {}).length;
    const roomName = getReportName(report);

    return (
        <PressableWithFeedback
            accessibilityLabel={roomName}
            accessibilityRole={CONST.ROLE.BUTTON}
            sentryLabel="WorkspaceRoomsPage-Row"
            onPress={onPress}
            style={[styles.flexRow, styles.alignItemsCenter, styles.ph5, styles.pv2]}
        >
            <View style={[styles.flexRow, styles.alignItemsCenter, {flex: 3}]}>
                <ReportActionAvatars
                    reportID={report.reportID}
                    size={CONST.AVATAR_SIZE.DEFAULT}
                    shouldShowTooltip={false}
                />
                <Text
                    numberOfLines={1}
                    style={[styles.textStrong, styles.ml3, styles.flexShrink1]}
                >
                    {roomName}
                </Text>
            </View>
            <View style={[styles.flexRow, styles.alignItemsCenter, {flex: 2}]}>
                {!!ownerAccountID && (
                    <>
                        <Avatar
                            source={ownerDetail?.avatar}
                            avatarID={ownerAccountID}
                            name={ownerDisplayName}
                            type={CONST.ICON_TYPE_AVATAR}
                            size={CONST.AVATAR_SIZE.SMALLER}
                            containerStyles={styles.mr2}
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
            <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                <Text style={[styles.flex1]}>{memberCount}</Text>
                <Icon
                    src={icons.ArrowRight}
                    fill={theme.icon}
                />
            </View>
        </PressableWithFeedback>
    );
}

WorkspaceRoomsListItem.displayName = 'WorkspaceRoomsListItem';

export default WorkspaceRoomsListItem;
