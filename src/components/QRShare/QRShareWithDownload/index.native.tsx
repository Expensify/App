import React, {useImperativeHandle, useRef} from 'react';
import ViewShot from 'react-native-view-shot';
import getQrCodeFileName from '@components/QRShare/getQrCodeDownloadFileName';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import fileDownload from '@libs/fileDownload';
import QRShare from '..';
import type {QRShareWithDownloadProps} from './types';

function QRShareWithDownload({ref, ...props}: QRShareWithDownloadProps) {
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();

    const qrCodeScreenshotRef = useRef<ViewShot>(null);

    useImperativeHandle(
        ref,
        () => ({
            download: () =>
                qrCodeScreenshotRef.current?.capture?.().then((uri) => fileDownload(translate, uri, getQrCodeFileName(props.title ?? 'QRCode'), translate('fileDownload.success.qrMessage'))),
        }),
        [props.title, translate],
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

export default QRShareWithDownload;
