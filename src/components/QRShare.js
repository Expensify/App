import React from 'react';
import PropTypes from 'prop-types';
import QRCodeLibrary from 'react-native-qrcode-svg';
import withLocalize, {withLocalizePropTypes} from './withLocalize';

const propTypes = {
    type: PropTypes.string,
    value: PropTypes.oneOfType(PropTypes.string, PropTypes.number),
    logo: PropTypes.func,
    download: PropTypes.func,

    ...withLocalizePropTypes,
};

const defaultProps = {
    type: undefined,
    value: undefined,
    logo: undefined,
    download: undefined,
};

class QRShare extends React.Component {
    constructor(props) {
        super(props);

        this.url = this.props.type === 'profile' ? `https://new.expensify.com/details?login=${this.props.value}` : `https://new.expensify.com/r/${this.props.value}`;

        this.base64Logo = this.props.logo.toString('base64');
    }

    render() {
        return (
            <QRCodeLibrary
                value={this.url}
                logo={{uri: this.base64Logo}}
                getRef={c => (this.svg = c)}
                logoBackgroundColor="transparent"
                logoSize={30}
            />
        );
    }
}
QRShare.propTypes = propTypes;
QRShare.defaultProps = defaultProps;

export default withLocalize(React.forwardRef((props, ref) => (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    <QRShare {...props} forwardedRef={ref} />
)));
