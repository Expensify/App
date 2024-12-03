import {Str} from 'expensify-common';
import {ResizeMode, Video} from 'expo-av';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import DefaultAttachmentView from './Attachments/AttachmentView/DefaultAttachmentView';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import ImageView from './ImageView';
import {PressableWithFeedback} from './Pressable';

type ImagePickerResponse = {
    height?: number;
    name: string;
    size?: number | null;
    type: string;
    uri: string;
    width?: number;
};

type FileObject = Partial<File | ImagePickerResponse>;

type AttachmentPreviewProps = {
    /** Optional source (URL, SVG function) for the image shown. */
    source?: string | undefined;

    /** Media's aspect ratio to calculate the thumbnail */
    aspectRatio: number | undefined;

    /** function to call when pressing thumbnail */
    onPress: () => void;
};

function AttachmentPreview({source = '', aspectRatio = 1, onPress}: AttachmentPreviewProps) {
    const styles = useThemeStyles();

    const file = useMemo<FileObject | undefined>(() => {
        const originalFileName: string = source.split('/').pop() ?? '';
        return originalFileName
            ? {
                  name: originalFileName,
              }
            : undefined;
    }, [source]);

    const isSourcePdf = typeof source === 'number' || (typeof source === 'string' && Str.isPDF(source));
    const isSourceImage = typeof source === 'number' || (typeof source === 'string' && Str.isImage(source));
    const isSourceVideo = ((typeof source === 'string' && Str.isVideo(source)) || (file?.name && Str.isVideo(file.name))) ?? (file?.name && Str.isVideo(file.name));
    const isFileNamePdf = file?.name && Str.isPDF(file.name);
    const isFileNameImage = file?.name && Str.isImage(file.name);
    const isFilePdf = isSourcePdf || isFileNamePdf;
    const isFileImage = isSourceImage || isFileNameImage;
    const isFileVideo = isSourceVideo && typeof source === 'string';

    const fillStyle = aspectRatio < 1 ? styles.h100 : styles.w100;
    let previewComponent;

    if (isFilePdf) {
        previewComponent = <DefaultAttachmentView fileName={file?.name} />;
    }

    if (isFileVideo) {
        previewComponent = (
            <>
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
                            additionalStyles={[styles.ml1]}
                        />
                    </View>
                </View>
            </>
        );
    }

    if (previewComponent) {
        return (
            <PressableWithFeedback
                accessibilityRole="button"
                style={[fillStyle, styles.br2, styles.overflowHidden, styles.alignItemsCenter, styles.alignSelfCenter, {aspectRatio}]}
                onPress={onPress}
                accessible
                accessibilityLabel="Attachment Thumbnail"
            >
                {previewComponent}
            </PressableWithFeedback>
        );
    }

    if (isFileImage) {
        return (
            <PressableWithFeedback
                accessibilityRole="button"
                style={[styles.alignItemsCenter, {aspectRatio: 1}]}
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
