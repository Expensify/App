import React from 'react';
import PropTypes from 'prop-types';
import QRCodeLibrary from 'react-native-qrcode-svg';
import {Dimensions, View} from 'react-native';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import defaultTheme from '../styles/themes/default';
import styles from '../styles/styles';
import Text from './Text';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import compose from '../libs/compose';
import variables from '../styles/variables';
import ExpensifyWordmark from '../../assets/images/expensify-wordmark.svg';

const propTypes = {
    type: PropTypes.string.isRequired,
    value: PropTypes.oneOfType(PropTypes.string, PropTypes.number).isRequired,
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    logo: PropTypes.func,
    download: PropTypes.func,

    ...windowDimensionsPropTypes,
    ...withLocalizePropTypes,
};

const defaultProps = {
    subtitle: undefined,
    logo: undefined,
    download: undefined,
};

class QRShare extends React.Component {
    constructor(props) {
        super(props);

        const defaultQrCodeSize = this.props.isSmallScreenWidth ? (Dimensions.get('window').width) - 75 : variables.sideBarWidth;

        this.state = {
            qrCodeSize: defaultQrCodeSize,
        };

        this.url = this.props.type === 'profile' ? `https://new.expensify.com/details?login=${this.props.value}` : `https://new.expensify.com/r/${this.props.value}`;

        this.onLayout = this.onLayout.bind(this);
    }

    onLayout = (event) => {
        this.setState({
            qrCodeSize: event.nativeEvent.layout.width - 64,
        });
    }

    render() {
        return (
            <View style={styles.shareCodeContainer} onLayout={this.onLayout}>
                <View style={{
                    alignSelf: 'stretch',
                    height: 27,
                    marginBottom: 20,
                }}
                >
                    <ExpensifyWordmark
                        fill={defaultTheme.borderFocus}
                        width="100%"
                        height="100%"
                        resizeMode="fill"
                    />
                </View>
                <QRCodeLibrary
                    value={this.url}
                    logo={this.props.logo}
                    getRef={c => (this.svg = c)}
                    logoBackgroundColor="transparent"
                    logoSize={this.state.qrCodeSize * 0.3}
                    logoBorderRadius={this.state.qrCodeSize}
                    size={this.state.qrCodeSize}
                    backgroundColor={defaultTheme.highlightBG}
                    color={defaultTheme.text}
                />

                <Text family="EXP_NEW_KANSAS_MEDIUM" fontSize={22} style={{marginTop: 15}}>{this.props.title}</Text>

                {this.props.subtitle && (
                <Text family="EXP_NEUE_BOLD" fontSize={13} style={{marginTop: 4}}>{this.props.subtitle}</Text>
                )}
            </View>
        );
    }
}
QRShare.propTypes = propTypes;
QRShare.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withWindowDimensions,
)(React.forwardRef((props, ref) => (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    <QRShare {...props} forwardedRef={ref} />
)));
