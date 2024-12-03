import React from 'react';
import {View} from 'react-native';
import type {GestureResponderEvent} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import Image from '@components/Image';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import {ShowContextMenuContext, showContextMenuForReport} from '@components/ShowContextMenuContext';
import useThemeStyles from '@hooks/useThemeStyles';
import ControlSelection from '@libs/ControlSelection';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import * as ReportUtils from '@libs/ReportUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';

type VideoPlayerThumbnailProps = {
    /** Url of thumbnail image. */
    thumbnailUrl?: string;

    /** Callback executed on thumbnail press. */
    onPress: (event?: GestureResponderEvent | KeyboardEvent) => void | Promise<void>;

    /** Accessibility label for the thumbnail. */
    accessibilityLabel: string;
};

function VideoPlayerThumbnail({thumbnailUrl, onPress, accessibilityLabel}: VideoPlayerThumbnailProps) {
    const styles = useThemeStyles();

    return (
        <View style={styles.flex1}>
            {thumbnailUrl && (
                <View style={[styles.flex1, {borderRadius: variables.componentBorderRadiusNormal}, styles.overflowHidden]}>
                    <Image
                        source={{uri: thumbnailUrl}}
                        style={styles.flex1}
                        // The auth header is required except for static images on Cloudfront, which makes them fail to load
                        isAuthTokenRequired={!CONST.CLOUDFRONT_DOMAIN_REGEX.test(thumbnailUrl)}
                    />
                </View>
            )}
            <ShowContextMenuContext.Consumer>
                {({anchor, report, reportNameValuePairs, action, checkIfContextMenuActive}) => (
                    <PressableWithoutFeedback
                        style={[styles.videoThumbnailContainer]}
                        accessibilityLabel={accessibilityLabel}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                        onPress={onPress}
                        onPressIn={() => DeviceCapabilities.canUseTouchScreen() && ControlSelection.block()}
                        onPressOut={() => ControlSelection.unblock()}
                        onLongPress={(event) =>
                            showContextMenuForReport(event, anchor, report?.reportID ?? '-1', action, checkIfContextMenuActive, ReportUtils.isArchivedRoom(report, reportNameValuePairs))
                        }
                        shouldUseHapticsOnLongPress
                    >
                        <View style={[styles.videoThumbnailPlayButton]}>
                            <Icon
                                src={Expensicons.Play}
                                fill="white"
                                width={variables.iconSizeXLarge}
                                height={variables.iconSizeXLarge}
                                additionalStyles={[styles.ml1]}
                            />
                        </View>
                    </PressableWithoutFeedback>
                )}
            </ShowContextMenuContext.Consumer>
        </View>
    );
}

VideoPlayerThumbnail.displayName = 'VideoPlayerThumbnail';

export default VideoPlayerThumbnail;
