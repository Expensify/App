import React, {Component} from 'react';
import ViewShot from 'react-native-view-shot';
import fileDownload from '../../../libs/fileDownload';
import QRShare from '..';
import {qrShareDefaultProps, qrSharePropTypes} from '../propTypes';
import getQrCodeFileName from '../getQrCodeDownloadFileName';

class QRShareWithDownload extends Component {
    qrCodeScreenshotRef = React.createRef();

    constructor(props) {
        super(props);

        this.download = this.download.bind(this);
    }

    download() {
        return this.qrCodeScreenshotRef.current.capture().then((uri) => fileDownload(uri, getQrCodeFileName(this.props.title)));
    }

    render() {
        return (
            <ViewShot ref={this.qrCodeScreenshotRef}>
                <QRShare
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...this.props}
                />
            </ViewShot>
        );
    }
}
QRShareWithDownload.propTypes = qrSharePropTypes;
QRShareWithDownload.defaultProps = qrShareDefaultProps;

export default QRShareWithDownload;
