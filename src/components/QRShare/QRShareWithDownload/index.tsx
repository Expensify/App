import type {ForwardedRef} from 'react';
import React, {forwardRef, useImperativeHandle, useRef} from 'react';
import getQrCodeFileName from '@components/QRShare/getQrCodeDownloadFileName';
import type {QRShareHandle, QRShareProps} from '@components/QRShare/types';
import useNetwork from '@hooks/useNetwork';
import fileDownload from '@libs/fileDownload';
import QRShare from '..';
import type QRShareWithDownloadHandle from './types';

function QRShareWithDownload(props: QRShareProps, ref: ForwardedRef<QRShareWithDownloadHandle>) {
    const {isOffline} = useNetwork();
    const qrShareRef = useRef<QRShareHandle>(null);

    useImperativeHandle(
        ref,
        () => ({
            download: () =>
                new Promise((resolve, reject) => {
                    // eslint-disable-next-line es/no-optional-chaining
                    const svg = qrShareRef.current?.getSvg();
                    if (!svg) {
                        reject();
                        return;
                    }

                    svg.toDataURL((dataURL) => resolve(fileDownload(dataURL, getQrCodeFileName(props.title))));
                }),
        }),
        [props.title],
    );

    return (
        <QRShare
            ref={qrShareRef}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            logo={isOffline ? undefined : props.logo}
        />
    );
}

QRShareWithDownload.displayName = 'QRShareWithDownload';

export default forwardRef(QRShareWithDownload);
