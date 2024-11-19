import {Str} from 'expensify-common';
import React, {useMemo, useRef} from 'react';
import {View} from 'react-native';
import Image from '@components/Image';
import useThemeStyles from '@hooks/useThemeStyles';
import AttachmentView from './Attachments/AttachmentView';
import RESIZE_MODES from './Image/resizeModes';
import Text from './Text';

type ImagePickerResponse = {
    height?: number;
    name: string;
    size?: number | null;
    type: string;
    uri: string;
    width?: number;
};

type FileObject = Partial<File | ImagePickerResponse>;

type AttachmentModalProps = {
    /** Optional source (URL, SVG function) for the image shown. If not passed in via props must be specified when modal is opened. */
    source?: string | undefined;

    aspectRatio: number | undefined;
};

function AttachmentPreview({source = '', aspectRatio}: AttachmentModalProps) {
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
            containerStyles={styles.mh5}
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
    const isSourceImage = typeof source === 'number' || (typeof source === 'string' && (Str.isImage(source) || Str.isVideo(source)));
    const isSourceVideo = ((typeof source === 'string' && Str.isVideo(source)) || (file?.name && Str.isVideo(file.name))) ?? (file?.name && Str.isVideo(file.name));
    const isFileNamePdf = file?.name && Str.isPDF(file.name);
    const isFileNameImage = file?.name && Str.isImage(file.name);
    const isFilePdf = isSourcePdf || isFileNamePdf;
    const isFileImage = isSourceImage || isFileNameImage;
    const isFileVideo = isSourceVideo && typeof source === 'string';

    if (isFilePdf) {
        return <View style={{width: '100%', aspectRatio, borderRadius: 8, paddingLeft: 20, overflow: 'hidden'}}>{AttachmentViewComponent}</View>;
    }

    if (isFileImage) {
        return <View style={{width: '100%', aspectRatio, borderRadius: 8, overflow: 'hidden', backgroundColor: 'yellow'}}>{AttachmentViewComponent}</View>;
    }

    if (isFileVideo) {
        return <View style={{width: '100%', aspectRatio, borderRadius: 8, overflow: 'hidden', backgroundColor: 'orange'}}>{AttachmentViewComponent}</View>;
    }

    return <View style={{width: '100%', aspectRatio, borderRadius: 8, overflow: 'hidden', backgroundColor: 'red', marginLeft: -20}}>{AttachmentViewComponent}</View>;
}

AttachmentPreview.displayName = 'AttachmentPreview';

export default AttachmentPreview;
