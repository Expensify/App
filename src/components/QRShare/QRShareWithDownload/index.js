import React, {forwardRef, useImperativeHandle, useRef} from 'react';
import getQrCodeFileName from '@components/QRShare/getQrCodeDownloadFileName';
import {qrShareDefaultProps, qrSharePropTypes} from '@components/QRShare/propTypes';
import useNetwork from '@hooks/useNetwork';
import fileDownload from '@libs/fileDownload';
import QRShare from '..';

function QRShareWithDownload({innerRef, ...props}) {
    const {isOffline} = useNetwork();
    const qrShareRef = useRef(null);

    useImperativeHandle(
        innerRef,
        () => ({
            download: () =>
                new Promise((resolve, reject) => {
                    // eslint-disable-next-line es/no-optional-chaining
                    const svg = qrShareRef.current?.getSvg();
                    if (svg == null) {
                        return reject();
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
            logo={isOffline ? null : props.logo}
        />
    );
}

QRShareWithDownload.propTypes = qrSharePropTypes;
QRShareWithDownload.defaultProps = qrShareDefaultProps;
QRShareWithDownload.displayName = 'QRShareWithDownload';

const QRShareWithDownloadWithRef = forwardRef((props, ref) => (
    <QRShareWithDownload
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        innerRef={ref}
    />
));

QRShareWithDownloadWithRef.displayName = 'QRShareWithDownloadWithRef';

export default QRShareWithDownloadWithRef;
