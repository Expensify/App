import {Str} from 'expensify-common';
import {ResizeMode, Video} from 'expo-av';
import React, {useState} from 'react';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import {checkIsFileImage} from './Attachments/AttachmentView';
import DefaultAttachmentView from './Attachments/AttachmentView/DefaultAttachmentView';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import ImageView from './ImageView';
import PDFThumbnail from './PDFThumbnail';
import {PressableWithFeedback} from './Pressable';

type AttachmentPreviewProps = {
    /** Source for file. */
    source: string;

    /** Media's aspect ratio to calculate the thumbnail */
    aspectRatio: number | undefined;

    /** Function to call when pressing thumbnail */
    onPress: () => void;

    /** The attachment load error callback */
    onLoadError?: () => void;
};

function AttachmentPreview({source, aspectRatio = 1, onPress, onLoadError}: AttachmentPreviewProps) {
    const styles = useThemeStyles();

    const fileName = source.split('/').pop() ?? undefined;
    const fillStyle = aspectRatio < 1 ? styles.h100 : styles.w100;
    const [isEncryptedPDF, setIsEncryptedPDF] = useState(false);

    if (typeof source === 'string' && Str.isVideo(source)) {
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
                    onError={onLoadError}
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
    const isFileImage = checkIsFileImage(source, fileName);

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
                        fileName={fileName ?? ''}
                    />
                </View>
            </PressableWithFeedback>
        );
    }

    if (typeof source === 'string' && Str.isPDF(source) && !isEncryptedPDF) {
        return (
            <PDFThumbnail
                previewSourceURL={source}
                onLoadError={onLoadError}
                onPassword={() => setIsEncryptedPDF(true)}
            />
        );
    }

    return <DefaultAttachmentView fileName={fileName} />;
}

AttachmentPreview.displayName = 'AttachmentPreview';

export default AttachmentPreview;
