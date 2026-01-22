import React, {memo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearAvatarErrors, updatePolicyRoomAvatar} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import {isUserCreatedPolicyRoom} from '@libs/ReportUtils';
import {isDefaultAvatar} from '@libs/UserAvatarUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Policy, Report} from '@src/types/onyx';
import type {Icon} from '@src/types/onyx/OnyxCommon';
import Avatar from './Avatar';
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
            Navigation.navigate(ROUTES.PROFILE_AVATAR.getRoute(Number(icon.id), Navigation.getActiveRoute()));
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
            return (
                <AvatarWithImagePicker
                    source={icon.source || report.avatarUrl}
                    avatarID={icon.id}
                    isUsingDefaultAvatar={!report.avatarUrl || isDefaultAvatar(icon.source)}
                    size={CONST.AVATAR_SIZE.X_LARGE}
                    avatarStyle={[styles.avatarXLarge, styles.alignSelfCenter]}
                    onViewPhotoPress={() => Navigation.navigate(ROUTES.REPORT_AVATAR.getRoute(report.reportID))}
                    onImageRemoved={() => updatePolicyRoomAvatar(report.reportID, currentUserAccountID)}
                    onImageSelected={(file) => updatePolicyRoomAvatar(report.reportID, currentUserAccountID, file)}
                    editIcon={expensifyIcons.Camera}
                    editIconStyle={styles.smallEditIconAccount}
                    pendingAction={report.pendingFields?.avatar}
                    errors={report.errorFields?.avatar ?? null}
                    errorRowStyles={styles.mt6}
                    onErrorClose={() => clearAvatarErrors(report.reportID)}
                    style={[styles.mb3, styles.w100, styles.alignItemsCenter]}
                    type={icon.type}
                    editorMaskImage={expensifyIcons.ImageCropSquareMask}
                    name={icon.name}
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
                <Avatar
                    source={icon.source}
                    imageStyles={styles.avatarXLarge}
                    size={CONST.AVATAR_SIZE.X_LARGE}
                    name={icon.name}
                    avatarID={icon.id}
                    type={icon.type}
                    fallbackIcon={icon.fallbackIcon}
                />
            </PressableWithoutFocus>
        );
    }

    const iconsToDisplay = icons.slice(0, CONST.REPORT.MAX_PREVIEW_AVATARS);

    const iconStyle = [
        styles.roomHeaderAvatar,

        // Due to border-box box-sizing, the Avatars have to be larger when bordered to visually match size with non-bordered Avatars
        StyleUtils.getAvatarStyle(CONST.AVATAR_SIZE.LARGE_BORDERED),
    ];
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
                            style={[styles.mln4, StyleUtils.getAvatarBorderRadius(CONST.AVATAR_SIZE.LARGE_BORDERED, icon.type)]}
                            onPress={() => navigateToAvatarPage(icon)}
                            accessibilityRole={CONST.ROLE.BUTTON}
                            accessibilityLabel={icon.name ?? ''}
                            disabled={icon.source === expensifyIcons.FallbackAvatar}
                        >
                            <Avatar
                                source={icon.source}
                                size={CONST.AVATAR_SIZE.LARGE}
                                containerStyles={[...iconStyle, StyleUtils.getAvatarBorderRadius(CONST.AVATAR_SIZE.LARGE_BORDERED, icon.type)]}
                                name={icon.name}
                                avatarID={icon.id}
                                type={icon.type}
                                fallbackIcon={icon.fallbackIcon}
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
                                        StyleUtils.getAvatarBorderRadius(CONST.AVATAR_SIZE.LARGE_BORDERED, icon.type),
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
