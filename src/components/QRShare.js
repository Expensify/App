import React, {Component} from 'react';
import PropTypes from 'prop-types';
import QRCodeLibrary from 'react-native-qrcode-svg';
import {Dimensions, View} from 'react-native';
import ViewShot from 'react-native-view-shot';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import defaultTheme from '../styles/themes/default';
import styles from '../styles/styles';
import Text from './Text';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import compose from '../libs/compose';
import variables from '../styles/variables';
import ExpensifyWordmark from '../../assets/images/expensify-wordmark.svg';
import fileDownload from '../libs/fileDownload';

const propTypes = {
    url: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    logo: PropTypes.func,

    ...windowDimensionsPropTypes,
    ...withLocalizePropTypes,
};

const defaultProps = {
    subtitle: undefined,
    logo: undefined,
};

class QRShare extends Component {
    qrCodeScreenshotRef = React.createRef();

    constructor(props) {
        super(props);

        const defaultQrCodeSize = this.props.isSmallScreenWidth ? Dimensions.get('window').width - 75 : variables.sideBarWidth;

        this.state = {
            qrCodeSize: defaultQrCodeSize,
        };

        this.onLayout = this.onLayout.bind(this);
        this.download = this.download.bind(this);
    }

    onLayout(event) {
        this.setState({
            qrCodeSize: event.nativeEvent.layout.width - variables.qrShareHorizontalPadding * 2,
        });
    }

    download() {
        return this.qrCodeScreenshotRef.current.capture().then((uri) => fileDownload(uri, `${this.props.title}-ShareCode.png`));
    }

    render() {
        return (
            <ViewShot
                ref={this.qrCodeScreenshotRef}
                options={{format: 'png'}}
            >
                <View
                    style={styles.shareCodeContainer}
                    onLayout={this.onLayout}
                >
                    <View
                        style={{
                            alignSelf: 'stretch',
                            height: 27,
                            marginBottom: 20,
                        }}
                    >
                        <ExpensifyWordmark
                            fill={defaultTheme.borderFocus}
                            width="100%"
                            height="100%"
                        />
                    </View>
                    <QRCodeLibrary
                        value={this.props.url}
                        logo={this.props.logo}
                        getRef={(c) => (this.svg = c)}
                        logoBackgroundColor="transparent"
                        logoSize={this.state.qrCodeSize * 0.3}
                        logoBorderRadius={this.state.qrCodeSize}
                        size={this.state.qrCodeSize}
                        backgroundColor={defaultTheme.highlightBG}
                        color={defaultTheme.text}
                    />

                    <Text
                        family="EXP_NEW_KANSAS_MEDIUM"
                        fontSize={22}
                        style={{marginTop: 15}}
                    >
                        {this.props.title}
                    </Text>

                    {this.props.subtitle && (
                        <Text
                            family="EXP_NEUE_BOLD"
                            fontSize={13}
                            style={{marginTop: 4}}
                        >
                            {this.props.subtitle}
                        </Text>
                    )}
                </View>
            </ViewShot>
        );
    }
}
QRShare.propTypes = propTypes;
QRShare.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withWindowDimensions,
)(
    React.forwardRef((props, ref) => (
        /* eslint-disable-next-line react/jsx-props-no-spreading */
        <QRShare
            {...props}
            forwardedRef={ref}
        />
    )),
);
