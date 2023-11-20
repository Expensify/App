import React, {Component} from 'react';
import {withNetwork} from '@components/OnyxProvider';
import getQrCodeFileName from '@components/QRShare/getQrCodeDownloadFileName';
import {qrShareDefaultProps, qrSharePropTypes} from '@components/QRShare/propTypes';
import fileDownload from '@libs/fileDownload';
import QRShare from '..';

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
            if (svg == null) {
                return reject();
            }

            svg.toDataURL((dataURL) => resolve(fileDownload(dataURL, getQrCodeFileName(this.props.title))));
        });
    }

    render() {
        return (
            <QRShare
                ref={this.qrShareRef}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...this.props}
                logo={this.props.network.isOffline ? null : this.props.logo}
            />
        );
    }
}
QRShareWithDownload.propTypes = qrSharePropTypes;
QRShareWithDownload.defaultProps = qrShareDefaultProps;

export default withNetwork()(QRShareWithDownload);
