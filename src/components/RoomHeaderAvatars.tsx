import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearAvatarErrors, updatePolicyRoomAvatar} from '@libs/actions/Report';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {isUserCreatedPolicyRoom} from '@libs/ReportUtils';
import {getAccountIDFromAvatarID, isDefaultAvatar} from '@libs/UserAvatarUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Policy, Report} from '@src/types/onyx';
import type {Icon} from '@src/types/onyx/OnyxCommon';

import type {OnyxEntry} from 'react-native-onyx';

import React, {memo} from 'react';
import {View} from 'react-native';

import AvatarFromIcon from './Avatar/AvatarFromIcon';
import UserAvatar from './Avatar/UserAvatar';
import WorkspaceAvatar from './Avatar/WorkspaceAvatar';
import AvatarWithImagePicker from './AvatarWithImagePicker';
import PressableWithoutFocus from './Pressable/PressableWithoutFocus';
import Text from './Text';

type RoomHeaderAvatarsProps = {
    icons: Icon[];
    report: Report;
    policy: OnyxEntry<Policy>;
    participants: number[];
    currentUserAccountID: number;
};

function RoomHeaderAvatars({icons, report, policy, participants, currentUserAccountID}: RoomHeaderAvatarsProps) {
    const navigateToAvatarPage = (icon: Icon) => {
        if (icon.type === CONST.ICON_TYPE_WORKSPACE && icon.id) {
            Navigation.navigate(ROUTES.REPORT_AVATAR.getRoute(report?.reportID, icon.id.toString()));
            return;
        }

        if (icon.id) {
            Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.PROFILE_AVATAR.getRoute(Number(icon.id))));
        }
    };

    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Camera', 'FallbackAvatar', 'ImageCropSquareMask']);
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const canEditRoomAvatar = isUserCreatedPolicyRoom(report) && participants.includes(currentUserAccountID) && !!policy && policy.role !== CONST.POLICY.ROLE.AUDITOR;

    if (!icons.length) {
        return null;
    }

    if (icons.length === 1) {
        const icon = icons.at(0);

        if (!icon) {
            return;
        }

        if (canEditRoomAvatar) {
            const avatarSource = icon.source || report.avatarUrl;
            const avatarForIconType =
                icon.type === CONST.ICON_TYPE_WORKSPACE ? (
                    <WorkspaceAvatar
                        source={avatarSource}
                        size={CONST.AVATAR_SIZE.XXXX_LARGE}
                        name={icon.name ?? ''}
                        avatarID={icon.id ?? CONST.DEFAULT_NUMBER_ID}
                    />
                ) : (
                    <UserAvatar
                        source={avatarSource}
                        size={CONST.AVATAR_SIZE.XXXX_LARGE}
                        accountID={getAccountIDFromAvatarID(icon.id)}
                        fallbackIcon={icon.fallbackIcon}
                    />
                );
            const roomAvatar = avatarSource ? avatarForIconType : null;

            return (
                <AvatarWithImagePicker
                    source={avatarSource}
                    avatar={roomAvatar}
                    isUsingDefaultAvatar={!report.avatarUrl || isDefaultAvatar(icon.source)}
                    onViewPhotoPress={() => Navigation.navigate(ROUTES.REPORT_AVATAR.getRoute(report.reportID))}
                    onImageRemoved={() => updatePolicyRoomAvatar(report.reportID, currentUserAccountID, report.avatarUrl)}
                    onImageSelected={(file) => updatePolicyRoomAvatar(report.reportID, currentUserAccountID, report.avatarUrl, file)}
                    editIcon={expensifyIcons.Camera}
                    editIconStyle={styles.smallEditIconAccount}
                    pendingAction={report.pendingFields?.avatar}
                    errors={report.errorFields?.avatar ?? null}
                    errorRowStyles={styles.mt6}
                    onErrorClose={() => clearAvatarErrors(report.reportID)}
                    style={[styles.mb3, styles.w100, styles.alignItemsCenter]}
                    editorMaskImage={expensifyIcons.ImageCropSquareMask}
                />
            );
        }

        return (
            <PressableWithoutFocus
                style={styles.noOutline}
                onPress={() => navigateToAvatarPage(icon)}
                accessibilityRole={CONST.ROLE.BUTTON}
                accessibilityLabel={icon.name ?? ''}
                disabled={icon.source === expensifyIcons.FallbackAvatar}
            >
                <AvatarFromIcon
                    icon={icon}
                    size={CONST.AVATAR_SIZE.XXXX_LARGE}
                />
            </PressableWithoutFocus>
        );
    }

    const iconsToDisplay = icons.slice(0, CONST.REPORT.MAX_PREVIEW_AVATARS);

    const roomHeaderAvatarFootprint = StyleUtils.getAvatarSizeWithBorder(CONST.AVATAR_SIZE.XXX_LARGE);
    const iconStyle = [
        styles.roomHeaderAvatar,

        // Due to border-box box-sizing, the Avatars have to be larger when bordered to visually match size with non-bordered Avatars
        StyleUtils.getWidthAndHeightStyle(roomHeaderAvatarFootprint),
    ];

    // Bordered workspace avatars here are 88px (avatar + border), so they keep the larger rounded radius instead of the 16px radius mapped to a plain xxx-large avatar.
    const getRoomHeaderAvatarBorderRadius = (type?: string) =>
        type === CONST.ICON_TYPE_WORKSPACE
            ? {borderRadius: variables.componentBorderRadiusRounded}
            : StyleUtils.getAvatarBorderRadius(CONST.AVATAR_SIZE.XXX_LARGE, StyleUtils.getShapeFromIconType(type));
    return (
        <View style={styles.pointerEventsBoxNone}>
            <View style={[styles.flexRow, styles.wAuto, styles.ml3]}>
                {iconsToDisplay.map((icon, index) => (
                    <View
                        // eslint-disable-next-line react/no-array-index-key
                        key={`${icon.id}${index}`}
                        style={[styles.justifyContentCenter, styles.alignItemsCenter]}
                    >
                        <PressableWithoutFocus
                            style={[styles.mln4, getRoomHeaderAvatarBorderRadius(icon.type)]}
                            onPress={() => navigateToAvatarPage(icon)}
                            accessibilityRole={CONST.ROLE.BUTTON}
                            accessibilityLabel={icon.name ?? ''}
                            disabled={icon.source === expensifyIcons.FallbackAvatar}
                        >
                            <AvatarFromIcon
                                icon={icon}
                                size={CONST.AVATAR_SIZE.XXX_LARGE}
                                containerStyles={[...iconStyle, getRoomHeaderAvatarBorderRadius(icon.type)]}
                            />
                        </PressableWithoutFocus>
                        {index === CONST.REPORT.MAX_PREVIEW_AVATARS - 1 && icons.length - CONST.REPORT.MAX_PREVIEW_AVATARS !== 0 && (
                            <>
                                <View
                                    style={[
                                        styles.roomHeaderAvatarSize,
                                        styles.roomHeaderAvatar,
                                        styles.mln4,
                                        ...iconStyle,
                                        getRoomHeaderAvatarBorderRadius(icon.type),
                                        styles.roomHeaderAvatarOverlay,
                                    ]}
                                />
                                <Text style={styles.avatarInnerTextChat}>{`+${icons.length - CONST.REPORT.MAX_PREVIEW_AVATARS}`}</Text>
                            </>
                        )}
                    </View>
                ))}
            </View>
        </View>
    );
}

export default memo(RoomHeaderAvatars);
