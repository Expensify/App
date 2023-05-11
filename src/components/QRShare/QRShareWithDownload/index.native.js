import React, {Component} from 'react';
import ViewShot from 'react-native-view-shot';
import fileDownload from '../../../libs/fileDownload';
import QRShare, {qrShareDefaultProps, qrSharePropTypes} from '..';
import getQrCodeFileName from '../getQrCodeDownloadFileName';

const propTypes = qrSharePropTypes;

const defaultProps = qrShareDefaultProps;

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
QRShareWithDownload.propTypes = propTypes;
QRShareWithDownload.defaultProps = defaultProps;

export default QRShareWithDownload;
