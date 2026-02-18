import React, {useImperativeHandle, useRef} from 'react';
import getQrCodeFileName from '@components/QRShare/getQrCodeDownloadFileName';
import type {QRShareHandle} from '@components/QRShare/types';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import fileDownload from '@libs/fileDownload';
import QRShare from '..';
import type {QRShareWithDownloadProps} from './types';

function QRShareWithDownload({ref, ...props}: QRShareWithDownloadProps) {
    const {isOffline} = useNetwork();
    const qrShareRef = useRef<QRShareHandle>(null);
    const {translate} = useLocalize();

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

                    svg.toDataURL((dataURL) => resolve(fileDownload(translate, dataURL, getQrCodeFileName(props.title ?? 'QRCode'))));
                }),
        }),
        [props.title, translate],
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

export default QRShareWithDownload;
