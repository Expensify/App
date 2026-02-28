import React from 'react';
import {View} from 'react-native';
import type {GestureResponderEvent} from 'react-native';
import AttachmentDeletedIndicator from '@components/AttachmentDeletedIndicator';
import Icon from '@components/Icon';
import Image from '@components/Image';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import {ShowContextMenuContext, showContextMenuForReport} from '@components/ShowContextMenuContext';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useThemeStyles from '@hooks/useThemeStyles';
import ControlSelection from '@libs/ControlSelection';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import {isArchivedNonExpenseReport} from '@libs/ReportUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';

type VideoPlayerThumbnailProps = {
    /** Url of thumbnail image. */
    thumbnailUrl?: string;

    /** Callback executed on thumbnail press. */
    onPress: (event?: GestureResponderEvent | KeyboardEvent) => void | Promise<void>;

    /** Accessibility label for the thumbnail. */
    accessibilityLabel: string;

    /** Whether the video is deleted */
    isDeleted?: boolean;
};

function VideoPlayerThumbnail({thumbnailUrl, onPress, accessibilityLabel, isDeleted}: VideoPlayerThumbnailProps) {
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['Play'] as const);

    return (
        <View style={styles.flex1}>
            {!!thumbnailUrl && (
                <View style={[styles.flex1, {borderRadius: variables.componentBorderRadiusNormal}, styles.overflowHidden]}>
                    <Image
                        source={{uri: thumbnailUrl}}
                        style={styles.flex1}
                        // The auth header is required except for static images on Cloudfront, which makes them fail to load
                        isAuthTokenRequired={!CONST.CLOUDFRONT_DOMAIN_REGEX.test(thumbnailUrl)}
                    />
                </View>
            )}
            {!isDeleted ? (
                <ShowContextMenuContext.Consumer>
                    {({anchor, report, isReportArchived, action, checkIfContextMenuActive, isDisabled, onShowContextMenu, shouldDisplayContextMenu}) => (
                        <PressableWithoutFeedback
                            style={[styles.videoThumbnailContainer]}
                            accessibilityLabel={accessibilityLabel}
                            accessibilityRole={CONST.ROLE.BUTTON}
                            onPress={onPress}
                            onPressIn={() => canUseTouchScreen() && ControlSelection.block()}
                            onPressOut={() => ControlSelection.unblock()}
                            onLongPress={(event) => {
                                if (isDisabled || !shouldDisplayContextMenu) {
                                    return;
                                }
                                onShowContextMenu(() => {
                                    showContextMenuForReport(event, anchor, report?.reportID, action, checkIfContextMenuActive, isArchivedNonExpenseReport(report, isReportArchived));
                                });
                            }}
                            shouldUseHapticsOnLongPress
                            sentryLabel={CONST.SENTRY_LABEL.VIDEO_PLAYER.THUMBNAIL}
                        >
                            <View style={[styles.videoThumbnailPlayButton]}>
                                <Icon
                                    src={icons.Play}
                                    fill="white"
                                    width={variables.iconSizeXLarge}
                                    height={variables.iconSizeXLarge}
                                />
                            </View>
                        </PressableWithoutFeedback>
                    )}
                </ShowContextMenuContext.Consumer>
            ) : (
                <AttachmentDeletedIndicator containerStyles={{borderRadius: variables.componentBorderRadiusNormal}} />
            )}
        </View>
    );
}

export default VideoPlayerThumbnail;
