import React, {Component} from 'react';
import fileDownload from '../../../libs/fileDownload';
import QRShare, {qrShareDefaultProps, qrSharePropTypes} from '..';
import getQrCodeFileName from '../getQrCodeDownloadFileName';

const propTypes = qrSharePropTypes;

const defaultProps = qrShareDefaultProps;

class QRShareWithDownload extends Component {
    qrShareRef = React.createRef();

    constructor(props) {
        super(props);

        this.download = this.download.bind(this);
    }

    download() {
        return new Promise((resolve, reject) => {
            // eslint-disable-next-line es/no-optional-chaining
            const svg = this.qrShareRef.current?.getSvg();
            if (svg == null) return reject();

            svg.toDataURL((dataURL) => resolve(fileDownload(dataURL, getQrCodeFileName(this.props.title))));
        });
    }

    render() {
        return (
            <QRShare
                ref={this.qrShareRef}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...this.props}
            />
        );
    }
}
QRShareWithDownload.propTypes = propTypes;
QRShareWithDownload.defaultProps = defaultProps;

export default QRShareWithDownload;
