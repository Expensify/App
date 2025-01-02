import {Str} from 'expensify-common';
import {ResizeMode, Video} from 'expo-av';
import React from 'react';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import DefaultAttachmentView from './Attachments/AttachmentView/DefaultAttachmentView';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import ImageView from './ImageView';
import {PressableWithFeedback} from './Pressable';

type AttachmentPreviewProps = {
    /** Source (URL, SVG function) for file. */
    source: string;

    /** Media's aspect ratio to calculate the thumbnail */
    aspectRatio: number | undefined;

    /** Function to call when pressing thumbnail */
    onPress: () => void;
};

function AttachmentPreview({source, aspectRatio = 1, onPress}: AttachmentPreviewProps) {
    const styles = useThemeStyles();

    const originalFileName: string = source.split('/').pop() ?? '';

    const file = originalFileName ? {name: originalFileName} : undefined;

    const isSourceImage = typeof source === 'number' || (typeof source === 'string' && Str.isImage(source));
    const isSourceVideo = ((typeof source === 'string' && Str.isVideo(source)) || (file?.name && Str.isVideo(file.name))) ?? (file?.name && Str.isVideo(file.name));
    const isFileNameImage = file?.name && Str.isImage(file.name);
    const isFileImage = isSourceImage || isFileNameImage;
    const isFileVideo = isSourceVideo && typeof source === 'string';

    const fillStyle = aspectRatio < 1 ? styles.h100 : styles.w100;

    if (isFileVideo) {
        return (
            <PressableWithFeedback
                accessibilityRole="button"
                style={[fillStyle, styles.br2, styles.overflowHidden, styles.alignSelfStart, {aspectRatio}]}
                onPress={onPress}
                accessible
                accessibilityLabel="Attachment Thumbnail"
            >
                <Video
                    style={[styles.w100, styles.h100]}
                    source={{
                        uri: source,
                    }}
                    shouldPlay={false}
                    useNativeControls={false}
                    resizeMode={ResizeMode.CONTAIN}
                    isLooping={false}
                />
                <View style={[styles.h100, styles.w100, styles.pAbsolute, styles.justifyContentCenter, styles.alignItemsCenter]}>
                    <View style={styles.videoThumbnailPlayButton}>
                        <Icon
                            src={Expensicons.Play}
                            fill="white"
                            width={variables.iconSizeXLarge}
                            height={variables.iconSizeXLarge}
                            additionalStyles={styles.ml1}
                        />
                    </View>
                </View>
            </PressableWithFeedback>
        );
    }

    if (isFileImage) {
        return (
            <PressableWithFeedback
                accessibilityRole="button"
                style={[styles.alignItemsStart, {aspectRatio: 1}]}
                onPress={onPress}
                accessible
                accessibilityLabel="Image Thumbnail"
            >
                <View style={[fillStyle, styles.br4, styles.overflowHidden, {aspectRatio}]}>
                    <ImageView
                        url={source}
                        fileName={file?.name ?? ''}
                    />
                </View>
            </PressableWithFeedback>
        );
    }

    return <DefaultAttachmentView fileName={file?.name} />;
}

AttachmentPreview.displayName = 'AttachmentPreview';

export default AttachmentPreview;
