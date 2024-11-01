import React, {useEffect, useMemo, useRef} from 'react';
import useThemeStyles from '@hooks/useThemeStyles';
import AttachmentView from './Attachments/AttachmentView';

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
};

function AttachmentPreview({source = ''}: AttachmentModalProps) {
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

    useEffect(() => {
        // setFile(originalFileName ? {name: originalFileName} : undefined);
        alert(JSON.stringify(file));
    }, [file]);

    return (
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
}

AttachmentPreview.displayName = 'AttachmentPreview';

export default AttachmentPreview;
