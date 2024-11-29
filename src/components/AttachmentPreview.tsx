import {Str} from 'expensify-common';
import {ResizeMode, Video} from 'expo-av';
import React, {useMemo, useRef} from 'react';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import AttachmentView from './Attachments/AttachmentView';
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

function AttachmentPreview({source = '', aspectRatio, onPress}: AttachmentPreviewProps) {
    const styles = useThemeStyles();
    const isPDFLoadError = useRef(false);

    const file = useMemo<FileObject | undefined>(() => {
        const originalFileName: string = source.split('/').pop() ?? '';
        return originalFileName
            ? {
                  name: originalFileName,
              }
            : undefined;
    }, [source]);

    const AttachmentViewComponent = (
        <AttachmentView
            containerStyles={{marginHorizontal: 20}}
            source={source}
            isAuthTokenRequired={false}
            file={file}
            onPDFLoadError={() => {
                isPDFLoadError.current = true;
            }}
            isWorkspaceAvatar={false}
            maybeIcon={false}
            fallbackSource={undefined}
            isUsedInAttachmentModal
            transactionID={undefined}
            isUploaded={false}
        />
    );

    const isSourcePdf = typeof source === 'number' || (typeof source === 'string' && Str.isPDF(source));
    const isSourceImage = typeof source === 'number' || (typeof source === 'string' && Str.isImage(source));
    const isSourceVideo = ((typeof source === 'string' && Str.isVideo(source)) || (file?.name && Str.isVideo(file.name))) ?? (file?.name && Str.isVideo(file.name));
    const isFileNamePdf = file?.name && Str.isPDF(file.name);
    const isFileNameImage = file?.name && Str.isImage(file.name);
    const isFilePdf = isSourcePdf || isFileNamePdf;
    const isFileImage = isSourceImage || isFileNameImage;
    const isFileVideo = isSourceVideo && typeof source === 'string';

    const stylesss = (aspectRatio ?? 1) < 1 ? {height: '100%'} : {width: '100%'};

    if (isFilePdf) {
        return (
            <PressableWithFeedback
                accessibilityRole="button"
                style={{width: '100%', aspectRatio: 1, overflow: 'hidden', alignItems: 'center', borderRadius: 8}}
                onPress={onPress}
                accessible
                accessibilityLabel="Image Thumbnail"
            >
                <View style={{width: '100%', aspectRatio: 2, paddingLeft: 20, overflow: 'hidden'}}>{AttachmentViewComponent}</View>
            </PressableWithFeedback>
        );
    }

    if (isFileImage) {
        return (
            <PressableWithFeedback
                accessibilityRole="button"
                style={{width: '100%', aspectRatio: 1, overflow: 'hidden', alignItems: 'center'}}
                onPress={onPress}
                accessible
                accessibilityLabel="Image Thumbnail"
            >
                <View style={{...stylesss, aspectRatio, backgroundColor: 'yellow', borderRadius: 8, overflow: 'hidden'}}>
                    <ImageView
                        url={source}
                        fileName="xd"
                    />
                </View>
            </PressableWithFeedback>
        );
    }

    if (isFileVideo) {
        return (
            <PressableWithFeedback
                accessibilityRole="button"
                style={{width: '100%', aspectRatio: 0.9, borderRadius: 8, overflow: 'hidden'}}
                onPress={onPress}
                accessible
                accessibilityLabel="Video Thumbnail"
            >
                <View style={{height: '100%', width: '100%', position: 'absolute'}}>
                    <Video
                        style={[{height: '100%', width: '100%', borderRadius: 20, flexDirection: 'column', alignItems: 'flex-start', overflow: 'hidden'}]}
                        // videoStyle={{borderRadius: 20, overflow: 'hidden'}}
                        source={{
                            uri: source,
                        }}
                        shouldPlay={false}
                        useNativeControls={false}
                        resizeMode={ResizeMode.CONTAIN}
                        isLooping={false}
                    />
                </View>
                <View style={{height: '100%', width: '100%', position: 'absolute', justifyContent: 'center'}}>
                    <View style={[styles.videoThumbnailPlayButton, {position: 'relative', alignSelf: 'center'}]}>
                        <Icon
                            src={Expensicons.Play}
                            fill="white"
                            width={variables.iconSizeXLarge}
                            height={variables.iconSizeXLarge}
                            additionalStyles={[styles.ml1]}
                        />
                    </View>
                </View>
            </PressableWithFeedback>
        );
    }

    return <View style={{width: '100%', aspectRatio, borderRadius: 8, overflow: 'hidden', backgroundColor: 'red', marginLeft: -20}}>{AttachmentViewComponent}</View>;
}

AttachmentPreview.displayName = 'AttachmentPreview';

export default AttachmentPreview;
