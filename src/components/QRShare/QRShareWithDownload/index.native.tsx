import type {ForwardedRef} from 'react';
import React, {forwardRef, useImperativeHandle, useRef} from 'react';
import ViewShot from 'react-native-view-shot';
import getQrCodeFileName from '@components/QRShare/getQrCodeDownloadFileName';
import type {QRShareProps} from '@components/QRShare/types';
import useNetwork from '@hooks/useNetwork';
import fileDownload from '@libs/fileDownload';
import QRShare from '..';
import type QRShareWithDownloadHandle from './types';

function QRShareWithDownload(props: QRShareProps, ref: ForwardedRef<QRShareWithDownloadHandle>) {
    const {isOffline} = useNetwork();
    const qrCodeScreenshotRef = useRef<ViewShot>(null);

    useImperativeHandle(
        ref,
        () => ({
            download: () => qrCodeScreenshotRef.current?.capture?.().then((uri) => fileDownload(uri, getQrCodeFileName(props.title))),
        }),
        [props.title],
    );

    return (
        <ViewShot ref={qrCodeScreenshotRef}>
            <QRShare
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                logo={isOffline ? undefined : props.logo}
            />
        </ViewShot>
    );
}

QRShareWithDownload.displayName = 'QRShareWithDownload';

export default forwardRef(QRShareWithDownload);
