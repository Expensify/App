import React, {forwardRef, useImperativeHandle, useRef} from 'react';
import ViewShot from 'react-native-view-shot';
import getQrCodeFileName from '@components/QRShare/getQrCodeDownloadFileName';
import {qrShareDefaultProps, qrSharePropTypes} from '@components/QRShare/propTypes';
import useNetwork from '@hooks/useNetwork';
import fileDownload from '@libs/fileDownload';
import QRShare from '..';

function QRShareWithDownload({innerRef, ...props}) {
    const {isOffline} = useNetwork();
    const qrCodeScreenshotRef = useRef(null);

    useImperativeHandle(
        innerRef,
        () => ({
            download: () => qrCodeScreenshotRef.current.capture().then((uri) => fileDownload(uri, getQrCodeFileName(props.title))),
        }),
        [props.title],
    );

    return (
        <ViewShot ref={qrCodeScreenshotRef}>
            <QRShare
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                logo={isOffline ? null : props.logo}
            />
        </ViewShot>
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
